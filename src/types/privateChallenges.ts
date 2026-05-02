export type PrivateChallengeDifficulty = "easy" | "medium" | "hard";
export type PrivateChallengeSetStatus = "pending" | "completed" | "skipped";

export type PrivateChallengeGoal =
  | "novelty"
  | "fun"
  | "connection"
  | "momentum"
  | "creativity"
  | "better_stories";

export type PrivateChallengeHardSituation =
  | "low_energy"
  | "overthinking"
  | "spending_money"
  | "planning"
  | "social_hesitation"
  | "going_far"
  | "not_knowing"
  | "feeling_self_conscious";

export type PrivateChallengeStretchLevel = "easy_win" | "moderate_push" | "bold_nudge";

export type PrivateChallengePreferredContext =
  | "at_home"
  | "near_home"
  | "out_in_the_city"
  | "with_other_people"
  | "solo";

export type PrivateChallengeMeaningfulType =
  | "playful"
  | "creative"
  | "exploratory"
  | "social"
  | "reflective"
  | "growth_edge";

export type PrivateChallengeAvoidType =
  | "spending_money"
  | "talking_to_strangers"
  | "group_social_situations"
  | "lots_of_planning"
  | "physically_demanding"
  | "nighttime"
  | "going_far";

export type PrivateChallengeProgressDefinition =
  | "did_something_unusual"
  | "more_stories"
  | "days_less_repetitive"
  | "followed_impulses"
  | "explored_more"
  | "felt_more_alive"
  | "shared_more_with_people";

export interface PrivateChallengeProfile {
  user_id: string;
  goal: PrivateChallengeGoal[];
  hard_situation: PrivateChallengeHardSituation[];
  stretch_level: PrivateChallengeStretchLevel;
  preferred_context: PrivateChallengePreferredContext[];
  meaningful_type: PrivateChallengeMeaningfulType[];
  avoid_types: PrivateChallengeAvoidType[];
  progress_definition: PrivateChallengeProgressDefinition[];
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrivateChallenge {
  id: number;
  set_id: number;
  difficulty: PrivateChallengeDifficulty;
  title: string;
  description: string;
  why_this_matters: string;
  coaching_tip: string | null;
  theme: string | null;
  llm_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PrivateChallengeSet {
  id: number;
  user_id: string;
  challenge_date: string;
  status: PrivateChallengeSetStatus;
  completed_difficulty: PrivateChallengeDifficulty | null;
  completed_note: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  private_challenges: PrivateChallenge[];
}

export interface PrivateChallengeQuestionnaireDraft {
  goal: PrivateChallengeGoal[];
  hard_situation: PrivateChallengeHardSituation[];
  stretch_level: PrivateChallengeStretchLevel | null;
  preferred_context: PrivateChallengePreferredContext[];
  meaningful_type: PrivateChallengeMeaningfulType[];
  avoid_types: PrivateChallengeAvoidType[];
  progress_definition: PrivateChallengeProgressDefinition[];
}

export interface PrivateChallengeStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
}
