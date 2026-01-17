import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as ImageManipulator from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';
import { supabase, supabaseStorageUrl } from "../lib/supabase";
import { RNFormDataBlob } from "../types";

/**
 * Helper to append a file to FormData in React Native.
 * RN's FormData.append() accepts {uri, name, type} objects but TS expects Blob.
 */
function appendFileToFormData(formData: FormData, fieldName: string, file: RNFormDataBlob): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData.append(fieldName, file as any);
}

interface MediaUploadResult {
  mediaId: number;
  videoThumbnail: string | null;
  mediaUrl: string;
}

export interface MediaSelectionResult {
  mediaId: number;
  previewUrl: string;
  thumbnailUri: string | null;
  isVideo: boolean;
  pendingUpload: {
    originalUri: string;
    fileName: string;
    mediaType: string;
    thumbnailFileName: string | null;
  };
}

/**
 * Selects media from media library to get the preview url and thumbnail uri
 * @param options - The options for the media selection
 * @returns The media selection result
 */
export const selectMediaForPreview = async (
  options: {
    allowVideo?: boolean;
    allowsEditing?: boolean;
  } = {}
): Promise<MediaSelectionResult | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Media library permissions not granted");
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: options.allowsEditing ?? false,
      quality: 1.0,
      videoMaxDuration: 120,
      selectionLimit: 1, // change if we want to allow multiple images
      exif: false, // no exif -- might make it faster for just selecting media
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    const isVideoFile = file.type === "video";
    let thumbnailUri = null;

    const timestamp = Date.now();
    const mediaType = file.type || "image";
    const fileExtension = mediaType === "video" ? ".mp4" : ".jpg";
    const baseFileName = `${mediaType}/${timestamp}`;
    const fileName = `${baseFileName}${fileExtension}`;
    let thumbnailFileName = null;
    let previewUrl = file.uri;

    // Store original URI for background compression
    const originalUri = file.uri;

    // For videos, generate and upload thumbnail immediately
    if (isVideoFile) {
      try {
        thumbnailFileName = `thumbnails/${baseFileName}.jpg`;

        const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, {
          time: 0,
          quality: 0.5,
        });
        thumbnailUri = uri;

        if (thumbnailUri) {
          // Use local thumbnail immediately, upload later in background
          previewUrl = thumbnailUri;
        }
      } catch (e) {
        console.warn("❌ [VIDEO THUMBNAIL] Couldn't generate or upload thumbnail", e);
      }
    } else {
      // For images, use original file as preview initially
      // Final compressed version will be uploaded in background
      previewUrl = file.uri;
    }

    // Create media record with upload_status = 'pending'
    const { data: mediaData, error: dbError } = await supabase
      .from("media")
      .insert([
        {
          file_path: null, // Will be updated when upload completes
          thumbnail_path: thumbnailFileName,
          upload_status: 'pending',
        },
      ])
      .select("id")
      .single();

    if (dbError) throw dbError;

    return {
      mediaId: mediaData.id,
      previewUrl,
      thumbnailUri,
      isVideo: isVideoFile,
      pendingUpload: {
        originalUri,
        fileName,
        mediaType,
        thumbnailFileName,
      },
    };
  } catch (error) {
    console.error("❌ [MEDIA SELECT] Error selecting media:", error);
    throw error;
  }
};

/**
 * Upload media in background and update the media record
 * @param mediaId - The id of the media to upload
 * @param pendingUpload - The pending upload to upload
 * @param onProgress - The function to call with the progress
 * @returns The public url of the uploaded media
 */
export const uploadMediaInBackground = async (
  mediaId: number,
  pendingUpload: MediaSelectionResult['pendingUpload'],
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const isVideoFile = pendingUpload.mediaType === "video";
    let compressedUri;

    // For videos, also upload thumbnail in background if needed
    if (isVideoFile && pendingUpload.thumbnailFileName) {
      if (onProgress) onProgress(5);
      
      // Re-generate and upload thumbnail
      try {
        const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(pendingUpload.originalUri, {
          time: 0,
          quality: 0.5,
        });

        if (thumbnailUri) {
          const compressedThumbnail = await ImageManipulator.manipulateAsync(
            thumbnailUri,
            [],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
          );

          const thumbnailFormData = new FormData();
          appendFileToFormData(thumbnailFormData, "file", {
            uri: compressedThumbnail.uri,
            name: pendingUpload.thumbnailFileName!,
            type: "image/jpeg",
          });

          await supabase.storage
            .from("challenge-uploads")
            .upload(pendingUpload.thumbnailFileName, thumbnailFormData, {
              contentType: "multipart/form-data",
            });
        }
      } catch (e) {
        console.warn("Failed to upload thumbnail in background:", e);
      }
    }

    // Compress media in background
    if (isVideoFile) {
      try {
        if (onProgress) onProgress(10); // Report compression start
        
        compressedUri = await Video.compress(
          pendingUpload.originalUri,
          {
            compressionMethod: "auto",
            minimumFileSizeForCompress: 0,
            maxSize: 50 * 1024 * 1024,
            bitrate: 500000,
          },
          (progress) => {
            if (onProgress) onProgress(10 + (progress * 0.6));
          }
        );
        
        if (onProgress) onProgress(70);
      } catch (e) {
        console.warn("Video compression failed, using original:", e);
        compressedUri = pendingUpload.originalUri;
      }
    } else {
      if (onProgress) onProgress(10);
      
      // Compress image
      const compressed = await ImageManipulator.manipulateAsync(
        pendingUpload.originalUri,
        [],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      compressedUri = compressed.uri;
      
      if (onProgress) onProgress(70);
    }

    if (onProgress) onProgress(75);

    const formData = new FormData();
    appendFileToFormData(formData, "file", {
      uri: compressedUri,
      name: pendingUpload.fileName,
      type: pendingUpload.mediaType === "video" ? "video/mp4" : "image/jpeg",
    });

    if (onProgress) onProgress(80);

    // Upload to supabase storage
    const { error: uploadError } = await supabase.storage
      .from("challenge-uploads")
      .upload(pendingUpload.fileName, formData, {
        contentType: "multipart/form-data",
      });

    if (uploadError) throw uploadError;

    if (onProgress) onProgress(95);

    // Update media record with final file path and status
    const { error: updateError } = await supabase
      .from("media")
      .update({
        file_path: pendingUpload.fileName,
        upload_status: 'completed',
      })
      .eq("id", mediaId);

    if (updateError) throw updateError;

    if (onProgress) onProgress(100);

    const publicUrl = `${supabaseStorageUrl}/${pendingUpload.fileName}`;
    return publicUrl;
  } catch (error) {
    // Mark upload as failed
    await supabase
      .from("media")
      .update({ upload_status: 'failed' })
      .eq("id", mediaId);
    
    console.error("Error uploading media in background:", error);
    throw error;
  }
};

/**
 * Uploads media to supabase storage and inserts into media table. Not done in the background.
 * @param options - The options for the media upload
 * @returns The media upload result
 */
export const uploadMedia = async (
  options: {
    allowVideo?: boolean;
    allowsEditing?: boolean;
  } = {}
): Promise<MediaUploadResult | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Media library permissions not granted");
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: options.allowsEditing ?? false,
      videoMaxDuration: 120,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    const isVideoFile = file.type === "video";
    let thumbnailUri = null;

    const timestamp = Date.now();
    const mediaType = file.type || "image";
    const fileExtension = mediaType === "video" ? ".mp4" : ".jpg";
    const baseFileName = `${mediaType}/${timestamp}`;
    const fileName = `${baseFileName}${fileExtension}`;
    let thumbnailFileName = null;

    // for videos we also generate a thumbnail
    if (isVideoFile) {
      try {
        thumbnailFileName = `thumbnails/${baseFileName}.jpg`;

        const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, {
          time: 0,
          quality: 0.5,
        });
        thumbnailUri = uri;

        if (thumbnailUri) {
          // Compress thumbnail
          const compressedThumbnail = await ImageManipulator.manipulateAsync(
            thumbnailUri,
            [],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
          );

          const thumbnailFormData = new FormData();
          appendFileToFormData(thumbnailFormData, "file", {
            uri: compressedThumbnail.uri,
            name: thumbnailFileName!,
            type: "image/jpeg",
          });

          const { error: thumbnailError } = await supabase.storage
            .from("challenge-uploads")
            .upload(thumbnailFileName, thumbnailFormData, {
              contentType: "multipart/form-data",
            });

          if (thumbnailError) console.error("Error uploading thumbnail:", thumbnailError);
        }
      } catch (e) {
        console.warn("Couldn't generate or upload thumbnail", e);
      }
    }

    // Compress media before upload
    let fileUri;
    if (isVideoFile) {
      try {
        // Compress video with absolute maximum compression
        fileUri = await Video.compress(
          file.uri,
          {
            compressionMethod: "auto",
            minimumFileSizeForCompress: 0,
            maxSize: 1 * 1024 * 1024,
            bitrate: 250000,
          },
        );
      } catch (e) {
        console.warn("Video compression failed, using original:", e);
        fileUri = file.uri;
      }
    } else {
      // Compress image
      const compressed = await ImageManipulator.manipulateAsync(
        file.uri,
        [],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      fileUri = compressed.uri;
    }

    const formData = new FormData();
    appendFileToFormData(formData, "file", {
      uri: fileUri,
      name: fileName,
      type: mediaType === "video" ? "video/mp4" : "image/jpeg",
    });

    // upload to supabase storage
    const { error: uploadError } = await supabase.storage
      .from("challenge-uploads")
      .upload(fileName, formData, {
        contentType: "multipart/form-data",
      });

    if (uploadError) throw uploadError;

    // construct the public url using supabaseStorageUrl from supabase config
    const publicUrl = `${supabaseStorageUrl}/${fileName}`;

    // insert into media table
    const { data: mediaData, error: dbError } = await supabase
      .from("media")
      .insert([
        {
          file_path: fileName,
          thumbnail_path: thumbnailFileName,
        },
      ])
      .select("id")
      .single();

    if (dbError) throw dbError;

    return {
      mediaId: mediaData.id,
      videoThumbnail: thumbnailUri,
      mediaUrl: publicUrl,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
