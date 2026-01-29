import { supabase } from "../lib/supabase";
import { Challenge } from "../types";

// keep these selects tight – challenge rows can pick up extra columns over time,
// and pulling `*` makes every request heavier than it needs to be.
const CHALLENGE_SELECT = `
  id,
  title,
  title_it,
  description,
  description_it,
  difficulty,
  created_by,
  created_at,
  updated_at,
  is_active,
  media:image_media_id(
    file_path
  )
`;

export const challengeService = {
  async fetchChallengeById(challengeId: number): Promise<Challenge | null> {
    if (!challengeId) {
      throw new Error("Challenge ID is required");
    }

    try {
      const { data, error } = await supabase
        .from("challenges")
        .select(CHALLENGE_SELECT)
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
