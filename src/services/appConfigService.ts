import { supabase } from "../lib/supabase";

export const appConfigService = {
  async getShareLink(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "share_link")
        .single();

      if (error) {
        console.warn("Error fetching share link from Supabase:", error);
        // Fallback to default
        return "https://apps.apple.com/us/app/stepn-out/id6739888631";
      }

      return data?.value || "https://apps.apple.com/us/app/stepn-out/id6739888631";
    } catch (error) {
      console.error("Error fetching share link:", error);
      // Fallback to default
      return "https://apps.apple.com/us/app/stepn-out/id6739888631";
    }
  },
};
