import {
  RankedSideQuest,
  SideQuest,
  SideQuestHardSituation,
  SideQuestProfile,
} from "../types/sideQuests";

const STRETCH_LEVEL_VALUE = {
  easy_win: 1,
  moderate_push: 2,
  bold_nudge: 3,
} as const;

const GOAL_MATCH_WEIGHT = 8;
const BARRIER_MATCH_WEIGHT = 6;
const CONTEXT_MATCH_WEIGHT = 5;
const TYPE_MATCH_WEIGHT = 6;
const OUTCOME_MATCH_WEIGHT = 5;
const AVOID_PENALTY_WEIGHT = 12;

const FRICTION_PENALTIES: Record<SideQuestHardSituation, (quest: SideQuest) => number> = {
  low_energy: (quest) => 4 * quest.physical_level,
  overthinking: (quest) => 4 * quest.planning_level,
  spending_money: (quest) => 5 * quest.cost_level,
  planning: (quest) => 5 * quest.planning_level,
  social_hesitation: (quest) => 4 * quest.social_level,
  going_far: (quest) => 5 * quest.distance_level,
  not_knowing: (quest) => 3 * quest.planning_level,
  feeling_self_conscious: (quest) => 4 * quest.social_level,
};

function getOverlapCount<T extends string>(selected: T[], available: T[]) {
  return selected.filter((value) => available.includes(value)).length;
}

function getOverlapValues<T extends string>(selected: T[], available: T[]) {
  return selected.filter((value) => available.includes(value));
}

function getStretchMatchScore(profile: SideQuestProfile, quest: SideQuest) {
  const distance = Math.abs(
    STRETCH_LEVEL_VALUE[profile.stretch_level] - STRETCH_LEVEL_VALUE[quest.stretch_level]
  );

  if (distance === 0) return 12;
  if (distance === 1) return 7;
  return 0;
}

function getAvoidPenalty(profile: SideQuestProfile, quest: SideQuest) {
  return getOverlapCount(profile.avoid_types, quest.avoid_flags) * AVOID_PENALTY_WEIGHT;
}

function getFrictionPenalty(profile: SideQuestProfile, quest: SideQuest) {
  return profile.hard_situation.reduce((total, barrier) => total + FRICTION_PENALTIES[barrier](quest), 0);
}

export function rankSideQuests(
  profile: SideQuestProfile,
  quests: SideQuest[]
): RankedSideQuest[] {
  return quests
    .filter((quest) => quest.is_active)
    .map((quest) => {
      const matchedGoalTags = getOverlapValues(profile.goal, quest.goal_tags);
      const matchedTypeTags = getOverlapValues(profile.meaningful_type, quest.type_tags);
      const matchedOutcomeTags = getOverlapValues(profile.progress_definition, quest.outcome_tags);

      const score =
        matchedGoalTags.length * GOAL_MATCH_WEIGHT +
        getOverlapCount(profile.hard_situation, quest.barrier_tags) * BARRIER_MATCH_WEIGHT +
        getOverlapCount(profile.preferred_context, quest.context_tags) * CONTEXT_MATCH_WEIGHT +
        matchedTypeTags.length * TYPE_MATCH_WEIGHT +
        matchedOutcomeTags.length * OUTCOME_MATCH_WEIGHT +
        getStretchMatchScore(profile, quest) -
        getAvoidPenalty(profile, quest) -
        getFrictionPenalty(profile, quest);

      return {
        ...quest,
        match_score: score,
        matched_goal_tags: matchedGoalTags,
        matched_type_tags: matchedTypeTags,
        matched_outcome_tags: matchedOutcomeTags,
      };
    })
    .sort((a, b) => b.match_score - a.match_score || a.title.localeCompare(b.title));
}
