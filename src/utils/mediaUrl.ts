import { supabaseStorageUrl } from "../lib/supabase";

export const toPublicMediaUrl = (filePath?: string | null) => {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  return `${supabaseStorageUrl}/${filePath}`;
};

export const isVideoUrl = (url: string) => url.match(/\.(mp4|mov|avi|wmv)$/i);
export const isAudioUrl = (url: string) => url.match(/\.(m4a|aac|caf|mp3|wav|ogg)$/i);
