/**
 * Comfort-Zone Event Pipeline — production-ready, self-verifying.
 *
 * Lift-and-shift artifact from the Claude-driven harness (see README.md).
 * The loop tuned the STRATEGY (config.json) and the JUDGE (rubric.md). This file
 * encodes the converged strategy + the v2 (corrected) judge as runnable TypeScript.
 * `run.ts` executes it against real fixtures and prints results.
 *
 * v2 objective (user correction): difficulty is NOT quality. All genuine
 * comfort-zone activities are peers. Quality = verifiability + cost + attendability;
 * variety across time is enforced by selectDiverse(). Difficulty is a display label.
 *
 * Autonomous deps to implement: search / fetchAndExtract / findPois / verifyOccurrence.
 */

// ---------------------------------------------------------------------------
// Schema (subset of UnifiedQuest, report §5.1)
// ---------------------------------------------------------------------------

export type QuestKind =
  | 'language_social' | 'dance_movement' | 'meetup_hobby' | 'community_sagra'
  | 'concert' | 'cinema' | 'exhibition' | 'market'
  | 'self_directed_mission';

export type Confidence =
  | 'confirmed_dated' | 'recurring_scheduled' | 'self_directed'
  | 'recurring_unresolved' | 'listed_unconfirmed';

export type Difficulty = 1 | 2 | 3 | 4 | 5;      // metadata label only — NOT scored
export type AttendMode = 'solo' | 'bring_friend' | 'either';

export interface UnifiedQuest {
  id: string;
  source: string;
  source_url: string | null;
  title: string;
  description: string | null;
  kind: QuestKind;
  difficulty: Difficulty;                // shown to the user; never affects score
  attend_mode: AttendMode;
  start_datetime: string | null;
  recurrence: string | null;
  venue_name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  city: string;
  price_eur: number | null;
  is_free: boolean;
  confidence: Confidence;
  verified_upcoming?: boolean;
  age_restricted?: boolean;
  eligible_reason?: string;              // why it counts as a comfort-zone outing
}

// ---------------------------------------------------------------------------
// User context (replaces the old difficulty-scoring persona)
// ---------------------------------------------------------------------------

export interface UserContext {
  id: string;
  recentKinds: QuestKind[];              // for diversity — kinds assigned lately
  /** Optional FILTER (a preference), not a quality lever. Undefined = no cap. */
  maxDifficulty?: Difficulty;
  allowAgeRestricted: boolean;
}

// ---------------------------------------------------------------------------
// Config (mirrors config.json)
// ---------------------------------------------------------------------------

const RADIUS_BY_POP: { maxPop: number | null; km: number }[] = [
  { maxPop: 50_000, km: 40 }, { maxPop: 150_000, km: 25 },
  { maxPop: 500_000, km: 15 }, { maxPop: null, km: 6 },
];

// Categories are now equal-value; we query a SPREAD to enable diversity, not to rank.
const CATEGORIES: { id: QuestKind; queries: string[] }[] = [
  { id: 'language_social', queries: ['language exchange {city} {month} {year}', 'BlaBla {city} language exchange'] },
  { id: 'dance_movement', queries: ['{city} corso ballo principianti serata {month} {year}'] },
  { id: 'meetup_hobby', queries: ['{city} meetup {month} {year} conoscere persone'] },
  { id: 'community_sagra', queries: ['sagra {city} provincia {month} {year} weekend'] },
  { id: 'concert', queries: ['eventi gratuiti {city} {month} {year} weekend concerti mostre'] },
];

const ACTIONABLE_FLOOR = 6;   // if nothing scores this high, the self-directed fallback fires

// ---------------------------------------------------------------------------
// Injected dependencies
// ---------------------------------------------------------------------------

export interface Deps {
  search: (query: string) => Promise<{ title: string; url: string }[]>;
  fetchAndExtract: (url: string, city: string) => Promise<UnifiedQuest[]>;
  findPois: (city: string, kind: 'bar_cafe' | 'museum' | 'market') => Promise<
    { name: string; address: string; lat: number; lng: number }[]
  >;
  verifyOccurrence?: (q: UnifiedQuest) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Judge (mirrors rubric v2) — verifiability + cost + attendability. NO difficulty.
// ---------------------------------------------------------------------------

export function scoreQuest(q: UnifiedQuest): {
  aggregate: number; verifiability: number; cost: number; attendability: number;
} {
  const verifiability =
    q.confidence === 'confirmed_dated' ? 10 :
    q.confidence === 'recurring_scheduled' ? 9 :
    q.confidence === 'self_directed' ? 8 :
    q.confidence === 'recurring_unresolved' ? 6 :
    q.source_url ? 5 : 2;
  const cost = q.is_free ? 10 : (q.price_eur ?? 99) <= 15 ? 7 : (q.price_eur ?? 99) <= 30 ? 4 : 1;
  const attendability =
    q.attend_mode === 'solo' || q.attend_mode === 'either' ? 10 :
    q.attend_mode === 'bring_friend' ? 9 : 5;
  const aggregate = Math.round((0.45 * verifiability + 0.30 * cost + 0.25 * attendability) * 10) / 10;
  return { aggregate, verifiability, cost, attendability };
}

/** Gate: is this a genuine comfort-zone outing and safe for this user? Type does not rank. */
export function isEligible(q: UnifiedQuest, ctx?: UserContext): boolean {
  if (ctx && q.age_restricted && !ctx.allowAgeRestricted) return false;
  if (ctx?.maxDifficulty && q.difficulty > ctx.maxDifficulty) return false; // a FILTER, not a score
  return true; // all current kinds are real outings
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: 'gentle', 2: 'easy', 3: 'moderate', 4: 'bold', 5: 'brave',
};

export function scoreCity(quests: UnifiedQuest[]): number {
  if (quests.length === 0) return 0;
  return Math.max(...quests.map(q => scoreQuest(q).aggregate));
}

// ---------------------------------------------------------------------------
// Diversity selector (the real chooser in v2)
// ---------------------------------------------------------------------------

/**
 * Prefer a high-quality candidate whose KIND the user hasn't done recently.
 * This is what stops the app assigning language exchange every week.
 */
export function selectDiverse(pool: UnifiedQuest[], recentKinds: QuestKind[]): UnifiedQuest | null {
  if (pool.length === 0) return null;
  const byScore = [...pool].sort((a, b) => scoreQuest(b).aggregate - scoreQuest(a).aggregate);
  const fresh = byScore.filter(q => !recentKinds.includes(q.kind));
  return (fresh.length ? fresh : byScore)[0];
}

export function rankForUser(quests: UnifiedQuest[], ctx: UserContext): UnifiedQuest[] {
  const eligible = quests.filter(q => isEligible(q, ctx));
  // Diversity-first ordering: unseen kinds ahead of repeats, then by quality.
  return eligible.sort((a, b) => {
    const aFresh = ctx.recentKinds.includes(a.kind) ? 0 : 1;
    const bFresh = ctx.recentKinds.includes(b.kind) ? 0 : 1;
    if (aFresh !== bFresh) return bFresh - aFresh;
    return scoreQuest(b).aggregate - scoreQuest(a).aggregate;
  });
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

function radiusKm(pop: number): number {
  return (RADIUS_BY_POP.find(r => r.maxPop === null || pop <= r.maxPop) ?? RADIUS_BY_POP[RADIUS_BY_POP.length - 1]).km;
}
function fill(q: string, city: string, when: { month: string; year: string }): string {
  return q.split('{city}').join(city).split('{month}').join(when.month).split('{year}').join(when.year);
}

export interface CityResult {
  primary: UnifiedQuest; backups: UnifiedQuest[]; radiusKmUsed: number; usedFallback: boolean;
}

export async function sourceCity(
  city: string, population: number, when: { month: string; year: string },
  ctx: UserContext, deps: Deps,
): Promise<CityResult> {
  const radius = radiusKm(population);
  const found: UnifiedQuest[] = [];

  // Query a spread of categories so the diversity selector has real variety to pick from.
  for (const cat of CATEGORIES) {
    for (const template of cat.queries) {
      const results = await deps.search(fill(template, city, when));
      for (const r of results.slice(0, 2)) found.push(...(await deps.fetchAndExtract(r.url, city)));
    }
  }

  if (deps.verifyOccurrence) {
    for (const q of found) {
      if (q.confidence === 'recurring_scheduled' && q.verified_upcoming === undefined) {
        q.verified_upcoming = await deps.verifyOccurrence(q);
        if (!q.verified_upcoming) q.confidence = 'recurring_unresolved';
      }
    }
  }

  const pool = dedupe(found).filter(q => isEligible(q, ctx));
  const bestActionable = pool.reduce((m, q) => Math.max(m, scoreQuest(q).aggregate), 0);

  if (pool.length === 0 || bestActionable < ACTIONABLE_FLOOR) {
    const mission = await buildFallbackMission(city, ctx, deps);
    return { primary: mission, backups: rankForUser(pool, ctx).slice(0, 4), radiusKmUsed: radius, usedFallback: true };
  }

  const ranked = rankForUser(pool, ctx);
  const primary = selectDiverse(pool, ctx.recentKinds) ?? ranked[0];
  return {
    primary,
    backups: ranked.filter(q => q.id !== primary.id).slice(0, 4),
    radiusKmUsed: radius, usedFallback: false,
  };
}

async function buildFallbackMission(city: string, ctx: UserContext, deps: Deps): Promise<UnifiedQuest> {
  const [spot] = await deps.findPois(city, 'bar_cafe');
  return {
    id: `mission:${city}:aperitivo`, source: 'self_directed', source_url: null,
    title: 'Solo aperitivo mission', kind: 'self_directed_mission', difficulty: 4, attend_mode: 'either',
    description: `Go to ${spot?.name ?? 'a busy central bar'} around 18:30, sit at the bar, order the local way, ` +
      `and start one conversation (or bring a friend and make it a dare together). Stay 45 min.`,
    start_datetime: null, recurrence: 'anytime', venue_name: spot?.name ?? null, address: spot?.address ?? null,
    lat: spot?.lat ?? null, lng: spot?.lng ?? null, city, price_eur: 10, is_free: false,
    confidence: 'self_directed', age_restricted: false, eligible_reason: 'self-directed social outing',
  };
}

// ---------------------------------------------------------------------------
// Dedup (report §5.2)
// ---------------------------------------------------------------------------

export function dedupe(quests: UnifiedQuest[]): UnifiedQuest[] {
  const seen = new Map<string, UnifiedQuest>();
  for (const q of quests) {
    const key = `${normTitle(q.title)}|${q.city}|${q.start_datetime ?? q.recurrence ?? ''}`;
    const prior = seen.get(key);
    if (!prior || scoreQuest(q).aggregate > scoreQuest(prior).aggregate) seen.set(key, q);
  }
  return [...seen.values()];
}

const NOISE = new Set(['live', 'serata', 'evento', 'event', 'the', 'di', 'a', 'il', 'la', 'free']);
function normTitle(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter(w => w && !NOISE.has(w)).join(' ');
}
