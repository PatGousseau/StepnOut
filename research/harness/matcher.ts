/**
 * MATCHER — replaces the keyword stand-in with actual judgment.
 *
 * The lexical matcher in profile.ts was always a placeholder for this. It works
 * on shared vocabulary, so it can only match when the user and the listing
 * happen to use the same words. Against real Italian listing pages that breaks
 * in both directions, and the first live run showed both:
 *
 *   false positive — Sofia ("speak Italian with real people") was handed a
 *                    religious pilgrimage walk, because "people" and "group"
 *                    are in the hobby-meetup vocabulary.
 *   false negative — nothing connects "I want to feel less invisible" to an
 *                    open mic, because they share no words at all.
 *
 * ONE call per user per week: the profile plus every candidate in, a judgment
 * per candidate out. Not one call per candidate — that would multiply cost by
 * the pool size for no benefit.
 *
 * What this does NOT do: choose. The model supplies pull/edge/bail per
 * candidate; the validity gate, hard filters, relaxation ladder, weights,
 * tiebreak and fallback all stay in profile.ts, deterministic and inspectable.
 * Judgment is the model's job. Deciding stays ours.
 */

import OpenAI from 'openai';
import { CONFIG } from './engine';
import type { UnifiedQuest } from './pipeline';
import type { UserProfile, FitJudgment } from './profile';

const SYSTEM = `You judge how well each candidate outing fits ONE specific person, for an app that
assigns a weekly real-world outing slightly outside the user's comfort zone.

You are given the person's own words, verbatim, and a numbered list of candidates.
Score EVERY candidate. Never invent candidates.

For each, return three judgments:

pull (0-10) — how strongly this connects to what they said they have been meaning to do.
  10 = this is precisely the thing they described
   7 = clearly in the same territory
   4 = loosely related; they might enjoy it but it is not what they asked for
   0 = nothing they said points here
  Judge MEANING, not shared words. "I want to feel less invisible" strongly pulls
  toward an open mic. A pilgrimage walk does NOT pull toward "speak Italian with
  people" just because both involve people.

edge (0-10) — is this uncomfortable in a way THEY named, and a genuine stretch for them?
  High only when the specific discomfort this outing demands is one they described.
  Generic difficulty is not edge. Something they would find easy is not edge, even
  if others would find it hard.

bail_hit (boolean) — does this collide head-on with what they said would make them
  cancel? Be literal and strict. If they said "nothing over the price of a pizza",
  a EUR 15 ticket is a hit. If they said "big loud crowds at night", a 22:30 club
  night is a hit and a 10:00 market is not. When the listing does not say enough
  to tell, answer false.

reason — one short clause, in English, quoting their words where possible. This is
  read by a human debugging the match, so be specific: "said 'dancing', this is a
  beginners' social dance" beats "good match".`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['judgments'],
  properties: {
    judgments: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['n', 'pull', 'edge', 'bail_hit', 'reason'],
        properties: {
          n: { type: 'integer' },
          pull: { type: 'integer', minimum: 0, maximum: 10 },
          edge: { type: 'integer', minimum: 0, maximum: 10 },
          bail_hit: { type: 'boolean' },
          reason: { type: 'string' },
        },
      },
    },
  },
} as const;

function describeProfile(p: UserProfile): string {
  const fu = (p.followUp ?? [])
    .filter(f => f.answer.trim())
    .map(f => `  they were asked "${f.question}" and answered: "${f.answer}"`)
    .join('\n');
  return [
    `Been meaning to do (their words): "${p.meaningToDo}"`,
    `Would make them bail (their words): "${p.bailCondition || '(they skipped this)'}"`,
    `Times they have gone to something like this alone: ${p.soloHistory}`,
    p.neighbourhood ? `Based in: ${p.neighbourhood}, ${p.city}` : `Based in: ${p.city}`,
    fu ? `Follow-up:\n${fu}` : '',
  ].filter(Boolean).join('\n');
}

function describeCandidate(q: UnifiedQuest, n: number): string {
  const price = q.is_free ? 'free' : q.price_eur != null ? `EUR ${q.price_eur}` : 'price not stated';
  const time = q.start_datetime ?? q.recurrence ?? 'no date given';
  return `${n}. ${q.title}\n   ${q.description ?? '(no description)'}\n` +
    `   where: ${q.venue_name ?? 'unstated'} · when: ${time} · cost: ${price}`;
}

/**
 * Returns a judgment per candidate, keyed by quest id. On any failure it returns
 * an empty map — callers fall back to the lexical matcher rather than failing the
 * whole assignment. A degraded match beats no quest.
 */
export async function judgeFit(
  p: UserProfile,
  candidates: UnifiedQuest[],
): Promise<Map<string, FitJudgment>> {
  const out = new Map<string, FitJudgment>();
  if (!candidates.length) return out;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const listing = candidates.map((q, i) => describeCandidate(q, i + 1)).join('\n\n');

  try {
    const res = await client.responses.create({
      model: CONFIG.extractModel,
      input: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `THE PERSON:\n${describeProfile(p)}\n\nCANDIDATES:\n${listing}` },
      ],
      text: {
        format: {
          type: 'json_schema', name: 'fit_judgments', strict: true,
          schema: SCHEMA as unknown as Record<string, unknown>,
        },
      },
    } as never);

    const raw = (res as { output_text?: string }).output_text ?? '';
    const parsed = JSON.parse(raw) as {
      judgments: { n: number; pull: number; edge: number; bail_hit: boolean; reason: string }[];
    };

    for (const j of parsed.judgments) {
      const q = candidates[j.n - 1];
      if (!q) continue;                      // model invented an index; drop it
      out.set(q.id, {
        pull: clamp(j.pull), edge: clamp(j.edge),
        bailHit: Boolean(j.bail_hit), reason: j.reason,
      });
    }
  } catch (err) {
    console.warn(`  [matcher] model judging failed, falling back to lexical: ` +
      `${err instanceof Error ? err.message : String(err)}`);
    return new Map();
  }
  return out;
}

const clamp = (n: number) => Math.min(10, Math.max(0, Math.round(Number(n) || 0)));
