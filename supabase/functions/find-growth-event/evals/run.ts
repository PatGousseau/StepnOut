import {
  eventModelContext,
  GROWTH_EVENT_MODEL,
  GROWTH_EVENT_PROMPT,
  GROWTH_EVENT_PROMPT_VERSION,
  GROWTH_EVENT_SCHEMA,
  normalizeGrowthEvent,
  validateEventSelection,
} from "../../_shared/growthEvents.ts";
const apiKey = Deno.env.get("OPENAI_API_KEY");
if (!apiKey) throw new Error("OPENAI_API_KEY required");
const runs = Number(Deno.args[0] || 3);
const event = {
  ...normalizeGrowthEvent({
    source_key: "community-table",
    title: "Library conversation table",
    description:
      "A public, facilitated, small-group conversation table at the municipal library. Adults may join without booking; no purchase required. Wheelchair entrance and accessible toilet confirmed by the library.",
    category: "community",
    source_url: "https://example.org/library/table",
    kind: "event",
    starts_at: "2030-09-07T14:00:00+02:00",
    location: "Municipal library in Fabriano",
    latitude: 43.34,
    longitude: 12.91,
    cost_eur: 0,
    wheelchair_accessible: true,
    accessibility: "Step-free entrance and accessible toilet",
    status: "active",
    verified_at: "2026-09-05T12:00:00Z",
  }, "synthetic-library"),
  id: "event-library",
  verified_at: "2030-09-06T12:00:00Z",
};
const base = {
  locale: "English",
  now: "2030-09-06T12:00:00Z",
  confirmed_plan: {
    goal: "Build a few genuine local connections through repeated contact",
    formulation: "A suitable accessible setting may be the missing opportunity",
    current_focus: "Initiate brief conversations in a structured setting",
  },
  original_evidence: {
    situation: "Recently relocated adult who knows no one locally",
    challenge_level: "gentle",
    boundaries: "No nightlife or paid events; wheelchair access required",
  },
  preferences: {
    availability: "Saturday afternoon",
    wheelchair_required: true,
    max_cost_eur: 0,
    travel_radius: 5,
  },
  current_step: null,
  recent_user_evidence: [],
  prior_event_rejections: [],
  candidates: [eventModelContext(event)],
};
const cases = [
  { id: "accessible-small-city", input: base, select: true },
  {
    id: "immediate-workplace",
    input: {
      ...base,
      confirmed_plan: {
        goal: "Contribute earlier to work meetings",
        current_focus:
          "Offer one relevant point in tomorrow's recurring meeting",
      },
      original_evidence: {
        situation: "Remote professional with a meeting tomorrow",
        boundaries: "Professional contexts only",
      },
    },
    select: false,
  },
  {
    id: "ordinary-opportunity-better",
    input: {
      ...base,
      original_evidence: {
        situation:
          "I already attend an accessible free drawing class every Saturday with familiar people. I can talk there and prefer not adding another outing.",
      },
    },
    select: false,
  },
  {
    id: "budget-timing-mismatch",
    input: {
      ...base,
      preferences: {
        ...base.preferences,
        availability: "Weekday mornings only",
      },
    },
    select: false,
  },
  {
    id: "unknown-accessibility",
    input: {
      ...base,
      candidates: [eventModelContext({
        ...event,
        wheelchair_accessible: null,
        accessibility: null,
        description:
          "A facilitated conversation table; accessibility has not been verified.",
      })],
    },
    select: false,
  },
  {
    id: "rejection-feedback",
    input: {
      ...base,
      prior_event_rejections: [{
        rejection_reason: "wrong_type",
        growth_events: {
          title: "Facilitated library conversation table",
          category: "community",
          location: "Municipal library in Fabriano",
        },
      }],
    },
    select: false,
  },
  {
    id: "creative-practice",
    input: {
      ...base,
      confirmed_plan: {
        goal: "Reconnect with drawing for personal enjoyment",
        current_focus: "Pick up a pencil during a short break",
      },
      original_evidence: {
        situation:
          "Parent with unpredictable caregiving responsibilities, interested in drawing at home",
        boundaries: "No social challenges or scheduled outings",
      },
    },
    select: false,
  },
  {
    id: "overchallenge",
    input: {
      ...base,
      original_evidence: {
        situation:
          "Just relocated. A facilitated group is currently too much; I want one familiar person with me before joining a group.",
        challenge_level: "gentle",
        boundaries: "No group participation yet",
      },
    },
    select: false,
  },
];
const path = new URL(
  `./artifacts/${new Date().toISOString().replaceAll(":", "-")}/`,
  import.meta.url,
);
await Deno.mkdir(path, { recursive: true });
let failures = 0;
for (const fixture of cases) {
  for (let run = 1; run <= runs; run++) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        model: GROWTH_EVENT_MODEL,
        temperature: 0.25,
        input: [{ role: "system", content: GROWTH_EVENT_PROMPT }, {
          role: "user",
          content: JSON.stringify(fixture.input),
        }],
        text: {
          format: {
            type: "json_schema",
            name: "growth_event_selection",
            strict: true,
            schema: GROWTH_EVENT_SCHEMA,
          },
        },
      }),
    });
    if (!response.ok) throw new Error(`Model status ${response.status}`);
    const body = await response.json();
    const raw = body.output?.flatMap((i: { content?: unknown[] }) =>
      i.content || []
    ).find((i: { type?: string }) => i.type === "output_text")?.text;
    let result: unknown;
    let passed = false;
    let error: string | null = null;
    try {
      result = validateEventSelection(
        JSON.parse(raw),
        fixture.input.candidates,
      );
      passed =
        !!(result as { event_id: string | null }).event_id === fixture.select;
    } catch (e) {
      error = String(e);
    }
    if (!passed) failures++;
    await Deno.writeTextFile(
      new URL(`${fixture.id}-${run}.json`, path),
      JSON.stringify(
        {
          fixture,
          run,
          model: GROWTH_EVENT_MODEL,
          prompt_version: GROWTH_EVENT_PROMPT_VERSION,
          raw,
          result,
          expected_selection_pass: passed,
          error,
        },
        null,
        2,
      ),
    );
    console.log(`${passed ? "PASS" : "FAIL"} ${fixture.id} run ${run}`);
  }
}
console.log(`Artifacts: ${path.pathname}`);
if (failures) Deno.exit(1);
