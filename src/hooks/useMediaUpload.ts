import { useState, useRef, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useUploadProgress } from '../contexts/UploadProgressContext';
import { createProgressManager } from '../utils/progressManager';
import { selectMediaForPreview, MediaSelectionResult } from '../utils/handleMediaUpload';
import { backgroundUploadService } from '../services/backgroundUploadService';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface UseMediaUploadOptions {
  onUploadComplete?: () => void;
  successMessage?: string;
}

interface UseMediaUploadResult {
  selectedMedia: MediaSelectionResult | null;
  postText: string;
  isUploading: boolean;
  uploadProgress: number | null;
  handleMediaUpload: () => Promise<void>;
  handleRemoveMedia: () => void;
  setPostText: (text: string) => void;
  handleSubmit: (additionalData?: Record<string, any>, text?: string) => Promise<void>;
}

export const useMediaUpload = (options: UseMediaUploadOptions = {}): UseMediaUploadResult => {
  const { t } = useLanguage();
  const [selectedMedia, setSelectedMedia] = useState<MediaSelectionResult | null>(null);
  const [postText, setPostText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
  const [localUploadProgress, setLocalUploadProgress] = useState(0);
  const { setUploadProgress, setUploadMessage } = useUploadProgress();
  const progressManagerRef = useRef(createProgressManager(setUploadProgress));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      progressManagerRef.current.cleanup();
    };
  }, []);

  const handleMediaUpload = async () => {
    try {
      setIsUploading(true);
      const result = await selectMediaForPreview({ allowVideo: true });
      if (result) {
        setSelectedMedia(result);
      }
    } catch (error: any) {
      console.error('Error selecting media:', error);
      
      // Check if it's a permissions error
      if (error?.message?.includes('permissions not granted')) {
        Alert.alert(
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
        setUploadMessage(t('Error selecting media'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
  };

  const handleSubmit = async (additionalData: Record<string, any> = {}, text?: string) => {
    const finalText = text !== undefined ? text : postText;
    
    if (!finalText.trim() && !selectedMedia) {
      setUploadMessage(t('Please add either a description or media'));
      return;
    }

    if (isUploading) {
      setUploadMessage(t('Please wait for media selection to complete'));
      return;
    }

    try {
      // Create post with media preview
      const { data: postData, error: postError } = await supabase
        .from('post')
        .insert([
          {
            media_id: selectedMedia?.mediaId || null,
            body: finalText,
            featured: false,
            ...additionalData,
          },
        ])
        .select('id')
        .single();

      if (postError) throw postError;

      // If there's media, start background upload
      if (selectedMedia) {
        setIsBackgroundUploading(true);
        progressManagerRef.current.startUpload();
        
        backgroundUploadService.addToQueue(
          selectedMedia.mediaId,
          selectedMedia.pendingUpload,
          postData.id,
          (progress) => {
            setLocalUploadProgress(progress);
            progressManagerRef.current.updateProgress(progress);
          },
          (success) => {
            setIsBackgroundUploading(false);
            setLocalUploadProgress(0);
            if (!success) {
              console.error('Background upload failed:', postData.id);
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
      } else {
        setUploadMessage(options.successMessage || t('Post sent successfully!'));
        setTimeout(() => setUploadMessage(null), 3000);
      }

      // Reset form
      setPostText('');
      setSelectedMedia(null);

      // Call completion callback if provided
      if (options.onUploadComplete) {
        options.onUploadComplete();
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setUploadMessage(t('Error submitting'));
    }
  };

  return {
    selectedMedia,
    postText,
    setPostText,
    isUploading,
    uploadProgress: isBackgroundUploading ? localUploadProgress : null,
    handleMediaUpload,
    handleRemoveMedia,
    handleSubmit,
  };
}; 