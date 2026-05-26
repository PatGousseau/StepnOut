export type SideQuestGoal =
  | "novelty"
  | "fun"
  | "connection"
  | "momentum"
  | "creativity"
  | "better_stories";

export type SideQuestHardSituation =
  | "low_energy"
  | "overthinking"
  | "spending_money"
  | "planning"
  | "social_hesitation"
  | "going_far"
  | "not_knowing"
  | "feeling_self_conscious";

export type SideQuestStretchLevel = "easy_win" | "moderate_push" | "bold_nudge";

export type SideQuestPreferredContext =
  | "at_home"
  | "near_home"
  | "out_in_the_city"
  | "with_other_people"
  | "solo";

export type SideQuestMeaningfulType =
  | "playful"
  | "creative"
  | "exploratory"
  | "social"
  | "reflective"
  | "growth_edge";

export type SideQuestAvoidType =
  | "spending_money"
  | "talking_to_strangers"
  | "group_social_situations"
  | "lots_of_planning"
  | "physically_demanding"
  | "nighttime"
  | "going_far";

export type SideQuestProgressDefinition =
  | "did_something_unusual"
  | "more_stories"
  | "days_less_repetitive"
  | "followed_impulses"
  | "explored_more"
  | "felt_more_alive"
  | "shared_more_with_people";

export interface SideQuestProfile {
  user_id: string;
  goal: SideQuestGoal[];
  hard_situation: SideQuestHardSituation[];
  stretch_level: SideQuestStretchLevel;
  preferred_context: SideQuestPreferredContext[];
  meaningful_type: SideQuestMeaningfulType[];
  avoid_types: SideQuestAvoidType[];
  progress_definition: SideQuestProgressDefinition[];
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SideQuest {
  id: number;
  title: string;
  summary: string;
  goal_tags: SideQuestGoal[];
  barrier_tags: SideQuestHardSituation[];
  context_tags: SideQuestPreferredContext[];
  type_tags: SideQuestMeaningfulType[];
  outcome_tags: SideQuestProgressDefinition[];
  stretch_level: SideQuestStretchLevel;
  cost_level: number;
  planning_level: number;
  social_level: number;
  physical_level: number;
  distance_level: number;
  night_level: 0 | 1;
  avoid_flags: SideQuestAvoidType[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SideQuestDraw {
  id: number;
  user_id: string;
  quest_id: number;
  local_day: string;
  created_at: string;
}

export interface RankedSideQuest extends SideQuest {
  match_score: number;
  matched_goal_tags: SideQuestGoal[];
  matched_type_tags: SideQuestMeaningfulType[];
  matched_outcome_tags: SideQuestProgressDefinition[];
}

export type DailySideQuestStatus = "undrawn" | "revealed" | "exhausted";

export interface SideQuestQuestionnaireDraft {
  goal: SideQuestGoal[];
  hard_situation: SideQuestHardSituation[];
  stretch_level: SideQuestStretchLevel | null;
  preferred_context: SideQuestPreferredContext[];
  meaningful_type: SideQuestMeaningfulType[];
  avoid_types: SideQuestAvoidType[];
  progress_definition: SideQuestProgressDefinition[];
}
