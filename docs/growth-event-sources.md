# Growth event opportunities

Issue #282 uses a shared inventory of reviewed public events and place-based opportunities. The app finds a match only on request, using the confirmed plan, current step, recent evidence, practical preferences, and prior rejections. It may select no event. Events never enter sidequests or daily draws.

## Source activation and refresh

Sources are disabled by default. A maintainer registers a source in `growth_event_sources` with its public HTTPS URL, name, approximate area center, and an actual legal/partnership approval reference before enabling it. This implementation does not assert approval for any provider. Municipal calendars and authorized community listings can supply small-city inventory; no paid event API is required. Do not import fixtures into a deployed environment.

Import reviewed records using the maintainer's configured Supabase credentials:

```sh
deno run --no-lock --allow-env --allow-read --allow-net scripts/growth-events/import.ts source-id reviewed-records.json
```

The JSON array follows `GrowthEvent` in the shared event module, omitting `id`, `source_id`, and `provenance` (assigned by the importer). Include a stable provider `source_key`, direct `source_url`, description, category, exact venue coordinates, actual verification timestamp, and status. Dates require a timezone. Prices are EUR; omit unknown price/accessibility rather than guessing. Timed events need `starts_at`; places need explicit opening/availability text. Set cancelled or unverified records accordingly, retaining their stable key. Re-importing updates the same identity, preserving feedback and active-step references. New imports do not change a source's approval status.

Only records from the registered HTTPS host may be imported. Fetching a page is not proof of event freshness: the reviewer must verify the specific occurrence, availability, cost, and access details at the source. Refresh timed listings within 48 hours and places within seven days; expired/stale/cancelled records become ineligible automatically. Recheck cancellation updates as close to the occurrence as practical. The UI links participants back to the source for current details.

The importer also accepts an approved HTTPS page URL as its second argument. It extracts explicit [Schema.org Event](https://schema.org/Event) JSON-LD occurrences with direct source links, timezone-aware dates, and venue coordinates; redirects and pages over 2 MB are rejected. Only explicitly scheduled occurrences are eligible automatically; unknown status and age-qualified entries remain unverified for review. Missing prices and accessibility remain unknown. Source approval must cover this extraction use. Automated broad discovery is not enabled; authorized provider feeds can use the same normalized format. Records restricted above age 18 are conservatively excluded by the current matcher.

## Matching and privacy

Users select an approximate supported area and radius, never precise live location. Area centers are rounded to two decimal places before storage; distance is measured from that center, not a user's home. Availability, cost, accessibility, and liked/disliked event types remain explicit preferences. Numeric budget and wheelchair requirements are hard filters; the model must also honor all narrative boundaries. Rejected or already accepted occurrences are excluded from later selection, and recent rejection reasons inform matching without changing stable preferences.

Duplicate candidates with the same normalized title/start and a venue within 100m are collapsed deterministically using the freshest record, preserving source provenance. Unknown fields are not filled from older records. Place suggestions remain places, never invented scheduled events. The step criterion must describe behavior under the participant's control.

Acceptance checks the source, event freshness, active plan/step, evidence version, and exact preference snapshot again under the same per-user transaction lock used by guidance. Changed context requires a new match. Deleting preferences removes stored location snapshots and suggestion history. Separately accepted steps remain in the user's plan. Selection history is owner-readable; source activation and inventory writes require trusted maintainer credentials.

The exact event record used for generation is also saved and compared before acceptance; refreshed or changed details require a new match. Inventory writes serialize with acceptance so a concurrent cancellation cannot slip through. Minimal `growth_event_requests` quota records retain only request ID, user ID, and timestamp after preference deletion; they prevent deletion/recreation from bypassing the 12-requests/hour limit and are removed on account deletion. Events default to the Italian `Europe/Rome` timezone, which reviewed records may override with a valid IANA timezone.

## Existing research

PR #275 remains unchanged and reproducible on `feat/events-sourcing-research`: `cd research/harness && npx tsc -p tsconfig.json && node dist/run.js`. Its normalization, provenance, freshness and small-city findings inform this integration. The old weekly assignment, automatic fallback mission, and diversity scoring are not the personalized-plan matcher. The implementation deliberately supports an honest no-match result.
