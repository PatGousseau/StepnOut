// Shared vocabulary and sanitisation for LLM-generated side quests.
//
// side_quests carries NOT NULL tag columns with cardinality CHECK constraints.
// OpenAI strict json_schema mode does not support minItems/maxItems, so the
// model is constrained to the right *values* by enum and the *cardinality* is
// clamped here. Anything missing falls back to a default, so a malformed model
// response can never fail the insert.

export const GOAL_TAGS = [
  'novelty',
  'fun',
  'connection',
  'momentum',
  'creativity',
  'better_stories',
] as const;

export const BARRIER_TAGS = [
  'low_energy',
  'overthinking',
  'spending_money',
  'planning',
  'social_hesitation',
  'going_far',
  'not_knowing',
  'feeling_self_conscious',
] as const;

export const CONTEXT_TAGS = [
  'at_home',
  'near_home',
  'out_in_the_city',
  'with_other_people',
  'solo',
] as const;

export const TYPE_TAGS = [
  'playful',
  'creative',
  'exploratory',
  'social',
  'reflective',
  'growth_edge',
] as const;

export const OUTCOME_TAGS = [
  'did_something_unusual',
  'more_stories',
  'days_less_repetitive',
  'followed_impulses',
  'explored_more',
  'felt_more_alive',
  'shared_more_with_people',
] as const;

export const AVOID_FLAGS = [
  'spending_money',
  'talking_to_strangers',
  'group_social_situations',
  'lots_of_planning',
  'physically_demanding',
  'nighttime',
  'going_far',
] as const;

export const STRETCH_LEVELS = ['easy_win', 'moderate_push', 'bold_nudge'] as const;

export type Horizon = 'today' | 'weekend';

export type GeneratedQuest = {
  horizon: Horizon;
  title: string;
  summary: string;
  goal_tags: string[];
  barrier_tags: string[];
  context_tags: string[];
  type_tags: string[];
  outcome_tags: string[];
  avoid_flags: string[];
  stretch_level: string;
  cost_level: number;
  planning_level: number;
  social_level: number;
  physical_level: number;
  distance_level: number;
  night_level: number;
};

function tagArraySchema(values: readonly string[]) {
  return {
    type: 'array',
    items: { type: 'string', enum: [...values] },
  };
}

function levelSchema() {
  return { type: 'integer', minimum: 0, maximum: 3 };
}

export const QUEST_GENERATION_SCHEMA = {
  type: 'object',
  properties: {
    readback: {
      type: 'array',
      description: 'Exactly three short lines.',
      items: { type: 'string', maxLength: 90 },
    },
    quests: {
      type: 'array',
      description: 'Exactly two quests: one with horizon "today", one with horizon "weekend".',
      items: {
        type: 'object',
        properties: {
          horizon: { type: 'string', enum: ['today', 'weekend'] },
          title: { type: 'string', maxLength: 60 },
          summary: { type: 'string', maxLength: 160 },
          goal_tags: tagArraySchema(GOAL_TAGS),
          barrier_tags: tagArraySchema(BARRIER_TAGS),
          context_tags: tagArraySchema(CONTEXT_TAGS),
          type_tags: tagArraySchema(TYPE_TAGS),
          outcome_tags: tagArraySchema(OUTCOME_TAGS),
          avoid_flags: tagArraySchema(AVOID_FLAGS),
          stretch_level: { type: 'string', enum: [...STRETCH_LEVELS] },
          cost_level: levelSchema(),
          planning_level: levelSchema(),
          social_level: levelSchema(),
          physical_level: levelSchema(),
          distance_level: levelSchema(),
          night_level: { type: 'integer', minimum: 0, maximum: 1 },
        },
        required: [
          'horizon',
          'title',
          'summary',
          'goal_tags',
          'barrier_tags',
          'context_tags',
          'type_tags',
          'outcome_tags',
          'avoid_flags',
          'stretch_level',
          'cost_level',
          'planning_level',
          'social_level',
          'physical_level',
          'distance_level',
          'night_level',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['readback', 'quests'],
  additionalProperties: false,
} as const;

function clampTags(
  raw: unknown,
  allowed: readonly string[],
  min: number,
  max: number,
  fallback: string,
): string[] {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set<string>();
  for (const item of list) {
    if (typeof item === 'string' && allowed.includes(item)) {
      seen.add(item);
    }
  }
  const cleaned = [...seen].slice(0, max);
  while (cleaned.length < min) {
    if (!cleaned.includes(fallback)) {
      cleaned.push(fallback);
    } else {
      const filler = allowed.find((value) => !cleaned.includes(value));
      if (!filler) break;
      cleaned.push(filler);
    }
  }
  return cleaned;
}

function clampLevel(raw: unknown, max: number, fallback: number): number {
  const value = typeof raw === 'number' && Number.isFinite(raw) ? Math.round(raw) : fallback;
  return Math.min(Math.max(value, 0), max);
}

function clampText(raw: unknown, max: number, fallback: string): string {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return fallback;
  return value.length > max ? value.slice(0, max).trimEnd() : value;
}

export function sanitizeQuest(raw: Record<string, unknown>, horizon: Horizon): GeneratedQuest {
  return {
    horizon,
    title: clampText(raw.title, 60, horizon === 'today' ? 'Something small today' : 'The real one this weekend'),
    summary: clampText(raw.summary, 160, 'A concrete step toward the thing you have been putting off.'),
    goal_tags: clampTags(raw.goal_tags, GOAL_TAGS, 1, 3, 'momentum'),
    barrier_tags: clampTags(raw.barrier_tags, BARRIER_TAGS, 1, 2, 'overthinking'),
    context_tags: clampTags(raw.context_tags, CONTEXT_TAGS, 1, 4, 'near_home'),
    type_tags: clampTags(raw.type_tags, TYPE_TAGS, 1, 3, 'growth_edge'),
    outcome_tags: clampTags(raw.outcome_tags, OUTCOME_TAGS, 1, 3, 'did_something_unusual'),
    // avoid_flags has no minimum, so an empty array is valid.
    avoid_flags: clampTags(raw.avoid_flags, AVOID_FLAGS, 0, AVOID_FLAGS.length, ''),
    stretch_level: STRETCH_LEVELS.includes(raw.stretch_level as typeof STRETCH_LEVELS[number])
      ? (raw.stretch_level as string)
      : horizon === 'today'
        ? 'easy_win'
        : 'moderate_push',
    cost_level: clampLevel(raw.cost_level, 3, 0),
    planning_level: clampLevel(raw.planning_level, 3, horizon === 'today' ? 0 : 1),
    social_level: clampLevel(raw.social_level, 3, 1),
    physical_level: clampLevel(raw.physical_level, 3, 0),
    distance_level: clampLevel(raw.distance_level, 3, horizon === 'today' ? 0 : 1),
    night_level: clampLevel(raw.night_level, 1, 0),
  };
}

/**
 * Always returns exactly two quests, one per horizon, even if the model
 * returned duplicates, one, or none.
 */
export function sanitizeQuestPair(raw: unknown): GeneratedQuest[] {
  const list = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  const horizons: Horizon[] = ['today', 'weekend'];

  return horizons.map((horizon, index) => {
    const match = list.find((item) => item?.horizon === horizon) ?? list[index] ?? {};
    return sanitizeQuest(match, horizon);
  });
}

export function sanitizeReadback(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : [];
  const lines = list
    .filter((line): line is string => typeof line === 'string')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  return lines;
}
