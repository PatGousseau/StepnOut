import { supabase } from "../lib/supabase";

interface ImageTransformOptions {
  quality?: number;
  width?: number;
  height?: number;
}

export const imageService = {
  /**
   * Gets a public URL for an image with optional transformations
   */
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
    size: "small" | "medium" | "large" = "medium"
  ): Promise<string> {
    const sizeMap = {
      small: { quality: 80, width: 80, height: 80 },
      medium: { quality: 80, width: 200, height: 200 },
      large: { quality: 100, width: 600, height: 600 },
    };

    return this.getImageUrl(filePath, sizeMap[size]);
  },

  async getPostImageUrl(
    filePath: string,
    size: "small" | "medium" | "large" = "medium"
  ): Promise<string> {
    const sizeMap = {
      small: { quality: 60, width: 400, height: 400 },
      medium: { quality: 70, width: 800, height: 800 },
      large: { quality: 80, width: 1200, height: 1200 },
    };

    return this.getImageUrl(filePath, sizeMap[size]);
  },
};
