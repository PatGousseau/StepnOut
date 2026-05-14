import { supabase } from "../lib/supabase";
import {
  RankedSideQuest,
  SideQuest,
  SideQuestAvoidType,
  SideQuestDraw,
  SideQuestGoal,
  SideQuestHardSituation,
  SideQuestMeaningfulType,
  SideQuestPreferredContext,
  SideQuestProfile,
  SideQuestProgressDefinition,
  SideQuestQuestionnaireDraft,
  SideQuestStretchLevel,
} from "../types/sideQuests";

type ProfileRow = Omit<
  SideQuestProfile,
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

type SideQuestRow = Omit<
  SideQuest,
  "goal_tags" | "barrier_tags" | "context_tags" | "type_tags" | "outcome_tags" | "avoid_flags"
> & {
  goal_tags: string[] | null;
  barrier_tags: string[] | null;
  context_tags: string[] | null;
  type_tags: string[] | null;
  outcome_tags: string[] | null;
  avoid_flags: string[] | null;
};

type SideQuestDrawRow = SideQuestDraw;

type ClaimDailyQuestRow = {
  status: "created" | "existing" | "exhausted";
  draw_id: number | null;
  draw_local_day: string;
  quest: SideQuestRow | null;
};

function toArray<T extends string>(value: T[] | T | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

const GOAL_MAP: Record<string, SideQuestGoal> = {
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

const HARD_SITUATION_MAP: Record<string, SideQuestHardSituation> = {
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

const STRETCH_LEVEL_MAP: Record<string, SideQuestStretchLevel> = {
  easy_win: "easy_win",
  moderate_push: "moderate_push",
  bold_nudge: "bold_nudge",
  gentle: "easy_win",
  balanced: "moderate_push",
  push_me: "bold_nudge",
};

const CONTEXT_MAP: Record<string, SideQuestPreferredContext | SideQuestPreferredContext[]> = {
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

const MEANINGFUL_TYPE_MAP: Record<string, SideQuestMeaningfulType> = {
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

const AVOID_TYPE_MAP: Record<string, SideQuestAvoidType> = {
  spending_money: "spending_money",
  talking_to_strangers: "talking_to_strangers",
  group_social_situations: "group_social_situations",
  lots_of_planning: "lots_of_planning",
  physically_demanding: "physically_demanding",
  nighttime: "nighttime",
  going_far: "going_far",
  work_or_school: "lots_of_planning",
};

const PROGRESS_DEFINITION_MAP: Record<string, SideQuestProgressDefinition> = {
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

function normalizeProfile(row: ProfileRow): SideQuestProfile {
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

function normalizeSideQuest(row: SideQuestRow): SideQuest {
  return {
    ...row,
    goal_tags: mapValues(row.goal_tags, GOAL_MAP),
    barrier_tags: mapValues(row.barrier_tags, HARD_SITUATION_MAP),
    context_tags: mapValuesExpanded(row.context_tags, CONTEXT_MAP),
    type_tags: mapValues(row.type_tags, MEANINGFUL_TYPE_MAP),
    outcome_tags: mapValues(row.outcome_tags, PROGRESS_DEFINITION_MAP),
    avoid_flags: mapValues(row.avoid_flags, AVOID_TYPE_MAP),
    stretch_level: STRETCH_LEVEL_MAP[row.stretch_level] || "moderate_push",
    night_level: row.night_level === 1 ? 1 : 0,
  };
}

function normalizeDraw(row: SideQuestDrawRow): SideQuestDraw {
  return row;
}

export const sideQuestService = {
  async fetchProfile(userId: string): Promise<SideQuestProfile | null> {
    const { data, error } = await supabase
      .from("side_quest_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data ? normalizeProfile(data as ProfileRow) : null;
  },

  async saveProfile(userId: string, draft: SideQuestQuestionnaireDraft): Promise<SideQuestProfile> {
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
      stretch_level: draft.stretch_level as SideQuestStretchLevel,
      preferred_context: draft.preferred_context,
      meaningful_type: draft.meaningful_type,
      avoid_types: draft.avoid_types,
      progress_definition: draft.progress_definition,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("side_quest_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw error;
    return normalizeProfile(data as ProfileRow);
  },

  async fetchSideQuests(): Promise<SideQuest[]> {
    const { data, error } = await supabase
      .from("side_quests")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) throw error;
    return (data || []).map((row) => normalizeSideQuest(row as SideQuestRow));
  },

  async fetchDailyDraw(userId: string, localDay: string): Promise<{ draw: SideQuestDraw; quest: SideQuest } | null> {
    const { data, error } = await supabase
      .from("side_quest_draws")
      .select("id, user_id, quest_id, local_day, created_at, side_quests (*)")
      .eq("user_id", userId)
      .eq("local_day", localDay)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.side_quests) return null;

    return {
      draw: normalizeDraw({
        id: data.id,
        user_id: data.user_id,
        quest_id: data.quest_id,
        local_day: data.local_day,
        created_at: data.created_at,
      } as SideQuestDrawRow),
      quest: normalizeSideQuest(data.side_quests as unknown as SideQuestRow),
    };
  },

  async claimDailyQuest(userId: string, rankedQuests: RankedSideQuest[], localDay: string): Promise<{
    status: "created" | "existing" | "exhausted";
    draw: SideQuestDraw | null;
    quest: SideQuest | null;
  }> {
    const rankedIds = rankedQuests.map((quest) => quest.id);
    const { data, error } = await supabase.rpc("claim_daily_side_quest", {
      ranked_quest_ids: rankedIds,
      requested_local_day: localDay,
    });

    if (error) throw error;

    const row = (Array.isArray(data) ? data[0] : data) as ClaimDailyQuestRow | null;
    if (!row || row.status === "exhausted" || !row.quest || !row.draw_id) {
      return { status: "exhausted", draw: null, quest: null };
    }

    const persisted = await this.fetchDailyDraw(userId, localDay);

    return {
      status: row.status,
      draw: persisted?.draw || null,
      quest: persisted?.quest || normalizeSideQuest(row.quest as unknown as SideQuestRow),
    };
  },
};
