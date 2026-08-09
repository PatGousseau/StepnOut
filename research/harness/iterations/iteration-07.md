# Iteration 07 — Fit: selecting FOR A USER, not in the abstract

**Date:** 2026-08-09 · **New files:** `profile.ts` · **Trigger:** the "personalized" claim was untested — iters 1–6 judged whether a quest was *real*, never whether it was *right for this person*.

## What was added

| Piece | Role |
|---|---|
| `UserProfile` | Mirrors the intake flow: `meaningToDo`, `bailCondition` (**raw text, never tag-collapsed**), `soloHistory`, city/neighbourhood, optional `followUp` (the flow skips it when it doesn't return in time), optional `history` with `attended`. |
| `scoreFit(profile, quest)` | The new judge. Five parts: **pull · edge · bailSafety · soloCalibration · novelty**. Returns a `why[]` trace — that's what you read, not the number. |
| `selectForUser(pool, profile)` | Validity is a **gate** (`scoreQuest ≥ 6`), fit is the **ranking**. The two numbers are never merged. |
| `difficultyWindow(profile)` | Base rung from `soloHistory` (never 1–2 · once_or_twice 2–3 · regularly 3–4), +1 every **2 attended** quests. |
| `buildPersonalMission(profile)` | Replaces iter 3's single fixed aperitivo mission with keyword-triggered templates, clamped to the user's window. |
| `MILAN_WEEK_V7`, `PROFILES` | One city, one week, 12 candidates, 6 people — deliberately **no physical/sport option** so the fallback is forced. |

**Weights (unvalidated, stated so they can be argued with):** `pull .35 · edge .20 · solo .20 · bail .15 · novelty .10`.

## ⚠️ Fidelity caveat — the matcher here is not the matcher in production

The brief says match on the user's actual wording. In production that is **one model call**: read the profile text and the candidate, judge pull/edge/bail. This harness runs offline (no key, no spend), so matching is **lexical** — a keyword lexicon plus token overlap.

Every failure below is tagged **[LEXICAL]** (the stand-in missed it; a model wouldn't) or **[DESIGN]** (the scoring structure is wrong, and swapping in a model won't fix it). Only the `[DESIGN]` ones are real findings about the product.

## The test: 6 people, same city, same week

```
SOFIA    "speak Italian with real people instead of just an app"   → Aperitivo linguistico      fit 9.7
MARCO    "start dancing again, haven't danced since university"    → Beginners salsa social     fit 8.5
ELENA    "start drawing again, sketchbook untouched for a year"    → Museo del Novecento        fit 9.5
TOMMASO  "get back into bouldering, haven't climbed since 2019"    → [FALLBACK] Drop-in session fit 6.4
GIULIA   "idk, get out more"                          (thin data)  → [FALLBACK] Solo aperitivo  fit 6.4
ANDREA   "meet more people i guess"                   (thin data)  → Board-game social night    fit 8.1

=> 6 distinct quests, 5 distinct kinds, across 6 people in ONE city-week.
```

**Control — what iter 6 would have done with the same pool:** everyone gets *"Free jazz concert @ Giardino delle Culture"* (validity 10/10). Its per-person fit: sofia 6 · marco 4.8 · elena 4.9 · tommaso 6 · giulia 6.4 · andrea 4.8. Validity genuinely cannot tell these people apart — the separation is real, not cosmetic.

**Verdict on the pass condition: the top three (Sofia, Elena, Andrea) are obviously right. Marco's is wrong. The two thin-data users are not personalized at all.** Details below.

## Failures, in order of how much they matter

### 1. `[DESIGN]` Marco got the quest that violates his only stated constraint — on a coin flip

He said *"anything that costs more than a pizza."* The pool has a **free** swing taster and a **€10** salsa social. He got the salsa.

```
Beginners salsa social   pull 10 · bail  5   → 8.5   ← selected
Swing taster (free)      pull  8 · bail 10   → 8.5   ← identical score, lost on sort order
```

The bail collision is detected correctly and traced (`bail: collides with "cost" — not earned yet`) and then costs him **0.75 points**, which the salsa recovers via +2 pull from the word "social". Two quests tie exactly, and the tiebreak is array order.

This is the most important finding in the iteration. A user's one stated deal-breaker should not be a 15%-weighted nudge that a synonym can cancel out — it should be closer to a filter with an explicit escalation override. **The escalation machinery exists** (`sanctionedEscalation` fires only at ≥2 attended and `soloHistory !== 'never'`, so a first quest can never collide) — it's the *unsanctioned* case that's too soft. Not fixed here: fixing it before writing this up is exactly the "tune until the output looks good" failure mode.

### 2. `[DESIGN]` The diversity guarantee from iter 6 does not survive contact with fit

Four weeks, Sofia, attending every time:

```
week 1  window 2-3  → language_social  Aperitivo linguistico        diff 3 · fit 9.7
week 2  window 2-3  → meetup_hobby     Board-game social night      diff 3 · fit 9.1
week 3  window 3-4  → language_social  Tandem @ Ostello Bello       diff 4 · fit 9.0
week 4  window 3-4  → language_social  Tandem @ Ostello Bello       diff 4 · fit 8.7   ← same quest, twice
```

Difficulty escalation works (3 → 3 → 4 → 4, tracking the window). Diversity does not: **2 distinct kinds over 4 weeks, and weeks 3–4 are the identical quest.**

Novelty is 10% of fit. A same-kind repeat costs 0.7; doing the *literally identical quest you did last week* costs 1.0. Against a 9-point pull that is nothing. `selectDiverse()` from iter 6 was a hard rotation over recent kinds; folding that guarantee into a weighted term silently deleted it. **Iter 6's `F-monotony` is back, at the individual level, and the iter-6 test still passes because it exercises the old path.** Novelty needs to be a constraint (exclude recent kinds unless the pool is exhausted), not a term.

### 3. `[DESIGN]` Thin-data users are not personalized, and one word decides which kind of not-personalized

Giulia (*"idk, get out more"*, no bail, no follow-up) has nothing that maps to anything: pull 2 everywhere, and **every runner-up ties at 6.4** — the fit signal is completely flat. She only avoids "whatever is cheapest and best-scheduled" because of the `PULL_FLOOR` rule (pull ≤ 2 → route to a made-for-them mission), and the mission she gets is the *default* one, i.e. still generic.

Andrea (*"meet more people i guess"*, 7 words) gets a confident, specific match at fit 8.1 — entirely because "people" happens to sit in the `meetup_hobby` lexicon.

So among two users who gave equally little, one gets a generic mission and one gets a specific event, decided by a single word. That's not robustness, it's luck. **Product implication: the intake flow needs to detect thin input and push back for one more sentence, because the matcher has nothing to work with otherwise.** `dataDepth()` already computes this (`thin` under 12 words) — it should gate the flow, not just annotate the log.

### 4. `[DESIGN]` The fallback flags itself as a bail collision

Tommaso's fallback mission is titled *"Drop-in session, no course"* — written specifically to respect his *"signing up for a whole course"* bail condition. `questBailFlags` regexes for `/corso|course/` and flags it as a commitment, so the mission built to avoid his deal-breaker is scored as colliding with it (bail 5, dropping fit to 6.4).

Absurd, and it's the generic shape of the problem: **bail flags are derived from the candidate's text, so a candidate that mentions a constraint in order to negate it reads as violating it.** A model-based matcher would not make this error, but the derived-flag approach is `[DESIGN]`, not `[LEXICAL]` — anything that pattern-matches text for prohibitions has this failure mode.

The fallback itself worked as intended otherwise: it fired (no physical option in the pool), matched on `"climb"`, and produced a mission specific to bouldering rather than the generic aperitivo — `eligible_reason: self-directed, matched to "climb"`. That was the thing this iteration most needed to verify, and it holds.

### 5. `[LEXICAL]` Elena's "edge" rationale is nonsense

Trace: `edge: their named discomfort ("slow") is exactly what this asks`. "Slow" came from her follow-up *"look at art slowly and not be rushed"* — a **preference**, read as a **discomfort**. Her edge score of 9 is unearned; the quest is still right for her, but for the wrong reason. Pure keyword-matching artifact; disappears with a model.

### 6. `[LEXICAL]` The best answer for Elena is ranked 2nd-equal for the wrong reason

*"Life drawing session, all levels"* is arguably the strongest quest in the pool for someone whose sketchbook has gone untouched for a year. It scores 6.3 against the museum's 9.5, because it is typed `meetup_hobby` and her words map to `exhibition` — so it only picks up token overlap ("drawing"), not a kind hit. Kind-keyed lexicons make quest **taxonomy** decide the match instead of quest **content**.

### 7. `[DESIGN]` Ties everywhere

Six ties in one run (salsa/swing at 8.5, board-games/life-drawing at 9.1 for Sofia and 8.1 for Andrea, three-way at 6.4 for both Tommaso and Giulia). Fit is coarse: 5 integer sub-scores on fixed weights lands on a small set of values. Every tie is currently broken by array order, which means **fixture ordering silently determines real assignments**. Needs an explicit, defensible tiebreak.

## What actually works

- **Separation of concerns holds.** Validity as a gate and fit as the ranking behaves as intended. The control run proves validity alone cannot discriminate between these six people.
- **Solo calibration is the most reliable signal.** Elena (never) gets diff 2, Marco (regularly) diff 4, and nobody is handed a rung they haven't reached. It's the one dimension driven by a closed-vocabulary answer rather than free text — which is exactly why it's the sturdy one.
- **Escalation via attendance works** and is correctly gated on `attended`, not on assignment.
- **The profile-aware fallback works** and is a clear improvement on iter 3's single fixed mission.
- **The `PULL_FLOOR` rule is load-bearing.** Aggregate fit is generous enough (~6.4) that a free, well-scheduled, correctly-pitched event clears any reasonable aggregate floor with *zero* connection to the user. Without the zero-pull rule everyone quietly converges back on iter-6 behaviour.

## Honest read

Personalization is **real but shallow**. It separates people who said something specific (Sofia, Elena, Marco, Tommaso) and does essentially nothing for people who didn't (Giulia, Andrea). Of the four "good" outcomes, one (Marco) is wrong on his only constraint and two are right partly by accident. The 6-distinct-quests headline is true and also the least informative number in this document.

Do **not** read a rising mean fit across future iterations as progress — mean fit rises when the matcher gets more confident, not when the quests get better. The only signals worth trusting are the side-by-side read and, eventually, attendance.

## Next (in priority order)

1. **Bail as a near-filter with explicit escalation**, not a 15% term. (finding 1)
2. **Restore hard diversity** — exclude recent kinds at selection, as iter 6 did, instead of a 10% novelty term. (finding 2)
3. **Gate thin intake** — `dataDepth() === 'thin'` should trigger one more question before assignment. (finding 3)
4. **Swap the lexical matcher for a model call** — kills findings 5 and 6, and lets pull work on meaning ("I want to feel less invisible" → open-mic) rather than shared vocabulary.
5. **Explicit tiebreak** so fixture order stops deciding assignments. (finding 7)
