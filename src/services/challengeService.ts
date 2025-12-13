import { supabase } from "../lib/supabase";
import { Challenge } from "../types";

export const challengeService = {
  async fetchChallengeById(challengeId: number): Promise<Challenge | null> {
    if (!challengeId) {
      throw new Error("Challenge ID is required");
    }

    try {
      const { data, error } = await supabase
        .from("challenges")
        .select(
          `
          *,
          media:image_media_id(
            file_path
          )
        `
        )
        .eq("id", challengeId)
        .single();

      if (error) throw error;

      // Calculate days remaining
      const now = new Date();
      const createdAt = new Date(data.created_at);
      const daysSinceCreation = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = 7 - daysSinceCreation;

      return {
        ...data,
        daysRemaining,
      } as Challenge;
    } catch (error) {
      console.error("Error loading challenge:", error);
      throw error; // Re-throw for React Query to handle
    }
  },
};
