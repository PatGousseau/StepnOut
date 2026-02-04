import { supabase, supabaseUrl } from "../lib/supabase";
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

const normalizePath = (filePath: string): string => {
  if (!filePath) return "";
  if (filePath.startsWith("http") && filePath.includes("challenge-uploads/")) {
    return filePath.split("challenge-uploads/")[1].split("?")[0];
  }
  return filePath;
};

const buildTransformUrl = (filePath: string, opts: ImageTransformOptions): string => {
  const path = normalizePath(filePath);
  if (!path) return "";
  const params = new URLSearchParams();
  if (opts.quality) params.set("quality", String(opts.quality));
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  return `${supabaseUrl}/storage/v1/render/image/public/challenge-uploads/${path}?${params}`;
};

export const imageService = {
  getProfileImageUrlSync(filePath: string, size: "tiny" | "small" | "medium" | "large" = "medium"): string {
    const sizes = {
      tiny: { quality: 60, width: 50, height: 50 },
      small: { quality: 80, width: 80, height: 80 },
      medium: { quality: 80, width: 200, height: 200 },
      large: { quality: 100, width: 600, height: 600 },
    };
    return buildTransformUrl(filePath, sizes[size]);
  },

  getPostImageUrlSync(filePath: string, size: "small" | "medium" | "large" = "medium"): string {
    const sizes = { small: { quality: 60 }, medium: { quality: 70 }, large: { quality: 80 } };
    return buildTransformUrl(filePath, sizes[size]);
  },

  async getImageUrl(filePath: string, options?: ImageTransformOptions): Promise<string> {
    const path = normalizePath(filePath);
    if (!path) return "";

    try {
      const { data } = await supabase.storage.from("challenge-uploads").getPublicUrl(path, {
        transform: options,
      });
      return data.publicUrl;
    } catch (error) {
      console.error("Error getting image URL:", error);
      const { data } = await supabase.storage.from("challenge-uploads").getPublicUrl(path);
      return data.publicUrl;
    }
  },

  async getProfileImageUrl(
    filePath: string,
    size: "small" | "medium" | "large" | "extraLarge" | "original" = "medium"
  ): Promise<ImageUrlResult> {
    if (size === "original") {
      const fullUrl = await this.getImageUrl(filePath);
      return { previewUrl: fullUrl, fullUrl };
    }

    const sizes = {
      small: { quality: 80, width: 80, height: 80 },
      medium: { quality: 80, width: 200, height: 200 },
      large: { quality: 100, width: 600, height: 600 },
      extraLarge: { quality: 80, width: 1000, height: 1000 },
    };

    const [previewUrl, fullUrl] = await Promise.all([
      this.getImageUrl(filePath, { quality: 10, width: 20, height: 20 }),
      this.getImageUrl(filePath, sizes[size]),
    ]);
    return { previewUrl, fullUrl };
  },

  async getPostImageUrl(
    filePath: string,
    size: "small" | "medium" | "large" | "original" = "medium"
  ): Promise<ImageUrlResult> {
    if (size === "original") {
      const fullUrl = await this.getImageUrl(filePath);
      return { previewUrl: fullUrl, fullUrl };
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
        : fullUrl;
      return { previewUrl, fullUrl };
    }

    const sizes = { small: { quality: 60 }, medium: { quality: 70 }, large: { quality: 80 } };
    const [previewUrl, fullUrl] = await Promise.all([
      this.getImageUrl(filePath, { quality: 10 }),
      this.getImageUrl(filePath, sizes[size]),
    ]);
    return { previewUrl, fullUrl };
  },
};
