import { supabase } from "../lib/supabase";
import {
  PrivateChallengeAvoidType,
  PrivateChallenge,
  PrivateChallengeDifficulty,
  PrivateChallengeGoal,
  PrivateChallengeHardSituation,
  PrivateChallengeMeaningfulType,
  PrivateChallengePreferredContext,
  PrivateChallengeProfile,
  PrivateChallengeProgressDefinition,
  PrivateChallengeQuestionnaireDraft,
  PrivateChallengeSet,
  PrivateChallengeStretchLevel,
  PrivateChallengeStats,
} from "../types/privateChallenges";

type ChallengeRow = Omit<PrivateChallenge, "llm_metadata"> & {
  llm_metadata: Record<string, unknown> | null;
};

type SetRow = Omit<PrivateChallengeSet, "private_challenges"> & {
  private_challenges: ChallengeRow[] | null;
};

type ProfileRow = Omit<
  PrivateChallengeProfile,
  "goal" | "hard_situation" | "preferred_context" | "meaningful_type" | "progress_definition"
> & {
  goal: string[] | string | null;
  hard_situation: string[] | string | null;
  preferred_context: string[] | string | null;
  meaningful_type: string[] | string | null;
  progress_definition: string[] | string | null;
  stretch_level: string | null;
  avoid_types: string[] | null;
};

function toArray<T extends string>(value: T[] | T | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

const GOAL_MAP: Record<string, PrivateChallengeGoal> = {
  novelty: "novelty",
  fun: "fun",
  connection: "connection",
  momentum: "momentum",
  creativity: "creativity",
  better_stories: "better_stories",
  confidence: "momentum",
  spontaneity: "novelty",
  surprise: "novelty",
  aliveness: "fun",
  courage: "momentum",
  self_trust: "momentum",
  less_overthinking: "novelty",
};

const HARD_SITUATION_MAP: Record<string, PrivateChallengeHardSituation> = {
  low_energy: "low_energy",
  overthinking: "overthinking",
  spending_money: "spending_money",
  planning: "planning",
  social_hesitation: "social_hesitation",
  going_far: "going_far",
  not_knowing: "not_knowing",
  feeling_self_conscious: "feeling_self_conscious",
  talking_to_strangers: "social_hesitation",
  being_seen: "feeling_self_conscious",
  asking_for_what_i_want: "social_hesitation",
  doing_things_alone: "not_knowing",
  being_playful: "feeling_self_conscious",
  saying_yes: "overthinking",
};

const STRETCH_LEVEL_MAP: Record<string, PrivateChallengeStretchLevel> = {
  easy_win: "easy_win",
  moderate_push: "moderate_push",
  bold_nudge: "bold_nudge",
  gentle: "easy_win",
  balanced: "moderate_push",
  push_me: "bold_nudge",
};

const CONTEXT_MAP: Record<string, PrivateChallengePreferredContext | PrivateChallengePreferredContext[]> = {
  at_home: "at_home",
  near_home: "near_home",
  out_in_the_city: "out_in_the_city",
  with_other_people: "with_other_people",
  solo: "solo",
  anywhere: ["at_home", "near_home", "out_in_the_city", "with_other_people", "solo"],
  outside: "out_in_the_city",
  social_settings: "with_other_people",
  work_or_school: "near_home",
};

const MEANINGFUL_TYPE_MAP: Record<string, PrivateChallengeMeaningfulType> = {
  playful: "playful",
  creative: "creative",
  exploratory: "exploratory",
  social: "social",
  reflective: "reflective",
  growth_edge: "growth_edge",
  sensory: "exploratory",
  practical_but_different: "exploratory",
  adventurous: "exploratory",
  expressive: "creative",
  practical: "exploratory",
  habit_building: "reflective",
};

const AVOID_TYPE_MAP: Record<string, PrivateChallengeAvoidType> = {
  spending_money: "spending_money",
  talking_to_strangers: "talking_to_strangers",
  group_social_situations: "group_social_situations",
  lots_of_planning: "lots_of_planning",
  physically_demanding: "physically_demanding",
  nighttime: "nighttime",
  going_far: "going_far",
  work_or_school: "lots_of_planning",
};

const PROGRESS_DEFINITION_MAP: Record<string, PrivateChallengeProgressDefinition> = {
  did_something_unusual: "did_something_unusual",
  more_stories: "more_stories",
  days_less_repetitive: "days_less_repetitive",
  followed_impulses: "followed_impulses",
  explored_more: "explored_more",
  felt_more_alive: "felt_more_alive",
  shared_more_with_people: "shared_more_with_people",
  less_anxious: "felt_more_alive",
  more_initiative: "followed_impulses",
  talk_to_more_people: "shared_more_with_people",
  less_overthinking_action: "did_something_unusual",
};

function mapValues<T extends string>(value: string[] | string | null | undefined, valueMap: Record<string, T>): T[] {
  const seen = new Set<T>();
  return toArray(value).reduce<T[]>((acc, entry) => {
    const mapped = valueMap[entry];
    if (!mapped || seen.has(mapped)) return acc;
    seen.add(mapped);
    acc.push(mapped);
    return acc;
  }, []);
}

function mapValuesExpanded<T extends string>(
  value: string[] | string | null | undefined,
  valueMap: Record<string, T | T[]>
): T[] {
  const seen = new Set<T>();
  return toArray(value).reduce<T[]>((acc, entry) => {
    const mapped = valueMap[entry];
    if (!mapped) return acc;

    const normalized = Array.isArray(mapped) ? mapped : [mapped];
    normalized.forEach((item) => {
      if (seen.has(item)) return;
      seen.add(item);
      acc.push(item);
    });

    return acc;
  }, []);
}

function normalizeProfile(row: ProfileRow): PrivateChallengeProfile {
  return {
    ...row,
    goal: mapValues(row.goal, GOAL_MAP),
    hard_situation: mapValues(row.hard_situation, HARD_SITUATION_MAP),
    stretch_level: STRETCH_LEVEL_MAP[row.stretch_level || ""] || "moderate_push",
    preferred_context: mapValuesExpanded(row.preferred_context, CONTEXT_MAP),
    meaningful_type: mapValues(row.meaningful_type, MEANINGFUL_TYPE_MAP),
    avoid_types: mapValues(row.avoid_types, AVOID_TYPE_MAP),
    progress_definition: mapValues(row.progress_definition, PROGRESS_DEFINITION_MAP),
  };
}

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
    return data ? normalizeProfile(data as ProfileRow) : null;
  },

  async saveProfile(userId: string, draft: PrivateChallengeQuestionnaireDraft): Promise<PrivateChallengeProfile> {
    if (
      draft.goal.length === 0 ||
      draft.hard_situation.length === 0 ||
      !draft.stretch_level ||
      draft.preferred_context.length === 0 ||
      draft.meaningful_type.length === 0 ||
      draft.progress_definition.length === 0
    ) {
      throw new Error("Incomplete questionnaire");
    }

    const payload = {
      user_id: userId,
      goal: draft.goal,
      hard_situation: draft.hard_situation,
      stretch_level: draft.stretch_level as PrivateChallengeStretchLevel,
      preferred_context: draft.preferred_context,
      meaningful_type: draft.meaningful_type,
      avoid_types: draft.avoid_types,
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
    return normalizeProfile(data as ProfileRow);
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
