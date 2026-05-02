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
  goal: [],
  hard_situation: [],
  stretch_level: null,
  preferred_context: [],
  meaningful_type: [],
  avoid_types: [],
  progress_definition: [],
};

export const PRIVATE_CHALLENGE_GOAL_OPTIONS: Option<PrivateChallengeGoal>[] = [
  { id: "novelty", label: "Novelty" },
  { id: "fun", label: "Fun" },
  { id: "connection", label: "Connection" },
  { id: "momentum", label: "Momentum" },
  { id: "creativity", label: "Creativity" },
  { id: "better_stories", label: "Better stories" },
];

export const PRIVATE_CHALLENGE_HARD_SITUATION_OPTIONS: Option<PrivateChallengeHardSituation>[] = [
  { id: "low_energy", label: "Low energy" },
  { id: "overthinking", label: "Overthinking" },
  { id: "spending_money", label: "Not wanting to spend money" },
  { id: "planning", label: "Not wanting to plan" },
  { id: "social_hesitation", label: "Social hesitation" },
  { id: "going_far", label: "Not wanting to go far" },
  { id: "not_knowing", label: "Not knowing what to do" },
  { id: "feeling_self_conscious", label: "Feeling self-conscious" },
];

export const PRIVATE_CHALLENGE_STRETCH_LEVEL_OPTIONS: Option<PrivateChallengeStretchLevel>[] = [
  { id: "easy_win", label: "Easy win" },
  { id: "moderate_push", label: "Moderate push" },
  { id: "bold_nudge", label: "Bold nudge" },
];

export const PRIVATE_CHALLENGE_CONTEXT_OPTIONS: Option<PrivateChallengePreferredContext>[] = [
  { id: "at_home", label: "At home" },
  { id: "near_home", label: "Near home" },
  { id: "out_in_the_city", label: "Out in the city" },
  { id: "with_other_people", label: "With other people" },
  { id: "solo", label: "Solo" },
];

export const PRIVATE_CHALLENGE_MEANINGFUL_TYPE_OPTIONS: Option<PrivateChallengeMeaningfulType>[] = [
  { id: "playful", label: "Playful" },
  { id: "creative", label: "Creative" },
  { id: "exploratory", label: "Exploratory" },
  { id: "social", label: "Social" },
  { id: "reflective", label: "Reflective" },
  { id: "growth_edge", label: "A little uncomfortable in a good way" },
];

export const PRIVATE_CHALLENGE_AVOID_OPTIONS: Option<PrivateChallengeAvoidType>[] = [
  { id: "spending_money", label: "Spending money" },
  { id: "talking_to_strangers", label: "Talking to strangers" },
  { id: "group_social_situations", label: "Group/social situations" },
  { id: "lots_of_planning", label: "Lots of planning" },
  { id: "physically_demanding", label: "Physically demanding activities" },
  { id: "nighttime", label: "Nighttime activities" },
  { id: "going_far", label: "Going far" },
];

export const PRIVATE_CHALLENGE_PROGRESS_OPTIONS: Option<PrivateChallengeProgressDefinition>[] = [
  { id: "did_something_unusual", label: "I did things I normally would not do" },
  { id: "more_stories", label: "I have more stories and memories" },
  { id: "days_less_repetitive", label: "My days felt less repetitive" },
  { id: "followed_impulses", label: "I followed impulses more often" },
  { id: "explored_more", label: "I explored my city or area more" },
  { id: "felt_more_alive", label: "I felt more alive and engaged" },
  { id: "shared_more_with_people", label: "I shared more moments with people" },
];
