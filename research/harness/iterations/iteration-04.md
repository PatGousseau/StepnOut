# Iteration 04 — Cross-source dedup + freshness (Ferragosto) guard

**Date:** 2026-08-09 · **Config:** v4 · **Change from v3:** stop trusting recurrence blindly; stop double-counting the same event.

Iter 3 hit 9.1 but two correctness bugs were hiding under the number: the same community appears on several sites (inflating the pool), and a "recurring, next Wednesday" slot was *assumed* to run when Wed 12 Aug is the eve of Ferragosto — exactly when Italian social groups pause.

## Config used
- `dedupe()` — normalized-title + city + date/recurrence key; keep the highest-verifiability copy (report §5.2).
- `verifyOccurrence()` — freshness check on `recurring_scheduled` events; if the next slot can't be confirmed, downgrade `recurring_scheduled → recurring_unresolved` (verifiability 9 → 6).

## Real data
Bologna BlaBla is listed on **blablacommunity.com, Meetup, and Facebook** simultaneously ([search](https://www.blablacommunity.com/events/bologna-blabla-language-exchange-1)). Its real slot is **Wed 20:30**; the next one (12 Aug) is pre-Ferragosto and unconfirmed.

## Actual run output (`node dist/run.js`)
```
raw pool: 4 candidates (BlaBla listed on 3 sites + UniTandem)
after dedupe: 2 canonical  ->  bo-blabla, bo-unitandem
freshness: BlaBla Aug-12 slot unverified (pre-Ferragosto) -> confidence downgraded
honest best assignment: "Bologna BlaBla Language Exchange"  score 8.8  (recurring_unresolved)
```

## What improved
- **`F-dup` closed:** 4 raw candidates → 2 canonical. The three BlaBla listings collapse to one; the pool no longer looks artificially deep.
- **Freshness guard works:** Bologna's honest score moves **9.4 → 8.8**. That's a *decrease*, and it's the right outcome — the app was about to assign a user to a language-exchange night that may not run during Ferragosto. **Correctness beats an optimistic number.** In production the guard prefers a *verified* alternative or the fallback over a high-but-unconfirmed listing.

## Design note
This is the iteration where the harness stops gaming its own metric. A judge you can fool by listing the same event three times or asserting unverified recurrence isn't world-class. The score is now *honest*, which is the precondition for using it as a live production quality signal.

## Remaining
- Persona/difficulty matching still absent — every user in a city gets the same top assignment. → iter 5.
- Safety pass for self-directed missions (time of day, 18+ venues). → iter 5.
