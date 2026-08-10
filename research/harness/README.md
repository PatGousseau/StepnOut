# Comfort-Zone Event Harness

A self-improvement loop for the "assign a real-world comfort-zone quest in the user's city each week" feature of StepnOut.

## What this is

A **generate → judge → improve** loop. Each iteration:

1. **Source** — search local aggregators for events in a city, extract to the `UnifiedQuest` schema (`pipeline.ts`), using the current `config.json`.
2. **Judge** — score every candidate against `rubric.md` (the comfort-zone rubric). The rubric is the optimization target.
3. **Improve** — read the judge's failure modes, change `config.json` / the extraction prompt / `pipeline.ts`, and re-run.

Iterations 1–8 ran **offline against fixtures**. **Iteration 9 made it live**: `engine.ts` implements the four dependencies `pipeline.ts` had stubbed since the start, so `node dist/ingest.js <city>` now does real search, real fetch, real extraction against real Italian listing pages.

## The goal it optimizes for

StepnOut is about **stepping outside your comfort zone**. A good weekly assignment is a real, verifiable, solo-attendable event or mission that requires a *stretch* — mild social courage or genuine novelty — graded so it can be matched to how bold the user is that week. See `rubric.md`.

## Files

| File | Role | Evolves? |
|---|---|---|
| `rubric.md` | The **validity** judge's criteria — what "real and attendable" means | yes (slowly) |
| `config.json` | Tunable sourcing knobs: queries, radius-by-population, sources, fallback | yes (every iteration) |
| `pipeline.ts` | Production-ready TS: types + source + normalize + validity judge (`scoreQuest`) | yes (reflects final config) |
| `profile.ts` | **Fit** judge (iter 7): `UserProfile`, `scoreFit`, `selectForUser`, profile-aware fallback | yes |
| `engine.ts` | **Live** (iter 9): the four deps for real — search, fetch+extract, POIs, verify + pool gates | yes |
| `matcher.ts` | **Live** (iter 9): one model call per user judging pull/edge/bail. Replaces the lexicon | yes |
| `ingest.ts` | Runnable CLI: ingest a city, cache the run, match the profiles against it | yes |
| `fixtures.ts` | Real events sourced live (2026-08-09) + user profiles, typed | append |
| `run.ts` | Runnable driver — scores the fixtures and prints the progression | yes |
| `tsconfig.json` | Standalone build (not the app's) so the harness runs on its own | — |
| `iterations/iteration-NN.md` | One loop pass: config used, output, judge scores, failure modes, fix | append-only log |
| `RESULTS.md` | Verbatim run output + the key insights the loop surfaced | yes |

## Run it (proves its own numbers)

```bash
cd research/harness && npx tsc -p tsconfig.json && node dist/run.js
```

The score progression in `RESULTS.md` is whatever this prints — the harness is self-verifying, not self-asserting.

## Run it for real (iteration 9 — costs money)

```bash
cd research/harness && npm install
npm run build

node dist/ingest.js Milan --smoke                     # 1 search + 1 extraction, pennies. Always first.
node dist/ingest.js Fabriano --verify                 # full run, ~2 min
node dist/ingest.js Fabriano --from-cache             # re-match the cached pool, free
node dist/ingest.js Fabriano --from-cache --llm-match # model judging instead of the lexicon
```

Needs `OPENAI_API_KEY` (read from `.env.local`, `.env`, or the repo root `.env`). Ingestion is **per city per week, never per user** — cost scales with cities covered, not users. `CONFIG.maxExtractionsPerCity` is a hard ceiling so a bad run can't spend unbounded money. Every run caches to `output/`, so iterating on matching is free.

## Test cities (deliberate spread)

- **Milan** (~1.4M) — easy baseline, rich inventory
- **Bologna** (~390k) — mid, still healthy
- **Fabriano** (~29k) — assumed to be the collapse case. **Iteration 9 disproved that**: live, it returned *more* assignable events than Milan (22 vs 16), because `comune.fabriano.an.it/eventi/` carries the town's entire summer programme. Big cities have no equivalent single source.

## How to run the next iteration (Claude-driven)

> "Run iteration N of the comfort-zone harness. Use the current `config.json`, source the 3 test cities, judge against `rubric.md`, log to `iterations/iteration-0N.md`, and update `config.json` + `RESULTS.md` with the improvement."

## What is still missing to ship

Iteration 9 closed the "is it real" gap. What remains:

1. **Persist `UnifiedQuest[]`** — the pool currently lives in `output/*.json`, not a table. Ingestion becomes a weekly job per city; `scoreQuest` logged per run is the health metric that catches a source going dark.
2. **Fix verifiability** — it is 45% of validity and iteration 9 showed it inflated: `verifyOccurrence` never fires on real data, and bare-homepage confirm links score 10/10.
3. **Let the matcher say "none of these fit"** — the fallback currently depends on a model volunteering a low score.

## Status

**9 iterations run, self-verifying.** iter 4 made the score *honest* (dedup + Ferragosto freshness guard); iter 5 added persona pacing + safety; iter 6 corrected the objective (user feedback): difficulty is a label, all kinds are peers, diversity is the goal. **iter 7 added the missing half — selecting FOR a user**, and **iter 8 fixed five of the seven failures it found.** There are now **two judges, deliberately unmerged**: `scoreQuest` (validity — a floor) and `scoreFit` (pull/edge/bail/solo/novelty — the ranking).

Iter 8 made the deal-breaker a hard filter, restored diversity as a hard exclusion, flagged thin input, made prohibition matching negation-aware, replaced array-order tiebreaks, and matched on candidate *content* rather than taxonomy — **with the fit weights unchanged**, so the before/after is readable. One score fell deliberately (a preference had been misread as a fear).

**Iteration 9 ran it against reality** and it works: real events, real venues, real dates, first try. It also inverted the core sourcing assumption (small towns are the *easy* case — see above), exposed four defects fixtures could never have shown (unknown price scored as expensive, no date gate, no geographic gate, the follow-up question polluting the match), and confirmed the `[LEXICAL]` tag was doing real work — the keyword matcher handed a user who wanted to *speak Italian with people* a **religious pilgrimage walk**.

Swapping in `matcher.ts` fixes that class of failure outright. On the same real Fabriano pool it took fallbacks from 3 to 0 and found Elena the one museum evening in town — a candidate the keyword path had *excluded* via her own deal-breaker. See `RESULTS.md` and `iterations/iteration-09.md`.

**The honest remaining gap is that nobody has attended anything.** Every score is still the rubric's opinion of itself.
