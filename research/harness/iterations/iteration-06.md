# Iteration 06 — Objective correction (human feedback): difficulty ≠ quality, diversity is the goal

**Date:** 2026-08-09 · **Config:** v6 · **Trigger:** user feedback, not a judge failure mode.

This is the most important iteration and the loop could **not** have found it alone: the *objective was wrong*. v1–v5 optimized "comfort-zone stretch" at 40% of the score — rewarding *harder = better*. The user corrected this:

> "all those in comfort zone are equally as good. it's not the harder the better. so language exchange is not better than a solo concert. and I actually like a diversity of things... solo attendable is good too, although maybe the challenge is go with a friend. verifiability and actionability is super important. cost too."

## What changed in the rubric (v1 → v2)

| | v1 (wrong) | v2 (corrected) |
|---|---|---|
| Comfort-zone stretch | **40% of score** | **removed from score** — all genuine outings are peers |
| Difficulty | drove ranking | **metadata label only** (gentle→brave); user can choose, app can pace |
| Verifiability | 20% | **45%** (user: "super important") |
| Cost | 10% | **30%** |
| Attendability | 20%, solo-biased | **25%**, and **bring-a-friend is a valid mode** (9/10), not a penalty |
| Diversity | absent | **the real selector** — rotate kinds over time (`selectDiverse`); new `F-monotony` failure tag |

`score = 0.45·verifiability + 0.30·cost + 0.25·attendability`  · gate: is-it-a-real-outing + safety.

## Actual run output (`node dist/run.js`)
```
concert          "Free jazz concert @ Giardino delle Culture" score 10   [easy · diff 2]
language_social  "Tandem language exchange @ Ostello Bello"   score 9.6  [bold · diff 4]
=> difficulty differs (2 vs 4) but neither is "better" — score is type-agnostic.

6 weeks, one Milan user:
  OLD (max score):  concert ×6                         -> 1 distinct kind  (F-monotony)
  v2 (selectDiverse): concert, exhibition, language_social, market, board-games, concert
                                                        -> 5 distinct kinds
```

## Why this matters
- **The score compressed into a tight high band on purpose.** Once you stop rewarding difficulty, every real-free-attendable option scores ~9–10. The score's job is now to *reject* the unverifiable and the expensive — **not to crown a winner**. The winner is chosen by **diversity**, which is a portfolio property, not an item property.
- **It re-reads the earlier iterations honestly.** Under v1, iter-1's concerts were marked `F-passive` ("bad, not enough stretch"). Under v2 that was a *mistaken* penalty — a free open-air concert is a perfectly good quest. Iter-1's *real* faults were low verifiability (unconfirmed listing), the empty small town, and monotony. The category-targeting from iter-2 is still valuable, but for **variety + actionable recurring communities**, not "more stretch."

## Lesson for the harness design itself
A self-improving loop optimizes the objective you give it — flawlessly, including when the objective is wrong. The judge got better at a goal that didn't match the product. **The human is the source of the objective; the loop is the source of execution.** The fix wasn't a smarter judge, it was a corrected goal — and the loop immediately propagated it into `scoreQuest`, `selectDiverse`, and every downstream number.

## Still open (unchanged by this correction)
- Attendance feedback loop — the true objective is "did they go, was it a good outing?" This rubric is still a proxy for that.
- Difficulty pacing — now that difficulty is a clean label, optionally ease newcomers in / let users pick, without it ever touching quality.
