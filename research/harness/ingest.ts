/**
 * INGEST — the runnable entry point. Turns a city name into a real, scored pool
 * of events, then runs the existing profiles against it.
 *
 *   node dist/ingest.js <city> [--smoke] [--verify] [--from-cache] [--max=N]
 *
 *   --smoke       ONE search + ONE extraction, then stop. Validates the API
 *                 surface for pennies before any real spend. Always run first.
 *   --verify      Enable verifyOccurrence (the Ferragosto guard from iter 4).
 *                 Off by default; it roughly doubles fetches.
 *   --from-cache  Skip the network entirely, re-run matching against the last
 *                 cached pool. This is what makes matcher iteration free.
 *   --max=N       Override the extraction ceiling for this run.
 *
 * Every run is cached to output/<city>-<stamp>.json (gitignored), so the
 * expensive half never has to be repeated to iterate on the cheap half.
 */

import * as fs from 'fs';
import * as path from 'path';
import { scoreQuest, DIFFICULTY_LABEL, type UnifiedQuest } from './pipeline';
import { selectForUser, describeUser } from './profile';
import { judgeFit } from './matcher';
import { PROFILES } from './fixtures';
import { ingestCity, applyPoolGates, CONFIG, type IngestReport } from './engine';

// ---------------------------------------------------------------------------
// Env — a ten-line parser beats a dependency for one file
// ---------------------------------------------------------------------------

function loadEnv(): void {
  for (const file of ['.env.local', '.env', '../../.env']) {
    const full = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
      const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (!m) continue;
      const value = m[2].replace(/^['"]|['"]$/g, '');
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  }
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);
const rule = (label = '') =>
  console.log(`\n${label ? `── ${label} ` : ''}${'─'.repeat(Math.max(0, 78 - label.length))}`);

function when(): { month: string; year: string } {
  const now = new Date();
  return {
    month: now.toLocaleString('it-IT', { month: 'long' }),
    year: String(now.getFullYear()),
  };
}

function printStats(r: IngestReport): void {
  const s = r.stats;
  rule('INGESTION');
  console.log(`  searches run          ${s.queries}`);
  console.log(`  results returned      ${s.hits}`);
  console.log(`  pages fetched         ${s.fetched}`);
  console.log(`  pages yielding zero   ${s.failedFetch}   ← 403s / paywalls / not listing pages`);
  console.log(`  events extracted      ${s.extracted === 0 ? 0 : r.pool.length + '(+dupes)'}`);
  console.log(`  after dedupe          ${s.afterDedupe}`);
  if (s.verified || s.demoted) {
    console.log(`  verified upcoming     ${s.verified}`);
    console.log(`  demoted (unverified)  ${s.demoted}   ← iter-4 honesty guard`);
  }
  console.log(`  dropped: already past ${s.droppedPast ?? 0}`);
  console.log(`  dropped: wrong city   ${s.droppedOutOfCity ?? 0}`);
  console.log(`  PASSED all gates      ${s.passedValidity}`);
}

function printPool(pool: UnifiedQuest[]): void {
  rule('THE POOL — read this before trusting anything downstream');
  if (!pool.length) {
    console.log('  empty. Either the searches found nothing usable, or extraction failed.');
    return;
  }
  console.log(`  ${pad('VAL', 5)}${pad('CONFIDENCE', 22)}${pad('KIND', 17)}${pad('DIFF', 6)}TITLE`);
  for (const q of [...pool].sort((a, b) => scoreQuest(b).aggregate - scoreQuest(a).aggregate)) {
    console.log(
      `  ${pad(String(scoreQuest(q).aggregate), 5)}${pad(q.confidence, 22)}` +
      `${pad(q.kind, 17)}${pad(String(q.difficulty), 6)}${q.title}`,
    );
    console.log(
      `        ${pad(q.venue_name ?? '(no venue)', 30)} ` +
      `${q.start_datetime ?? q.recurrence ?? '(no date)'} · ` +
      `${q.is_free ? 'free' : q.price_eur != null ? `€${q.price_eur}` : 'price unknown'}`,
    );
    console.log(`        ${q.source_url ?? '(NO SOURCE URL — should have been gated out)'}`);
  }
}

async function printMatching(pool: UnifiedQuest[], useModel: boolean): Promise<void> {
  rule(`MATCHING — fixture profiles against REAL candidates [${useModel ? 'MODEL-JUDGED' : 'lexical'}]`);
  if (!pool.length) {
    console.log('  no pool, so everyone falls back. Nothing to learn here.');
  }

  // One call per person, all candidates at once — not one call per candidate.
  const judged = new Map<string, Awaited<ReturnType<typeof judgeFit>>>();
  if (useModel && pool.length) {
    for (const p of PROFILES) judged.set(p.id, await judgeFit(p, pool));
  }

  for (const p of PROFILES) {
    const a = selectForUser(pool, p, judged.get(p.id));
    console.log(`\n  ${p.id.toUpperCase()} — ${describeUser(p)}`);
    console.log(`    said: "${p.meaningToDo}"`);
    console.log(`    →  ${a.usedFallback ? '[FALLBACK] ' : ''}${a.quest.title}`);
    console.log(
      `       ${a.quest.kind} · ${DIFFICULTY_LABEL[a.quest.difficulty]} · ` +
      `validity ${a.validity} · FIT ${a.fit.fit} · bail:${a.fit.bailVerdict}`,
    );
    for (const w of a.fit.why.slice(0, 3)) console.log(`       · ${w}`);
    if (a.relaxations.length) console.log(`       ⚠ relaxed: ${a.relaxations.join(', ')}`);
  }

  const picks = PROFILES.map(p => selectForUser(pool, p, judged.get(p.id)));
  const distinct = new Set(picks.map(a => a.quest.id)).size;
  const fallbacks = picks.filter(a => a.usedFallback).length;
  console.log(
    `\n  => ${distinct} distinct quests across ${PROFILES.length} people; ` +
    `${fallbacks} fell back to a self-directed mission.`,
  );
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const OUT_DIR = path.resolve(__dirname, '..', 'output');

function cachePath(city: string): string {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  return path.join(OUT_DIR, `${city.toLowerCase()}-${stamp}.json`);
}

function newestCache(city: string): string | null {
  if (!fs.existsSync(OUT_DIR)) return null;
  const files = fs.readdirSync(OUT_DIR)
    .filter(f => f.startsWith(`${city.toLowerCase()}-`) && f.endsWith('.json'))
    .sort();
  return files.length ? path.join(OUT_DIR, files[files.length - 1]) : null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  loadEnv();

  const args = process.argv.slice(2);
  const flags = new Set(args.filter(a => a.startsWith('--')));
  const city = args.find(a => !a.startsWith('--')) ?? 'Milan';
  const maxArg = args.find(a => a.startsWith('--max='));
  if (maxArg) CONFIG.maxExtractionsPerCity = Number(maxArg.split('=')[1]);

  const smoke = flags.has('--smoke');
  const verify = flags.has('--verify');
  const fromCache = flags.has('--from-cache');
  const useModel = flags.has('--llm-match');

  if (smoke) CONFIG.maxExtractionsPerCity = 1;

  console.log(`\n${'═'.repeat(80)}`);
  console.log(` CITY QUEST ENGINE — ${city}${smoke ? '  [SMOKE TEST: 1 search, 1 extraction]' : ''}`);
  console.log(`${'═'.repeat(80)}`);

  // --- cached path: no network, free -------------------------------------
  if (fromCache) {
    const file = newestCache(city);
    if (!file) {
      console.error(`\n  No cached run for "${city}". Run without --from-cache first.`);
      process.exit(1);
    }
    const cached = JSON.parse(fs.readFileSync(file, 'utf8')) as IngestReport;
    console.log(`\n  reading ${path.relative(process.cwd(), file)} (no API calls)`);

    // Re-gate against CURRENT logic rather than whatever was in force when this
    // was fetched — otherwise a cached run silently tests yesterday's rules.
    // Older caches predate `raw`; their `pool` is already validity-gated, so
    // re-gating it is still correct — it just cannot show anything the validity
    // floor had already removed.
    const source = cached.raw ?? cached.pool;
    const gated = applyPoolGates(source, cached.city);
    cached.pool = gated.pool;
    cached.stats.passedValidity = gated.pool.length;
    cached.stats.droppedPast = gated.droppedPast;
    cached.stats.droppedOutOfCity = gated.droppedOutOfCity;
    console.log(
      `  re-gated with current rules: ${source.length} → ${gated.pool.length}` +
      `${cached.raw ? '' : '  (from stored pool; pre-validity drops not visible)'}`,
    );

    printStats(cached);
    printPool(cached.pool);
    await printMatching(cached.pool, useModel);
    return;
  }

  // --- live path ----------------------------------------------------------
  if (!process.env.OPENAI_API_KEY) {
    console.error('\n  OPENAI_API_KEY not found. Checked .env.local, .env, ../../.env');
    console.error('  Set it, or run with --from-cache to work offline.\n');
    process.exit(1);
  }

  console.log(`  models: extract=${CONFIG.extractModel} search=${CONFIG.searchModel}`);
  console.log(`  search tool: ${CONFIG.searchToolType}`);
  console.log(`  extraction ceiling: ${CONFIG.maxExtractionsPerCity}`);
  console.log(`  verification: ${verify ? 'ON' : 'off (pass --verify to enable)'}`);

  const started = Date.now();
  let report: IngestReport;
  try {
    report = await ingestCity(city, when(), { verify });
  } catch (err) {
    console.error(`\n${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
    return;
  }
  const secs = ((Date.now() - started) / 1000).toFixed(1);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = cachePath(city);
  fs.writeFileSync(out, JSON.stringify(report, null, 2));

  printStats(report);
  printPool(report.pool);
  if (!smoke) await printMatching(report.pool, useModel);

  rule();
  console.log(`  ${secs}s · cached to ${path.relative(process.cwd(), out)}`);
  console.log(`  re-run matching for free:  node dist/ingest.js ${city} --from-cache\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
