import { supabase } from "../lib/supabase";
import { isVideo } from "../utils/utils";

interface ImageTransformOptions {
  quality?: number;
  width?: number;
  height?: number;
}

interface ImageUrlResult {
  previewUrl: string;
  fullUrl: string;
}

export const imageService = {
  async getImageUrl(filePath: string, options?: ImageTransformOptions): Promise<string> {
    if (!filePath) return "";

    try {
      // handle already-transformed URLs or external URLs
      if (filePath.startsWith("http")) {
        const relativePath = filePath.includes("challenge-uploads/")
          ? filePath.split("challenge-uploads/")[1].split("?")[0]
          : filePath;
        filePath = relativePath;
      }

      // get URL with transforms
      const { data } = await supabase.storage.from("challenge-uploads").getPublicUrl(filePath, {
        transform: options,
      });

      return data.publicUrl;
    } catch (error) {
      console.error("Error getting image URL:", error);

      // fallback on untransformed if there are any errors
      const { data } = await supabase.storage.from("challenge-uploads").getPublicUrl(filePath);

      return data.publicUrl;
    }
  },

  async getProfileImageUrl(
    filePath: string,
    size: "small" | "medium" | "large" | "extraLarge" | "original" = "medium"
  ): Promise<ImageUrlResult> {
    if (size === "original") {
      const fullUrl = await this.getImageUrl(filePath);
      return {
        previewUrl: fullUrl,
        fullUrl,
      };
    }

    const sizeMap = {
      small: { quality: 80, width: 80, height: 80 },
      medium: { quality: 80, width: 200, height: 200 },
      large: { quality: 100, width: 600, height: 600 },
      preview: { quality: 10, width: 20, height: 20 },
      extraLarge: { quality: 80, width: 1000, height: 1000 },
    };

    const [previewUrl, fullUrl] = await Promise.all([
      this.getImageUrl(filePath, sizeMap.preview),
      this.getImageUrl(filePath, sizeMap[size]),
    ]);

    return { previewUrl, fullUrl };
  },

  async getPostImageUrl(
    filePath: string,
    size: "small" | "medium" | "large" | "original" = "medium"
  ): Promise<ImageUrlResult> {
    if (size === "original") {
      const fullUrl = await this.getImageUrl(filePath);
      return {
        previewUrl: fullUrl,
        fullUrl,
      };
    }

    if (isVideo(filePath)) {
      const { data: mediaData } = await supabase
        .from("media")
        .select("thumbnail_path")
        .eq("file_path", filePath)
        .single();

      const fullUrl = await this.getImageUrl(filePath);
      const previewUrl = mediaData?.thumbnail_path
        ? await this.getImageUrl(mediaData.thumbnail_path)
        : fullUrl; // falls back to the full URL if no thumbnail

      return {
        previewUrl,
        fullUrl,
      };
    }

    const sizeMap = {
      small: { quality: 60 },
      medium: { quality: 70 },
      large: { quality: 80 },
      preview: { quality: 10 },
    };

    const [previewUrl, fullUrl] = await Promise.all([
      this.getImageUrl(filePath, sizeMap.preview),
      this.getImageUrl(filePath, sizeMap[size]),
    ]);

    return { previewUrl, fullUrl };
  },
};
