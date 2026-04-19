import { supabase } from "../lib/supabase";
import {
  PrivateChallenge,
  PrivateChallengeDifficulty,
  PrivateChallengeProfile,
  PrivateChallengeQuestionnaireDraft,
  PrivateChallengeSet,
  PrivateChallengeStats,
} from "../types/privateChallenges";

type ChallengeRow = Omit<PrivateChallenge, "llm_metadata"> & {
  llm_metadata: Record<string, unknown> | null;
};

type SetRow = Omit<PrivateChallengeSet, "private_challenges"> & {
  private_challenges: ChallengeRow[] | null;
};

function normalizeSet(row: SetRow): PrivateChallengeSet {
  const order: Record<PrivateChallengeDifficulty, number> = {
    easy: 0,
    medium: 1,
    hard: 2,
  };

  return {
    ...row,
    private_challenges: (row.private_challenges || [])
      .map((challenge) => ({
        ...challenge,
        llm_metadata: challenge.llm_metadata || {},
      }))
      .sort((a, b) => order[a.difficulty] - order[b.difficulty]),
  };
}

function toDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function diffDays(a: string, b: string) {
  const aParts = toDateParts(a);
  const bParts = toDateParts(b);
  const aUtc = Date.UTC(aParts.year, aParts.month - 1, aParts.day);
  const bUtc = Date.UTC(bParts.year, bParts.month - 1, bParts.day);
  return Math.round((aUtc - bUtc) / (1000 * 60 * 60 * 24));
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function computePrivateChallengeStats(sets: PrivateChallengeSet[]): PrivateChallengeStats {
  const completedDates = sets
    .filter((set) => set.status === "completed")
    .map((set) => set.challenge_date)
    .sort((a, b) => b.localeCompare(a));

  if (completedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
    };
  }

  let currentStreak = 1;
  for (let i = 1; i < completedDates.length; i++) {
    if (diffDays(completedDates[i - 1], completedDates[i]) === 1) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  let longestStreak = 1;
  let running = 1;
  for (let i = 1; i < completedDates.length; i++) {
    if (diffDays(completedDates[i - 1], completedDates[i]) === 1) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 1;
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalCompleted: completedDates.length,
  };
}

export const privateChallengeService = {
  async fetchProfile(userId: string): Promise<PrivateChallengeProfile | null> {
    const { data, error } = await supabase
      .from("private_challenge_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async saveProfile(userId: string, draft: PrivateChallengeQuestionnaireDraft): Promise<PrivateChallengeProfile> {
    if (
      !draft.goal ||
      !draft.hard_situation ||
      !draft.stretch_level ||
      !draft.preferred_context ||
      !draft.meaningful_type ||
      !draft.progress_definition
    ) {
      throw new Error("Incomplete questionnaire");
    }

    const avoidTypes = draft.avoid_types.includes("none")
      ? ["none"]
      : draft.avoid_types.filter((value) => value !== "none");

    const payload = {
      user_id: userId,
      goal: draft.goal,
      hard_situation: draft.hard_situation,
      stretch_level: draft.stretch_level,
      preferred_context: draft.preferred_context,
      meaningful_type: draft.meaningful_type,
      avoid_types: avoidTypes,
      progress_definition: draft.progress_definition,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("private_challenge_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async fetchOrCreateTodaySet(localDate: string, language: "en" | "it"): Promise<PrivateChallengeSet> {
    const { data, error } = await supabase.functions.invoke("get-private-challenge-set", {
      body: {
        localDate,
        language,
      },
    });

    if (error) throw error;
    return normalizeSet(data as SetRow);
  },

  async fetchHistory(userId: string, limit = 30): Promise<PrivateChallengeSet[]> {
    const { data, error } = await supabase
      .from("private_challenge_sets")
      .select("*, private_challenges(*)")
      .eq("user_id", userId)
      .order("challenge_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((row) => normalizeSet(row as SetRow));
  },

  async completeSet(
    setId: number,
    difficulty: PrivateChallengeDifficulty,
    note: string
  ): Promise<void> {
    const { data, error } = await supabase
      .from("private_challenge_sets")
      .update({
        status: "completed",
        completed_difficulty: difficulty,
        completed_note: note.trim() ? note.trim() : null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .eq("id", setId)
      .eq("status", "pending")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("This challenge is no longer available");
  },

  async skipSet(setId: number): Promise<void> {
    const { data, error } = await supabase
      .from("private_challenge_sets")
      .update({
        status: "skipped",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .eq("id", setId)
      .eq("status", "pending")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("This challenge is no longer available");
  },
};
