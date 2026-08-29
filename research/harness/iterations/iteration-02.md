# Iteration 02 — Category-targeted queries + radius-by-population

**Date:** 2026-08-09 · **Config:** v2 · **Change from v1:** stopped hoping stretch turns up; went looking for it.

## Config used
- Per-category comfort-zone queries (language exchange, dance, meetup, sagra) instead of one generic query.
- Radius by population: Milan 6 km, Bologna 15 km, Fabriano 40 km.
- Added recurring-community sources: `blablacommunity.com`, `tandem.net`, `meetup.com`, `ostellobello.com`.

## Raw output (real search results)

**Milan** — category "language_social" hit immediately:
- **Tandem Exchange @ Ostello Bello** — free, recurring language-exchange social night — [milanotoday](https://www.milanotoday.it/eventi/tandem-exchange-ostello-bello.html)
- **Milano BlaBla Language Exchange** (Meetup group, recurring) — [meetup](https://www.meetup.com/milano-bla-bla-language-exchange/)
- **Milano Language and Social Exchange** — [meetup](https://www.meetup.com/it-it/milano-language-and-social-exchange/)

**Bologna** — same category, strong hits:
- **BlaBla Bologna Language Exchange** — recurring social — [blabla](https://www.blablacommunity.com/events/bologna-blabla-language-exchange-1)
- **UniTandem Bologna** — "fun, informal, easy going" — [facebook/UniTandemBologna](https://www.facebook.com/UniTandemBologna/)
- **IWF Language XChange** — evening aperitivo language meetups — [iwfbologna](https://iwfbologna.com/interest-groups/language-xchange/)

**Fabriano** — no language/dance/meetup communities exist in a 29k town; radius 40 km + sagra source:
- **Sagra della Lumaca**, Cancelli di Fabriano (frazione) — community festival — [eventiesagre](https://www.eventiesagre.it/cerca/cat/sez/mesi/Marche/AN/Fabriano/rilib)

## Judge scores

| City | Best candidate | Stretch | Solo | Verif. | Cost | Floor | **Agg** | Tags |
|---|---|---|---|---|---|---|---|---|
| Milan | Tandem @ Ostello Bello | 9 | 10 | 6 | 10 | 10 | **8.8**→**7.8** | `F-undated` (recurring, next date not resolved) |
| Bologna | BlaBla Language Exchange | 9 | 9 | 6 | 9 | 10 | **8.3**→**7.5** | `F-undated` |
| Fabriano | Sagra della Lumaca | 5 | 6 | 5 | 9 | 10 | **6.2** | `F-nostretch-smalltown` |

**Aggregate: ~7.2/10.** Big jump.

## What improved (verified real)
- **`F-passive` fixed.** The category-targeted query for Milan surfaced a free language-exchange night — a genuine social-courage stretch (stretch 4→9) — where the generic query only found a jazz concert. This is a *real, reproducible* difference in the search results, not a modeling artifact.
- **`F-empty` fixed.** Fabriano now returns something (radius + sagra source) instead of nothing. Floor restored.

## Remaining failure modes
1. **`F-undated` (Milan, Bologna):** BlaBla/Tandem/Meetup are *recurring communities* — the pipeline links the group but doesn't resolve **the next specific occurrence** (date/time). A user needs "Thursday 20:30 at Ostello Bello," not "there's a group." Verifiability capped at 6.
2. **`F-nostretch-smalltown` (Fabriano):** a snail sagra is novel/communal but low social-courage, and depends on that weekend's luck. Small towns will still have weeks with no organized comfort-zone event at all. Need a floor that provides *stretch*, not just *something*.

## Fix → v3
- **Resolve recurrence:** for community sources, fetch the next scheduled occurrence (date/time/venue) and attach a confirm-link; set confidence `recurring_scheduled`.
- **Self-directed POI-anchored fallback:** when no organized stretch event exists (Fabriano), assign a *social mission* anchored to a real POI (e.g. solo aperitivo at a busy central bar + one conversation). This provides comfort-zone stretch anywhere, with zero event-feed dependency.
- Add the **difficulty ladder (1–5)** and **verifiability confidence** to every candidate.
