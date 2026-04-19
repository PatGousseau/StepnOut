export type PrivateChallengeDifficulty = "easy" | "medium" | "hard";
export type PrivateChallengeSetStatus = "pending" | "completed" | "skipped";

export type PrivateChallengeGoal =
  | "confidence"
  | "connection"
  | "spontaneity"
  | "courage"
  | "self_trust"
  | "less_overthinking";

export type PrivateChallengeHardSituation =
  | "talking_to_strangers"
  | "being_seen"
  | "asking_for_what_i_want"
  | "doing_things_alone"
  | "being_playful"
  | "saying_yes";

export type PrivateChallengeStretchLevel = "gentle" | "balanced" | "push_me";

export type PrivateChallengePreferredContext =
  | "at_home"
  | "outside"
  | "social_settings"
  | "work_or_school"
  | "anywhere";

export type PrivateChallengeMeaningfulType =
  | "social"
  | "reflective"
  | "adventurous"
  | "expressive"
  | "practical"
  | "habit_building";

export type PrivateChallengeAvoidType =
  | "spending_money"
  | "talking_to_strangers"
  | "group_social_situations"
  | "physically_demanding"
  | "nighttime"
  | "work_or_school"
  | "none";

export type PrivateChallengeProgressDefinition =
  | "less_anxious"
  | "more_initiative"
  | "talk_to_more_people"
  | "less_overthinking_action"
  | "more_stories";

export interface PrivateChallengeProfile {
  user_id: string;
  goal: PrivateChallengeGoal;
  hard_situation: PrivateChallengeHardSituation;
  stretch_level: PrivateChallengeStretchLevel;
  preferred_context: PrivateChallengePreferredContext;
  meaningful_type: PrivateChallengeMeaningfulType;
  avoid_types: PrivateChallengeAvoidType[];
  progress_definition: PrivateChallengeProgressDefinition;
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
  goal: PrivateChallengeGoal | null;
  hard_situation: PrivateChallengeHardSituation | null;
  stretch_level: PrivateChallengeStretchLevel | null;
  preferred_context: PrivateChallengePreferredContext | null;
  meaningful_type: PrivateChallengeMeaningfulType | null;
  avoid_types: PrivateChallengeAvoidType[];
  progress_definition: PrivateChallengeProgressDefinition | null;
}

export interface PrivateChallengeStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
}
