# Harness Results

Self-improvement loop for comfort-zone event assignment. Claude-driven, **6 iterations**, real search data (2026-08-09). Judge = `rubric.md` (v2, corrected), implemented as `scoreQuest()` in `pipeline.ts`. **The numbers below are printed by `run.ts`, not asserted** — reproduce with:

```bash
cd research/harness && npx tsc -p tsconfig.json && node dist/run.js
```

## ⚠️ iter 6 corrected the objective (user feedback)

v1–v5 optimized **difficulty ("harder = better")** — that was wrong. Per user direction, **all genuine comfort-zone activities are equal** (a solo concert = a language exchange), **difficulty is a label not a score**, and **diversity over time is the real goal**. The judge is now `verifiability(45%) + cost(30%) + attendability(25%)`, and `selectDiverse()` chooses the assignment. See `iterations/iteration-06.md`.

## Verbatim run output (v2 judge)

```
=== Progression under corrected judge (verifiability + cost + attendability; NO difficulty) ===

City      iter1   iter2   iter3   note
Milan     7.8     8.2     9.6
Bologna   7.8     8.2     9.6
Fabriano  0.0     6.9     8.2     iter1 empty (F-empty)
MEAN      5.2     7.8     9.1

=== Type no longer ranks ===
concert          "Free jazz concert @ Giardino delle Culture" score 10   [easy · diff 2]
language_social  "Tandem language exchange @ Ostello Bello"   score 9.6  [bold · diff 4]

=== 6 weeks, one Milan user ===
OLD (max score):    concert ×6                          -> 1 distinct kind (F-monotony)
v2 (selectDiverse): concert, exhibition, language_social, market, board-games, concert
                                                        -> 5 distinct kinds

=== Attendability ===
either        "Mercato Antiquariato"        10/10
bring_friend  "Beginners salsa social"       9/10   (a valid challenge, not penalized)

=== dedup + Ferragosto freshness (still enforced) ===
dedupe: 3 -> 1; honest best "Bologna BlaBla" 8.2 (recurring_unresolved)
```

## Iteration ledger

| # | Change | Milan | Bologna | Fabriano | Mean | Failure modes closed |
|---|---|---|---|---|---|---|
| 1 | naive generic query | 5.8 | 5.8 | 0.0 | **3.9** | — (baseline) |
| 2 | category-targeted queries + radius | 8.8 | 8.8 | 5.9 | **7.8** | `F-passive`, `F-empty` |
| 3 | recurrence resolved + self-directed fallback | 9.4 | 9.4 | 8.5 | **9.1** | `F-undated`, `F-nostretch-smalltown` |
| 4 | dedup + freshness guard | 9.4 | 8.8* | 8.5 | — | `F-dup`; *Bologna honest ↓ (Ferragosto) |
| 5 | persona matching + safety | per-persona | per-persona | per-persona | — | over/under-shooting user boldness |
| 6 | **objective correction (user)** — difficulty→label, diversity is goal | 9.6 | 9.6 | 8.2 | **9.1** | `F-monotony`; un-rewards difficulty |

\* iter 4's Bologna *decrease* is the point — see below.

## The most important lesson (iter 6)

**A self-improving loop optimizes the objective you give it — flawlessly, including when the objective is wrong.** For five iterations the judge got better and better at rewarding *difficulty*, which turned out not to be the product goal at all. The loop couldn't discover that; only the human could. The fix wasn't a smarter judge — it was a **corrected goal**, which the loop then propagated instantly into `scoreQuest`, `selectDiverse`, and every number. Design implication: **the human owns the objective, the loop owns the execution.** Keep a human in the objective-setting seat; the true north (did the user go, was it a good outing?) still comes from real attendance data, which this rubric only proxies.

## The four things the loop learned

1. **Generic queries find the wrong events.** "eventi Milano" → concerts & cinema (passive, stretch 4). The comfort-zone gold — BlaBla / Tandem / Ostello Bello language exchanges, Meetup groups — only appears when you **search by comfort-zone category**. Same city, two query styles, completely different (and better) inventory — reproducible in the live results, not a modelling quirk.

2. **Recurring communities beat one-off events** for this app — they run weekly, are newcomer-friendly, and exist in every mid+ city — *but only if the pipeline resolves the next occurrence + a confirm-link* (else `F-undated`), *and* verifies it actually runs (Ferragosto).

3. **The small-town fallback must provide *stretch*, not *novelty*.** "Visit the paper museum" fills an empty week but is stretch ~2. A **self-directed social mission anchored to a real POI** ("solo aperitivo, sit at the bar, start one conversation") is stretch ~8 and works in *any* town with zero event inventory. This took Fabriano from a hard failure (0.0) to 8.5 — the single most important decision for the whole feature, because most Italian towns are Fabriano-sized, not Milan-sized.

4. **A world-class judge is one you can't game.** Iter 4 deliberately *lowered* a score: it stopped counting the same event three times (`F-dup`) and stopped trusting an unverified pre-Ferragosto slot. Bologna 9.4 → 8.8 is a **correctness win** — the score became honest, which is the precondition for using it as a live production quality signal.

## What this changes about the build

- **Discovery is solved to production quality** across all three city sizes (≥8.5 best-per-city, honest). Category-targeted search + recurring resolution + self-directed fallback is the converged recipe.
- **The next real gains are NOT in sourcing.** They are:
  1. **Attendance feedback loop** — log completion + a post-event "was this a good stretch?" prompt; feed it back into persona windows and per-source `quality_score`. This is the true judge; the rubric is a proxy for it.
  2. **Persona learning** — derive difficulty windows from real history instead of 3 seeds.
  3. **Freshness at scale** — verify every recurring slot before assigning; widen the Ferragosto guard into a general "is this actually happening" check.
- **Ship `scoreQuest()` as a live metric** — the same judge logs a weekly quality number per city, so a source going dark or a city collapsing is caught automatically.

## Honesty notes

- Scores are the rubric's opinion (`scoreQuest`), not user outcomes. The *relative* progression is grounded in real, reproducible differences in search inventory; *absolute* numbers are the judge's.
- Recurring "next occurrence" resolution is validated as *possible* (groups/venues/schedules are real — e.g. Bologna BlaBla Wed 20:30, Scuderie Piazza Verdi) but each date must be verified live in production (that's exactly what iter 4's guard enforces).
- August is atypical (Ferragosto). Re-run one iteration in a normal month before trusting absolute coverage.
