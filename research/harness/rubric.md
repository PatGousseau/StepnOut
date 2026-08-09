# Comfort-Zone Judge Rubric (v2 — corrected)

> **v2 objective correction (user feedback).** v1 was misguided: it scored *harder = better* (comfort-zone stretch at 40% of the score). That's wrong. **All genuine comfort-zone activities are equally good** — a solo concert is not worse than a language exchange. Difficulty is useful *information*, not a quality signal. And the app should deliver **diversity** of experiences over time, not converge on the "hardest" category. This rubric reflects that.

## What "good" means now

A good weekly assignment is:
1. a **genuine comfort-zone outing** (gate — see below),
2. **verifiable & actionable** (real, dated/scheduled, a venue, a link),
3. **affordable** (free or low-cost),
4. **clearly attendable** (solo *or* bring-a-friend — both valid),

…and across weeks the assignments are **diverse in kind**. Difficulty is shown as a label but never scores.

## Gate (eligibility — pass/fail, not graded)

A candidate must be a **real step-out activity** (novel experience, social, or participatory) *and* pass a light **safety** check. A mundane errand ("buy groceries") fails the gate → ineligible. Among activities that pass, **type does not rank** — a market, a concert, a class, and a language exchange are peers.

## Scored dimensions (only for eligible candidates)

| Dimension | Weight | Meaning |
|---|---|---|
| **Verifiability & actionability** | **45%** | Real and attendable: specific date/time **or** a resolved recurring schedule, named venue+address, source URL to confirm. `confirmed_dated` 10 · `recurring_scheduled` 9 · `self_directed` 8 · `recurring_unresolved` 6 · `listed w/ url` 5 · none 2 |
| **Cost fit** | **30%** | Free = 10 · ≤ €15 = 7 · €15–30 = 4 · > €30 = 1 |
| **Attendability** | **25%** | Clearly doable in a realistic social setup. Solo-designed / "either" = 10 · **bring-a-friend (a valid challenge) = 9** · needs-a-group-you-don't-have with no framing = 5 |

`score = 0.45·verifiability + 0.30·cost + 0.25·attendability`

Note the scores now **compress into a tight high band** for anything real-free-and-attendable — *by design*. Among good options the differentiator is not the score, it's **diversity** (below). The score's job is to reject the unverifiable and the expensive, not to crown the "hardest."

## Diversity (portfolio-level, across time — the real selector)

The assignment engine tracks the user's **recent kinds** and prefers a candidate whose `kind` they haven't done lately. Over a month a user should see a mix — e.g. a concert, a language exchange, a hike, a market, a class — not four language exchanges. This is enforced at selection (`selectDiverse`), not in the per-item score.

## Difficulty ladder (metadata label — never scored)

Still surfaced, because *knowing* which are harder is useful (user can pick; app can ease newcomers in or nudge progression). It just doesn't affect quality.

1 public, anonymous, novel (market, viewpoint) · 2 longer solo dwell (museum, exhibition) · 3 among people, structured (class, communal-table sagra) · 4 designed for stranger interaction (language exchange, beginners' social dance) · 5 high visibility (open-mic, karaoke).

## Availability floor (hard rule)

Empty output for a covered city is a product failure → the self-directed POI fallback fires so the user always has an assignable, actionable quest. (The fallback fires whenever nothing *actionable* exists — not when nothing "hard enough" exists.)

## Failure-mode tags (fed back to the loop)

`F-empty` no assignable output · `F-undated` no date/schedule · `F-unverifiable` no venue/source · `F-toobig` over cost ceiling · `F-dup` same event repeated · `F-monotony` **same kind assigned repeatedly to one user** (new in v2).

## Explicit anti-goals

- **Do NOT reward difficulty.** Hard ≠ good.
- **Do NOT converge on one category.** Monotony is a failure even if each item scores well.
- Do not reward volume, big-city bias, or listings asserted as fact without a confirm-link.
