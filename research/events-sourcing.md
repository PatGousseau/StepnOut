# Sourcing Local Public Events for a Weekly Real-World Quest App — Italian Cities

**Context:** A mobile app (StepnOut) that assigns each user one real-world event to attend per week. Target market: **Italian cities** — Milan primary, plus Rome, Turin, Bologna, Naples, and smaller towns. Event types: classes, meetups, live music, markets, sports, social nights — all **solo-friendly**.

**Research date:** 2026-08-09. Every non-obvious claim below was verified against live documentation and is cited with a URL. Where a claim could not be confirmed live (SPA/bot-blocked pages, gated APIs, private pricing), it is explicitly flagged as **unconfirmed**.

> ⚠️ **Honesty caveat on "coverage":** Auth, quotas, and pricing were verified from live docs (high confidence). But **actual inventory depth in specific Italian cities could not be measured** — every API that matters is either gated (Songkick, Bandsintown, DICE), paywalled (Meetup Pro), or bot-protected (YesMilano, DICE pages returned HTTP 403 to automated fetch). Coverage statements are qualitative inferences from documented country support + each platform's known business, not measured result counts. **Before committing budget, run a one-week manual probe against Milan with real keys.**

---

## TL;DR — The core finding

**There is no single official API that returns live, structured, solo-friendly event listings for Italian cities.** The landscape splits into three painful buckets:

1. **Self-serve but wrong category** — Ticketmaster Discovery is free and open, but returns only big concerts/sports/theatre, and Italy's real ticketing inventory sits in **TicketOne** (which has no public API).
2. **Right category but paywalled/gated** — Meetup (best fit for solo social/meetup events) requires **Meetup Pro (~$50/group/mo)**. DICE (nightlife/music) is **partner-only**. Songkick and Bandsintown geo-search are **paid partnership-only**.
3. **Richest inventory, programmatically inaccessible** — **Facebook Events** is culturally dominant for grassroots Italian events (especially smaller cities) but has **no compliant API** since 2018. Municipal open-data portals publish statistics, **not live calendars**.

**Therefore the architecture must be multi-source with an always-available POI fallback.** The reliable, self-serve, zero-legal-risk floor is **OpenStreetMap/Overpass POI data** — assign a *place* (viewpoint, market, museum, notable café) when no event feed yields a good match. Real event feeds layer on top opportunistically.

---

## 1. Official APIs — verified 2026 status

### Summary matrix

| Source | Open to new devs 2026? | Auth | Rate limit | Cost | Can discover events near Milan? | Category fit |
|---|---|---|---|---|---|---|
| **Ticketmaster Discovery v2** | ✅ Yes, self-serve, instant | API key (query param) | 5,000/day, 5 req/s | Free | ✅ `countryCode=IT` | ⚠️ Concerts/sports/theatre only |
| **Eventbrite** | ⚠️ Account-scoped only | OAuth 2.0 | 1,000/hr/token | Free | ❌ Public search removed 2019 | ✅ Content great, **unsearchable** |
| **Meetup** | ⚠️ Pro-gated | OAuth 2.0 | 500 pts/60s (GraphQL) | **~$47–55/group/mo Pro** | ✅ `keywordSearch` lat/lon/radius | ✅ **Best fit** for solo social |
| **Songkick** | ❌ Partner-only, paid | Partner key after signed deal | Not published | Private license fee | ✅ (if licensed) | Concerts only |
| **Bandsintown** | ⚠️ Artist-key only / partnership | `app_id` / partnership | Not published | Free (per-artist) / negotiated | ❌ artist-indexed, no geo-search on free tier | Concerts only |
| **Google Places (New)** | ✅ Yes, self-serve | API key + billing | High (per-SKU) | Per-SKU free caps, then $5–35/1k | **N/A — POIs, not events** | POI fallback only |
| **Facebook / Meta Events** | ❌ Dead for discovery | Page token, owned Pages only | n/a | n/a | ❌ No public event search since 2018 | Huge inventory, **inaccessible** |

### 1.1 Ticketmaster Discovery API v2 — ✅ the only frictionless one

- **Open, self-serve, free.** Register → instant API key, no approval. ([getting-started](https://developer.ticketmaster.com/products-and-docs/apis/getting-started/))
- **Auth:** API key as query param (`?apikey=...`) over TLS 1.2+. No OAuth.
- **Rate limits:** **5,000 calls/day, 5 req/s** default; 429 on over-quota; monitor via `Rate-Limit-Available`/`Rate-Limit-Reset` headers. **Deep-paging cap: `size × page` must stay < 1000.** ([Discovery API v2 manual](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/))
- **Data:** event name, dates/times + timezone, venue, attraction/artist, images, on-sale/presale, **price ranges**, classifications (segment→genre→subgenre), buy links. Rich and clean.
- **Italy coverage:** Italy **is** in the supported list — query `countryCode=IT`. ([Discovery Feed country list incl. IT](https://developer.ticketmaster.com/products-and-docs/apis/discovery-feed/)) **But the fit is poor:** inventory is arena/stadium concerts, big sports, theatre. The dominant Italian primary ticketer **TicketOne** (Live Nation-owned) is **not reliably surfaced** through the global Discovery API. Expect major Milan/Rome shows and near-nothing for classes/meetups/markets/social nights. **Do not** build on the separate "International Discovery API v2" — it excludes Italy and is closed to new keys. ([International Discovery — closed, excludes IT](https://developer.ticketmaster.com/products-and-docs/apis/international-discovery/v2/))

### 1.2 Eventbrite — ⚠️ ideal content, discovery walled off

- **Public event search endpoint (`GET /v3/events/search/`) was removed December 2019.** There is no supported way to discover events you don't own. ([changelog](https://www.eventbrite.com/platform/docs/changelog), corroboration: [Automattic issue #83](https://github.com/Automattic/eventbrite-api/issues/83))
- Remaining event retrieval: **Get Event by ID, List by Venue, List by Organization** — all scoped to your own org or orgs that authorized your app. City-wide discovery requires acceptance into the **Distribution Partner Program** (approval-gated, not self-serve).
- **Auth:** OAuth 2.0, Bearer token. **Rate limit: 1,000 calls/hr/token** (a daily cap is reported by third parties but unconfirmed on Eventbrite's own current docs). **Cost:** free today. ([API Terms of Use](https://www.eventbrite.com/help/en-us/articles/833731/eventbrite-api-terms-of-use/), [rate limits](https://www.eventbrite.com/platform/docs/rate-limits))
- **Italy:** genuinely used in Milan/Rome for exactly your categories (workshops, classes, social nights, markets) — but **you cannot search it** without partner status. Rich content, inaccessible.

### 1.3 Meetup — ⚠️ best category fit, but Pro-gated

- Old REST API retired; **GraphQL only**. Creating an OAuth consumer **requires an active Meetup Pro subscription** (and Pro does not guarantee approval). ([how to get API access](https://help.meetup.com/hc/en-us/articles/41453576628749-How-can-I-get-access-to-Meetup-s-API), [GraphQL guide](https://www.meetup.com/graphql/guide/))
- **Cost: Meetup Pro ~$47/group/mo (6-mo plan) to ~$55/group/mo monthly**, billed per group. ([Meetup Pro pricing](https://help.meetup.com/hc/en-us/articles/39428296529421-Meetup-Pro-pricing-and-trial))
- **Rate limit:** 500 points / 60s (GraphQL point-cost model). **Location discovery: ✅ yes** — `keywordSearch` accepts `query`, `lat`, `lon`, `radius`, `first`, returning Events + Groups. This is the one thing Eventbrite lacks.
- **Uncertainty:** whether a *non-Pro* authenticated token can still run `keywordSearch` in 2026 is **unconfirmed** — Meetup's own page lists "API access" as a Pro feature. Safe planning assumption: **budget for Pro.**
- **Italy:** **strongest structural fit** — Milan has active language exchanges, expat/social nights, hiking, board games, tech meetups. Rome/Turin/Bologna real but thinner. **Smaller Italian cities are sparse to empty** — density collapses outside major metros.

### 1.4 Songkick — ❌ partner-only, paid

- Live developer page: *"We are currently not approving API requests for student projects, educational purposes or hobbyist purposes."* Access requires the **paid licensing inquiry form** + signed partnership agreement + license fee. ([songkick.com/developer](https://www.songkick.com/developer))
- Best-in-class concert data (6M+ concerts, strong Milan/Rome/Turin/Bologna metro coverage), but **structurally unavailable to an indie app** without enterprise licensing. Rate limits and price are private/unpublished. **Don't plan around it.**

### 1.5 Bandsintown — ⚠️ wrong query model on free tier

- Two paths: (a) **artist API key** — self-serve but **linked to a single artist**, returns only that artist's events (useless for city discovery); (b) **partnership program** (email `API@bandsintown.com` with traffic projections, case-by-case). ([what is the Bandsintown API](https://help.artists.bandsintown.com/en/articles/7053475-what-is-the-bandsintown-api), [non-artist access](http://help.artists.bandsintown.com/en/articles/3372745-can-i-have-access-to-the-api-and-an-api-key-if-i-m-not-an-artist))
- Good Italian concert coverage, but **geo-search ("concerts near Milan") is gated behind partnership.** Rate limits unpublished. Same practical wall as Songkick.

### 1.6 Google Places (New) — ✅ but it's a POI source, not events

- **There is no public queryable Google Events API.** Google surfaces events via schema.org structured-data ingestion + Knowledge Graph (display, not queryable). Confirmed: Places returns POIs, no events field. ([Places overview](https://developers.google.com/maps/documentation/places/web-service/overview))
- Fully self-serve (API key + billing). See §4 for pricing — treat as **premium POI enrichment**, not an event source. It does expose useful venue attributes like `liveMusic`, `goodForGroups`, `reservable` (Enterprise+Atmosphere tier).

### 1.7 Facebook / Meta Events — ❌ dead for discovery

- **No public event search by location since 2018** (post–Cambridge Analytica lockdown). The canonical open-source workaround `tobilg/facebook-events-by-location` is **archived (Dec 2021)**: *"no longer usable, because FB changed the way one can access the event data."* ([archived repo](https://github.com/tobilg/facebook-events-by-location), [TechCrunch 2018 shutdowns](https://techcrunch.com/2018/07/02/facebook-rolls-out-more-api-restrictions-and-shutdowns/amp/))
- Only surviving path: read events for a **Page you own/manage** (Page Access Token + app review). Not discovery.
- **This is the biggest gap:** Facebook is the dominant grassroots event platform in Italy — club nights, aperitivi, local festivals, university/community events, *especially in smaller cities* — and it is a **locked box.** Accept as a hard constraint; scraping it violates Meta ToS and is fragile.

---

## 2. Coverage reality check — Milan vs the rest of Italy

**The critical pattern: coverage is a function of city size, and it collapses sharply outside the top metros.**

| Category | Milan | Rome / Turin / Bologna | Smaller Italian cities | Best source |
|---|---|---|---|---|
| **Live music (big)** | ✅ Strong | ✅ Good | ⚠️ Touring acts only | Ticketmaster (partial), Songkick*, DICE* |
| **Live music (small/DIY gigs)** | ✅ Good | ⚠️ Moderate | ❌ Weak | DICE* / scraping / Facebook (inaccessible) |
| **Meetups / social nights** | ✅ **Strong** | ⚠️ Moderate | ❌ **Sparse-to-empty** | Meetup Pro |
| **Classes / workshops** | ✅ Good | ⚠️ Moderate | ❌ Weak | Eventbrite (unsearchable) / scraping |
| **Nightlife / clubs** | ✅ Strong | ✅ Good | ⚠️ Moderate | DICE* / Xceed / Zero (scrape) |
| **Markets** | ✅ Good | ✅ Good | ⚠️ Some | Comune HTML / OSM `amenity=marketplace` |
| **Amateur sports / social sport** | ❌ Weak everywhere | ❌ Weak | ❌ Weak | No good API — Facebook/local (inaccessible) |
| **POI fallback (any place)** | ✅ **Complete** | ✅ **Complete** | ✅ **Complete** | **OSM / Google Places** |

\* = gated (partnership/paid) — not freely accessible.

**Where coverage collapses:** Every *event* API degrades outside major metros. Meetup — your best category fit — is essentially Milan-only in practice. **The only layer that holds up everywhere in Italy is POI data (OSM/Google), which is exhaustive even in small towns.** This is why the POI fallback (§4) is not a nice-to-have — for smaller cities it will frequently be the *primary* quest source.

---

## 2b. Small-city reality — TESTED LIVE (2026-08-09)

The coverage-collapse claim above was **verified empirically**, not just asserted. Using a live *web-search → fetch-aggregator → LLM-extract* flow (see §3.6), the same weekend (8–9 Aug 2026) was probed across four cities of decreasing size. Results:

| City | Pop. | Local aggregator exists? | Free solo events *this weekend*? | Verdict |
|---|---|---|---|---|
| **Parma** | ~200k | ✅ parmatoday, nonsoloeventiparma | ✅ Museum art labs (Sat/Sun), MIC fest, 3 sagre in provincia | **Healthy** |
| **Lecce** | ~95k | ✅ lecceprima, iltaccodibacco | ⚠️ Thin *in-city*, but **5+ sagre/festivals within ~40 km** | **Saved by province** |
| **Matera** | ~60k | ✅ sassiland, materawelcome | ⚠️ One big *ticketed* concert; free = municipal "Estate 2026" only | **Weak** |
| **Fabriano** | ~29k | ✅ virgilio, eventiesagre | ❌ **Nothing on 9 Aug in-town** — real events are 17–24 Aug | **Collapsed** |

Sources: [parmatoday](https://www.parmatoday.it/eventi/) · [trovasagre Lecce](https://trovasagre.com/sagre/puglia/lecce) · [sassiland Matera](https://www.sassiland.com/eventi_matera/) · [virgilio Fabriano](https://www.virgilio.it/italia/fabriano/eventi/mese/agosto)

**Three findings that revise the recommended stack:**

1. **The collapse is density, not absence.** Every city — even 29k Fabriano — has *some* aggregator. Critically, `virgilio.it/italia/{city}/eventi` gives national per-city coverage, and `trovasagre.com` / `iltaccodibacco.it` blanket the south. So the search-extract layer works *everywhere*; what collapses below ~50–100k is **how often a given week has an assignable free solo event.** Small towns will have genuinely empty weeks (Fabriano, this week) — these are exactly when the POI fallback (§4) must fire as the *primary* source.

2. **Radius expansion is the biggest single rescue.** Lecce the *city* was thin, but widening to ~40 km surfaced 5 free events. Below ~100k population, the pipeline must query the **province**, not the comune. Implement as a config knob: `search_radius_km` scales inversely with city population (e.g. Milan 5 km → small town 40–50 km).

3. **Sagre are the killer small-town category — and NO API in this report covers them.** These free food-and-community town festivals are the backbone of small-city Italian summer, are intensely solo-friendly, and surface *only* via `trovasagre.com` / `eventiesagre.it` / local Pro Loco pages. A Ticketmaster/Meetup-based stack shows **zero** of them. A dedicated sagre source is a required Phase-1 component for anywhere outside the top metros.

**Worked collapse example — Fabriano (29k), 9 Aug, no event to assign → POI fallback fires:**
> *This week's quest:* Visit the **Museo della Carta e della Filigrana** (paper & watermark museum) in the historic centre — Fabriano invented watermarked paper. Concrete, dignified, requires no event feed. The same OSM/Places mechanism yields a viewpoint/park/landmark in any town on an empty week.

---

## 3. Scraping fallback — viability, legal risk, maintenance

Because the good APIs are gated and municipal portals lack live calendars, scraping is tempting. **The EU legal context makes this materially riskier than in the US** — read this before writing a single scraper.

### 3.1 Where the actual inventory lives (all scrape-only or gated)

| Source | Real inventory | API? | Access |
|---|---|---|---|
| **DICE.fm** | Music/nightlife, strong IT | Partner-only GraphQL | Gated (apply via MIO) |
| **TicketOne** | **Dominant** IT ticketing (~200k events/yr) | **None official found** | — |
| **Fever** | Experiences/live entertainment | **Public API via MCP** (OAuth, free) | **Open-ish — but Italy coverage unconfirmed** |
| **Xceed** | Nightlife/clubs (Milan-founded) | None found | Scrape-only |
| **Zero.eu / ZeroMilano** | Curated events since 1996 | None found | Scrape-only |
| **2night.it** | Nightlife/aperitivo | None found | Scrape-only |
| **YesMilano** | Milan official tourism calendar | None / no RSS | Scrape-only, **Cloudflare-protected (403)** |

Sources: [DICE partner GraphQL docs](https://partners-endpoint.dice.fm/graphql/docs/index.html) · [Fever developer portal](https://developer.feverup.com/en/) · [Xceed IT events](https://xceed.me/en/italy/events) · [Zero Milano](https://zero.eu/en/milano/) · [2night Milano](https://2night.it/milano/eventi.html) · [YesMilano What's On](https://www.yesmilano.it/en/whats-on)

> ⚠️ **Avoid third-party "APIs" for DICE/TicketOne** (e.g. ticketsdata.com, parse.bot) — these are **resellers of scraped data**, not official endpoints. They carry all the scraping legal risk *plus* an uncontrolled dependency.
>
> **Fever is the one genuinely open structured bet** — public event-discovery API (`search_events`, `search_cities`), OAuth 2.0, currently free, no registration form. **But its docs list MAD/NYC/LON/BCN and Italian coverage is unconfirmed** — verify with `data-ai@feverup.com` before relying on it.

### 3.2 Municipal / comune open data = dead end for live events

- **Comune di Milano** has a real CKAN API (`https://dati.comune.milano.it/api/3`, JSON, no auth) — but the only events dataset is **historical statistics (1995–2010)**, not a calendar. ([Milan CKAN API](https://dati.comune.milano.it/en/web/portale-del-dato/utilizza-i-dati/cdm-api), [ds157 historical](https://dati.comune.milano.it/it/dataset/ds157-cultura-ingressi-spettacoli-manifestazione-1995-2010))
- **Comune di Roma** relaunched a CKAN portal (500+ datasets, Turismo group) — but tourism datasets are accommodation/reference data, **not event calendars**. ([Rome open data](https://dati.comune.roma.it/))
- **National portal `dati.gov.it`** (CKAN + DCAT-AP_IT, JSON API) is a **metadata catalog of datasets**, not an events feed. ([dati.gov.it API](https://www.dati.gov.it/api))
- **Turin/Bologna/Naples not individually verified** — expect the same pattern (statistical portal + separate HTML tourism site holding the calendar).

**Verdict:** treat comune portals as reference data only. The live events sit on tourism HTML sites (YesMilano etc.) — scrape-only and often bot-protected.

### 3.3 Legal risk — the EU is stricter than the US

Three independent legal layers **stack** in Italy/EU:

1. **Contract / ToS (binding in the EU).** Per **CJEU *Ryanair v. PR Aviation* (C-30/14, 2015)**: for a database *not* protected by copyright/sui-generis right, the operator is **free to prohibit scraping by contract, and that prohibition is enforceable.** A "no scraping" ToS clause is a real barrier in Italy. ([Pinsent Masons](https://www.pinsentmasons.com/out-law/news/website-operators-can-prohibit-screen-scraping-of-unprotected-data-via-terms-and-conditions-says-eu-court-in-ryanair-case), [Kluwer Copyright Blog](https://legalblogs.wolterskluwer.com/copyright-blog/ryanair-ltd-v-pr-aviation-bv-contracts-rights-and-users-in-a-low-cost-database-law/))
2. **EU Database Directive — sui generis right.** A curated listing built with "substantial investment" can prohibit extraction of substantial parts even absent copyright. Aggregators (Zero, 2night, YesMilano) plausibly qualify. ([MediaLaws](https://www.medialaws.eu/ecj-clarifies-database-directive-scope-in-screen-scraping-case/))
3. **GDPR (data-centric, not access-centric).** *"Public does not mean permission."* Listings naming organizers/DJs/hosts/teachers = personal data → you need an **Art. 6 legal basis** (usually legitimate interest + documented balancing + data minimization). Venue+time+title is lower risk; anything naming individuals is squarely in scope. ([IAPP: web scraping in the EU](https://iapp.org/news/a/the-state-of-web-scraping-in-the-eu))

**US vs EU contrast:** *hiQ v. LinkedIn* (9th Cir. 2022) held scraping public pages likely doesn't violate the CFAA — **but even there ToS anti-scraping clauses were enforceable as breach of contract** and hiQ still faced a $500k judgment. In the EU the "it was public" defense is **much weaker** — contract + sui-generis + GDPR each independently constrain you. **Do not import the US "public = fine" assumption.** ([Jenner & Block on hiQ](https://www.jenner.com/en/news-insights/publications/client-alert-data-scraping-in-hiq-v-linkedin-the-ninth-circuit-reaffirms-narrow-interpretation-of-cfaa))

**Per-source risk read:**
- **Comune / municipal HTML** — lower GDPR risk (public-interest, low personal-data density) but YesMilano is bot-protected + likely ToS-restricted → **prefer a data partnership over covert scraping.**
- **Commercial aggregators (Zero, 2night, DICE, TicketOne, Xceed)** — **highest risk**: likely sui-generis protection + anti-scraping ToS + organizer/artist personal data.
- **Independent venue sites** — lowest legal profile, highest maintenance.

### 3.4 schema.org/Event JSON-LD harvesting — lowest-maintenance scrape

Where present, harvesting `<script type="application/ld+json">` Event markup beats bespoke DOM parsers: it's a stable standardized object (`name`, `startDate`, `location`, `offers`, `performer`) that survives visual redesigns, and SEO incentives (Google event rich results) push ticketing/venue sites to include it. ~31% of pages carry some schema.org markup and rising. ([schema.org Event](https://schema.org/Event), [Gatilab adoption stats](https://gatilab.com/event-schema-markup/))

- **WordPress venue sites** using The Events Calendar plugin auto-emit Event JSON-LD → easy wins.
- **Italy-specific prevalence unconfirmed** — spot-check the JSON-LD of your top ~20 target sources before committing; fall back to DOM parsing only where absent.
- **Legal note:** JSON-LD harvesting is still scraping — §3.3 analysis applies unchanged. Lower engineering cost, same legal exposure.

### 3.5 Maintenance burden

**High and ongoing.** Bespoke per-source parsers break on every restyle; SPAs/anti-bot (YesMilano, DICE) need headless browsers (Playwright) → slower, costlier, brittle; aggregators actively defend against scraping. A 10–20-source pipeline needs continuous babysitting. This is the strongest argument for **APIs/partnerships first, JSON-LD over DOM parsers second, and never depend on covert scraping of protected aggregators.**

### 3.6 Search-and-extract layer — the highest-value approach for this use case (tested live)

**This was validated live for Milan (2026-08-09) and it materially changes the recommendation.** Instead of hand-written scrapers, run: **web search (~5 queries/city/week) → fetch the top-ranked aggregator pages → LLM-extract to the `UnifiedQuest` schema.** Executing this by hand for Milan produced a full slate of concrete, dated, free events in ~2 minutes.

**The decisive finding:** *none* of the official APIs in §1 produced a single one of the free/low-cost solo events that actually matter for this app. Every real result came from **Italian-language local editorial aggregators** — `milanopocket.it`, `milanofree.it`, `milanotoday.it`, `milanobiz.it`, and per-city equivalents (`parmatoday`, `lecceprima`, `sassiland`, `virgilio.it/italia/{city}`). **For free/low-cost solo events in Italy, these local listings are the actual inventory, not the APIs.**

Why this beats bespoke DOM scraping:
- **Lower maintenance** — extraction is *from rendered content via a model*, not brittle CSS selectors. Site restyles don't break it.
- **Source-agnostic** — the same flow works on any city's aggregator without a new parser per site.
- **Cheap** — a few search calls + a few LLM extractions per city per week.

Caveats (must be designed in):
- Aggregator listings are **secondhand** — many say *"prenotazione obbligatoria"* / *"verificare i canali ufficiali."* Keep the source URL and surface a **"confirm on official site"** link rather than asserting the event as fact.
- **Same EU legal exposure as §3.3** — reading a page to extract facts for a link-back is lower-risk than republishing a whole database, but get counsel before scaling. Prefer sending users *to* the source over mirroring it.
- Pair with the **radius knob** (§2b) and a **dedicated sagre source** (§2b) for small cities.

**This layer should lead Phase 1 for everything outside the top ~5 metros** — see revised build order in §8.

---

## 4. Always-available POI fallback — the reliable floor

When no event feed yields a good match (common outside Milan), generate a **place-based quest**: visit a viewpoint, hike to a peak, explore a market, see a museum, sit at a notable café. **POI data is exhaustive everywhere in Italy**, so this layer never collapses.

### 4.1 Sources compared

| Source | Model | Cost | Best for |
|---|---|---|---|
| **OSM / Overpass** | Free API or self-host | **$0** (attribution only) | ✅ **Primary bulk fallback** — category queries, strong IT coverage |
| **Foursquare OS Places** | Bulk Parquet download, Apache-2.0 | **$0** | Ingest-once enrichment (popularity/category richness) |
| **Foursquare Places API** | Hosted, per-call (from Jun 2026) | ~$0.009–0.015/call, 500 free/mo | On-demand lookups |
| **Google Places (New)** | Hosted, per-SKU | $32/1k Nearby, $5–20/1k Details | Premium enrichment (photos, ratings, hours) on the *selected* quest |

### 4.2 OpenStreetMap / Overpass — recommended primary

- **Free, no API key.** Endpoint `https://overpass-api.de/api/interpreter`. Usage policy: safe under **~10,000 queries/day and <1 GB/day**; send an identifying `User-Agent`; 429 on over-limit. ([OSM Wiki — Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API))
- **For a production weekly batch, self-host Overpass** (Docker + Italy `.osm.pbf` extract from [Geofabrik](https://www.geofabrik.de/data/overpass-api.html)) to eliminate rate-limit risk entirely. Cost ≈ a small VPS.
- **Do POI extraction via Overpass, NOT Nominatim** — Nominatim's policy is strict (max **1 req/s**, no bulk/systematic queries, explicitly prohibits "downloading all POIs in an area"). ([Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/))
- **Category → OSM tag mapping** (stable OSM Map Features conventions):

| Quest kind | OSM tag filter |
|---|---|
| Viewpoint | `tourism=viewpoint` |
| Peak / hike | `natural=peak` |
| Landmark / historic | `historic=*` |
| Museum | `tourism=museum` |
| Notable café | `amenity=cafe` |
| Market | `amenity=marketplace` |
| Park | `leisure=park` |
| Gallery / attraction | `tourism=gallery`, `tourism=attraction` |

- Example Overpass QL (all categories within 5 km of Milan center, returning centroids):

```
[out:json][timeout:25];
(
  nwr(around:5000,45.4642,9.1900)[tourism~"viewpoint|museum|gallery|attraction"];
  nwr(around:5000,45.4642,9.1900)[natural=peak];
  nwr(around:5000,45.4642,9.1900)[historic];
  nwr(around:5000,45.4642,9.1900)[leisure=park];
  nwr(around:5000,45.4642,9.1900)[amenity=marketplace];
);
out center tags;
```

- **Italy coverage: excellent** — one of the best-mapped OSM regions. Attribution: `© OpenStreetMap contributors` (ODbL).

### 4.3 Foursquare & Google Places

- **Foursquare OS Places** (Apache-2.0, 100M+ POIs, Parquet, ~monthly) — ingest the Italy slice into your DB for popularity/rating signals that OSM lacks. Also flowing into Overture Maps. ([FSQ OS Places](https://opensource.foursquare.com/os-places/), [HF dataset](https://huggingface.co/datasets/foursquare/fsq-os-places)) *Access model migrated to a portal/Iceberg token flow — confirm at ingest time.*
- **Foursquare hosted API changes June 1 2026:** V3 deprecated May 15 2026; new Pro tier = **500 free calls/mo, then ~$9–15 CPM**. ([Foursquare upcoming changes](https://docs.foursquare.com/developer/reference/upcoming-changes))
- **Google Places (New) pricing** (post-March-2025 — old $200/mo pooled credit **removed**, replaced by per-SKU free caps): ([March 2025 changes](https://developers.google.com/maps/billing-and-pricing/march-2025), [pricing list](https://developers.google.com/maps/billing-and-pricing/pricing))

| SKU | $/1,000 | Free/mo |
|---|---|---|
| Nearby Search — Pro | $32 | 5,000 |
| Text Search — Pro | $32 | 5,000 |
| Place Details — Essentials | $5 | 10,000 |
| Place Details — Pro | $17 | 5,000 |
| Place Details — Enterprise | $20 | 1,000 |

  **Billing gotcha:** you pay the **highest SKU tier touched by any field** in the request — one Enterprise field (`rating`, `websiteUri`, phone) bumps the whole call. Keep field masks tight. Reserve Google for premium metadata (photos/ratings/hours) on the *single selected* quest POI, staying in free tiers.

**Recommendation:** OSM/Overpass (self-hosted) as the always-on primary; FSQ OS Places Parquet ingested for enrichment; Google Places only for premium metadata on the chosen quest.

---

## 5. Normalization schema & deduplication

### 5.1 Unified schema (timed events + POI quests in one table)

Aligns with [schema.org/Event](https://schema.org/Event) so a POI quest is just an Event with **null datetimes** and a `Place`-only location. Nullable time fields are the key design choice.

```typescript
type QuestSourceType =
  | 'ticketmaster' | 'eventbrite' | 'meetup' | 'dice' | 'fever' | 'bandsintown'
  | 'osm' | 'foursquare_os' | 'google_places' | 'scrape_jsonld' | 'manual';

type QuestKind =
  | 'concert' | 'exhibition' | 'sports' | 'theater' | 'festival' | 'class' | 'meetup' | 'nightlife' | 'market_event'  // timed
  | 'viewpoint' | 'hike' | 'landmark' | 'museum' | 'cafe' | 'market' | 'park' | 'attraction';                          // POI-based

interface UnifiedQuest {
  // Identity & provenance
  id: string;                     // internal canonical UUID
  source: QuestSourceType;
  source_id: string;              // provider native id (e.g. OSM "node/12345")
  dedup_key: string;              // hash(normalized_title + local_date + geohash7)
  merged_from?: string[];         // source ids merged into this canonical record

  // Descriptive
  title: string;
  description: string | null;
  kind: QuestKind;
  category_raw: string | null;    // provider's own category string
  tags: string[];                 // normalized facets: ['outdoor','free','solo-ok']

  // Time — NULL for POI quests (the crux)
  start_datetime: string | null;  // ISO 8601 + tz offset
  end_datetime: string | null;
  timezone: string;               // IANA, e.g. 'Europe/Rome'
  is_timed: boolean;              // false => always-available POI quest

  // Location
  venue_name: string | null;
  address: string | null;
  lat: number;
  lng: number;
  geohash: string;                // precision-7 (~150m) for blocking/dedup
  city: string;                   // normalized Italian city
  country_code: string;           // 'IT'

  // Commercial
  price_min: number | null;       // cents, EUR
  price_max: number | null;
  currency: string;               // 'EUR'
  is_free: boolean;

  // Media & links
  url: string | null;
  image_url: string | null;
  attribution: string | null;     // e.g. '© OpenStreetMap contributors'

  // Quest semantics
  is_solo_friendly: boolean;
  is_recurring: boolean;          // POI quests => true
  difficulty: 'easy' | 'moderate' | 'hard' | null;

  // Lifecycle
  status: 'active' | 'expired' | 'cancelled' | 'duplicate';
  quality_score: number;          // 0–1, drives ranking & source scoring
  fetched_at: string;
  updated_at: string;
}
```

**Storage notes (fits your existing Supabase/Postgres):** nullable `start/end_datetime`; index `(city, kind, is_timed, status)`; PostGIS `geography` point on `(lat,lng)` + btree on `geohash` prefix for blocking. POI quest defaults: `is_timed=false`, `start_datetime=null`, `is_recurring=true`, `is_solo_friendly` per kind (viewpoint/hike/museum → true).

### 5.2 Deduplication (same event across Ticketmaster + DICE + Bandsintown)

Standard **record-linkage / entity-resolution** pipeline: normalize → block → score → merge. ([Splink docs](https://moj-analytical-services.github.io/splink/index.html), [Awesome Entity Resolution](https://github.com/OlivierBinette/Awesome-Entity-Resolution))

1. **Normalize:** title → lowercase, strip accents/punctuation, remove noise tokens ("live", "tour 2026", "official"); extract headliner/artist as its own field (strongest concert signal). Datetimes → UTC, but keep local *date* separately. Geocode venue to lat/lng.
2. **Block** (avoid O(n²)): candidate pairs only when they share a block key —
   - **same city + same local date** (primary block for timed events)
   - **geohash prefix match** (precision-6 ≈ 1.2 km or 7 ≈ 150 m) — uses coordinates, robust to venue-name spelling; add neighboring-geohash lookup for grid edges.
3. **Score pairs:** title similarity (token-set + Jaro-Winkler via RapidFuzz) + artist exact-match; datetime proximity (same date strong, Δt ≤ few hrs boost); **venue proximity via haversine (<150 m ≈ same venue** — more robust than name match); venue-name fuzzy as tiebreaker.
4. **Decide + merge:**
   - **Ship first (deterministic, explainable):** `same_local_date AND venue_within_150m AND title_similarity ≥ 0.85` → duplicate.
   - **Scale up (probabilistic):** **Splink** (Fellegi-Sunter, DuckDB backend, ~1M records/min) learns field weights + clustering. Alternatives: `dedupe`, `Zingg`, Python Record Linkage Toolkit.
   - **Canonicalize:** cluster matched pairs, pick canonical by **source priority** (e.g. Ticketmaster > DICE > Bandsintown for accuracy), fill gaps from others, store contributors in `merged_from`, set losers `status='duplicate'`. Short-circuit exact dups on ingest via `dedup_key`.
   - **POI dedup** (OSM vs FSQ vs Google): same machinery, no datetime — block on geohash-7, match on name similarity + coord distance (<50–100 m) + category compatibility.

([Splink intro](https://www.robinlinacre.com/introducing_splink/), [Tilores ER library comparison](https://tilores.io/content/best-open-source-entity-resolution-and-record-linkage-libraries-splink-zingg-dedupe-and-when-to-move-beyond-them/))

---

## 6. Recommended stack

**Design principle: a tiered pipeline where every tier degrades gracefully to the one below, and the bottom tier (POI) never fails.**

```
Weekly batch job (per covered city; radius scales inversely with population — §2b)
  ├─ Tier 1 — Search-and-extract from local aggregators  [HIGHEST-VALUE, tested §3.6]
  │     • web search → fetch top aggregators → LLM-extract → UnifiedQuest
  │     • sources: milanopocket/milanofree/*Today, virgilio.it/italia/{city}
  │     • dedicated sagre source: trovasagre.com / eventiesagre.it  (small-town backbone)
  ├─ Tier 2 — Free self-serve event feeds
  │     • Ticketmaster Discovery (countryCode=IT)        [free]
  │     • Fever API (IF Italy coverage confirmed)        [free]
  ├─ Tier 3 — Paid/gated event feeds (add as traction justifies)
  │     • Meetup GraphQL via Meetup Pro   → solo social  [~$50/mo]
  │     • DICE partner API (apply)         → nightlife    [partnership]
  ├─ Tier 4 — JSON-LD harvest (opportunistic, per-source, EU-legal-reviewed)
  │     • schema.org/Event off vetted venue/aggregator pages
  └─ Tier 5 — POI fallback (ALWAYS AVAILABLE; PRIMARY on empty small-town weeks)
        • OSM/Overpass (self-hosted) primary
        • Foursquare OS Places (enrichment)
        • Google Places (premium metadata on selected quest only)

  → Normalize to UnifiedQuest → Dedup (deterministic rule → Splink)
  → Store in Supabase/Postgres (PostGIS + geohash) → weekly assignment engine
```

**Concrete component choices:**
- **Ingestion/scheduling:** Supabase Edge Functions or a scheduled worker (you already run Supabase). Weekly cron per city, with `search_radius_km` scaled inversely to population (§2b).
- **Primary discovery (Tier 1):** search-and-extract over local aggregators + a dedicated sagre source — this is what actually surfaced free solo events in the live test, and it works in every city size.
- **Event feeds:** Ticketmaster (day 1, free) + Meetup Pro (when you need solo-social depth in Milan) + Fever (if IT-confirmed) + DICE partnership (later).
- **POI:** self-hosted Overpass (Docker + Geofabrik Italy extract) → $0 marginal, no rate limits.
- **Enrichment:** FSQ OS Places Parquet ingested once; Google Places only for the chosen quest's photo/rating/hours.
- **Dedup:** RapidFuzz + geohash blocking first; Splink (DuckDB) when volume grows.
- **Legal:** get EU counsel to sign off before any aggregator scraping/extraction; prefer link-outs to the source over mirroring, and partnership inquiries (YesMilano, TicketOne, DICE, Fever) over covert scraping.

---

## 7. Estimated monthly API cost

**Key insight: cost is driven by number-of-cities and caching strategy, NOT by user count.** Event ingestion is a per-city batch (weekly), and POI data is cached per city — so **1k and 10k users cost nearly the same** as long as you assign from a shared per-city pool rather than making per-user live API calls. The scaling axis is *cities covered*.

Assumptions: batch ingestion weekly per city; POI cached and refreshed monthly; Google Places used only for premium metadata on selected quests, cached per-city-cohort (not per user).

### At 1,000 users (assume ~3–5 cities, Milan-heavy)

| Component | Basis | Monthly cost |
|---|---|---|
| Search-and-extract (Tier 1) | ~5 searches + few LLM extractions × cities × 4 wks | **~$5–20** |
| Ticketmaster Discovery | Free tier, weekly batch << 5k/day | **$0** |
| Fever API | Free (if used) | **$0** |
| Meetup Pro | 1 group subscription (for `keywordSearch`) | **~$50** |
| OSM/Overpass | Self-hosted small VPS (or free public tier) | **$0–20** |
| Foursquare OS Places | Bulk Parquet, Apache-2.0 | **$0** |
| Google Places | Selected-quest metadata, cached; within free per-SKU caps | **$0–30** |
| Supabase/infra | Marginal (existing) | **~$0** |
| **Total** | | **≈ $55–120/mo** |

### At 10,000 users (assume ~8–12 cities)

| Component | Basis | Monthly cost |
|---|---|---|
| Search-and-extract (Tier 1) | More cities × searches + LLM extractions | **~$20–60** |
| Ticketmaster Discovery | Still free (more cities, still << quota) | **$0** |
| Fever API | Free | **$0** |
| Meetup Pro | 1–2 groups (Pro is per-group, not per-user) | **~$50–110** |
| OSM/Overpass | Self-hosted VPS (slightly bigger, more cities) | **~$20–40** |
| Foursquare OS Places | Bulk Parquet | **$0** |
| Google Places | More cities/quests; keep field masks tight, cache aggressively; may exceed some free SKU caps | **~$50–200** |
| DICE / partnerships | Negotiated (may be rev-share, not per-call) | **variable** |
| Supabase/infra | Scales modestly | **~$25–50** |
| **Total** | | **≈ $170–460/mo** |

> **Cost stays low because you never call event APIs per-user.** The thing that would blow this up is **per-user live Google Places calls** — avoid it. Cache the weekly quest pool per city and assign from it. If you later personalize with live Places Details per user, model 10k users × ~4 assignments/mo ≈ 40k calls; at Place Details Pro ($17/1k) that's ~$680/mo — so **cache instead.**
>
> Costs excluded (real but not per-API): scraping infra maintenance (mostly engineer time), legal review (one-time + ongoing), and any partnership minimums (Songkick/DICE license fees are private).

---

## 8. Ranked build order

> **Revised after the live test (§2b, §3.6):** the search-and-extract layer and the POI fallback now *lead* Phase 1 — they are the two things proven to work in every city size, whereas the APIs are Milan-centric add-ons.

**Phase 1 — Prove the mechanic (weeks 1–3), zero/low cost, test in Milan AND one small town**
1. **Search-and-extract over local aggregators + a dedicated sagre source** — the highest-value layer, validated live; it surfaced the actual free solo events the APIs missed, and works in every city. Build the `UnifiedQuest` schema around this. Include the `search_radius_km`-by-population knob from day one.
2. **Self-hosted Overpass + OSM POI fallback** — the always-available floor: when a small town has an empty week (which *will* happen — see Fabriano, §2b), this assigns a place-based quest so the app never fails.
3. **Ticketmaster Discovery** (`countryCode=IT`) — free, instant, adds big timed events (concerts/sports) to the pool.
4. **Normalization + deterministic dedup** (RapidFuzz + geohash) — wire the pipeline end-to-end across these sources.

**Phase 2 — Add the category that actually fits (weeks 3–6)**
5. **Meetup Pro + GraphQL `keywordSearch`** — the single biggest quality lift for solo-friendly social/meetup quests in Milan. ~$50/mo; validate `keywordSearch` access on the Pro token before relying on it.
6. **Fever API** — verify Italian coverage with Fever first; if confirmed, it's free structured inventory.
7. **Manual probe** — one week, real keys, count actual results per source across a big + small city to replace qualitative estimates with measured numbers.

**Phase 3 — Deepen inventory & expand cities (weeks 6–12)**
8. **DICE partnership application** — nightlife/music depth (gated; apply early since approval takes time).
9. **JSON-LD harvesting** for 10–20 vetted venue/aggregator pages — **only after EU legal sign-off**; prefer JSON-LD over DOM parsers. Drop organizer/host personal data unless you have a documented legitimate-interest basis.
10. **Expand search-extract + POI to all target cities** (Rome/Turin/Bologna/Naples + smaller towns) — both scale trivially; this is how you cover cities where API event feeds collapse.
11. **Splink** dedup once multi-source volume justifies probabilistic matching.

**Phase 4 — Partnerships & polish (3+ months)**
12. **TicketOne / YesMilano data-partnership inquiries** — the two richest Italian sources with no public API; a direct deal beats scraping legally and operationally.
13. **Foursquare OS Places enrichment** + **Google Places premium metadata** on selected quests (photos/ratings/hours) for a polished quest card.
14. **Source quality scoring & audit trail** — feed `quality_score`, make merges reversible, tune the assignment engine.

**Deliberately NOT on the roadmap:** Songkick (enterprise-only), Bandsintown geo-search (partnership wall), Facebook Events (no compliant API), and third-party scraped-data resellers (ticketsdata.com/parse.bot — legal + dependency risk).

---

## Appendix — Explicit uncertainties to resolve before building

| Claim | Status | How to resolve |
|---|---|---|
| Meetup free-tier `keywordSearch` allowance | Unconfirmed — assumed Pro required | Test with a Pro trial token |
| Fever API Italian city coverage | Unconfirmed | Email `data-ai@feverup.com` |
| Actual Milan inventory *counts* per source | Not measured (APIs gated/blocked) | One-week manual probe with real keys |
| Eventbrite daily call cap | Unconfirmed on current docs | Test empirically |
| Songkick / Bandsintown / DICE pricing | Private | Submit partnership inquiry forms |
| Rome/Turin/Bologna/Naples live-event feeds | Not individually verified | Direct check per city |
| Italy-specific JSON-LD prevalence | Not measured | Spot-check top 20 target sources' page markup |
| Foursquare OS Places access mechanics | Migrated to portal/Iceberg token flow | Confirm download path at ingest |
| Google Places SKU pricing | Verified but Google adjusts periodically | Re-check before budget commit |

---

*Report compiled 2026-08-09 from four parallel research passes, each verifying against live documentation. All URLs cited inline. Coverage/inventory claims are qualitative where live measurement was impossible (gated or bot-protected sources) and are flagged as such.*
