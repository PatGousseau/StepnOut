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
import { ITER1, ITER2, ITER3, ITER4_BOLOGNA_POOL, MILAN_WEEKLY_POOL } from './fixtures';

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
    `score ${scoreQuest(best).aggregate} (${best.confidence})\n`);
})();

void (undefined as unknown as UserContext); // UserContext exercised by pipeline.sourceCity in prod
