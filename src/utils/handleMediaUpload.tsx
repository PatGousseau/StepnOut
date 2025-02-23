import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { supabase, supabaseStorageUrl } from "../lib/supabase";

interface MediaUploadResult {
  mediaId: number;
  videoThumbnail: string | null;
  mediaUrl: string;
}

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
      quality: 0.2,
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
          const thumbnailFormData = new FormData();
          thumbnailFormData.append("file", {
            uri: thumbnailUri,
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

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
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
