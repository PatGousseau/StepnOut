# Iteration 01 — Baseline (naive)

**Date:** 2026-08-09 · **Config:** v1 · **Rubric:** as defined

## Config used
- One generic query per city: `eventi {city} agosto 2026 gratis weekend`
- Radius: city only (0 km beyond comune)
- No comfort-zone category targeting
- No scoring, no fallback, no verifiability handling

## Raw output (best candidate per city, real search results)

**Milan**
- Jazz trio (Marco Mezquida) @ Giardino delle Culture, Sun 9 Aug 21:30, free — [milanofree](https://www.milanofree.it/milano/eventi/cosa-fare-a-milano-e-dintorni-questo-weekend-eventi-e-sagre.html)
- Open-air cinema @ Castello Sforzesco, tonight, free (reservation)
- "Passione disegno" exhibition @ Castello, free

**Bologna**
- Sotto le Stelle del Cinema @ Piazza Maggiore, Sun 9 Aug, free — [bolognatoday](https://www.bolognatoday.it/eventi/cosa-fare-bologna-7-8-9-agosto-2026.html)
- Saturday farmers markets, free

**Fabriano**
- *(none for this weekend — real events are 17–24 Aug)* — [virgilio](https://www.virgilio.it/italia/fabriano/eventi/mese/agosto)

## Judge scores

| City | Best candidate | Stretch | Solo | Verif. | Cost | Floor | **Agg** | Tags |
|---|---|---|---|---|---|---|---|---|
| Milan | Jazz concert | 4 | 8 | 7 | 10 | 10 | **6.0** | `F-passive` |
| Bologna | Open-air cinema | 3 | 6 | 7 | 10 | 10 | **5.2** | `F-passive` |
| Fabriano | — | 0 | 0 | 0 | 0 | 0 | **0.0** | `F-empty` |

**Aggregate (mean of best-per-city): 3.7/10** — but the Fabriano `F-empty` is a hard product failure (user gets nothing), so the honest headline is **the pipeline does not work outside big cities.**

## Failure modes
1. **`F-passive` (Milan, Bologna):** generic queries surface *spectator* events — concerts, cinema, exhibitions. These are novel but require zero social courage. The best comfort-zone events (language exchange, social dance, meetups) never appeared because nobody searched for them.
2. **`F-empty` (Fabriano):** a single city-only generic query returns nothing for a small town on a quiet week. No fallback → no assignment.
3. **No difficulty grading** — can't match to how bold the user is feeling; everything is an undifferentiated blob.
4. **No verifiability discipline** — aggregator listings taken at face value, no confirm-link.

## Fix → v2
- Replace the single generic query with **comfort-zone category-targeted queries** (language exchange, dance, meetup, sagra) — go looking for stretch, don't hope it turns up.
- **Radius scales with population** so small towns pull from the province.
- Add **recurring-community sources** (BlaBla, Tandem, Meetup, Ostello Bello) — these are the comfort-zone backbone and don't depend on a specific week's inventory.
