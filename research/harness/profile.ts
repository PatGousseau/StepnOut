/**
 * Iteration 7 — PERSONALIZATION LAYER.  ·  Iteration 8 — the five fixes.
 *
 * Everything up to iter 6 judged a quest in the abstract: is it real, cheap, and
 * attendable? That's a FLOOR (validity). It says nothing about whether this quest
 * is right for THIS person. This file adds the second, separate stage:
 *
 *     validity (pipeline.ts scoreQuest)  -> pass/fail gate, unchanged
 *     fit      (profile.ts  scoreFit)    -> the product decision
 *
 * The two numbers are deliberately never merged. A quest can be perfectly valid
 * (10/10) and a terrible fit (2/10); that is the normal case, not an anomaly.
 *
 * ---------------------------------------------------------------------------
 * ITER 8 CHANGELOG — structural only. THE WEIGHTS ARE UNCHANGED FROM ITER 7,
 * on purpose: if the weights moved too, the before/after would be unreadable.
 *
 *  fix 1  bail  -> a near-FILTER with an escalation override, not a 15% nudge
 *  fix 2  diversity -> a hard exclusion at selection, not a 10% novelty term
 *  fix 3  thin input -> flagged and questioned, not silently guessed at
 *  fix 4  bail flags -> negation-aware ("no course" no longer reads as a course)
 *  fix 5  ties -> explicit deterministic tiebreak, never array order
 *  fix 6  pull -> matches CONTENT, not taxonomy (partial fix for iter-7 finding 7)
 *
 * Filters relax in a fixed order when they would empty the pool, and every
 * relaxation is recorded on the assignment. A silent relaxation would be a
 * filter that isn't really a filter.
 * ---------------------------------------------------------------------------
 *
 * ⚠️ FIDELITY CAVEAT — READ BEFORE TRUSTING ANY NUMBER BELOW
 *
 * The brief says: keep the user's raw wording, match on what they actually said.
 * In production that matching is ONE MODEL CALL — the model reads the profile
 * text and the candidate and judges pull/edge/bail directly.
 *
 * This harness runs offline (no key, no spend), so matchers here are LEXICAL:
 * a keyword lexicon plus token overlap. That is a deliberately weak stand-in.
 * It captures "she said tango, this is a tango night" and completely misses
 * "I want to feel less invisible" -> open-mic. Failures in the iteration logs
 * are tagged [LEXICAL] (the stand-in missed it) vs [DESIGN] (the structure is
 * wrong), because only the second kind survives the swap to a real model.
 */

import {
  scoreQuest, isEligible, DIFFICULTY_LABEL,
  type UnifiedQuest, type QuestKind, type Difficulty,
} from './pipeline';

// ---------------------------------------------------------------------------
// 1. Profile — mirrors what the intake flow actually collects
// ---------------------------------------------------------------------------

export type SoloHistory = 'never' | 'once_or_twice' | 'regularly';

export interface FollowUp {
  question: string;
  answer: string;
}

export interface QuestHistoryEntry {
  week: number;
  questId: string;
  kind: QuestKind;
  difficulty: Difficulty;
  attended: boolean;
}

export interface UserProfile {
  id: string;
  /** Raw text: "the thing you've been meaning to do". Never tag-collapsed. */
  meaningToDo: string;
  /** Raw text: "what would make you bail". May be empty — the flow allows skipping. */
  bailCondition: string;
  soloHistory: SoloHistory;
  city: string;
  neighbourhood?: string;
  /** Absent when the adaptive follow-up didn't return in time. This is common. */
  followUp?: FollowUp[];
  /** Absent for a brand-new user. */
  history?: QuestHistoryEntry[];
}

/**
 * All the free text THIS USER gave us, lowercased, in one blob.
 *
 * iter 9: the follow-up QUESTION used to be included here. It is authored by us,
 * not by them, so matching on it means matching on our own words. In the first
 * live run this cost Marco his quest: the question "What kind of thing appeals?"
 * put "app" in his profile text, "app" is in the language-exchange vocabulary,
 * and he was handed a language exchange over four real dance events. Only what
 * the user typed counts.
 */
function profileText(p: UserProfile): string {
  const fu = (p.followUp ?? []).map(f => f.answer).join(' ');
  return `${p.meaningToDo} ${p.bailCondition} ${fu}`.toLowerCase();
}

/**
 * ITER 8 fix 3 — discomfort is read ONLY from the bail answer and follow-up
 * answers, never from `meaningToDo`. Iter 7 read Elena's "look at art slowly"
 * (a preference, stated as something she WANTS) as a named discomfort and
 * awarded her edge 9 for it. What someone is drawn to is not what they fear.
 */
function discomfortText(p: UserProfile): string {
  const fu = (p.followUp ?? []).map(f => f.answer).join(' ');
  return `${p.bailCondition} ${fu}`.toLowerCase();
}

// ---------------------------------------------------------------------------
// 2. Data depth — ITER 8 fix 3: thin input is surfaced, not silently guessed at
// ---------------------------------------------------------------------------

export interface DataDepth {
  words: number;
  level: 'thin' | 'ok' | 'rich';
  /** True when we do not have enough to personalise honestly. */
  needsMoreInput: boolean;
  /** The one question the intake flow should ask before assigning. */
  followUpQuestion: string | null;
}

export function dataDepth(p: UserProfile): DataDepth {
  const words = profileText(p).split(/\s+/).filter(Boolean).length;
  const level = words < 12 ? 'thin' : words < 30 ? 'ok' : 'rich';
  const noBail = p.bailCondition.trim().length === 0;
  const needsMoreInput = level === 'thin' || (noBail && !p.followUp);

  let followUpQuestion: string | null = null;
  if (level === 'thin') {
    followUpQuestion = 'Name one specific thing you keep not getting round to — a place, a skill, ' +
      'a kind of evening. One sentence is enough.';
  } else if (noBail) {
    followUpQuestion = "What would make you cancel on the day? Cost, crowds, going alone, something else?";
  }
  return { words, level, needsMoreInput, followUpQuestion };
}

// ---------------------------------------------------------------------------
// 3. Lexicon — the offline stand-in for the matching model
// ---------------------------------------------------------------------------

/** Terms that, if present in the user's own words, point at a quest kind. */
const KIND_LEXICON: Record<QuestKind, string[]> = {
  language_social: ['italian', 'italiano', 'language', 'lingua', 'speak', 'parlare', 'tandem',
    'conversation', 'expat', 'foreigners', 'duolingo', 'app'],
  dance_movement: ['dance', 'dancing', 'ballo', 'ballare', 'salsa', 'tango', 'swing', 'move',
    'body', 'lessons'],
  meetup_hobby: ['meet', 'people', 'friends', 'gente', 'board', 'games', 'club', 'group',
    'hobby', 'workshop', 'making', 'build'],
  community_sagra: ['food', 'local', 'village', 'sagra', 'festival', 'town', 'community'],
  concert: ['music', 'musica', 'concert', 'concerto', 'gig', 'live', 'jazz', 'band', 'listen'],
  cinema: ['film', 'cinema', 'movie', 'screening'],
  exhibition: ['art', 'arte', 'draw', 'drawing', 'paint', 'painting', 'sketch', 'museum',
    'museo', 'gallery', 'exhibition', 'mostra', 'design'],
  market: ['market', 'mercato', 'browse', 'wander', 'explore', 'walk', 'vintage', 'antique'],
  self_directed_mission: [],
};

/**
 * The discomfort each kind actually asks for. "Edge" only counts when the
 * discomfort a quest demands is one the USER named — generic hardness doesn't.
 *
 * ITER 8 fix 3: pruned the ambiguous entries ('slow', 'lingering', 'in',
 * 'aimless') that read preferences as fears.
 */
const KIND_DISCOMFORT: Record<QuestKind, string[]> = {
  language_social: ['strangers', 'stranger', 'talking', 'talk', 'speak', 'speaking', 'awkward',
    'shy', 'introduce', 'mistakes', 'embarrass', 'freeze', 'tongue'],
  dance_movement: ['watched', 'watching', 'clumsy', 'beginner', 'foolish', 'coordination',
    'perform', 'stupid'],
  meetup_hobby: ['group', 'groups', 'newcomer', 'clique', 'joining', 'walking in'],
  community_sagra: ['crowd', 'crowds', 'stranger', 'strangers'],
  concert: ['alone', 'solo', 'myself', 'nobody', 'invisible'],
  cinema: ['alone', 'solo', 'myself'],
  exhibition: ['alone', 'solo', 'myself'],
  market: ['alone', 'solo', 'myself'],
  self_directed_mission: ['alone', 'strangers', 'stranger', 'initiate', 'ask', 'freeze'],
};

/** Bail conditions we can actually detect on a candidate, and how they read in text. */
export type BailFlag = 'cost' | 'crowd' | 'night' | 'spotlight' | 'commitment' | 'far' | 'planning';

const BAIL_LEXICON: Record<BailFlag, string[]> = {
  cost: ['cost', 'costs', 'expensive', 'money', 'spend', 'spending', 'cheap', 'pricey', 'euro',
    'budget', 'pizza', 'afford'],
  crowd: ['crowd', 'crowds', 'crowded', 'loud', 'busy', 'packed', 'noisy', 'big'],
  night: ['night', 'late', 'evening', 'nighttime', 'dark'],
  spotlight: ['perform', 'performing', 'performance', 'front', 'stage', 'attention', 'watched',
    'centre', 'center', 'speech', 'presenting'],
  commitment: ['course', 'courses', 'sign', 'signing', 'commit', 'commitment', 'weekly',
    'subscription', 'membership', 'series'],
  far: ['far', 'travel', 'across', 'trek', 'commute', 'distance', 'outskirts'],
  planning: ['plan', 'planning', 'organise', 'organize', 'book', 'booking', 'reserve', 'ahead'],
};

const STOPWORDS = new Set(['the', 'a', 'an', 'to', 'for', 'of', 'and', 'or', 'in', 'on', 'at',
  'i', 'ive', "i've", 'been', 'meaning', 'do', 'my', 'me', 'it', 'is', 'that', 'this',
  'with', 'but', 'have', 'has', 'would', 'want', 'wanted', 'really', 'just', 'like', 'get',
  'go', 'going', 'up', 'out', 'more', 'some', 'something', 'anything', 'months',
  'years', 'again', 'actually', 'if', 'not', 'no', 'be', 'am']);

function tokens(s: string): string[] {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9']+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Term hits. Long terms match as prefixes so "sketchbook" counts for "sketch";
 * short ones must match a whole word.
 *
 * iter 9: unrestricted prefix matching let 3-letter terms swallow real words —
 * "app" matched "appeals", "art" would match "article". Anything under 5 chars
 * now needs a word boundary. The long-prefix behaviour is what makes Italian
 * inflection work ("ballo"/"ballare"), so it stays for longer terms.
 */
function hits(text: string, terms: string[]): string[] {
  const t = ` ${text} `;
  return terms.filter(term =>
    term.length >= 5
      ? t.includes(` ${term}`)
      : new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`).test(t));
}

const NEGATORS = /\b(no|not|non|senza|without|never|free)\b/;

/**
 * ITER 8 fix 4 — negation-aware. Iter 7 flagged a mission titled
 * "Drop-in session, NO COURSE" as colliding with a "signing up for a course"
 * bail condition, because it pattern-matched the word it was written to negate.
 */
function mentionsUnnegated(text: string, terms: string[]): boolean {
  const lower = ` ${text.toLowerCase()} `;
  return terms.some(term => {
    const i = lower.indexOf(` ${term}`);
    if (i < 0) return false;
    return !NEGATORS.test(lower.slice(Math.max(0, i - 22), i));
  });
}

// ---------------------------------------------------------------------------
// 4. Derived properties of a candidate (what a bail condition can collide with)
// ---------------------------------------------------------------------------

export function questBailFlags(q: UnifiedQuest): BailFlag[] {
  const text = `${q.title} ${q.description ?? ''}`;
  const flags: BailFlag[] = [];

  if (!q.is_free && (q.price_eur ?? 0) > 8) flags.push('cost');
  if (q.kind === 'concert' || q.kind === 'community_sagra' || q.kind === 'market') flags.push('crowd');

  const hour = q.start_datetime ? Number(q.start_datetime.slice(11, 13))
    : /(\d{1,2}):\d{2}/.exec(q.recurrence ?? '') ? Number(/(\d{1,2}):\d{2}/.exec(q.recurrence!)![1]) : null;
  if (hour !== null && hour >= 20) flags.push('night');

  if (q.kind === 'dance_movement' || q.difficulty >= 5) flags.push('spotlight');
  if (mentionsUnnegated(text, ['corso', 'course', 'series', 'subscription'])) flags.push('commitment');

  return flags;
}

/** Which of THIS user's stated bail conditions this candidate collides with. */
export function bailCollisions(p: UserProfile, q: UnifiedQuest): string[] {
  const bail = p.bailCondition.toLowerCase();
  if (!bail.trim()) return [];
  return questBailFlags(q)
    .map(f => ({ f, said: hits(bail, BAIL_LEXICON[f]) }))
    .filter(x => x.said.length > 0)
    .map(x => `${x.f} ("${x.said[0]}")`);
}

// ---------------------------------------------------------------------------
// 5. Difficulty calibration — where this user is right now
// ---------------------------------------------------------------------------

/** Base window from stated solo history, then escalated by ATTENDED quests only. */
export function difficultyWindow(p: UserProfile): { lo: Difficulty; hi: Difficulty; attended: number } {
  const base: Record<SoloHistory, [number, number]> = {
    never: [1, 2],
    once_or_twice: [2, 3],
    regularly: [3, 4],
  };
  const attended = (p.history ?? []).filter(h => h.attended).length;
  const bump = Math.floor(attended / 2);           // +1 rung every 2 completed outings
  const [lo0, hi0] = base[p.soloHistory];
  const clamp = (n: number) => Math.min(5, Math.max(1, n)) as Difficulty;
  return { lo: clamp(lo0 + bump), hi: clamp(hi0 + bump), attended };
}

/**
 * A head-on collision with a stated deal-breaker is allowed ONLY as a deliberate
 * escalation: a real track record, and never for someone who has never gone alone.
 * A first quest can never contradict what they told us.
 */
export function escalationEarned(p: UserProfile): boolean {
  const { attended } = difficultyWindow(p);
  return attended >= 2 && p.soloHistory !== 'never';
}

// ---------------------------------------------------------------------------
// 6. Pull — ITER 8 fix 6: match CONTENT, not taxonomy
//
// Iter 7 only asked "is the candidate's KIND one this user's words evoke?", so
// "Life drawing session" (typed meetup_hobby) scored 6.3 for someone whose whole
// profile is about drawing, while the museum scored 9.5. Quest taxonomy decided
// the match instead of quest content. Now the candidate's own text is checked
// against the lexicons of every kind the user evoked.
// ---------------------------------------------------------------------------

interface Evoked { kind: QuestKind; hits: string[] }

export function evokedKinds(p: UserProfile): Evoked[] {
  const text = profileText(p);
  return (Object.keys(KIND_LEXICON) as QuestKind[])
    .map(kind => ({ kind, hits: hits(text, KIND_LEXICON[kind]) }))
    .filter(e => e.hits.length > 0)
    .sort((a, b) => b.hits.length - a.hits.length);
}

function pullScore(p: UserProfile, q: UnifiedQuest, evoked: Evoked[]): { pull: number; why: string[] } {
  const why: string[] = [];

  // A self-directed mission is built FROM their words; its provenance is the match.
  if (q.kind === 'self_directed_mission') {
    const matched = /matched to/.test(q.eligible_reason ?? '');
    why.push(matched ? `pull: mission built from their own words (${q.eligible_reason})`
      : 'pull: default mission — nothing specific to build from');
    return { pull: matched ? 8 : 2, why };
  }

  const qText = `${q.title} ${q.description ?? ''} ${q.venue_name ?? ''}`;
  let pull = 2;

  const direct = evoked.find(e => e.kind === q.kind);
  if (direct) {
    pull = 7 + Math.min(2, direct.hits.length - 1);
    why.push(`pull: said "${direct.hits.slice(0, 2).join('", "')}"`);
  } else {
    // Indirect: does the CANDIDATE's own text speak the vocabulary they used?
    for (const e of evoked) {
      const inTitle = hits(qText.toLowerCase(), KIND_LEXICON[e.kind]);
      if (inTitle.length) {
        pull = Math.max(pull, inTitle.length >= 2 ? 7 : 6);
        why.push(`pull: candidate text uses their vocabulary ("${inTitle[0]}")`);
        break;
      }
    }
  }

  const overlap = tokens(qText).filter(w => tokens(profileText(p)).includes(w));
  if (overlap.length) {
    pull = Math.min(10, pull + 2);
    why.push(`pull: wording overlap "${overlap.slice(0, 2).join('", "')}"`);
  }
  if (pull === 2) why.push('pull: nothing in their words points here');

  return { pull, why };
}

// ---------------------------------------------------------------------------
// 7. The fit judge — SEPARATE from scoreQuest. Never merged.
// ---------------------------------------------------------------------------

/**
 * A model's judgment of one candidate for one person (see matcher.ts). When
 * supplied, it replaces the lexical stand-in for pull/edge/bail — and ONLY those.
 * Weights, filters, calibration, tiebreak and fallback are unchanged either way,
 * so the two matchers are directly comparable.
 */
export interface FitJudgment {
  pull: number;
  edge: number;
  bailHit: boolean;
  reason: string;
}

export type Judgments = Map<string, FitJudgment>;

export interface FitScore {
  fit: number;                  // 0–10 aggregate
  pull: number;
  edge: number;
  bailSafety: number;
  soloCalibration: number;
  novelty: number;
  bailCollisions: string[];
  bailVerdict: 'clear' | 'escalation' | 'collision';
  why: string[];
}

/** UNCHANGED from iter 7 — only the structure around them moved. */
const W = { pull: 0.35, edge: 0.20, solo: 0.20, bail: 0.15, novelty: 0.10 };

export function scoreFit(p: UserProfile, q: UnifiedQuest, judgments?: Judgments): FitScore {
  const judged = judgments?.get(q.id);
  const evoked = evokedKinds(p);
  const why: string[] = [];
  const win = difficultyWindow(p);

  // --- pull ---------------------------------------------------------------
  let pull: number;
  if (judged) {
    pull = judged.pull;
    why.push(`pull: ${judged.reason}`);
  } else {
    const r = pullScore(p, q, evoked);
    pull = r.pull;
    why.push(...r.why);
  }

  // --- edge ---------------------------------------------------------------
  // The stretch half stays deterministic even when judged: whether a difficulty
  // sits above someone's rung is arithmetic we already track, not a judgment call.
  const stretch = q.difficulty >= win.hi ? 5 : q.difficulty >= win.lo ? 3 : 1;
  let edge: number;
  if (judged) {
    edge = Math.min(10, Math.round(judged.edge * 0.5) + stretch);
  } else {
    const named = hits(discomfortText(p), KIND_DISCOMFORT[q.kind]);
    const relevance = named.length ? Math.min(5, 3 + named.length) : 1;
    edge = Math.min(10, relevance + stretch);
    if (named.length) why.push(`edge: they named "${named[0]}" as hard — this asks exactly that`);
  }
  if (stretch === 1) why.push('edge: below their current rung — no stretch');

  // --- bail ---------------------------------------------------------------
  const collisions = judged
    ? (judged.bailHit ? [`judged: collides with "${p.bailCondition}"`] : [])
    : bailCollisions(p, q);
  const earned = escalationEarned(p);
  const bailVerdict: FitScore['bailVerdict'] =
    collisions.length === 0 ? 'clear' : earned ? 'escalation' : 'collision';
  const bailSafety = bailVerdict === 'clear' ? 10 : bailVerdict === 'escalation' ? 7 : 0;
  if (bailVerdict === 'escalation') why.push(`bail: hits "${collisions[0]}" — deliberate escalation (${win.attended} attended)`);
  if (bailVerdict === 'collision') why.push(`bail: hits "${collisions[0]}" — EXCLUDED, not earned`);

  // --- solo calibration (always deterministic) ----------------------------
  const dist = q.difficulty < win.lo ? win.lo - q.difficulty
    : q.difficulty > win.hi ? q.difficulty - win.hi : 0;
  const soloCalibration = Math.max(0, 10 - dist * 4);
  if (dist > 0) why.push(`solo: diff ${q.difficulty} vs window ${win.lo}-${win.hi} (${p.soloHistory})`);

  // --- novelty (now mostly enforced as a filter; kept as a soft signal) ----
  const recent = (p.history ?? []).slice(-4);
  const novelty = recent.some(h => h.questId === q.id) ? 0
    : recent.some(h => h.kind === q.kind) ? 3 : 10;
  if (novelty < 10) why.push(`novelty: ${q.kind} assigned recently`);

  const fit = Math.round((W.pull * pull + W.edge * edge + W.solo * soloCalibration
    + W.bail * bailSafety + W.novelty * novelty) * 10) / 10;

  return { fit, pull, edge, bailSafety, soloCalibration, novelty, bailCollisions: collisions, bailVerdict, why };
}

// ---------------------------------------------------------------------------
// 8. Selection — validity gates, hard filters exclude, fit ranks
// ---------------------------------------------------------------------------

export const VALIDITY_FLOOR = 6;   // same floor iter 3 used for "actionable"
export const FIT_FLOOR = 6.0;
/**
 * Aggregate fit is generous: a free, well-dated, correctly-pitched event scores
 * ~6.4 even when NOTHING the user said points at it. `pull <= PULL_FLOOR` means
 * "we have no reason to believe this person wants this", and routes to a
 * made-for-them mission instead. This is the line that stops personalization
 * collapsing back into iter-6 behaviour.
 */
export const PULL_FLOOR = 2;

/** How many past assignments block a repeat. */
const KIND_COOLDOWN = 2;   // no category from the last 2 weeks
const QUEST_COOLDOWN = 6;  // no identical quest from the last 6 weeks

export interface Assignment {
  quest: UnifiedQuest;
  validity: number;
  fit: FitScore;
  usedFallback: boolean;
  /** Filters we had to drop to find anything at all. Empty is the healthy case. */
  relaxations: string[];
  /** Candidates removed by a hard filter, for the log. */
  excluded: { quest: UnifiedQuest; by: string }[];
  depth: DataDepth;
  runnersUp: { quest: UnifiedQuest; fit: number }[];
}

/**
 * ITER 8 fix 5 — deterministic tiebreak. Iter 7 resolved ties by array position,
 * which meant fixture ordering silently decided real assignments (Marco got a
 * €10 quest over a free one on exactly this). Order: fit, then pull, then
 * validity, then closeness to the middle of their difficulty window, then id.
 */
function compare(p: UserProfile, a: UnifiedQuest, b: UnifiedQuest, j?: Judgments): number {
  const fa = scoreFit(p, a, j), fb = scoreFit(p, b, j);
  if (fb.fit !== fa.fit) return fb.fit - fa.fit;
  if (fb.pull !== fa.pull) return fb.pull - fa.pull;
  const va = scoreQuest(a).aggregate, vb = scoreQuest(b).aggregate;
  if (vb !== va) return vb - va;
  const win = difficultyWindow(p), mid = (win.lo + win.hi) / 2;
  const da = Math.abs(a.difficulty - mid), db = Math.abs(b.difficulty - mid);
  if (da !== db) return da - db;
  return a.id.localeCompare(b.id);
}

export function selectForUser(pool: UnifiedQuest[], p: UserProfile, judgments?: Judgments): Assignment {
  const depth = dataDepth(p);
  const history = p.history ?? [];
  const recentKinds = new Set(history.slice(-KIND_COOLDOWN).map(h => h.kind));
  const recentIds = new Set(history.slice(-QUEST_COOLDOWN).map(h => h.questId));

  // Validity is a GATE — it never ranks.
  const valid = pool.filter(q => isEligible(q) && scoreQuest(q).aggregate >= VALIDITY_FLOOR);

  /**
   * Hard filters, in relaxation order: the LAST one listed is dropped first when
   * the pool would otherwise empty, so the stated deal-breaker is the most
   * protected thing in the system.
   */
  const filters: { name: string; keep: (q: UnifiedQuest) => boolean }[] = [
    { name: 'bail-collision', keep: q => scoreFit(p, q, judgments).bailVerdict !== 'collision' },
    { name: 'same-quest-recently', keep: q => !recentIds.has(q.id) },
    { name: 'same-category-recently', keep: q => !recentKinds.has(q.kind) },
  ];

  const excluded: { quest: UnifiedQuest; by: string }[] = [];
  for (const q of valid) {
    const broke = filters.find(f => !f.keep(q));
    if (broke) excluded.push({ quest: q, by: broke.name });
  }

  const relaxations: string[] = [];
  let active = [...filters];
  let candidates = valid.filter(q => active.every(f => f.keep(q)));
  while (candidates.length === 0 && active.length > 0) {
    relaxations.push(active[active.length - 1].name);
    active = active.slice(0, -1);
    candidates = valid.filter(q => active.every(f => f.keep(q)));
  }

  const ranked = [...candidates].sort((a, b) => compare(p, a, b, judgments));
  const best = ranked[0];
  const bestFit = best ? scoreFit(p, best, judgments) : null;

  if (!best || !bestFit || bestFit.fit < FIT_FLOOR || bestFit.pull <= PULL_FLOOR) {
    const mission = buildPersonalMission(p);
    return {
      quest: mission, validity: scoreQuest(mission).aggregate, fit: scoreFit(p, mission),
      usedFallback: true, relaxations, excluded, depth,
      runnersUp: ranked.slice(0, 3).map(q => ({ quest: q, fit: scoreFit(p, q, judgments).fit })),
    };
  }
  return {
    quest: best, validity: scoreQuest(best).aggregate, fit: bestFit,
    usedFallback: false, relaxations, excluded, depth,
    runnersUp: ranked.slice(1, 4).map(q => ({ quest: q, fit: scoreFit(p, q, judgments).fit })),
  };
}

// ---------------------------------------------------------------------------
// 9. Profile-aware fallback
//
// iter 3's fallback was one fixed aperitivo mission. That is exactly the failure
// this layer is meant to catch: a fallback that ignores the profile makes the
// personalization hollow precisely where it matters most (thin event inventory).
// Templates are keyed off the user's own words.
// ---------------------------------------------------------------------------

interface MissionTemplate {
  id: string;
  triggers: string[];
  difficulty: Difficulty;
  title: string;
  body: (p: UserProfile) => string;
}

const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'physical-drop-in', difficulty: 3,
    triggers: ['climb', 'climbing', 'bouldering', 'gym', 'run', 'running', 'physical', 'sport',
      'swim', 'yoga', 'football', 'fit'],
    // Title deliberately contains the word "course" so the negation fix (iter 8
    // fix 4) is actually exercised by the run, not just asserted.
    title: 'Drop-in session, no course',
    body: p => `Find a wall or gym near ${p.neighbourhood ?? p.city} that takes walk-ins. Pay for the ` +
      `single session, not a course. Go once, and ask one person there how they got started.`,
  },
  {
    id: 'sketch-in-public', difficulty: 3,
    triggers: ['draw', 'drawing', 'paint', 'sketch', 'art', 'creative', 'design', 'photograph'],
    title: 'Sketch in public for 40 minutes',
    body: p => `Take the sketchbook to a busy cafe or piazza in ${p.neighbourhood ?? p.city}, ` +
      `sit somewhere visible, and draw for 40 minutes without hiding the page.`,
  },
  {
    id: 'language-cold-open', difficulty: 4,
    triggers: ['italian', 'italiano', 'language', 'speak', 'parlare', 'conversation'],
    title: 'Order, then keep talking',
    body: p => `Go to a bar in ${p.neighbourhood ?? p.city} at a quiet hour and order entirely in ` +
      `Italian. Then keep the conversation going for three more exchanges after the order is done.`,
  },
  {
    id: 'quiet-wander', difficulty: 2,
    triggers: ['quiet', 'calm', 'walk', 'wander', 'explore', 'nature', 'park'],
    title: 'One-hour unplanned wander',
    body: p => `Pick a part of ${p.city} you have never walked through. One hour, phone in your ` +
      `pocket, no destination. Stop once somewhere you would normally walk past.`,
  },
  {
    id: 'solo-aperitivo', difficulty: 4,
    triggers: [],   // default
    title: 'Solo aperitivo mission',
    body: p => `Go to a busy central bar in ${p.neighbourhood ?? p.city} around 18:30, sit at the bar ` +
      `(not a table), order the local way, and stay 45 minutes. Start one conversation.`,
  },
];

export function buildPersonalMission(p: UserProfile): UnifiedQuest {
  const text = profileText(p);
  const win = difficultyWindow(p);
  const matched = MISSION_TEMPLATES
    .filter(t => t.triggers.length && hits(text, t.triggers).length)
    .sort((a, b) => Math.abs(a.difficulty - win.hi) - Math.abs(b.difficulty - win.hi))[0];
  const t = matched ?? MISSION_TEMPLATES.find(x => x.id === 'solo-aperitivo')!;
  const difficulty = Math.min(Math.max(t.difficulty, win.lo), win.hi) as Difficulty;

  return {
    id: `mission:${p.city}:${t.id}`, source: 'self_directed', source_url: null,
    title: t.title, description: t.body(p), kind: 'self_directed_mission',
    difficulty, attend_mode: 'either',
    start_datetime: null, recurrence: 'anytime',
    venue_name: null, address: null, lat: null, lng: null,
    city: p.city, price_eur: 0, is_free: true,
    confidence: 'self_directed', age_restricted: false,
    eligible_reason: matched ? `matched to "${hits(text, t.triggers)[0]}"` : 'default mission',
  };
}

export function describeUser(p: UserProfile): string {
  const d = dataDepth(p);
  const w = difficultyWindow(p);
  return `${p.id} · solo:${p.soloHistory} · window ${w.lo}-${w.hi} · ${d.level} data (${d.words}w)` +
    `${p.followUp ? '' : ' · no follow-up'}`;
}

export { DIFFICULTY_LABEL };
