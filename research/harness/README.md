# Comfort-Zone Event Harness

A self-improvement loop for the "assign a real-world comfort-zone quest in the user's city each week" feature of StepnOut.

## What this is

A **generate → judge → improve** loop. Each iteration:

1. **Source** — search local aggregators for events in a city, extract to the `UnifiedQuest` schema (`pipeline.ts`), using the current `config.json`.
2. **Judge** — score every candidate against `rubric.md` (the comfort-zone rubric). The rubric is the optimization target.
3. **Improve** — read the judge's failure modes, change `config.json` / the extraction prompt / `pipeline.ts`, and re-run.

The loop is currently **Claude-driven**: Claude runs the search/fetch/extract with its own tools, plays the judge, and edits the config between rounds. `pipeline.ts` is the lift-and-shift artifact — swap Claude's web tools for a real search API + the Anthropic API and the same loop runs unattended.

## The goal it optimizes for

StepnOut is about **stepping outside your comfort zone**. A good weekly assignment is a real, verifiable, solo-attendable event or mission that requires a *stretch* — mild social courage or genuine novelty — graded so it can be matched to how bold the user is that week. See `rubric.md`.

## Files

| File | Role | Evolves? |
|---|---|---|
| `rubric.md` | The judge's scoring criteria — what "good" means | yes (slowly) |
| `config.json` | Tunable sourcing knobs: queries, radius-by-population, sources, fallback | yes (every iteration) |
| `pipeline.ts` | Production-ready TS: types + source + normalize + judge (`scoreQuest`) | yes (reflects final config) |
| `fixtures.ts` | Real events sourced live (2026-08-09), typed as `UnifiedQuest` | append |
| `run.ts` | Runnable driver — scores the fixtures and prints the progression | yes |
| `tsconfig.json` | Standalone build (not the app's) so the harness runs on its own | — |
| `iterations/iteration-NN.md` | One loop pass: config used, output, judge scores, failure modes, fix | append-only log |
| `RESULTS.md` | Verbatim run output + the key insights the loop surfaced | yes |

## Run it (proves its own numbers)

```bash
cd research/harness && npx tsc -p tsconfig.json && node dist/run.js
```

The score progression in `RESULTS.md` is whatever this prints — the harness is self-verifying, not self-asserting.

## Test cities (deliberate spread)

- **Milan** (~1.4M) — easy baseline, rich inventory
- **Bologna** (~390k) — mid, still healthy
- **Fabriano** (~29k) — the collapse case; forces the fallback + radius paths

## How to run the next iteration (Claude-driven)

> "Run iteration N of the comfort-zone harness. Use the current `config.json`, source the 3 test cities, judge against `rubric.md`, log to `iterations/iteration-0N.md`, and update `config.json` + `RESULTS.md` with the improvement."

## How to lift to autonomous

1. Replace Claude's `WebSearch`/`WebFetch` with a search API (Brave/Tavily/SerpAPI) + fetch in `pipeline.ts`.
2. Replace the extraction + judge steps with Anthropic API calls (model `claude-opus-4-8` or `claude-haiku-4-5` for the cheaper extraction pass).
3. Persist `UnifiedQuest[]` to Supabase; the loop becomes a scheduled job that logs judge scores as a quality metric over time.

## Status

**6 iterations run, self-verifying.** iter 4 made the score *honest* (dedup + Ferragosto freshness guard); iter 5 added persona pacing + safety; **iter 6 corrected the objective (user feedback): difficulty is a label not a quality signal, all comfort-zone kinds are peers, and diversity over time is the real goal** — judge is now `verifiability(45%)+cost(30%)+attendability(25%)` with `selectDiverse()` choosing. Discovery is at production quality across all city sizes. The remaining frontier is the **attendance feedback loop**, not sourcing. See `RESULTS.md`.
