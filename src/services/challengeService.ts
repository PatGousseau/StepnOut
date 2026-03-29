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

  async fetchPastChallengesFromPosts(excludeChallengeId?: number) {
    const { data, error } = await supabase
      .from("post")
      .select("challenge_id, created_at")
      .not("challenge_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    const latestByChallengeId = new Map<number, string>();
    for (const row of data ?? []) {
      const id = row.challenge_id as number | null;
      if (!id) continue;
      if (excludeChallengeId && id === excludeChallengeId) continue;
      if (!latestByChallengeId.has(id)) {
        latestByChallengeId.set(id, row.created_at as string);
      }
    }

    const ids = Array.from(latestByChallengeId.keys());
    if (ids.length === 0) return [] as Challenge[];

    const { data: challenges, error: challengesError } = await supabase
      .from("challenges")
      .select(
        `
        *,
        media:image_media_id(
          file_path
        )
      `
      )
      .in("id", ids);

    if (challengesError) throw challengesError;

    const now = new Date();
    const withDerived = (challenges ?? []).map((c: unknown) => {
      const row = c as Record<string, unknown>;
      const createdAt = new Date(String(row.created_at));
      const daysSinceCreation = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = 7 - daysSinceCreation;
      return { ...(row as Record<string, unknown>), daysRemaining } as unknown as Challenge;
    });

    return withDerived.sort((a, b) => {
      const aLatest = latestByChallengeId.get(a.id) ?? "";
      const bLatest = latestByChallengeId.get(b.id) ?? "";
      return bLatest.localeCompare(aLatest);
    });
  },
};
