import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as ImageManipulator from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';
import { supabase, supabaseStorageUrl } from "../lib/supabase";

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

// Stage 1: Select media and upload preview/thumbnail immediately
export const selectMediaForPreview = async (
  options: {
    allowVideo?: boolean;
    allowsEditing?: boolean;
  } = {}
): Promise<MediaSelectionResult | null> => {
  console.log("🎬 [MEDIA SELECT] Starting media selection...");
  const startTime = Date.now();
  
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Media library permissions not granted");
  }

  try {
    console.log("📱 [MEDIA SELECT] Opening image picker...");
    const pickerStart = Date.now();
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: options.allowsEditing ?? false,
      quality: 1.0, // NO compression - fastest possible
      videoMaxDuration: 120,
      selectionLimit: 1, // Only one file
      exif: false, // Skip EXIF data processing
    });

    const pickerTime = Date.now() - pickerStart;
    console.log(`✅ [MEDIA SELECT] Image picker promise resolved in ${pickerTime}ms`);
    
    if (pickerTime > 3000) {
      console.warn("⚠️ [MEDIA SELECT] Slow picker processing detected. iOS is processing large media file.");
    }

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

    console.log(`🎯 [MEDIA SELECT] Selected ${isVideoFile ? 'video' : 'image'}: ${file.uri}`);

    // Store original URI for background compression
    const originalUri = file.uri;

    // For videos, generate and upload thumbnail immediately
    if (isVideoFile) {
      console.log("🎥 [VIDEO THUMBNAIL] Starting video thumbnail generation...");
      const thumbnailStart = Date.now();
      
      try {
        thumbnailFileName = `thumbnails/${baseFileName}.jpg`;

        console.log("🎯 [VIDEO THUMBNAIL] Generating thumbnail from video...");
        const thumbnailGenStart = Date.now();
        
        const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, {
          time: 0,
          quality: 0.5,
        });
        thumbnailUri = uri;

        console.log(`✅ [VIDEO THUMBNAIL] Thumbnail generated in ${Date.now() - thumbnailGenStart}ms`);

        if (thumbnailUri) {
          // Use local thumbnail immediately, upload later in background
          previewUrl = thumbnailUri;
          console.log(`🎉 [VIDEO THUMBNAIL] Local thumbnail ready in ${Date.now() - thumbnailStart}ms - Upload will happen in background`);
        }
      } catch (e) {
        console.warn("❌ [VIDEO THUMBNAIL] Couldn't generate or upload thumbnail", e);
      }
    } else {
      console.log("📸 [IMAGE PREVIEW] Using original image as preview");
      // For images, use original file as preview initially
      // Final compressed version will be uploaded in background
      previewUrl = file.uri;
    }

    console.log("💾 [DATABASE] Creating media record...");
    const dbStart = Date.now();
    
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

    console.log(`✅ [DATABASE] Media record created in ${Date.now() - dbStart}ms`);

    const totalTime = Date.now() - startTime;
    console.log(`🎉 [MEDIA SELECT] TOTAL TIME: ${totalTime}ms - User can now hit Send!`);

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

// Stage 2: Upload the full media in background and update media record
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
      
      console.log("☁️ [BACKGROUND] Uploading video thumbnail...");
      
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
          thumbnailFormData.append("file", {
            uri: compressedThumbnail.uri,
            name: pendingUpload.thumbnailFileName,
            type: "image/jpeg",
          } as any);

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
            compressionMethod: "auto",               // Smart defaults + manual overrides
            minimumFileSizeForCompress: 0,
            maxSize: 50 * 1024 * 1024,                 // Allow uploads up to 50 MB
            bitrate: 500000,                          // 1 Mbps – great for 720p video
          },
          (progress) => {
            // Report compression progress (10-70% of total)
            if (onProgress) onProgress(10 + (progress * 0.6));
          }
        );
        
        if (onProgress) onProgress(70); // Compression complete
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
    formData.append("file", {
      uri: compressedUri,
      name: pendingUpload.fileName,
      type: pendingUpload.mediaType === "video" ? "video/mp4" : "image/jpeg",
    } as any);

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

// Legacy function for backward compatibility
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
      // quality: 0.2,
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
          thumbnailFormData.append("file", {
            uri: compressedThumbnail.uri,
            name: thumbnailFileName,
            type: "image/jpeg",
          } as any);

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
          (progress) => {
            console.log('Compression progress: ', progress);
          }
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
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: mediaType === "video" ? "video/mp4" : "image/jpeg",
    } as any);

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
