import { useState, useRef, useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { AppAlert } from '../components/AppAlert';
import { useUploadProgress } from '../contexts/UploadProgressContext';
import { createProgressManager } from '../utils/progressManager';
import { selectMediaItemsForPreview, MediaSelectionResult } from '../utils/handleMediaUpload';
import { backgroundUploadService } from '../services/backgroundUploadService';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { captureEvent } from '../lib/posthog';
import { POST_EVENTS } from '../constants/analyticsEvents';

interface UseMediaUploadOptions {
  onUploadComplete?: () => void;
  successMessage?: string;
}

interface UseMediaUploadResult {
  selectedMedia: MediaSelectionResult | null;
  selectedMediaItems: MediaSelectionResult[];
  postText: string;
  isUploading: boolean;
  isSubmitting: boolean;
  uploadProgress: number | null;
  handleMediaUpload: () => Promise<void>;
  handleRemoveMedia: (index?: number) => void;
  setPostText: (text: string) => void;
  handleSubmit: (additionalData?: Record<string, unknown>, text?: string) => Promise<void>;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : undefined;

export const useMediaUpload = (options: UseMediaUploadOptions = {}): UseMediaUploadResult => {
  const { t } = useLanguage();
  const [selectedMediaItems, setSelectedMediaItems] = useState<MediaSelectionResult[]>([]);
  const selectedMedia = selectedMediaItems[0] || null;
  const [postText, setPostText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
  const [localUploadProgress, setLocalUploadProgress] = useState(0);
  const { setUploadProgress, setUploadMessage } = useUploadProgress();
  const progressManagerRef = useRef(createProgressManager(setUploadProgress));

  // Cleanup on unmount
  useEffect(() => {
    const progressManager = progressManagerRef.current;
    return () => {
      progressManager.cleanup();
    };
  }, []);

  const handleMediaUpload = async () => {
    try {
      setIsUploading(true);
      const remainingSlots = Math.max(4 - selectedMediaItems.length, 0);
      if (remainingSlots === 0) return;
      const result = await selectMediaItemsForPreview({
        allowVideo: true,
        selectionLimit: remainingSlots,
      });
      if (result.length > 0) {
        setSelectedMediaItems((prev) => [...prev, ...result].slice(0, 4));
      }
    } catch (error: unknown) {
      console.error('Error selecting media:', error);
      const message = getErrorMessage(error);
      
      // Check if it's a permissions error
      if (message?.includes('permissions not granted')) {
        captureEvent(POST_EVENTS.MEDIA_PERMISSION_DENIED);
        AppAlert.show(
          t('Photo Access Required'),
          t('Please enable photo library access in Settings to share photos and videos.'),
          [
            { text: t('Cancel'), style: 'cancel' },
            { 
              text: t('Open Settings'), 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            },
          ]
        );
      } else {
        captureEvent(POST_EVENTS.MEDIA_PICK_FAILED, { message });
        setUploadMessage(t('Error selecting media'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = (index?: number) => {
    if (index == null) {
      setSelectedMediaItems([]);
      return;
    }
    setSelectedMediaItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (additionalData: Record<string, unknown> = {}, text?: string) => {
    const finalText = text !== undefined ? text : postText;

    const mediaItems = selectedMediaItems;

    if (!finalText.trim() && mediaItems.length === 0) {
      setUploadMessage(t('Please add either a description or media'));
      return;
    }

    if (isUploading) {
      setUploadMessage(t('Please wait for media selection to complete'));
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    captureEvent(POST_EVENTS.SUBMIT_ATTEMPTED, {
      has_media: !!selectedMedia,
      media_count: mediaItems.length,
      has_text: !!finalText.trim(),
    });

    try {
      // Create post with media preview
      const { data: postData, error: postError } = await supabase
        .from('post')
        .insert([
          {
            media_id: mediaItems[0]?.mediaId || null,
            body: finalText,
            featured: false,
            ...additionalData,
          },
        ])
        .select('id')
        .single();

      if (postError) throw postError;

      if (mediaItems.length > 0) {
        const { error: postMediaError } = await supabase
          .from('post_media')
          .insert(
            mediaItems.map((item, index) => ({
              post_id: postData.id,
              media_id: item.mediaId,
              position: index,
            }))
          );

        if (postMediaError) throw postMediaError;
      }

      // If there's media, start background upload
      if (mediaItems.length > 0) {
        setIsBackgroundUploading(true);
        progressManagerRef.current.startUpload();

        const uploadProgressByMediaId = new Map<number, number>();
        let completedUploads = 0;
        let failedUploads = 0;

        mediaItems.forEach((item) => {
          backgroundUploadService.addToQueue(
            item.mediaId,
            item.pendingUpload,
            postData.id,
            (progress) => {
              uploadProgressByMediaId.set(item.mediaId, progress);
              const totalProgress = mediaItems.reduce(
                (sum, mediaItem) => sum + (uploadProgressByMediaId.get(mediaItem.mediaId) || 0),
                0
              ) / mediaItems.length;
              setLocalUploadProgress(totalProgress);
              progressManagerRef.current.updateProgress(totalProgress);
            },
            (success) => {
              completedUploads += 1;
              if (!success) failedUploads += 1;

              if (completedUploads < mediaItems.length) return;

              setIsBackgroundUploading(false);
              setLocalUploadProgress(0);
              if (failedUploads > 0) {
                console.error('Background upload failed:', postData.id);
                captureEvent(POST_EVENTS.MEDIA_UPLOAD_FAILED, { post_id: postData.id });
                setUploadMessage(t('Upload failed'));
                setTimeout(() => {
                  setUploadMessage(null);
                  setUploadProgress(null);
                }, 3000);
              } else {
                progressManagerRef.current.complete();
                setUploadMessage(options.successMessage || t('Upload completed successfully!'));
                setTimeout(() => {
                  setUploadMessage(null);
                  setUploadProgress(null);
                }, 3000);

                // Call completion callback for successful background upload
                if (options.onUploadComplete) {
                  options.onUploadComplete();
                }
              }
            }
          );
        });
      } else {
        setUploadMessage(options.successMessage || t('Post sent successfully!'));
        setTimeout(() => setUploadMessage(null), 3000);
      }

      // Reset form
      setPostText('');
      setSelectedMediaItems([]);

      // Call completion callback if provided
      if (options.onUploadComplete) {
        options.onUploadComplete();
      }
    } catch (error) {
      console.error('Error submitting:', error);
      captureEvent(POST_EVENTS.CREATE_FAILED, { message: (error as Error).message });
      setUploadMessage(t('Error submitting'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedMedia,
    selectedMediaItems,
    postText,
    setPostText,
    isUploading,
    isSubmitting,
    uploadProgress: isBackgroundUploading ? localUploadProgress : null,
    handleMediaUpload,
    handleRemoveMedia,
    handleSubmit,
  };
}; 
