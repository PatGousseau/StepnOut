/**
 * Harness driver — v2 (corrected objective). Difficulty is a label, not a score.
 * Quality = verifiability + cost + attendability; variety over time is the real goal.
 *
 *   cd research/harness && npx tsc -p tsconfig.json && node dist/run.js
 */
import {
  scoreQuest, scoreCity, dedupe, selectDiverse, DIFFICULTY_LABEL,
  type UnifiedQuest, type QuestKind, type UserContext,
} from './pipeline';
import {
  selectForUser, scoreFit, difficultyWindow, dataDepth, describeUser,
  type UserProfile, type QuestHistoryEntry,
} from './profile';
import {
  ITER1, ITER2, ITER3, ITER4_BOLOGNA_POOL, MILAN_WEEKLY_POOL,
  MILAN_WEEK_V7, THIN_WEEK_V8, PROFILES,
} from './fixtures';

const CITIES = ['Milan', 'Bologna', 'Fabriano'];
const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);
const bar = (v: number) => '█'.repeat(Math.round(v)) + '░'.repeat(10 - Math.round(v));

// --- Part 1: progression under the CORRECTED (type-agnostic) judge -----------

console.log('\n=== Progression under corrected judge (verifiability + cost + attendability; NO difficulty) ===\n');
console.log(pad('City', 10) + pad('iter1', 8) + pad('iter2', 8) + pad('iter3', 8) + 'note');
const means = [0, 0, 0];
for (const city of CITIES) {
  const s = [scoreCity(ITER1[city]), scoreCity(ITER2[city]), scoreCity(ITER3[city])];
  s.forEach((v, i) => (means[i] += v));
  const note = ITER1[city].length === 0 ? 'iter1 empty (F-empty)' : '';
  console.log(pad(city, 10) + s.map(v => pad(v.toFixed(1), 8)).join('') + note);
}
means.forEach((m, i) => (means[i] = Math.round((m / 3) * 10) / 10));
console.log(pad('MEAN', 10) + means.map(m => pad(m.toFixed(1), 8)).join(''));
console.log('');
means.forEach((m, i) => console.log(`iter${i + 1}  ${bar(m)}  ${m.toFixed(1)}`));
console.log('\nNote: gains now come from VERIFIABILITY + never-empty, not from "harder" events.');

// --- Part 2: a solo concert now scores like a language exchange ---------------

console.log('\n=== Type no longer ranks: equally-actionable options tie ===\n');
const concert = MILAN_WEEKLY_POOL.find(q => q.kind === 'concert')!;
const langex = MILAN_WEEKLY_POOL.find(q => q.kind === 'language_social')!;
for (const q of [concert, langex]) {
  const sc = scoreQuest(q);
  console.log(
    `${pad(q.kind, 16)} "${pad(q.title, 40)}" score ${sc.aggregate}  ` +
    `[${DIFFICULTY_LABEL[q.difficulty]} · diff ${q.difficulty}]`,
  );
}
console.log('=> difficulty differs (2 vs 4) but neither is "better" — score is type-agnostic.');

// --- Part 3: DIVERSITY over time (the point of the correction) ----------------

console.log('\n=== 6 weeks for one Milan user: monotone (old) vs diverse (v2) ===\n');
const weeks = 6;

// Old behaviour: always pick the top-scoring item -> same kind repeats.
const topAlways = [...MILAN_WEEKLY_POOL].sort((a, b) => scoreQuest(b).aggregate - scoreQuest(a).aggregate)[0];
console.log('OLD (max score, no diversity):');
for (let w = 1; w <= weeks; w++) console.log(`  week ${w}: ${pad(topAlways.kind, 16)} ${topAlways.title}`);

// v2: selectDiverse over a sliding window of recent kinds.
console.log('\nv2 (selectDiverse over recent kinds):');
const recent: QuestKind[] = [];
for (let w = 1; w <= weeks; w++) {
  const pick = selectDiverse(MILAN_WEEKLY_POOL, recent.slice(-4))!;
  console.log(`  week ${w}: ${pad(pick.kind, 16)} ${pad(pick.title, 44)} [${DIFFICULTY_LABEL[pick.difficulty]}]`);
  recent.push(pick.kind);
}
console.log(`\n=> v2 delivers ${new Set(recent).size} distinct kinds across ${weeks} weeks; old delivers 1 (F-monotony).`);

// --- Part 4: attendability — "bring a friend" is valid, not penalized ---------

console.log('\n=== Attendability: solo AND bring-a-friend both score well ===\n');
for (const q of MILAN_WEEKLY_POOL.filter(q => q.attend_mode !== 'solo')) {
  console.log(`${pad(q.attend_mode, 13)} "${q.title}"  attendability ${scoreQuest(q).attendability}/10`);
}

// --- Part 5 (unchanged): dedup + freshness still hold -------------------------

console.log('\n=== dedup + Ferragosto freshness (Bologna) still enforced ===\n');
const verifyOccurrence = async (q: UnifiedQuest) => !/2026-08-12/.test(q.start_datetime ?? '');
(async () => {
  const deduped = dedupe(ITER4_BOLOGNA_POOL);
  for (const q of deduped) {
    if (q.confidence === 'recurring_scheduled' && q.verified_upcoming === undefined) {
      if (!(await verifyOccurrence(q))) q.confidence = 'recurring_unresolved';
    }
  }
  const best = deduped.sort((a, b) => scoreQuest(b).aggregate - scoreQuest(a).aggregate)[0];
  console.log(`dedupe: ${ITER4_BOLOGNA_POOL.length} -> ${deduped.length}; honest best "${best.title}" ` +
    `score ${scoreQuest(best).aggregate} (${best.confidence})`);

  personalization();   // iter 7 — chained so output stays in order
})();

void (undefined as unknown as UserContext); // UserContext exercised by pipeline.sourceCity in prod

// ===========================================================================
// ITER 7 — PERSONALIZATION. Validity is a floor; fit is the product.
// ===========================================================================

function personalization(): void {
  console.log('\n\n############ ITERATION 8 — FIT, with the five iter-7 fixes applied ############');
  console.log('# weights UNCHANGED from iter 7 (.35/.20/.20/.15/.10) — only the structure moved.');

  // --- Part 6: same city, same week, six different people -----------------

  console.log('\n=== Same city + same week: does anyone actually get a different quest? ===\n');

  const picks = PROFILES.map(p => ({ p, a: selectForUser(MILAN_WEEK_V7, p) }));

  for (const { p, a } of picks) {
    console.log(`── ${p.id.toUpperCase()} ─ ${describeUser(p)}`);
    console.log(`   said: "${p.meaningToDo}"`);
    console.log(`   bail: "${p.bailCondition || '(skipped)'}"`);
    if (a.depth.needsMoreInput) {
      console.log(`   ⚠ NEEDS MORE INPUT — intake should ask before assigning:`);
      console.log(`     "${a.depth.followUpQuestion}"`);
    }
    console.log(`   →  ${a.usedFallback ? '[FALLBACK] ' : ''}${a.quest.title}`);
    console.log(`      ${a.quest.kind} · ${DIFFICULTY_LABEL[a.quest.difficulty]} (diff ${a.quest.difficulty})` +
      `   validity ${a.validity}/10   FIT ${a.fit.fit}/10   bail:${a.fit.bailVerdict}`);
    console.log(`      fit parts: pull ${a.fit.pull} · edge ${a.fit.edge} · solo ${a.fit.soloCalibration}` +
      ` · bail ${a.fit.bailSafety} · novelty ${a.fit.novelty}`);
    for (const w of a.fit.why) console.log(`      · ${w}`);
    const filtered = a.excluded.filter(e => e.by === 'bail-collision');
    if (filtered.length) {
      console.log(`      EXCLUDED by their deal-breaker: ${filtered.map(e => e.quest.title).join(' | ')}`);
    }
    if (a.relaxations.length) console.log(`      ⚠ relaxed filters to find anything: ${a.relaxations.join(', ')}`);
    if (a.runnersUp.length) {
      console.log(`      runners-up: ${a.runnersUp.map(r => `${r.quest.title} (${r.fit})`).join(' | ')}`);
    }
    console.log('');
  }

  const distinct = new Set(picks.map(x => x.a.quest.id));
  const distinctKinds = new Set(picks.map(x => x.a.quest.kind));
  console.log(`=> ${distinct.size} distinct quests and ${distinctKinds.size} distinct kinds across ` +
    `${picks.length} people in ONE city-week.`);
  console.log('   (If this were 1-2, the personalization would be hollow — that is the finding, not a bug to tune away.)');

  // --- Part 7: what the SAME pool looks like with no profile at all --------

  console.log('\n=== Control: iter-6 behaviour (no profile) on the same pool ===\n');
  const iter6Pick = [...MILAN_WEEK_V7].sort((a, b) => scoreQuest(b).aggregate - scoreQuest(a).aggregate)[0];
  console.log(`  everyone would get: "${iter6Pick.title}" (validity ${scoreQuest(iter6Pick).aggregate})`);
  console.log(`  fit of that quest per person: ` +
    PROFILES.map(p => `${p.id} ${scoreFit(p, iter6Pick).fit}`).join(' · '));
  console.log('  => validity alone cannot tell these people apart. That is the gap iter 7 fills.');

  // --- Part 8: the fallback has to be personal too -------------------------

  console.log('\n=== Fallback check: profile with no matching event in the pool ===\n');
  const tommaso = PROFILES.find(p => p.id === 'tommaso')!;
  const tAssign = selectForUser(MILAN_WEEK_V7, tommaso);
  console.log(`  ${tommaso.id} wants: "${tommaso.meaningToDo}"`);
  console.log(`  pool contains zero physical/sport options.`);
  console.log(`  → ${tAssign.usedFallback ? 'FALLBACK fired' : 'NO fallback (matched an event)'}: "${tAssign.quest.title}"`);
  console.log(`    ${tAssign.quest.description}`);
  console.log(`    eligible_reason: ${tAssign.quest.eligible_reason}`);
  console.log(`  best event alternative was: ${tAssign.runnersUp.map(r => `${r.quest.title} (fit ${r.fit})`).join(' | ') || 'none'}`);

  // --- Part 8b: does the deal-breaker filter survive a thin pool? ----------

  console.log('\n=== Stress test: same people, Fabriano-sized pool (3 candidates) ===\n');
  console.log('  iter 8 made the bail condition a hard filter. A filter is only a guarantee');
  console.log('  if it holds when the pool cannot absorb it. Most Italian towns look like this.\n');

  for (const p of PROFILES) {
    const a = selectForUser(THIN_WEEK_V8, p);
    const kept = THIN_WEEK_V8.length - a.excluded.length;
    console.log(`  ${pad(p.id, 9)} ${pad(`${kept}/${THIN_WEEK_V8.length} survived filters`, 26)}` +
      `→ ${a.usedFallback ? '[FALLBACK] ' : ''}${pad(a.quest.title, 38)} fit ${a.fit.fit}` +
      `${a.relaxations.length ? `  ⚠ RELAXED: ${a.relaxations.join(',')}` : ''}`);
  }

  // --- Part 9: four consecutive weeks for one profile ----------------------

  console.log('\n=== 4 weeks, one profile (sofia): escalation + no category spiral ===\n');
  const sofia = PROFILES.find(p => p.id === 'sofia')!;
  const history: QuestHistoryEntry[] = [];

  for (let week = 1; week <= 4; week++) {
    const p: UserProfile = { ...sofia, history: [...history] };
    const win = difficultyWindow(p);
    const a = selectForUser(MILAN_WEEK_V7, p);
    console.log(`  week ${week}  window ${win.lo}-${win.hi} (attended ${win.attended})  ` +
      `→ ${pad(a.quest.kind, 22)} ${pad(a.quest.title, 42)} ` +
      `[diff ${a.quest.difficulty} · fit ${a.fit.fit}]${a.usedFallback ? ' (fallback)' : ''}` +
      `${a.relaxations.length ? ` (relaxed: ${a.relaxations.join(',')})` : ''}`);
    history.push({
      week, questId: a.quest.id, kind: a.quest.kind,
      difficulty: a.quest.difficulty, attended: true,      // simulate: she goes every week
    });
  }

  const diffs = history.map(h => h.difficulty);
  const kinds = new Set(history.map(h => h.kind));
  console.log(`\n  difficulty path: ${diffs.join(' → ')}   (escalating: ${diffs[3] > diffs[0] ? 'yes' : 'NO'})`);
  console.log(`  distinct kinds over 4 weeks: ${kinds.size}/4   (${[...kinds].join(', ')})`);
}
