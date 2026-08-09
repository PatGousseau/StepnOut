# Iteration 08 — Fixing what iteration 7 found

**Date:** 2026-08-09 · **Changed:** `profile.ts` (structure only), `fixtures.ts` (+`THIN_WEEK_V8`), `run.ts` (+stress test) · **Trigger:** the five `[DESIGN]` findings from iter 7.

**The fit weights are unchanged: `.35 pull · .20 edge · .20 solo · .15 bail · .10 novelty`.** Every change below is structural. If the weights had moved too, the before/after would be unreadable — and "we tuned the numbers until the output looked better" is precisely the failure mode iter 7 was written to avoid.

## What changed

| # | iter-7 finding | Fix |
|---|---|---|
| 1 | A deal-breaker lost a coin flip | Bail collision is now a **hard filter**, not a 15% term. `escalationEarned()` (≥2 attended **and** has gone solo before) is the only override. |
| 2 | Diversity became a weight and stopped working | **Hard exclusion at selection**: no category from the last 2 weeks, no identical quest from the last 6. |
| 3 | Thin input silently guessed at | `dataDepth()` now returns `needsMoreInput` + the specific question to ask. Also: discomfort is read **only** from the bail answer and follow-up answers, never from `meaningToDo`. |
| 4 | Fallback flagged itself as a violation | `mentionsUnnegated()` — a prohibition term preceded by *no / not / non / senza / without / never / free* within 22 characters doesn't count. |
| 5 | Ties broken by array order | Explicit comparator: fit → pull → validity → distance from the middle of the difficulty window → id. |
| 7 | Taxonomy decided the match, not content | `evokedKinds()` + indirect matching: a candidate whose **own text** speaks the user's vocabulary scores as a match even when its `kind` doesn't. |

Filters relax in a fixed order when they would empty the pool — `same-category-recently` drops first, `bail-collision` last — and **every relaxation is recorded on the assignment**. A silent relaxation would be a filter that isn't really a filter.

## Verified fixed

**Marco — the wrong answer is now right.** Both quests still tie on fit at 8.5; the €10 salsa is now removed from the pool before ranking rather than winning a coin flip.

```
iter 7:  Beginners salsa social, €10   fit 8.5   ← selected on array order
iter 8:  EXCLUDED by their deal-breaker: Beginners salsa social
         → Swing beginners taster — free trial   fit 8.5   validity 9.6   bail:clear
```

**Sofia's exclusions are correct and non-obvious.** Her *"perform in front of a group"* removes salsa, swing **and** the open-mic — all three genuinely demand being watched, none of them mention performance in their titles. The flag is derived from what the quest *is*, not what it says.

**Negation.** The fallback is still titled *"Drop-in session, no course"* on purpose, so the fix is exercised by the run rather than asserted. It now reads `bail:clear`, and Tommaso's fit went 6.4 → 8.5.

**Content over taxonomy.** *Life drawing session* (typed `meetup_hobby`, for a user whose profile is entirely about drawing) went **6.3 → 8.1**. It still loses to the museum (8.9), but now on solo calibration — difficulty 3 against a never-gone-alone window of 1–2 — which is a defensible reason rather than a filing accident.

**Diversity restored.**

```
iter 7:  language → meetup → language → language   2 kinds, weeks 3+4 identical
iter 8:  language → meetup → dance    → language   3 kinds, 4 distinct quests
         difficulty 3 → 3 → 4 → 4
```

**One score went down, on purpose.** Elena's fit dropped 9.5 → 8.9 because her edge fell 9 → 6. Iter 7 read *"look at art slowly"* — something she said she **wants** — as a named discomfort. What someone is drawn to is not what they fear. The quest is unchanged and the reasoning is now honest, which is the same kind of correctness win as iter 4's Bologna decrease.

## New findings

### A. `[DESIGN]` In a thin town the fallback *is* the product — and it has five templates

The stress test (`THIN_WEEK_V8`, 3 candidates, Fabriano-shaped) was built to check whether a hard bail filter survives a pool that can't absorb it. It does — no relaxation fired for anyone. But it exposed something more important:

```
sofia     3/3 survived   → [FALLBACK] Order, then keep talking          fit 9.3
marco     3/3 survived   → [FALLBACK] Solo aperitivo mission            fit 6.4
elena     1/3 survived   → Museo della Carta e della Filigrana          fit 8.9
tommaso   3/3 survived   → [FALLBACK] Drop-in session, no course        fit 8.5
giulia    3/3 survived   → [FALLBACK] Solo aperitivo mission            fit 6.4
andrea    3/3 survived   → [FALLBACK] Solo aperitivo mission            fit 6.4
```

**Four of six get a self-directed mission, and three of those get the identical default one.** Sofia and Tommaso do well (9.3 and 8.5) because a template happens to match their words. Marco wants to dance; there is no dance mission, so he gets the same generic aperitivo as the two users who typed nothing.

Iteration 7 concluded that "the fallback must be profile-aware." That was right and insufficient. Since most Italian towns are Fabriano-sized, **the mission template library is the personalization ceiling for most of the country**, and it currently holds five entries. Expanding it is worth more than any further scoring work.

Note also that Sofia's *mission* (9.3) nearly beats her best Milan *event* (9.7). Missions get pull 8 by construction plus validity 9.1 for being free and always-available. That margin is thin enough that a slightly worse event week would hand a rich-inventory city a self-directed mission — worth watching.

### B. `[DESIGN]` The escalation fires silently, and picked her stated fear

Week 3 of the sequence assigns Sofia the beginners salsa social — the exact category her deal-breaker excluded in weeks 1 and 2 — because `attended` hit 2 and the collision was reclassified as a sanctioned escalation.

The mechanism is working as designed. Two things about it are not:

- **It is unannounced.** A deliberate escalation that arrives looking like any other assignment is indistinguishable, from the user's side, from not having been listened to. It needs framing: *"this one's a stretch — you said groups put you off."*
- **The threshold is a blunt count.** Two attended quests unlocks *every* deal-breaker at once, permanently, regardless of which one or how emphatically it was stated.

### C. `[DESIGN]` The thin-input flag is raised and nothing consumes it

`needsMoreInput` and a concrete follow-up question are now produced for Giulia and Andrea, but the harness assigns anyway and Giulia's outcome is byte-identical to iter 7 (default mission, fit 6.4). The fix is a flow change — ask, then assign — and it can't be demonstrated inside a batch harness. Carried to the intake work, not closed here.

### D. `[DESIGN]` A common-word deal-breaker removes most of the pool

Elena's *"big loud crowds at night"* excludes **7 of 12** Milan candidates, and 2 of 3 in the thin pool. Every exclusion is arguably correct — they are all crowds or after 20:00 — but the outcome is that one sentence at intake can silently remove most of what a city has to offer, including things like an open-air park cinema that few people would file under "big loud crowd". Now that bail is a filter rather than a penalty, its precision matters far more than it did in iter 7.

## Still open, unchanged

Findings 6 and 7 from iter 7 were tagged `[LEXICAL]`; 7 is now largely fixed by content matching, but the underlying limitation stands. Matching here is keyword-based because the harness runs offline with no key and no spend. The production matcher is one model call, and until that swap happens, every pull score is a proxy for a proxy.

## Next

1. **Expand the mission template library** — highest leverage, because in most of Italy it *is* the product. (finding A)
2. **Frame escalations explicitly** in the assignment payload, and make the threshold per-condition rather than a global count. (finding B)
3. **Wire `needsMoreInput` into the intake flow.** (finding C)
4. **Swap the lexical matcher for a model call.**
5. **Soften bail-flag derivation** so a category label alone (`concert` ⇒ crowd) isn't sufficient evidence. (finding D)
