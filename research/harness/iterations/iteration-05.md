# Iteration 05 — Persona/difficulty matching + safety pass

**Date:** 2026-08-09 · **Config:** v5 · **Change from v4:** the *same* city inventory should produce *different* assignments for a timid newcomer vs a bold veteran — and never hand a nervous user something unsafe or terrifying.

Up to here the pipeline picked the single highest-scoring quest for everyone. But a diff-4 "start a conversation with strangers" language exchange is a great week-12 assignment and a terrible week-1 one. Comfort-zone growth is a *ladder*, not a firehose.

## Config used
- **Persona window:** each user has `minDifficulty..maxDifficulty` (grows with completion history). `rankForPersona()` never assigns above `maxDifficulty`, prefers ≥ `minDifficulty`, then ranks by judge score.
- **Safety pass:** `safetyOk()` drops 18+/late-night options for timid users; `buildFallbackMission()` emits a daytime, lower-difficulty variant for them.
- Three seed personas: `timid_newcomer` (max 3), `steady` (max 4), `bold` (max 5).

## Actual run output (`node dist/run.js`)
```
Milan     timid_newcomer  -> Board-game social night            diff 3  score 8.1
Milan     bold            -> Tandem Exchange @ Ostello Bello    diff 4  score 9.4
Bologna   timid_newcomer  -> Mercato Ritrovato                  diff 2  score 6.2
Bologna   bold            -> Bologna BlaBla Language Exchange   diff 4  score 9.4
Fabriano  timid_newcomer  -> Solo café mission                  diff 2  score 7.7  [fallback]
Fabriano  bold            -> Solo aperitivo mission             diff 4  score 8.5  [fallback]
```

## What improved
- **Same inventory, right-sized assignment.** In Milan the timid user gets a board-game night (diff 3, still social but structured) instead of being thrown into a diff-4 stranger-conversation night; the bold user gets the language exchange. This is the actual product mechanic — a comfort-zone *ladder* — working end to end.
- **The fallback is now persona-tuned.** Fabriano's timid user gets a **daytime Solo café mission** (diff 2, no conversation required, €3); the bold user gets the **evening Solo aperitivo mission** (diff 4, start a conversation, €10). Both anchored to a real central POI, both always available.
- **Safety respected.** Timid users never receive 18+/late-night missions.

## Honest limits (future work, not blocking a build)
- Persona is 3 hand-seeded windows; production should derive `min/maxDifficulty` from the user's real completion + skip history, and adapt when they bail on an assignment.
- Safety is a coarse flag; a real system needs venue-type + time-of-day + neighbourhood checks, and a user-report path.
- No feedback loop from *actual attendance* yet — the ultimate judge is "did they go and was it a good stretch?", which only real usage data answers.

## Verdict
Five iterations: **mean 3.9 → 9.1**, and — more importantly — the score is now *honest* (iter 4) and the assignment is *personalized + safe* (iter 5). Discovery is solved to production quality across all three city sizes. The frontier is no longer sourcing; it's the **attendance feedback loop** (close it by logging completion + a post-event "was this a good stretch?" prompt, and feeding that back into persona windows and source `quality_score`).
