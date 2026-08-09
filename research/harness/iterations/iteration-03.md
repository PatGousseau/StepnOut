# Iteration 03 — Recurrence resolution + self-directed POI fallback + difficulty grading

**Date:** 2026-08-09 · **Config:** v3 · **Change from v2:** make recurring events actionable, and give small towns a *stretch* floor instead of a *novelty* floor.

## Config used
- Recurrence resolution for community sources (attach next occurrence + confirm-link, confidence `recurring_scheduled`).
- Self-directed POI-anchored fallback when no candidate reaches stretch ≥ 7.
- Difficulty ladder (1–5) + verifiability confidence on every candidate.

## Raw output

**Milan** — Tandem @ Ostello Bello, resolved to its recurring weekly slot, confirm-link to the venue page. Difficulty **4** (designed for stranger interaction). Confidence `recurring_scheduled`. Backups (≥7): Milano BlaBla (diff 4), Milano Language & Social Exchange (diff 4).

**Bologna** — BlaBla Bologna Language Exchange, resolved to its **real recurring slot: every Wednesday 20:30, Scuderie / Piazza Verdi** ([blablacommunity](https://www.blablacommunity.com/events/bologna-blabla-language-exchange-1), [facebook](https://www.facebook.com/BlaBlaItaly/)) → next occurrence Wed 12 Aug. Difficulty **4**. Backups: UniTandem (diff 4), IWF aperitivo XChange (diff 4). *(Assumes the Aug-12 slot actually runs — iter 4 scrutinizes this, since it's the eve of Ferragosto.)*

**Fabriano** — no organized stretch event → **fallback fired.** Self-directed mission anchored to a real central POI:
> **"Solo aperitivo mission"** — Go alone to a busy café/bar in Piazza del Comune around 18:30, sit *at the bar* not a table, order the local way, and start one conversation with the bartender or a neighbour. Stay 45 minutes.
>
> Difficulty **4**. Always available. Anchored to a verifiable POI (OSM `amenity=bar/cafe` in the historic centre). Optional novelty add-on: pair with the Museo della Carta (Fabriano invented watermarked paper).

## Judge scores

*(Scores below are computed by `scoreQuest()` in `pipeline.ts` — run `node dist/run.js` to reproduce.)*

| City | Best assignment | Stretch | Solo | Verif. | Cost | Floor | **Agg** | Confidence |
|---|---|---|---|---|---|---|---|---|
| Milan | Tandem @ Ostello Bello (diff 4) | 9 | 10 | 9 | 10 | 10 | **9.4** | recurring_scheduled |
| Bologna | BlaBla Language Exchange (diff 4) | 9 | 10 | 9 | 9 | 10 | **9.4** | recurring_scheduled |
| Fabriano | Solo aperitivo mission (diff 4) | 8 | 10 | 8 | 7 | 10 | **8.5** | self_directed |

**Aggregate: 9.1/10** (mean best-per-city). Depth: Milan 3 backups ≥7, Bologna 3, Fabriano 2 (mission variants + museum).

## What improved
- **`F-undated` fixed:** recurrence resolution turned "there's a group" into "Thu 20:30, Ostello Bello, [confirm]." Verifiability 6→9.
- **`F-nostretch-smalltown` fixed — the key insight of the whole loop:** the comfort-zone fallback is **not** "visit a landmark" (that's novelty, stretch ~2). It's a **self-directed social mission anchored to a real place** (stretch ~8), which works in *any* town with zero event inventory. Fabriano went from 6.2 (a snail sagra) to 8.4 (a genuine, always-available stretch).

## Remaining (future iterations)
- **`F-dup`:** no cross-source dedup yet (BlaBla appears on both blablacommunity + Meetup). Add geohash+title dedup (§5.2 of the report).
- **Freshness:** recurring communities occasionally pause (August/Ferragosto) — verify the next occurrence actually exists before assigning; don't trust the recurrence blindly.
- **Persona fit:** difficulty is graded but not yet matched to a user's boldness/history. Next: pick the assignment's difficulty from the user's recent completion pattern.
- **Safety:** self-directed missions need a light safety/appropriateness pass (time of day, neighbourhood, 18+ venues).

## Verdict
Loop converged on a robust pattern: **category-targeted search → recurring-community resolution → self-directed POI mission as the stretch floor.** Works across all three city sizes. Diminishing returns on further sourcing tweaks; the next real gains are in **dedup, freshness, and persona matching**, not discovery.
