import {
  PrivateChallengeAvoidType,
  PrivateChallengeGoal,
  PrivateChallengeHardSituation,
  PrivateChallengeMeaningfulType,
  PrivateChallengePreferredContext,
  PrivateChallengeProgressDefinition,
  PrivateChallengeQuestionnaireDraft,
  PrivateChallengeStretchLevel,
} from "../types/privateChallenges";

type Option<T extends string> = {
  id: T;
  label: string;
};

export const PRIVATE_CHALLENGE_EMPTY_DRAFT: PrivateChallengeQuestionnaireDraft = {
  goal: null,
  hard_situation: null,
  stretch_level: null,
  preferred_context: null,
  meaningful_type: null,
  avoid_types: [],
  progress_definition: null,
};

export const PRIVATE_CHALLENGE_GOAL_OPTIONS: Option<PrivateChallengeGoal>[] = [
  { id: "confidence", label: "Confidence" },
  { id: "connection", label: "Connection" },
  { id: "spontaneity", label: "Spontaneity" },
  { id: "courage", label: "Courage" },
  { id: "self_trust", label: "Self-trust" },
  { id: "less_overthinking", label: "Less overthinking" },
];

export const PRIVATE_CHALLENGE_HARD_SITUATION_OPTIONS: Option<PrivateChallengeHardSituation>[] = [
  { id: "talking_to_strangers", label: "Talking to strangers" },
  { id: "being_seen", label: "Being seen / standing out" },
  { id: "asking_for_what_i_want", label: "Asking for what I want" },
  { id: "doing_things_alone", label: "Doing things alone" },
  { id: "being_playful", label: "Being playful or silly" },
  { id: "saying_yes", label: "Saying yes to unfamiliar things" },
];

export const PRIVATE_CHALLENGE_STRETCH_LEVEL_OPTIONS: Option<PrivateChallengeStretchLevel>[] = [
  { id: "gentle", label: "Gentle" },
  { id: "balanced", label: "Balanced" },
  { id: "push_me", label: "Push me" },
];

export const PRIVATE_CHALLENGE_CONTEXT_OPTIONS: Option<PrivateChallengePreferredContext>[] = [
  { id: "at_home", label: "At home" },
  { id: "outside", label: "Outside" },
  { id: "social_settings", label: "Social settings" },
  { id: "work_or_school", label: "Work or school" },
  { id: "anywhere", label: "Anywhere" },
];

export const PRIVATE_CHALLENGE_MEANINGFUL_TYPE_OPTIONS: Option<PrivateChallengeMeaningfulType>[] = [
  { id: "social", label: "Social" },
  { id: "reflective", label: "Reflective" },
  { id: "adventurous", label: "Adventurous" },
  { id: "expressive", label: "Expressive" },
  { id: "practical", label: "Practical" },
  { id: "habit_building", label: "Tiny habit-building" },
];

export const PRIVATE_CHALLENGE_AVOID_OPTIONS: Option<PrivateChallengeAvoidType>[] = [
  { id: "spending_money", label: "Spending money" },
  { id: "talking_to_strangers", label: "Talking to strangers" },
  { id: "group_social_situations", label: "Group/social situations" },
  { id: "physically_demanding", label: "Physically demanding activities" },
  { id: "nighttime", label: "Nighttime activities" },
  { id: "work_or_school", label: "Work or school situations" },
  { id: "none", label: "None of these" },
];

export const PRIVATE_CHALLENGE_PROGRESS_OPTIONS: Option<PrivateChallengeProgressDefinition>[] = [
  { id: "less_anxious", label: "I feel less anxious" },
  { id: "more_initiative", label: "I take more initiative" },
  { id: "talk_to_more_people", label: "I talk to more people" },
  { id: "less_overthinking_action", label: "I do things without overthinking" },
  { id: "more_stories", label: "I have more stories and memories" },
];
