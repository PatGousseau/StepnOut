import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  dedupeGrowthEvents,
  extractGrowthJsonLd,
  normalizeGrowthEvent,
  validateEventSelection,
} from "./growthEvents.ts";
const raw = {
  source_key: "library-club",
  title: "Library conversation club",
  description: "A structured community conversation with a facilitator.",
  category: "community",
  source_url: "https://example.org/events/library-club",
  kind: "event",
  starts_at: "2030-09-06T14:00:00+02:00",
  location: "Public library",
  latitude: 43.34,
  longitude: 12.91,
  status: "active",
  verified_at: "2026-09-01T12:00:00Z",
};
Deno.test("normalization preserves unknown cost and accessibility and source identity", () => {
  const e = normalizeGrowthEvent(raw, "municipal");
  assertEquals(e.cost_eur, null);
  assertEquals(e.wheelchair_accessible, null);
  assertEquals(e.starts_at, "2030-09-06T12:00:00.000Z");
  assertEquals(e.provenance[0].source_key, "library-club");
});
Deno.test("normalization rejects timezone ambiguity, coordinates, future verification and fabricated prices", () => {
  for (
    const patch of [{ starts_at: "2030-09-06T14:00:00" }, { latitude: null }, {
      cost_eur: -1,
    }, { verified_at: "2099-01-01T00:00:00Z" }]
  ) assertThrows(() => normalizeGrowthEvent({ ...raw, ...patch }, "municipal"));
});
Deno.test("dedup preserves provenance without replacing fresh unknown facts with older claims", () => {
  const a = normalizeGrowthEvent(raw, "municipal");
  const b = normalizeGrowthEvent({
    ...raw,
    cost_eur: 0,
    verified_at: "2026-08-01T12:00:00Z",
  }, "community");
  const [merged] = dedupeGrowthEvents([b, a]);
  assertEquals(merged.provenance.length, 2);
  assertEquals(merged.cost_eur, null);
  assertEquals(
    dedupeGrowthEvents([a, { ...b, starts_at: "2030-09-07T12:00:00Z" }]).length,
    2,
  );
});
Deno.test("JSON-LD extraction preserves cancellation and excludes generic or timezone-ambiguous records", () => {
  const node = {
    "@type": "Event",
    name: raw.title,
    description: raw.description,
    url: raw.source_url,
    startDate: raw.starts_at,
    eventStatus: "https://schema.org/EventCancelled",
    location: { name: "Library", geo: { latitude: 43.34, longitude: 12.91 } },
  };
  const html = `<script type="application/ld+json">${
    JSON.stringify({
      "@graph": [node, { ...node, url: "https://example.org/" }, {
        ...node,
        startDate: "2030-09-06",
      }],
    })
  }</script>`;
  const extracted = extractGrowthJsonLd(
    html,
    "https://example.org/calendar",
    "municipal",
  );
  assertEquals(extracted.length, 1);
  assertEquals(extracted[0].status, "cancelled");
  assertEquals(extracted[0].cost_eur, null);
});
Deno.test("selection supports no event and rejects invented IDs, missing fit and non-observable empty steps", () => {
  const e = { ...normalizeGrowthEvent(raw, "municipal"), id: "event-1" };
  const noMatch = {
    event_id: null,
    explanation: "Your work meeting is the simpler opportunity.",
    fit: {},
    next_step: null,
  };
  assertEquals(validateEventSelection(noMatch, [e]).event_id, null);
  assertThrows(() =>
    validateEventSelection({ ...noMatch, event_id: "invented" }, [e])
  );
  assertThrows(() =>
    validateEventSelection({ ...noMatch, event_id: e.id }, [e])
  );
  assertThrows(() =>
    validateEventSelection({ ...noMatch, next_step: {} }, [e])
  );
});
