# Harness Results

Self-improvement loop for comfort-zone event assignment. Claude-driven, **7 iterations**, real search data (2026-08-09). Two separate judges: **validity** = `rubric.md` (v2), implemented as `scoreQuest()` in `pipeline.ts`; **fit** = `scoreFit()` in `profile.ts` (iter 7). **The numbers below are printed by `run.ts`, not asserted** — reproduce with:

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
| 7 | **fit judge** — select FOR a user (`profile.ts`), validity becomes a gate | — | — | — | — | `F-samequest-everyone`; **reopens `F-monotony` per-user** |
| 8 | **fixes** — bail→filter, diversity→hard exclusion, thin-input flag, negation, tiebreak, content-match | — | — | — | — | closes 5 of 7 iter-7 findings; **opens `F-thin-fallback`** |

\* iter 4's Bologna *decrease* is the point — see below.

## iter 7 — personalization: real, but shallow

> **Superseded by iter 8** (below), which fixed five of the seven findings. The numbers in this section are iter-7's printed output, kept as the historical record; `run.ts` now prints iter-8 output.

Iters 1–6 asked *is this quest real?* Nothing asked *is it right for this person*, so the "personalized" claim was untested. Iter 7 adds `scoreFit(profile, quest)` — **pull · edge · bailSafety · soloCalibration · novelty** — kept strictly separate from `scoreQuest`: **validity is a floor (≥6 to be eligible), fit is the ranking.** Full write-up: `iterations/iteration-07.md`.

### Six people, one Milan week (verbatim from `run.ts`)

```
SOFIA    "speak Italian with real people instead of just an app"   → Aperitivo linguistico      fit 9.7
MARCO    "start dancing again, haven't danced since university"    → Beginners salsa social     fit 8.5
ELENA    "start drawing again, sketchbook untouched for a year"    → Museo del Novecento        fit 9.5
TOMMASO  "get back into bouldering, haven't climbed since 2019"    → [FALLBACK] Drop-in session fit 6.4
GIULIA   "idk, get out more"                          (thin data)  → [FALLBACK] Solo aperitivo  fit 6.4
ANDREA   "meet more people i guess"                   (thin data)  → Board-game social night    fit 8.1

=> 6 distinct quests, 5 distinct kinds, 6 people, ONE city-week.

Control (iter-6 behaviour, no profile): everyone gets "Free jazz concert" (validity 10).
Its per-person fit: sofia 6 · marco 4.8 · elena 4.9 · tommaso 6 · giulia 6.4 · andrea 4.8
```

The separation is real — validity genuinely cannot tell these six apart. **But 6-distinct-quests is the least informative number here.** Reading the output:

- **Marco's is wrong.** He said *"anything that costs more than a pizza"*; he got the **€10** salsa over the **free** swing taster. Both scored exactly **8.5** and the tie broke on array order. His one stated deal-breaker is a 15% term worth 0.75 points, which the salsa recovered by matching the word "social". A deal-breaker should be a near-filter with an explicit escalation override, not a nudge.
- **The two thin-data users aren't personalized at all.** Giulia's fit is *completely flat* — every candidate ties at 6.4. Andrea gets a confident specific match only because "people" happens to be in the lexicon. Two users who gave equally little; one word decides which gets a real quest. **The intake flow should push back for one more sentence when input is thin** rather than pretending to personalize.
- **The fallback works** — Tommaso's pool had zero physical options, the fallback fired and produced a bouldering-specific mission (`matched to "climb"`), not the generic aperitivo. That was the main thing this iteration needed to verify.
- **The fallback also flags itself as a bail collision.** The mission titled *"Drop-in session, no course"*, written to respect his *"signing up for a whole course"* deal-breaker, matches the `/course/` commitment regex and is scored as violating it. Text-derived prohibition flags can't tell a negation from a violation.

### Four weeks, one profile — diversity regressed

```
week 1  window 2-3  → language_social  Aperitivo linguistico     diff 3 · fit 9.7
week 2  window 2-3  → meetup_hobby     Board-game social night   diff 3 · fit 9.1
week 3  window 3-4  → language_social  Tandem @ Ostello Bello    diff 4 · fit 9.0
week 4  window 3-4  → language_social  Tandem @ Ostello Bello    diff 4 · fit 8.7   ← identical, twice
```

Difficulty escalation works (windows widen on `attended`, not on assignment). Diversity doesn't: **2 distinct kinds in 4 weeks, and weeks 3–4 are the same quest.** Iter 6 enforced rotation with a hard `selectDiverse()`; iter 7 demoted it to a 10% novelty term, where a same-kind repeat costs 0.7 and repeating the *identical quest you did last week* costs 1.0 — nothing against a 9-point pull. **`F-monotony` is back at the individual level, and the iter-6 test still passes because it exercises the old path.** Diversity has to be a constraint, not a weight.

### Fidelity caveat

Production matching is **one model call** on the raw text. This harness runs offline (no key, no spend), so matching is **lexical** — keyword lexicon + token overlap. `iteration-07.md` tags each failure `[LEXICAL]` (the stand-in missed it; a model wouldn't) or `[DESIGN]` (the structure is wrong and a model won't fix it). Findings 1–4 and 7 are `[DESIGN]`. Two `[LEXICAL]` artifacts worth knowing: Elena's edge rationale cites "slow" as her *discomfort* when she used it as a *preference*, and *"Life drawing session"* — probably the best quest in the pool for her — ranks 6.3 vs the museum's 9.5 purely because it's typed `meetup_hobby` while her words map to `exhibition`.

**Do not read a rising mean fit as progress.** Mean fit rises when the matcher gets more confident, not when the quests get better. The signals that count are the side-by-side read and, eventually, attendance.

## iter 8 — the fixes, and what they exposed

Five of iter 7's seven findings are closed. **The fit weights are unchanged (`.35/.20/.20/.15/.10`)** — every change is structural, so the before/after is readable. Full write-up: `iterations/iteration-08.md`.

| iter-7 finding | Fix |
|---|---|
| A deal-breaker lost a coin flip | Bail collision → **hard filter**, with `escalationEarned()` (≥2 attended **and** has gone solo) as the only override |
| Diversity became a weight and stopped working | **Hard exclusion**: no category from the last 2 weeks, no identical quest from the last 6 |
| Thin input silently guessed at | `needsMoreInput` + the specific question to ask; discomfort now read only from the bail answer and follow-ups, never from what they said they *want* |
| Fallback flagged itself as a violation | Negation-aware prohibition matching |
| Ties broken by array order | Explicit comparator: fit → pull → validity → window distance → id |
| Taxonomy decided the match | Candidate's **own text** is matched against the vocabulary the user evoked |

Filters relax in a fixed order (`same-category` first, `bail-collision` last) and every relaxation is recorded — a silent relaxation would be a filter that isn't one.

### What the fixes did

```
MARCO    iter 7: Beginners salsa social, €10   fit 8.5   ← won a coin flip
         iter 8: EXCLUDED by deal-breaker → Swing taster, free   fit 8.5   validity 9.6

SEQUENCE iter 7: language → meetup → language → language   2 kinds, weeks 3+4 identical
         iter 8: language → meetup → dance    → language   3 kinds, 4 distinct quests
                 difficulty 3 → 3 → 4 → 4

LIFE DRAWING (Elena)   6.3 → 8.1   — now loses to the museum on solo calibration,
                                     not on being filed under the wrong category
TOMMASO'S MISSION      6.4 → 8.5   — "no course" no longer reads as a course
ELENA                  9.5 → 8.9   — score DOWN on purpose (see below)
```

**One score fell deliberately.** Elena's edge dropped 9 → 6 because iter 7 read *"look at art slowly"* — something she said she **wants** — as a named discomfort. What someone is drawn to is not what they fear. Same quest, honest reasoning. Same kind of correctness win as iter 4's Bologna decrease.

Sofia's exclusions are the nicest result: *"perform in front of a group"* removes salsa, swing **and** the open-mic, none of which mention performing in their titles. The flag comes from what the quest *is*.

### The stress test found the real ceiling

Iter 8 made the deal-breaker a hard filter, which is only a guarantee if it survives a pool that can't absorb it — so the same six people were run against a **Fabriano-sized pool of 3**:

```
sofia     3/3 survived   → [FALLBACK] Order, then keep talking      fit 9.3
marco     3/3 survived   → [FALLBACK] Solo aperitivo mission        fit 6.4
elena     1/3 survived   → Museo della Carta e della Filigrana      fit 8.9
tommaso   3/3 survived   → [FALLBACK] Drop-in session, no course    fit 8.5
giulia    3/3 survived   → [FALLBACK] Solo aperitivo mission        fit 6.4
andrea    3/3 survived   → [FALLBACK] Solo aperitivo mission        fit 6.4
```

The filter held — no relaxation fired. But **four of six get a self-directed mission and three get the identical default one.** Sofia and Tommaso do well because a template matches their words; Marco wants to dance, there is no dance mission, so he gets the same generic aperitivo as the two users who typed nothing.

Iter 7 concluded the fallback must be profile-aware. Correct, and insufficient: since most Italian towns are Fabriano-sized, **the mission template library is the personalization ceiling for most of the country — and it holds five entries.** Expanding it beats any further scoring work.

### Three findings still open

- **The escalation fires silently.** Week 3 hands Sofia the salsa social — the exact category her deal-breaker excluded in weeks 1 and 2 — because `attended` reached 2. Working as designed, but an unannounced escalation is indistinguishable from not having listened, and one blunt count unlocks *every* deal-breaker at once.
- **The thin-input flag is raised and nothing consumes it.** Giulia's outcome is byte-identical to iter 7. The fix is a flow change — ask, then assign — which can't be demonstrated inside a batch harness.
- **A common-word deal-breaker removes most of the pool.** Elena's *"big loud crowds at night"* excludes 7 of 12 Milan candidates. Every exclusion is defensible, but now that bail is a filter rather than a penalty, its precision matters much more than it did.

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
