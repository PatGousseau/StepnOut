# Iteration 09 — First contact with real data

**Date:** 2026-08-09 · **New:** `engine.ts`, `ingest.ts`, `matcher.ts`, `package.json` · **Trigger:** every number in iterations 1–8 came from events I wrote and profiles I wrote.

Two live runs: **Milan** and **Fabriano**, real search, real pages, real extraction. Then the same pools matched twice — once with the keyword stand-in, once with a model judging.

```bash
npm run build
node dist/ingest.js Milan --smoke              # 1 search, 1 extraction
node dist/ingest.js Milan --verify
node dist/ingest.js Fabriano --verify
node dist/ingest.js Fabriano --from-cache --llm-match
```

The four stubbed dependencies in `pipeline.ts` are now implemented: `search` (OpenAI Responses API + `web_search`), `fetchAndExtract` (plain fetch → HTML-to-text → one strict-schema call), `findPois` (Overpass), `verifyOccurrence`. `gpt-4.1-mini`, matching the house pattern in `supabase/functions/generate-personalized-quests`.

## It works, and the API surface needed no fixes

Smoke run returned a real, dated, confirmable event first try — **BlaBla Language Exchange, Henry's Cafè, 13 Aug 19:30, €13**, validity 9.1. That is precisely the category the research doc argued only appears under category-targeted search and never through the official APIs. It is also, almost exactly, an event I had invented as a fixture in iteration 2.

| | Milan | Fabriano |
|---|---|---|
| searches | 5 | 5 |
| pages fetched | 10 | 10 |
| pages yielding nothing | 1 | 2 |
| events after dedupe | 22 | 27 |
| **passed all gates** | **16** | **22** |

## Finding 1 — Fabriano is not the collapse case. It beats Milan.

The research doc's central claim is that coverage collapses below ~50k population, with Fabriano (29k) as the worked example of a town where nothing is happening. **The live run says the opposite: Fabriano returned 22 assignable events to Milan's 16.**

Zero Festival (3 nights), Fabrijazz (a week of concerts and masterclasses), Cinema sotto le Stelle, Musei sotto le Stelle, Frazioni di Folk, Mercatino dell'Antico, Frazion Tour, and the **42ª Sagra della Lumaca** — which I had also invented as a fixture, and which turns out to be a real event in its 42nd year.

The reason is a single URL:

```
https://comune.fabriano.an.it/eventi/     → 14 of the 22 events
```

**The comune's own events page carries the town's entire summer programme.** Small Italian towns have one municipal calendar; big cities have none, because their inventory is fragmented across commercial aggregators that variously 403, paywall, or return junk. Milan's pool came from six different domains, six of its events shared a single useless homepage URL, and one page returned nothing at all.

This inverts the sourcing strategy. `config.json` treats small towns as the hard case needing radius expansion and a sagre-specific source. In practice **`comune.<city>.<prov>.it/eventi/` is the highest-yield source in the whole system**, and it only exists for small towns. The hard case is the metro.

## Finding 2 — Four defects only real data could expose

All four fixed in this iteration.

**Unknown price was scored as expensive.** `scoreQuest` did `(q.price_eur ?? 99)`, so a missing price scored as "over €30" — cost 1/10. Real listing pages omit the price constantly: **10 of Milan's 21 events**. Half the real inventory was being quietly penalised for something we simply didn't know. Unknown now scores 5. Ahynama Club went 6.9 → 8.1 on this alone. *(No fixture has a null price, so iterations 1–8 output is unchanged — verified.)*

**No date gate existed.** 4 of Milan's 21 and 5 of Fabriano's 27 had already happened. The offline harness never needed one because I only ever wrote future events.

**No geographic gate existed.** A Milan search returned an event in **Sillavengo** — a village of 600 people, ~70km away in Novara province. `config.json` has had a radius-by-population table since iteration 2; ingestion never applied it.

**The follow-up question polluted the match.** `profileText` concatenated the follow-up *question* along with the answer. The question "What kind of thing appeals?" put **"app"** into Marco's profile text; "app" is in the language-exchange vocabulary; Marco — who wants to dance, in a pool containing four real dance events — was handed a language exchange. Matching on our own words, not his. Fixed, plus short lexicon terms now need a word boundary so 3-letter terms stop swallowing real words.

After the fixes, Marco gets Ahynama Club.

## Finding 3 — The keyword matcher fails on real text, as predicted

Iterations 7 and 8 tagged failures `[LEXICAL]` on the theory they would vanish with a real model. Real listing text confirms the tag was doing real work:

> **Sofia** — *"speak Italian with real people instead of just an app"* → **Le Vie di San Francesco**, a religious pilgrimage walk. Trace: `pull: said "people", "group"`. Fit 9.1.

Both words are in the hobby-meetup vocabulary. The match is confident, well-reasoned by its own lights, and absurd.

Real inventory also breaks the taxonomy in ways fixtures never did. Extraction filed **"Gruppi di Cammino"** (a municipal walking group) as `dance_movement`, a **mountain-bike granfondo** as `meetup_hobby`, and a **pilgrimage route** as `meetup_hobby`. Eight kinds cannot hold real Italian small-town inventory, and under the lexical matcher a mis-filed kind propagates straight into a bad assignment.

## Finding 4 — Model judging is clearly better, and the gap is largest where inventory is richest

`matcher.ts` replaces **only** pull/edge/bail with one call per user (all candidates at once, not one call per candidate). The validity gate, hard filters, relaxation ladder, weights, tiebreak and fallback are untouched, so the two are directly comparable.

**Fabriano, same pool:**

| | keyword | model-judged |
|---|---|---|
| Sofia | pilgrimage walk | Frazion Tour Collamato — *"opportunity to speak Italian with locals"* |
| Marco | walking group, below his rung | Frazioni di Folk — *"social folk dancing, no class line"* |
| Elena | **fallback** | **Notte nei musei** — *"evening museum visit for slow art viewing"* |
| Tommaso | fallback | MTB granfondo — *"near bouldering's physicality but different activity"* |
| Giulia | fallback | Zero Festival — *"social and free"* |
| Andrea | pilgrimage walk | Sagra della Lumaca |
| | 5 distinct, **3 fallbacks** | 6 distinct, **0 fallbacks** |

Marco's reason cites his follow-up — *"not a class where I stand in a line"* — and picks a social folk dance over the courses. No lexicon reaches that.

Elena's is the sharpest result. The keyword path **excluded** Notte nei musei via her deal-breaker: it starts at 21:30, her bail says *"big loud crowds at night"*, `night` flag → collision → filtered. The model judged `bail_hit: false` — a museum evening is not a big loud crowd — and gave her the one event in Fabriano that matches a year-untouched sketchbook. **Iteration 8's finding D (a common-word deal-breaker removes the best option) is fixed by judgment, not by more rules.**

**Milan** went the other way: the model produced *more* fallbacks (3) than Fabriano (0), because Milan's pool genuinely had no art event for Elena and no climbing for Tommaso. It is reading inventory, not being uniformly generous.

## Finding 5 — The model never says "nothing here fits"

The flip side of finding 4. In Fabriano it found a connection for all six people including Giulia, whose entire input is *"idk, get out more"* — fit 7.3, reason *"social and free"*. That is rationalisation, and it fires the honest fallback zero times.

The `PULL_FLOOR` rule from iteration 7 exists precisely to catch "we have no reason to think this person wants this". A model asked to score pull will almost always find *some* reason. **The floor now depends on the model's willingness to score low, which is the one thing models are worst at.** Milan's 3 fallbacks show it is not unconditional — but the mechanism is weaker than it was.

## Finding 6 — Verifiability is inflated, and it is 45% of validity

Two problems, unfixed:

- **`verifyOccurrence` never fires.** It only runs on `recurring_scheduled`, and extraction returns `confirmed_dated` for nearly everything. Milan: 6 checked, **0 demoted**. Fabriano: 0 checked. The Ferragosto guard from iteration 4 — the change that made the score honest — is effectively dead on real data.
- **Source URLs are frequently wrong.** Six Milan events cite `https://www.vibeevents.it/` — the bare homepage — as their confirm link. A classical concert cites a URL whose slug is about a language exchange. Every one of them scored `confirmed_dated` = 10/10 verifiability.

The gate that drops URL-less events works. It cannot tell a *useless* URL from a good one, and "confirm on the official site" is the promise the whole design rests on.

## What changed in code

| File | Change |
|---|---|
| `engine.ts` | new — the four deps + `ingestCity` + pool gates (`isUpcoming`, `inCity`, `applyPoolGates`) |
| `ingest.ts` | new — CLI, env loader, run cache, reporting. `--smoke` / `--verify` / `--from-cache` / `--llm-match` |
| `matcher.ts` | new — one structured call per user, judging pull/edge/bail only |
| `pipeline.ts` | unknown price 1 → 5 |
| `profile.ts` | follow-up question dropped from match text; short-term word boundaries; optional `Judgments` threaded through `scoreFit`/`selectForUser` |

Offline harness output for iterations 1–8 is **unchanged** — verified after every edit.

## Next

1. **Make `comune.*` a first-class source.** Highest-yield URL in the system, and it is not in `config.json`.
2. **Fix verifiability.** Demote when a source URL is a bare homepage or its slug does not relate to the event; run `verifyOccurrence` on `confirmed_dated` too, not just recurring.
3. **Give the matcher a way to say no** — an explicit "none of these fit" output, so the fallback stops depending on the model volunteering a low score.
4. **Widen the taxonomy** or stop keying anything on it — walking groups, bike races and pilgrimages are all real inventory and none of the eight kinds fit.
5. **Strip candidate indices from reason text** — reasons currently leak "#9", "#19".
