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
        return "https://linktr.ee/stepnout";
      }

      return data?.value || "https://linktr.ee/stepnout";
    } catch (error) {
      console.error("Error fetching share link:", error);
      // Fallback to default
      return "https://linktr.ee/stepnout";
    }
  },
};
