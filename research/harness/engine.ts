/**
 * ENGINE — the live half. Implements the four dependencies that pipeline.ts
 * declares and the harness stubs out:
 *
 *     search            OpenAI Responses API + the web_search tool
 *     fetchAndExtract   plain fetch -> HTML to text -> one structured-output call
 *     findPois          OpenStreetMap / Overpass (free, no key)
 *     verifyOccurrence  refetch the source page, ask a yes/no question
 *
 * EVERY provider-specific detail lives in this one file. Scoring, filtering,
 * matching and selection stay in pipeline.ts / profile.ts and make no network
 * calls at all — so swapping providers, or swapping the matcher for a model,
 * never touches the logic that decides things.
 *
 * ---------------------------------------------------------------------------
 * ⚠️ FIRST RUN WILL PROBABLY NEED ONE SMALL EDIT.
 *
 * This was written offline. I could not verify OpenAI's current tool name
 * (`web_search` vs `web_search_preview`) or which models your key can reach —
 * those have changed before and may have changed since. Both are isolated in
 * CONFIG below, and the error handler prints exactly what to change. Everything
 * else is provider-neutral.
 * ---------------------------------------------------------------------------
 *
 * COST SHAPE — read before running at scale.
 * Ingestion is per CITY per WEEK, never per user. ~5 searches + ~15 extractions
 * per city. Assignment reads the stored pool and costs nothing. Cost scales with
 * cities covered, not with how many users you have. Keep it that way.
 */

import OpenAI from 'openai';
import { dedupe, scoreQuest, type UnifiedQuest, type QuestKind, type Confidence } from './pipeline';

// ---------------------------------------------------------------------------
// Config — the two things most likely to need adjusting on first run
// ---------------------------------------------------------------------------

export const CONFIG = {
  /** Cheap model, high volume: one call per fetched page. */
  extractModel: process.env.OPENAI_EXTRACT_MODEL ?? process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
  /** Used for search and verification. Can be the same model. */
  searchModel: process.env.OPENAI_SEARCH_MODEL ?? process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
  /** Rename to 'web_search_preview' if the API rejects this. */
  searchToolType: process.env.OPENAI_SEARCH_TOOL ?? 'web_search',
  /** Results kept per query, and pages fetched per query. */
  resultsPerQuery: 4,
  fetchPerQuery: 2,
  /** Hard ceiling so a bad run can't spend unbounded money. */
  maxExtractionsPerCity: Number(process.env.MAX_EXTRACTIONS ?? 20),
  /** Characters of page text sent to the model. ~4 chars/token. */
  maxPageChars: 12_000,
};

let client: OpenAI | null = null;
function openai(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not set.\n' +
        '  export OPENAI_API_KEY=sk-...    (or put it in research/harness/.env.local and source it)',
      );
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

/** Turns an unfamiliar API error into an instruction rather than a stack trace. */
function explain(err: unknown, stage: string): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (/model/i.test(msg) && /(not found|does not exist|access)/i.test(msg)) {
    return new Error(
      `[${stage}] Your key cannot reach the configured model.\n` +
      `  currently: extract=${CONFIG.extractModel} search=${CONFIG.searchModel}\n` +
      `  fix: export OPENAI_MODEL=<a model your key has>\n\n${msg}`,
    );
  }
  if (/tool/i.test(msg) && /(web_search|unknown|invalid|unsupported)/i.test(msg)) {
    return new Error(
      `[${stage}] The web search tool name was rejected.\n` +
      `  currently: ${CONFIG.searchToolType}\n` +
      `  fix: export OPENAI_SEARCH_TOOL=web_search_preview  (or whatever the current name is)\n\n${msg}`,
    );
  }
  return new Error(`[${stage}] ${msg}`);
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Pull the first JSON value out of a model response that may have prose around it. */
function parseLooseJson<T>(text: string): T | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const body = fenced ? fenced[1] : text;
  const start = body.search(/[[{]/);
  if (start < 0) return null;
  for (let end = body.length; end > start; end--) {
    try { return JSON.parse(body.slice(start, end)) as T; } catch { /* keep shrinking */ }
  }
  return null;
}

/** Crude but dependency-free HTML -> text. Good enough for listing pages. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|li|tr|h[1-6]|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

function textOf(response: { output_text?: string }): string {
  return response.output_text ?? '';
}

// ---------------------------------------------------------------------------
// 1. search — OpenAI Responses API with the web_search tool
//
// Deliberately asks for URLs, not answers. The model finding a page is fine;
// the model *telling us what is on the page* is not — that is how a hallucinated
// date sends someone across a city to an event that isn't happening. Extraction
// is a separate call against the real fetched text.
// ---------------------------------------------------------------------------

export interface SearchHit { title: string; url: string }

export async function search(query: string): Promise<SearchHit[]> {
  try {
    const res = await openai().responses.create({
      model: CONFIG.searchModel,
      tools: [{ type: CONFIG.searchToolType } as never],
      input:
        `Search the web for: ${query}\n\n` +
        `Return ONLY a JSON array of the ${CONFIG.resultsPerQuery} most relevant pages, newest first:\n` +
        `[{"title": "...", "url": "https://..."}]\n\n` +
        `Rules: prefer local Italian event listing sites and official venue pages. ` +
        `Every url must be one you actually found. Do not summarise the pages. No prose.`,
    });

    const hits = parseLooseJson<SearchHit[]>(textOf(res as { output_text?: string })) ?? [];
    return hits
      .filter(h => h && typeof h.url === 'string' && /^https?:\/\//.test(h.url))
      .slice(0, CONFIG.resultsPerQuery);
  } catch (err) {
    throw explain(err, 'search');
  }
}

// ---------------------------------------------------------------------------
// 2. fetchAndExtract — fetch the page ourselves, then one structured call
// ---------------------------------------------------------------------------

const QUEST_KINDS: QuestKind[] = ['language_social', 'dance_movement', 'meetup_hobby',
  'community_sagra', 'concert', 'cinema', 'exhibition', 'market'];

const EXTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['quests'],
  properties: {
    quests: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'description', 'kind', 'difficulty', 'attend_mode', 'start_datetime',
          'recurrence', 'venue_name', 'address', 'city', 'price_eur', 'is_free', 'confidence'],
        properties: {
          title: { type: 'string' },
          description: { type: ['string', 'null'] },
          kind: { type: 'string', enum: QUEST_KINDS },
          difficulty: { type: 'integer', minimum: 1, maximum: 5 },
          attend_mode: { type: 'string', enum: ['solo', 'bring_friend', 'either'] },
          start_datetime: { type: ['string', 'null'] },
          recurrence: { type: ['string', 'null'] },
          venue_name: { type: ['string', 'null'] },
          address: { type: ['string', 'null'] },
          city: { type: 'string' },
          price_eur: { type: ['number', 'null'] },
          is_free: { type: 'boolean' },
          confidence: {
            type: 'string',
            enum: ['confirmed_dated', 'recurring_scheduled', 'recurring_unresolved', 'listed_unconfirmed'],
          },
        },
      },
    },
  },
} as const;

const EXTRACTION_PROMPT = `You extract real, attendable events from an Italian listing page.

Return every event that a person could plausibly attend ALONE in the given city or its province.
Skip anything that is not a real dated or scheduled event: ticket ads, generic venue blurbs,
"discover the city" filler, and past events.

Fields that matter most:
- start_datetime: ISO 8601 with offset, e.g. "2026-08-14T21:00:00+02:00". Null if the page
  gives no specific date.
- recurrence: free text like "weekly, Wed 20:30" if it repeats. Null otherwise.
- confidence:
    confirmed_dated       a specific date and time is stated on the page
    recurring_scheduled   it repeats on a stated schedule you could turn into a next date
    recurring_unresolved  it repeats but the page does not say when
    listed_unconfirmed    listed, but you cannot confirm a date or schedule
- price_eur: number, or null if unstated. is_free true only if the page says free/gratuito.
- difficulty 1-5, how much social exposure it asks for:
    1 public and anonymous (market, viewpoint)
    2 longer solo dwell (museum, exhibition)
    3 among people, structured (class, communal-table sagra)
    4 designed for interaction with strangers (language exchange, beginners' social dance)
    5 high visibility (open mic, karaoke)

NEVER invent a date, a venue, or a price. If the page does not say it, use null and lower the
confidence. An unverifiable event is worse than no event: it sends a real person across a real
city to something that is not happening.`;

export async function fetchAndExtract(url: string, city: string): Promise<UnifiedQuest[]> {
  let pageText: string;
  try {
    const res = await fetch(url, {
      headers: {
        // Identify honestly. Several Italian aggregators are Cloudflare-protected and
        // will 403 — that is expected; we log and move on rather than working around it.
        'User-Agent': 'StepnOut-research/0.1 (comfort-zone quest research; contact via repo)',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    pageText = htmlToText(await res.text()).slice(0, CONFIG.maxPageChars);
    if (pageText.length < 200) return [];
  } catch {
    return [];   // unreachable page is a normal outcome, not an error
  }

  try {
    const res = await openai().responses.create({
      model: CONFIG.extractModel,
      input: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `City: ${city}\nSource URL: ${url}\n\nPAGE TEXT:\n${pageText}` },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'extracted_quests',
          strict: true,
          schema: EXTRACTION_SCHEMA as unknown as Record<string, unknown>,
        },
      },
    } as never);

    const parsed = parseLooseJson<{ quests: Partial<UnifiedQuest>[] }>(
      textOf(res as { output_text?: string }),
    );
    if (!parsed?.quests) return [];

    return parsed.quests.map((q, i) => normalize(q, url, city, i));
  } catch (err) {
    throw explain(err, 'extract');
  }
}

/** Fill in provenance the model must never author, and clamp anything out of range. */
function normalize(q: Partial<UnifiedQuest>, url: string, city: string, i: number): UnifiedQuest {
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'unknown'; } })();
  const diff = Math.min(5, Math.max(1, Number(q.difficulty ?? 3)));
  return {
    id: `${host}:${slug(q.title ?? 'untitled')}:${i}`,
    source: host,
    source_url: url,                         // provenance is ours, never the model's
    title: q.title ?? 'Untitled',
    description: q.description ?? null,
    kind: (QUEST_KINDS as string[]).includes(q.kind as string) ? q.kind as QuestKind : 'meetup_hobby',
    difficulty: diff as UnifiedQuest['difficulty'],
    attend_mode: q.attend_mode ?? 'either',
    start_datetime: q.start_datetime ?? null,
    recurrence: q.recurrence ?? null,
    venue_name: q.venue_name ?? null,
    address: q.address ?? null,
    lat: null, lng: null,
    city: q.city ?? city,
    price_eur: q.price_eur ?? null,
    is_free: q.is_free ?? false,
    confidence: (q.confidence ?? 'listed_unconfirmed') as Confidence,
    eligible_reason: `extracted from ${host}`,
  };
}

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

// ---------------------------------------------------------------------------
// 3. findPois — OpenStreetMap / Overpass. Free, no key, works in every town.
//
// This is the layer that never collapses: event feeds thin out below ~50k
// population, POI data does not. Add a city here and the fallback works there.
// ---------------------------------------------------------------------------

const CITY_COORDS: Record<string, [number, number]> = {
  milan: [45.4642, 9.1900],
  milano: [45.4642, 9.1900],
  bologna: [44.4949, 11.3426],
  fabriano: [43.3363, 12.9046],
  roma: [41.9028, 12.4964],
  rome: [41.9028, 12.4964],
  torino: [45.0703, 7.6869],
  napoli: [40.8518, 14.2681],
  parma: [44.8015, 10.3279],
  lecce: [40.3515, 18.1750],
  matera: [40.6664, 16.6043],
};

const OSM_TAGS: Record<'bar_cafe' | 'museum' | 'market', string> = {
  bar_cafe: '[amenity~"^(bar|cafe|pub)$"]',
  museum: '[tourism~"^(museum|gallery)$"]',
  market: '[amenity=marketplace]',
};

export interface Poi { name: string; address: string; lat: number; lng: number }

export async function findPois(city: string, kind: 'bar_cafe' | 'museum' | 'market'): Promise<Poi[]> {
  const coords = CITY_COORDS[city.toLowerCase()];
  if (!coords) {
    console.warn(`  [poi] no coordinates for "${city}" — add it to CITY_COORDS in engine.ts`);
    return [];
  }
  const [lat, lng] = coords;
  const query = `[out:json][timeout:25];nwr(around:2500,${lat},${lng})${OSM_TAGS[kind]}[name];out center 25;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'StepnOut-research/0.1 (comfort-zone quest research)',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return [];
    const json = await res.json() as { elements?: Array<Record<string, never>> };

    return (json.elements ?? []).map(el => {
      const e = el as unknown as {
        tags?: Record<string, string>; lat?: number; lon?: number;
        center?: { lat: number; lon: number };
      };
      const t = e.tags ?? {};
      return {
        name: t.name ?? 'unnamed',
        address: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ') || city,
        lat: e.lat ?? e.center?.lat ?? lat,
        lng: e.lon ?? e.center?.lon ?? lng,
      };
    }).filter(p => p.name !== 'unnamed');
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 4. verifyOccurrence — the guard iteration 4 added, now against live pages.
//
// Refetch the source and ask whether it is actually happening. This is what
// caught the Ferragosto case: a recurring weekly event whose venue is shut for
// the entire week. Unverified recurring slots get demoted, never assumed.
// ---------------------------------------------------------------------------

export async function verifyOccurrence(q: UnifiedQuest): Promise<boolean> {
  if (!q.source_url) return false;
  try {
    const page = await fetch(q.source_url, {
      headers: { 'User-Agent': 'StepnOut-research/0.1 (comfort-zone quest research)' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!page.ok) return false;
    const text = htmlToText(await page.text()).slice(0, 6_000);

    const res = await openai().responses.create({
      model: CONFIG.searchModel,
      input: [
        {
          role: 'system',
          content:
            'You verify whether an event is actually happening. Answer with exactly one word: ' +
            'YES if the page confirms this event runs at the stated time, NO if it is cancelled, ' +
            'closed, past, or the page does not confirm it. When in doubt answer NO — a false ' +
            'YES sends someone to a closed venue.',
        },
        {
          role: 'user',
          content: `Event: ${q.title}\nWhen: ${q.start_datetime ?? q.recurrence ?? 'unspecified'}\n` +
            `Venue: ${q.venue_name ?? 'unspecified'}\n\nPAGE:\n${text}`,
        },
      ],
    } as never);

    return /\byes\b/i.test(textOf(res as { output_text?: string }));
  } catch {
    return false;   // unverifiable is not verified
  }
}

// ---------------------------------------------------------------------------
// 5. ingestCity — the whole batch, one city, one week.
//
// Returns the POOL, not one assignment. Assignment is a separate, per-user,
// network-free step (profile.ts selectForUser). Keeping them apart is what
// makes cost scale with cities rather than users.
// ---------------------------------------------------------------------------

const CATEGORY_QUERIES: { id: QuestKind; queries: string[] }[] = [
  { id: 'language_social', queries: ['language exchange {city} {month} {year}'] },
  { id: 'dance_movement', queries: ['{city} corso ballo principianti serata sociale {month} {year}'] },
  { id: 'meetup_hobby', queries: ['{city} meetup {month} {year} conoscere persone serata giochi'] },
  { id: 'community_sagra', queries: ['sagra {city} provincia {month} {year} weekend'] },
  { id: 'concert', queries: ['eventi gratuiti {city} {month} {year} weekend concerti mostre mercatini'] },
];

// ---------------------------------------------------------------------------
// Pool gates — added in iter 9, from what the first live run actually returned.
//
// Exported and applied on BOTH the live and the --from-cache path, so a cached
// run reflects the current gates rather than the ones in force when it was
// fetched. Two things the offline harness never had to think about, because I
// wrote the fixtures: events can be in the past, and search does not respect
// city boundaries.
// ---------------------------------------------------------------------------

/** Milan's first live run returned an event in Sillavengo — ~70km away, Novara province. */
const CITY_ALIASES: Record<string, string> = {
  milan: 'milano', milano: 'milano',
  rome: 'roma', roma: 'roma',
  turin: 'torino', torino: 'torino',
  naples: 'napoli', napoli: 'napoli',
  florence: 'firenze', firenze: 'firenze',
};
const canon = (c: string) => {
  const k = c.trim().toLowerCase();
  return CITY_ALIASES[k] ?? k;
};

/** 19% of the first live Milan pool had already happened. */
export function isUpcoming(q: UnifiedQuest, now = new Date()): boolean {
  if (!q.start_datetime) return true;              // recurring / undated: the confidence score handles it
  const t = Date.parse(q.start_datetime);
  if (Number.isNaN(t)) return true;                // unparseable is a confidence problem, not a date one
  return t >= now.getTime() - 12 * 3600_000;       // 12h grace: a date-only event today is still today
}

export function inCity(q: UnifiedQuest, city: string): boolean {
  return canon(q.city) === canon(city);
}

export interface PoolGateResult { pool: UnifiedQuest[]; droppedPast: number; droppedOutOfCity: number }

/** validity floor + upcoming + in-city, in that order. */
export function applyPoolGates(quests: UnifiedQuest[], city: string, now = new Date()): PoolGateResult {
  let droppedPast = 0, droppedOutOfCity = 0;
  const pool = quests.filter(q => {
    if (scoreQuest(q).aggregate < 6) return false;
    if (!isUpcoming(q, now)) { droppedPast++; return false; }
    if (!inCity(q, city)) { droppedOutOfCity++; return false; }
    return true;
  });
  return { pool, droppedPast, droppedOutOfCity };
}

export interface IngestReport {
  city: string;
  pool: UnifiedQuest[];
  /** Everything that survived dedupe, before the gates. Lets --from-cache re-gate. */
  raw?: UnifiedQuest[];
  stats: {
    queries: number; hits: number; fetched: number;
    extracted: number; afterDedupe: number; passedValidity: number;
    verified: number; demoted: number; failedFetch: number;
    droppedPast: number; droppedOutOfCity: number;
  };
}

export async function ingestCity(
  city: string,
  when: { month: string; year: string },
  opts: { verify?: boolean; log?: (s: string) => void } = {},
): Promise<IngestReport> {
  const log = opts.log ?? console.log;
  const stats = { queries: 0, hits: 0, fetched: 0, extracted: 0, afterDedupe: 0,
    passedValidity: 0, verified: 0, demoted: 0, failedFetch: 0,
    droppedPast: 0, droppedOutOfCity: 0 };
  const found: UnifiedQuest[] = [];

  for (const cat of CATEGORY_QUERIES) {
    for (const template of cat.queries) {
      if (stats.extracted >= CONFIG.maxExtractionsPerCity) {
        log(`  [cap] hit maxExtractionsPerCity (${CONFIG.maxExtractionsPerCity}) — stopping early`);
        break;
      }
      const q = template.split('{city}').join(city)
        .split('{month}').join(when.month).split('{year}').join(when.year);

      log(`\n  [${cat.id}] "${q}"`);
      const hits = await search(q);
      stats.queries++; stats.hits += hits.length;
      if (!hits.length) { log('    no results'); continue; }

      for (const hit of hits.slice(0, CONFIG.fetchPerQuery)) {
        if (stats.extracted >= CONFIG.maxExtractionsPerCity) break;
        const quests = await fetchAndExtract(hit.url, city);
        stats.fetched++;
        stats.extracted++;
        if (!quests.length) { stats.failedFetch++; log(`    ✗ ${short(hit.url)} — nothing usable`); continue; }
        log(`    ✓ ${short(hit.url)} — ${quests.length} event${quests.length === 1 ? '' : 's'}`);
        found.push(...quests);
      }
    }
  }

  const deduped = dedupe(found);
  stats.afterDedupe = deduped.length;

  if (opts.verify) {
    log('\n  [verify] checking recurring slots actually run...');
    for (const q of deduped) {
      if (q.confidence === 'recurring_scheduled' && q.verified_upcoming === undefined) {
        q.verified_upcoming = await verifyOccurrence(q);
        if (q.verified_upcoming) stats.verified++;
        else { q.confidence = 'recurring_unresolved'; stats.demoted++; log(`    demoted: ${q.title}`); }
      }
    }
  }

  const gated = applyPoolGates(deduped, city);
  stats.passedValidity = gated.pool.length;
  stats.droppedPast = gated.droppedPast;
  stats.droppedOutOfCity = gated.droppedOutOfCity;

  return { city, pool: gated.pool, raw: deduped, stats };
}

const short = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u.slice(0, 40); } };
