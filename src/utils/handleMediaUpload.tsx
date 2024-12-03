import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { supabase } from '../lib/supabase';

interface MediaUploadResult {
  mediaId: number | null;
  mediaPreview: string | null;
  isVideo: boolean;
  videoThumbnail: string | null;
  mediaUrl: string;
}

export const uploadMedia = async (
  options: {
    allowVideo?: boolean;
    allowsEditing?: boolean;
  } = {}
): Promise<MediaUploadResult> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('Media library permissions not granted');
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: options.allowVideo ? ImagePicker.MediaTypeOptions.All : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? false,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (result.canceled) {
      return {
        mediaId: null,
        mediaPreview: null,
        isVideo: false,
        videoThumbnail: null,
      };
    }

    const file = result.assets[0];
    const isVideoFile = file.type === 'video';
    let thumbnailUri = null;

    if (isVideoFile) {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, {
          time: 0,
          quality: 0.5,
        });
        thumbnailUri = uri;
      } catch (e) {
        console.warn("Couldn't generate thumbnail", e);
      }
    }

    const mediaType = file.type || 'image';
    const fileExtension = mediaType === 'video' ? '.mp4' : '.jpg';
    const fileName = `${mediaType}/${Date.now()}${fileExtension}`;
    
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: fileName,
      type: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
    } as any);

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('challenge-uploads')
      .upload(fileName, formData, {
        contentType: 'multipart/form-data',
      });

    if (uploadError) throw uploadError;

    // Get the public URL immediately after upload
    const { data: { publicUrl } } = supabase.storage
      .from('challenge-uploads')
      .getPublicUrl(fileName);

    // Insert into media table and get the ID
    const { data: mediaData, error: dbError } = await supabase
      .from('media')
      .insert([{ 
        file_path: fileName,
      }])
      .select('id')
      .single();

    if (dbError) throw dbError;

    return {
      mediaId: mediaData.id,
      mediaPreview: isVideoFile ? thumbnailUri || file.uri : file.uri,
      isVideo: isVideoFile,
      videoThumbnail: thumbnailUri,
      mediaUrl: publicUrl,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};