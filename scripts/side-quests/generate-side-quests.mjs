#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { Agent } from "undici";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const MODEL = process.env.OPENAI_MODEL || "gpt-5.5";
const SIDE_QUEST_TARGET = Number(process.env.SIDE_QUEST_COUNT || 300);
const BRAINSTORM_BATCH_SIZE = Number(process.env.BRAINSTORM_BATCH_SIZE || 40);
const BRAINSTORM_OVERAGE = Number(process.env.BRAINSTORM_OVERAGE || 2.0);
const MAX_OUTPUT_TOKENS = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 120000);
const OPENAI_HEADERS_TIMEOUT_MS = Number(process.env.OPENAI_HEADERS_TIMEOUT_MS || 10 * 60 * 1000);
const OPENAI_BODY_TIMEOUT_MS = Number(process.env.OPENAI_BODY_TIMEOUT_MS || 10 * 60 * 1000);
const OPENAI_BACKGROUND_MODE = process.env.OPENAI_BACKGROUND_MODE !== "0";
const OPENAI_BACKGROUND_POLL_MS = Number(process.env.OPENAI_BACKGROUND_POLL_MS || 5000);
const ENABLE_TOPUP = process.env.ENABLE_TOPUP !== "0";
const MAX_TOPUP_CALLS = Number(process.env.MAX_TOPUP_CALLS || 6);

// Per-step reasoning effort. Allowed: "none" | "low" | "medium".
// "high" and "xhigh" are intentionally disallowed.
// (gpt-5.x uses "none" to fully disable reasoning; there is no "minimal" for this family.)
const ALLOWED_EFFORTS = new Set(["none", "low", "medium"]);
function validateEffort(name, value) {
  if (!ALLOWED_EFFORTS.has(value)) {
    throw new Error(
      `${name} must be one of: none, low, medium. Got: "${value}". "high" is intentionally not allowed.`
    );
  }
  return value;
}
const BRAINSTORM_EFFORT = validateEffort("BRAINSTORM_EFFORT", process.env.BRAINSTORM_EFFORT || "medium");
const CRITIQUE_EFFORT = validateEffort("CRITIQUE_EFFORT", process.env.CRITIQUE_EFFORT || "medium");
const TOPUP_EFFORT = validateEffort("TOPUP_EFFORT", process.env.TOPUP_EFFORT || "medium");
const COVERAGE_EFFORT = validateEffort("COVERAGE_EFFORT", process.env.COVERAGE_EFFORT || "none");
const ANNOTATE_EFFORT = validateEffort("ANNOTATE_EFFORT", process.env.ANNOTATE_EFFORT || "none");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const OUTPUT_DIR = path.join(ROOT, "output");
const openaiDispatcher = new Agent({
  headersTimeout: OPENAI_HEADERS_TIMEOUT_MS,
  bodyTimeout: OPENAI_BODY_TIMEOUT_MS,
});

const GOAL_TAGS = [
  "novelty",
  "fun",
  "connection",
  "momentum",
  "creativity",
  "better_stories",
];

const BARRIER_TAGS = [
  "low_energy",
  "overthinking",
  "spending_money",
  "planning",
  "social_hesitation",
  "going_far",
  "not_knowing",
  "feeling_self_conscious",
];

const CONTEXT_TAGS = [
  "at_home",
  "near_home",
  "out_in_the_city",
  "with_other_people",
  "solo",
];

const TYPE_TAGS = [
  "playful",
  "creative",
  "exploratory",
  "social",
  "reflective",
  "growth_edge",
];

const OUTCOME_TAGS = [
  "did_something_unusual",
  "more_stories",
  "days_less_repetitive",
  "followed_impulses",
  "explored_more",
  "felt_more_alive",
  "shared_more_with_people",
];

const STRETCH_LEVELS = ["easy_win", "moderate_push", "bold_nudge"];
const AVOID_FLAGS = [
  "spending_money",
  "talking_to_strangers",
  "group_social_situations",
  "lots_of_planning",
  "physically_demanding",
  "nighttime",
  "going_far",
];

// =============================================================================
// SCHEMAS
// =============================================================================

const seedQuestSchema = {
  type: "object",
  properties: {
    quests: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
        },
        required: ["title", "summary"],
        additionalProperties: false,
      },
    },
  },
  required: ["quests"],
  additionalProperties: false,
};

const critiqueResultSchema = {
  type: "object",
  properties: {
    kept_indices: {
      type: "array",
      items: { type: "integer" },
    },
    rejection_notes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          reason: { type: "string" },
        },
        required: ["index", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["kept_indices", "rejection_notes"],
  additionalProperties: false,
};

const coverageTagSchema = {
  type: "object",
  properties: {
    quests: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          context_tags: {
            type: "array",
            items: { type: "string", enum: CONTEXT_TAGS },
          },
          stretch_level: { type: "string", enum: STRETCH_LEVELS },
          type_tags: {
            type: "array",
            items: { type: "string", enum: TYPE_TAGS },
          },
          night_level: { type: "integer" },
        },
        required: ["index", "context_tags", "stretch_level", "type_tags", "night_level"],
        additionalProperties: false,
      },
    },
  },
  required: ["quests"],
  additionalProperties: false,
};

const singleAnnotatedQuestSchema = {
  type: "object",
  properties: {
    quest: {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        goal_tags: {
          type: "array",
          items: { type: "string", enum: GOAL_TAGS },
        },
        barrier_tags: {
          type: "array",
          items: { type: "string", enum: BARRIER_TAGS },
        },
        context_tags: {
          type: "array",
          items: { type: "string", enum: CONTEXT_TAGS },
        },
        type_tags: {
          type: "array",
          items: { type: "string", enum: TYPE_TAGS },
        },
        outcome_tags: {
          type: "array",
          items: { type: "string", enum: OUTCOME_TAGS },
        },
        stretch_level: {
          type: "string",
          enum: STRETCH_LEVELS,
        },
        cost_level: { type: "integer" },
        planning_level: { type: "integer" },
        social_level: { type: "integer" },
        physical_level: { type: "integer" },
        distance_level: { type: "integer" },
        night_level: { type: "integer" },
        avoid_flags: {
          type: "array",
          items: { type: "string", enum: AVOID_FLAGS },
        },
      },
      required: [
        "title",
        "summary",
        "goal_tags",
        "barrier_tags",
        "context_tags",
        "type_tags",
        "outcome_tags",
        "stretch_level",
        "cost_level",
        "planning_level",
        "social_level",
        "physical_level",
        "distance_level",
        "night_level",
        "avoid_flags",
      ],
      additionalProperties: false,
    },
  },
  required: ["quest"],
  additionalProperties: false,
};

// =============================================================================
// IO / API HELPERS
// =============================================================================

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readJsonIfExists(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function getOutputText(responseJson) {
  if (typeof responseJson.output_text === "string" && responseJson.output_text.trim()) {
    return responseJson.output_text;
  }

  if (!Array.isArray(responseJson.output)) {
    throw new Error(`No output text found. Raw response:\n${JSON.stringify(responseJson, null, 2)}`);
  }

  const chunks = [];
  for (const item of responseJson.output) {
    if (item.type === "refusal") {
      throw new Error(`Model refusal: ${item.refusal || "refused"}`);
    }

    if (!Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
      if (content.type === "text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
      if (content.type === "refusal") {
        throw new Error(`Model refusal: ${content.refusal || "refused"}`);
      }
    }
  }

  const text = chunks.join("").trim();
  if (!text) {
    throw new Error(`No output text found. Raw response:\n${JSON.stringify(responseJson, null, 2)}`);
  }
  return text;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchOpenAIJson(url, options, errorLabel) {
  let response;
  try {
    response = await fetch(url, {
      dispatcher: openaiDispatcher,
      ...options,
    });
  } catch (error) {
    const cause = error && typeof error === "object" && "cause" in error ? error.cause : null;
    const details =
      cause && typeof cause === "object"
        ? JSON.stringify(
            Object.fromEntries(
              Object.entries(cause).filter(([, value]) => value !== undefined)
            ),
            null,
            2
          )
        : String(cause || "no additional cause");

    throw new Error(
      [
        `${errorLabel}.`,
        `Model: ${MODEL}`,
        `Max output tokens: ${MAX_OUTPUT_TOKENS}`,
        `Headers timeout ms: ${OPENAI_HEADERS_TIMEOUT_MS}`,
        `Body timeout ms: ${OPENAI_BODY_TIMEOUT_MS}`,
        `Cause: ${details}`,
      ].join("\n")
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function pollBackgroundResponse(responseId, schemaName) {
  let attempts = 0;
  let lastStatus = null;

  while (true) {
    const responseJson = await fetchOpenAIJson(
      `https://api.openai.com/v1/responses/${responseId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      },
      `Fetch failed while polling OpenAI background response "${responseId}" for schema "${schemaName}"`
    );

    const status = responseJson.status || "unknown";
    if (status !== lastStatus || attempts % 6 === 0) {
      console.log(`  [bg ${responseId}] ${schemaName}: ${status}`);
      lastStatus = status;
    }

    if (status === "completed") {
      return responseJson;
    }

    if (status === "failed" || status === "cancelled" || status === "incomplete") {
      throw new Error(
        `OpenAI background response ${responseId} for schema "${schemaName}" ended with status "${status}": ${JSON.stringify(responseJson, null, 2)}`
      );
    }

    attempts += 1;
    await sleep(OPENAI_BACKGROUND_POLL_MS);
  }
}

async function callStructuredOutput({ systemPrompt, userPrompt, schemaName, schema, background = false, effort }) {
  const requestBody = {
    model: MODEL,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema,
      },
    },
  };

  if (effort) {
    requestBody.reasoning = { effort };
  }

  if (background) {
    requestBody.background = true;
    requestBody.store = true;
  }

  const responseJson = await fetchOpenAIJson(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
    `Fetch failed while calling OpenAI for schema "${schemaName}"`
  );

  const finalJson = background ? await pollBackgroundResponse(responseJson.id, schemaName) : responseJson;
  const outputText = getOutputText(finalJson);
  return JSON.parse(outputText);
}

// =============================================================================
// PROMPT BUILDING BLOCKS
// =============================================================================

const QUALITY_BAR = `
Quality bar — every quest must satisfy at least one of:
- AGENCY: the user CREATES, BUILDS, LEARNS, PERFORMS, or INITIATES something concrete
- EXCHANGE: the user has a real interaction with another person (a request, a gift, a conversation, a question, a performance)
- DISCOVERY: the user encounters something specific and surprising that yields a story they'd tell someone

If you can't answer "what does the user create, exchange, or initiate today?", the quest fails.
A real, specific story or feeling must be the predictable outcome.

The story or counterparty-exchange must happen DURING the quest itself, not later as a downstream consequence.
A quest that just sets something in motion (booking a ticket for next week, practicing saying no IF someone asks, wearing something bold IF someone comments) fails the test — the payoff is hypothetical or deferred.
Pick quests where the meaningful moment is built into the action itself: the conversation happens today, the call happens today, the thing is delivered today, the song is sung today.
`.trim();

const FORBIDDEN_ARCHETYPES = `
FORBIDDEN ARCHETYPES (real failures from a previous catalog we are replacing — do not generate anything in these shapes):

1. "Walk through area, observe N specimens of X, pick a favorite"
   Bad examples to avoid: best public door handle, best bench, best tree, best typography on signs,
   best shadow, best microclimate corner, best public restroom, best mascot, best handmade sign.

2. "Set a tiny budget, buy one small cheap item, use it once today"
   Bad examples to avoid: a single lemon, a $1 candle, a cheap hook, the cheapest bouquet, a $5 spice,
   the cheapest menu item just to try it.

3. "Enter a public place but do the absolute minimum and leave before any real commitment"
   Bad examples to avoid: museum gift shop only, gallery for exactly 30 minutes, hotel lobby for 10 minutes,
   civic meeting for 20 minutes, hospital lobby art briefly, mall walk without buying.

4. "Do a household chore framed as ritual"
   Bad examples to avoid: clear the floor in 15 minutes, polish shoes, fold laundry, clean one object,
   pack a donation bag, fix a small thing the user already needed to fix anyway.

5. "Apply a tiny visual constraint to a familiar walk and count instances"
   Bad examples to avoid: find 10 circles, count shadows, find 5 handwritten signs, look for textures.

6. "Sit somewhere and notice things for N minutes" with no further action
   Bad examples to avoid: bird watch from one spot, sky watch, observe a construction site, listen to a city soundscape.

Concrete bad-quest titles from the previous catalog (do NOT generate similar concepts):
- "La buona penna" — use your best pen to write an ordinary note
- "Il mazzo da cinque dollari" — buy the cheapest possible bouquet
- "Reset del pavimento in quindici minuti" — clear the floor
- "La maniglia perfetta" — find the most satisfying public door handle
- "La passeggiata comune, un solo obiettivo" — walk usual route counting circles
- "Aggiornamento da un Dollaro" — buy a $1 thing to slightly upgrade something
- "Caccia alle bandiere del quartiere" — walk around and count flags
- "Tipografia dei cartelli del quartiere" — observe sign typography
- "Lettura alla Candela Singola" — read by a single candle for 20 minutes
- "Test del clima d'angolo" — find the windiest corner of the block
`.trim();

const GOOD_ARCHETYPES = `
TARGET ARCHETYPES (real successes from the previous catalog — aim for shapes like these):
- Borrow a small skill from a friend (they teach you something concrete in 20 minutes)
- Micro-reunion with an old friend for exactly one hour
- Cook a borrowed recipe from someone and report back to them
- Perform one song, poem, or reading for one person you trust
- Practice saying no, gently and clearly, to one optional thing today
- Send a tiny invitation for "just one stop" — coffee, errand, single drink
- Call a relative to ask where a specific family story actually happened
- Finally book the thing you keep postponing — class, table, ticket
- Sing one song at karaoke or in front of one person
- Try a beginner's class or trial session you've been curious about
- Host one specific small thing — tea, snack, song, plant cutting
- Make and deliver a tiny treat to a specific neighbor or friend
- Write and deliver a sincere specific thank-you for something real
- Wear something slightly bolder than usual, deliberately

These work because they require AGENCY, involve a real COUNTERPARTY, and produce a SPECIFIC story.
`.trim();

const CULTURAL_GROUNDING = `
CULTURAL GROUNDING (Italian audience):
Write in contemporary natural Italian. Ground quests in specifically Italian institutions where appropriate:
sagre, aperitivo, bar nazionali, edicole, mercati rionali, biblioteche comunali, treni regionali,
sale parrocchiali, bocciofile, ricevitorie, piazze, lungomare/lungofiume, centri sociali,
oratori, circoli, parchi pubblici, panetterie/pasticcerie di quartiere, fruttivendoli, tabaccherie.

Avoid translated American concepts: diner, barcade, bodega, food truck, photo booth as default,
strip mall, suburb, "$5 things," drugstore, food court without local equivalent.
Don't assume coastal city, mall culture, or commute-by-car as defaults.
`.trim();

const TONE_GUIDANCE = `
TONE VARIETY:
Only a minority of quests should feel whimsical or playful.
The majority should feel: grounded, curious, social, reflective, intimate, cinematic, or quietly adventurous.
Vary the emotional register, not just the activity type.

The previous catalog collapsed into a single failure tone: gentle observational solo near-home reflection.
Push away from that default. Quests that involve other people, real risk, real commitment, or
real creation should outnumber quiet-observation quests.
`.trim();

// =============================================================================
// STEP 1: BRAINSTORM SEEDS (batched, with archetype suppression context)
// =============================================================================

const SEED_SYSTEM_PROMPT = [
  "You generate side quests for a consumer app that helps users step outside their comfort zone.",
  "A side quest is a one-day activity that breaks routine.",
  "Each quest has just two text fields, both in natural contemporary Italian:",
  "- title: a short imperative-action phrase that says WHAT THE USER WILL DO, readable at a glance. Use the imperative second-person form (tu): 'Impara X', 'Porta X', 'Cucina X', 'Chiedi X', 'Vai a X', 'Fatti Y'. 4-9 words. NOT a noun phrase or 'book-title' style: avoid 'Il messaggero del complimento tecnico', 'La voce del mercato coperto', 'Cartolina sonora' — those read as headings, not actions. Instead: 'Ringrazia chi resta invisibile', 'Raccogli al mercato una storia su un ingrediente', 'Registra una cartolina audio e mandala'.",
  "- summary: around two sentences. Sentence 1 says WHAT the quest is. Sentence 2 says HOW the user does it — the key concrete actions, in order. Together they should give the user everything they need to decide on the quest AND actually do it.",
  "",
  "The summary is the only text the user will see. Treat it as both pitch and instructions.",
  "",
  QUALITY_BAR,
  "",
  FORBIDDEN_ARCHETYPES,
  "",
  GOOD_ARCHETYPES,
  "",
  CULTURAL_GROUNDING,
  "",
  TONE_GUIDANCE,
  "",
  "FORBIDDEN PHRASING IN SUMMARIES — these are filler tics from the previous catalog. Do not use them:",
  "- 'scegli il tuo preferito' / 'proclama il vincitore' / any 'pick a favorite of X' closing",
  "- 'torna a casa prima che si faccia tardi' / 'vai via prima che [crowd/area/cosa]' (unless genuinely safety-relevant)",
  "- 'goditi il momento' / 'lascia che la sorpresa faccia parte' / similar generic warm closings",
  "- 'osserva per N minuti' as the main action with no follow-up",
  "- 'nota X' as a substitute for the user actually doing something",
  "",
  "The summary should be concrete and specific. If the second sentence reads like generic warm filler, rewrite it with real action.",
  "",
  "Return valid JSON only.",
].join("\n");

async function generateSeedBatch({ batchIndex, batchSize, allPreviousTitles, biasNote }) {
  const userPromptParts = [
    `Generate exactly ${batchSize} unique side quest concept seeds.`,
    "",
    "Each must have:",
    "- title: short, vivid, Italian",
    "- summary: around two sentences in Italian. Sentence 1 = WHAT (the quest concept). Sentence 2 = HOW (the concrete actions the user takes). Concrete, specific, no filler closings.",
    "",
    "INTRA-BATCH ARCHETYPE UNIQUENESS:",
    "Within this single batch, no two quests may share an archetype.",
    "An 'archetype' is the underlying shape, not the surface details. These count as the same archetype:",
    "- 'invite one person for a tiny micro-meet (coffee, walk, single drink)' — pick one and move on",
    "- 'perform one short thing (song, poem, reading) for one person' — pick one and move on",
    "- 'borrow a recipe / skill / piece of advice from someone and act on it today' — pick one and move on",
    "- 'send a written note / thank-you / postcard with a real message' — pick one and move on",
    "- 'call a specific person to ask about a specific thing' — pick one and move on",
    "After you write a quest, scan back through the batch. If a later quest shares its underlying shape, replace it with a quest in a completely different shape.",
    "",
    biasNote || "",
  ];

  if (allPreviousTitles.length > 0) {
    userPromptParts.push("");
    userPromptParts.push(`You have already produced ${allPreviousTitles.length} seeds in earlier batches.`);
    userPromptParts.push("Do not produce concepts that overlap with any of these titles or their themes:");
    for (const t of allPreviousTitles) userPromptParts.push(`- ${t}`);
  }

  userPromptParts.push("");
  userPromptParts.push(`Return exactly ${batchSize} concepts. Valid JSON only.`);

  const userPrompt = userPromptParts.filter((s) => s !== "").join("\n");

  const payload = await callStructuredOutput({
    systemPrompt: SEED_SYSTEM_PROMPT,
    userPrompt,
    schemaName: "side_quest_seed_batch",
    schema: seedQuestSchema,
    background: OPENAI_BACKGROUND_MODE,
    effort: BRAINSTORM_EFFORT,
  });

  if (!payload?.quests || !Array.isArray(payload.quests)) {
    throw new Error(`Seed batch ${batchIndex + 1} returned no quests array`);
  }
  if (payload.quests.length !== batchSize) {
    console.warn(
      `  WARN: Seed batch ${batchIndex + 1} produced ${payload.quests.length} seeds, expected ${batchSize}. Continuing with what was returned.`
    );
  }
  return payload.quests;
}

async function generateAllSeeds({ targetCount, onProgress, initialSeeds = [] }) {
  const totalSeeds = Math.ceil(targetCount * BRAINSTORM_OVERAGE);
  const totalBatches = Math.ceil(totalSeeds / BRAINSTORM_BATCH_SIZE);
  const allSeeds = [...initialSeeds];

  while (allSeeds.length < totalSeeds) {
    const remaining = totalSeeds - allSeeds.length;
    const batchSize = Math.min(BRAINSTORM_BATCH_SIZE, remaining);
    if (batchSize <= 0) break;
    const batchIndex = Math.floor(allSeeds.length / BRAINSTORM_BATCH_SIZE);

    const titles = allSeeds.map((s) => s.title);
    const biasNote =
      allSeeds.length > 0
        ? "Bias this batch toward archetypes and tones that feel underrepresented above. " +
          "If the earlier batches lean near-home, solo, or observational, push hard toward social, with-other-people, " +
          "evening, bold, creating, performing, and connecting quests."
        : "";

    const batch = await generateSeedBatch({
      batchIndex,
      batchSize,
      allPreviousTitles: titles,
      biasNote,
    });
    allSeeds.push(...batch);

    if (onProgress) await onProgress(allSeeds, batchIndex + 1, totalBatches);
  }

  return allSeeds;
}

// =============================================================================
// STEP 2: CRITIQUE (single call over all seeds)
// =============================================================================

const CRITIQUE_SYSTEM_PROMPT = [
  "You are a strict quality reviewer for a side quest catalog.",
  "You receive a list of candidate quest seeds (title + summary).",
  "Your job: identify which to KEEP (the strong ones) and which to REJECT (filler, duplicates, failed archetypes).",
  "",
  "REJECT any seed that:",
  "1. Is pure observation with no action — walk and look, sit and notice, count instances",
  "2. Is a household chore reframed as ritual — cleaning, tidying, organizing one object",
  "3. Asks the user to buy one cheap small item with no real story payoff",
  "4. Asks the user to 'pick a favorite' of inanimate objects (handles, benches, trees, signs, etc.)",
  "5. Is 'enter a public space, do the minimum, leave before commitment'",
  "6. Is functionally a duplicate of another seed in the list — when 5 seeds boil down to the same idea, keep at most one",
  "7. Has a generic premise that could apply to many cities, people, or moods interchangeably",
  "8. Reads like a translated American concept (diner, food truck, barcade, bodega, mall, suburb)",
  "9. Has a summary that doesn't say concretely what the user DOES",
  "10. Could not produce a specific story the user would actually tell someone later",
  "",
  "KEEP only seeds where the user has AT LEAST ONE of:",
  "- AGENCY: creates, builds, learns, performs, initiates something concrete",
  "- EXCHANGE: has a real interaction with a real counterparty (person, response, outcome)",
  "- DISCOVERY: encounters something specific and surprising that yields a real story",
  "",
  "Be STRICT. It is better to reject 60% of seeds than to keep filler. The next step is expensive.",
  "When two seeds are near-duplicates or share an archetype, keep only the SINGLE strongest one.",
  "",
  "Return:",
  "- kept_indices: array of integers (0-based indices of seeds you keep)",
  "- rejection_notes: brief one-line reason for each REJECTED seed (e.g. 'duplicate of #12', 'observation only', 'chore', 'tiny purchase no story')",
  "",
  "Return valid JSON only.",
].join("\n");

async function critiqueSeeds(seeds) {
  const seedsList = seeds
    .map((s, i) => `${i}. ${s.title} — ${s.summary}`)
    .join("\n");

  const userPrompt = [
    `Review these ${seeds.length} candidate side quest seeds.`,
    "Return the 0-based indices to KEEP, plus brief rejection notes for the rest.",
    "",
    "Seeds:",
    seedsList,
    "",
    "Apply the rejection rules from your system prompt strictly. Return verdicts as JSON.",
  ].join("\n");

  const payload = await callStructuredOutput({
    systemPrompt: CRITIQUE_SYSTEM_PROMPT,
    userPrompt,
    schemaName: "side_quest_critique",
    schema: critiqueResultSchema,
    background: OPENAI_BACKGROUND_MODE,
    effort: CRITIQUE_EFFORT,
  });

  if (!Array.isArray(payload?.kept_indices)) {
    throw new Error("Critique payload missing kept_indices array");
  }

  // Sanity-check indices
  const validKept = payload.kept_indices.filter(
    (i) => Number.isInteger(i) && i >= 0 && i < seeds.length
  );
  if (validKept.length !== payload.kept_indices.length) {
    console.warn(
      `  WARN: critique returned ${payload.kept_indices.length} indices but only ${validKept.length} are in range`
    );
  }

  return { ...payload, kept_indices: validKept };
}

// =============================================================================
// STEP 3: COVERAGE TAGGING (single call over survivors)
// =============================================================================

const COVERAGE_SYSTEM_PROMPT = [
  "You tag side quest seeds along a few preference dimensions so we can measure catalog coverage.",
  "Be honest and conservative — choose tags that genuinely fit, not aspirationally.",
  "Return valid JSON only.",
].join("\n");

async function tagSurvivorsForCoverage(survivors) {
  const seedsList = survivors
    .map((s, i) => `${i}. ${s.title} — ${s.summary}`)
    .join("\n");

  const userPrompt = [
    `Tag these ${survivors.length} quest seeds for coverage analysis.`,
    "",
    `For each seed by index, provide:`,
    `- context_tags (1-3 of): ${CONTEXT_TAGS.join(", ")}`,
    `- stretch_level (one of): ${STRETCH_LEVELS.join(", ")}`,
    `- type_tags (1-3 of): ${TYPE_TAGS.join(", ")}`,
    `- night_level (0 or 1): 1 only if the quest genuinely requires evening/nighttime`,
    "",
    "Seeds:",
    seedsList,
    "",
    `Return tag entries for ALL ${survivors.length} seeds by index.`,
  ].join("\n");

  const payload = await callStructuredOutput({
    systemPrompt: COVERAGE_SYSTEM_PROMPT,
    userPrompt,
    schemaName: "side_quest_coverage_tags",
    schema: coverageTagSchema,
    background: OPENAI_BACKGROUND_MODE,
    effort: COVERAGE_EFFORT,
  });

  if (!Array.isArray(payload?.quests)) {
    throw new Error("Coverage tagging payload missing quests array");
  }
  return payload.quests;
}

// =============================================================================
// STEP 4: GAP IDENTIFICATION (pure function, no API)
// =============================================================================

function identifyCoverageGaps(taggedSurvivors) {
  const counts = {
    context: Object.fromEntries(CONTEXT_TAGS.map((t) => [t, 0])),
    stretch: Object.fromEntries(STRETCH_LEVELS.map((t) => [t, 0])),
    type: Object.fromEntries(TYPE_TAGS.map((t) => [t, 0])),
    night: { 0: 0, 1: 0 },
  };

  for (const tagged of taggedSurvivors) {
    for (const t of tagged.context_tags || []) {
      if (counts.context[t] !== undefined) counts.context[t]++;
    }
    if (counts.stretch[tagged.stretch_level] !== undefined) {
      counts.stretch[tagged.stretch_level]++;
    }
    for (const t of tagged.type_tags || []) {
      if (counts.type[t] !== undefined) counts.type[t]++;
    }
    if (tagged.night_level === 0 || tagged.night_level === 1) {
      counts.night[tagged.night_level]++;
    }
  }

  const total = taggedSurvivors.length;
  // Threshold: 8% of total, minimum 5. Below this, we consider a cell under-covered.
  const threshold = Math.max(5, Math.floor(total * 0.08));
  const gaps = [];

  for (const [k, v] of Object.entries(counts.context)) {
    if (v < threshold) gaps.push({ dimension: "context", value: k, current: v, target: threshold });
  }
  for (const [k, v] of Object.entries(counts.stretch)) {
    if (v < threshold) gaps.push({ dimension: "stretch", value: k, current: v, target: threshold });
  }
  for (const [k, v] of Object.entries(counts.type)) {
    if (v < threshold) gaps.push({ dimension: "type", value: k, current: v, target: threshold });
  }
  // Night is binary, lighter threshold (5% of total)
  const nightThreshold = Math.max(3, Math.floor(total * 0.05));
  if (counts.night[1] < nightThreshold) {
    gaps.push({ dimension: "night", value: "1", current: counts.night[1], target: nightThreshold });
  }

  // Sort gaps by severity (biggest deficit first)
  gaps.sort((a, b) => (a.current - a.target) - (b.current - b.target));

  return { counts, gaps, total, threshold };
}

// =============================================================================
// STEP 5: TARGETED TOP-UPS (one call per gap)
// =============================================================================

async function generateTargetedFill({ gap, existingTitles }) {
  const need = Math.max(1, gap.target - gap.current);

  const dimensionDescriptions = {
    context: {
      at_home: "happens primarily AT HOME (the user stays inside or in their building)",
      near_home: "happens in the user's immediate neighborhood (walkable, very close to home)",
      out_in_the_city: "happens further out in the city, requiring transit or a real outing",
      with_other_people: "explicitly involves another person — friend, family, partner, neighbor, stranger",
      solo: "is best experienced alone",
    },
    stretch: {
      easy_win: "an EASY WIN — low friction, low risk, accessible even on a tired day",
      moderate_push: "a MODERATE PUSH — some courage, planning, or new behavior required",
      bold_nudge: "a BOLD NUDGE — genuinely outside comfort zone, requires real bravery or commitment",
    },
    type: {
      playful: "PLAYFUL — silly, fun, lighthearted",
      creative: "CREATIVE — making, building, designing, expressing",
      exploratory: "EXPLORATORY — going somewhere new or seeing something differently",
      social: "SOCIAL — interactions with other people are central",
      reflective: "REFLECTIVE — quiet, contemplative, inward",
      growth_edge: "GROWTH EDGE — pushing a personal limit, trying something they've avoided",
    },
    night: {
      "1": "NIGHTTIME — happens after dark and the nighttime quality is essential to it",
    },
  };

  const dimensionDescription =
    dimensionDescriptions[gap.dimension][gap.value] || `${gap.dimension}/${gap.value}`;

  const userPromptParts = [
    `Generate exactly ${need} side quest concept seeds that specifically serve users wanting:`,
    `>>> ${dimensionDescription} <<<`,
    "",
    "All quality rules from your system prompt still apply.",
    "NO observation-only, NO chores, NO 'buy one cheap thing', NO 'pick a favorite of objects'.",
    "Each quest must have AGENCY, EXCHANGE, or DISCOVERY.",
    "Each quest must produce a specific story the user would actually tell someone.",
    "",
  ];

  if (existingTitles.length > 0) {
    userPromptParts.push("Do not duplicate or near-duplicate any of these existing titles:");
    for (const t of existingTitles) userPromptParts.push(`- ${t}`);
    userPromptParts.push("");
  }

  userPromptParts.push(`Return exactly ${need} concepts as JSON.`);

  const payload = await callStructuredOutput({
    systemPrompt: SEED_SYSTEM_PROMPT,
    userPrompt: userPromptParts.join("\n"),
    schemaName: "side_quest_targeted_fill",
    schema: seedQuestSchema,
    background: OPENAI_BACKGROUND_MODE,
    effort: TOPUP_EFFORT,
  });

  return Array.isArray(payload?.quests) ? payload.quests : [];
}

// =============================================================================
// ORCHESTRATOR
// =============================================================================

async function runPipeline() {
  await ensureOutputDir();
  const resumeStamp = process.env.STAMP;
  const stamp = resumeStamp || timestamp();

  console.log(`\n=== Side Quest Pipeline ===`);
  console.log(`Target: ${SIDE_QUEST_TARGET} | Overage: ${BRAINSTORM_OVERAGE}x | Model: ${MODEL}`);
  console.log(`Stamp: ${stamp}${resumeStamp ? " (resuming from existing files)" : ""}\n`);

  // ----- Step 1: Brainstorm seeds in batches -----
  const seedsPath = path.join(OUTPUT_DIR, `${stamp}.seeds.json`);
  const targetSeeds = Math.ceil(SIDE_QUEST_TARGET * BRAINSTORM_OVERAGE);
  const existingSeeds = (await readJsonIfExists(seedsPath))?.seeds ?? [];

  let seeds;
  if (existingSeeds.length >= targetSeeds) {
    seeds = existingSeeds;
    console.log(`Step 1/4: Loaded ${seeds.length} seeds from ${seedsPath} (skipping brainstorm)\n`);
  } else {
    if (existingSeeds.length > 0) {
      console.log(`Step 1/4: Resuming brainstorm from ${existingSeeds.length}/${targetSeeds} existing seeds...`);
    } else {
      console.log(`Step 1/4: Brainstorming seeds (${BRAINSTORM_BATCH_SIZE}/batch)...`);
    }
    seeds = await generateAllSeeds({
      targetCount: SIDE_QUEST_TARGET,
      initialSeeds: existingSeeds,
      onProgress: async (allSeeds, batch, totalBatches) => {
        await writeJson(seedsPath, { seeds: allSeeds });
        console.log(`  Batch ${batch}/${totalBatches}: ${allSeeds.length} seeds total`);
      },
    });
    console.log(`  -> Wrote ${seeds.length} seeds to ${seedsPath}\n`);
  }

  // ----- Step 2: Critique -----
  const critiquePath = path.join(OUTPUT_DIR, `${stamp}.critique.json`);
  const existingCritique = await readJsonIfExists(critiquePath);

  let survivors;
  if (existingCritique?.survivors) {
    survivors = existingCritique.survivors;
    console.log(`Step 2/4: Loaded ${survivors.length} survivors from ${critiquePath} (skipping critique)\n`);
  } else {
    console.log(`Step 2/4: Critiquing seeds...`);
    const critique = await critiqueSeeds(seeds);
    survivors = critique.kept_indices.map((i) => seeds[i]).filter(Boolean);
    await writeJson(critiquePath, { critique, survivors });
    console.log(
      `  Kept ${survivors.length} of ${seeds.length} (${critique.rejection_notes?.length || 0} rejections)`
    );
    console.log(`  -> Wrote critique to ${critiquePath}\n`);
  }

  if (survivors.length === 0) {
    throw new Error("Critique kept 0 seeds. Pipeline aborted.");
  }

  // ----- Step 3: Coverage tagging -----
  const coveragePath = path.join(OUTPUT_DIR, `${stamp}.coverage.json`);
  const existingCoverage = await readJsonIfExists(coveragePath);

  let coverageTags;
  if (existingCoverage?.tags) {
    coverageTags = existingCoverage.tags;
    console.log(`Step 3/4: Loaded coverage tags from ${coveragePath} (skipping tagging)`);
  } else {
    console.log(`Step 3/4: Tagging survivors for coverage analysis (with top-ups)...`);
    coverageTags = await tagSurvivorsForCoverage(survivors);
    await writeJson(coveragePath, { tags: coverageTags });
    console.log(`  Tagged ${coverageTags.length} survivors`);
  }

  // Gap analysis (pure JS, always re-runs)
  const { counts, gaps, total, threshold } = identifyCoverageGaps(coverageTags);
  console.log(`\n  Coverage report (threshold: ${threshold} per cell, total survivors: ${total}):`);
  console.log(`    context:`, counts.context);
  console.log(`    stretch:`, counts.stretch);
  console.log(`    type:   `, counts.type);
  console.log(`    night:  `, counts.night);
  if (gaps.length > 0) {
    console.log(`\n  Gaps detected:`);
    for (const g of gaps) {
      console.log(`    - ${g.dimension}/${g.value}: ${g.current} (target ${g.target})`);
    }
  } else {
    console.log(`\n  No significant gaps.`);
  }
  console.log("");

  // ----- Step 4: Top-up + finalize -----
  const topupPath = path.join(OUTPUT_DIR, `${stamp}.topup.json`);
  const existingTopup = await readJsonIfExists(topupPath);

  let allSurvivors;
  if (existingTopup?.survivors) {
    allSurvivors = existingTopup.survivors;
    console.log(`Step 4/4: Loaded ${allSurvivors.length} from ${topupPath} (skipping top-up)`);
    console.log(`  (To force top-up re-run, delete that file and re-run with the same STAMP.)`);
  } else {
    allSurvivors = [...survivors];
    if (ENABLE_TOPUP && gaps.length > 0) {
      const numTopups = Math.min(gaps.length, MAX_TOPUP_CALLS);
      console.log(`Step 4/4: Generating ${numTopups} targeted top-ups for gaps, then finalizing...`);
      for (let i = 0; i < numTopups; i++) {
        const gap = gaps[i];
        console.log(`  Top-up ${i + 1}/${numTopups}: ${gap.dimension}/${gap.value}`);
        try {
          const fill = await generateTargetedFill({
            gap,
            existingTitles: allSurvivors.map((s) => s.title),
          });
          allSurvivors.push(...fill);
          // Write after every successful fill so a mid-loop crash doesn't lose progress.
          await writeJson(topupPath, { survivors: allSurvivors });
          console.log(`    Added ${fill.length} concepts`);
        } catch (error) {
          console.warn(`    Top-up failed: ${error.message}`);
        }
      }
      console.log(`  Total after top-ups: ${allSurvivors.length}`);
    } else {
      console.log(`Step 4/4: Skipping top-up (${ENABLE_TOPUP ? "no gaps" : "disabled"}); finalizing...`);
    }
  }

  // The survivors (with title + summary) are already the final quest content.
  // Write them as raw.json so the existing annotation step can pick them up.
  const rawPath = path.join(OUTPUT_DIR, `${stamp}.raw.json`);
  await writeJson(rawPath, { quests: allSurvivors });
  console.log(`  -> Wrote ${allSurvivors.length} quests to ${rawPath}\n`);

  console.log(`Pipeline complete.`);
  console.log(`\nNext step — run annotation:`);
  console.log(`  ./scripts/side-quests/run.sh annotate ${rawPath}\n`);
}

// =============================================================================
// ANNOTATION (existing per-quest annotation step — unchanged behavior)
// =============================================================================

async function annotateRawQuests(rawPayload, onProgress, existingAnnotatedQuests = []) {
  const systemPrompt = [
    "You are annotating side quests for deterministic matching.",
    "Do not rewrite the quests unless needed to preserve clean JSON.",
    "Annotate each quest honestly and conservatively.",
    "Return valid JSON only.",
  ].join("\n");
  const annotatedQuests = [...existingAnnotatedQuests];

  for (let index = 0; index < existingAnnotatedQuests.length; index += 1) {
    const rawQuest = rawPayload.quests[index];
    const annotatedQuest = existingAnnotatedQuests[index];

    if (
      !annotatedQuest ||
      annotatedQuest.title !== rawQuest.title ||
      annotatedQuest.summary !== rawQuest.summary
    ) {
      throw new Error(
        `Existing annotated file does not match raw file at quest ${index + 1}. Delete the partial annotated file or use the matching raw file.`
      );
    }
  }

  for (let index = existingAnnotatedQuests.length; index < rawPayload.quests.length; index += 1) {
    const quest = rawPayload.quests[index];
    const userPrompt = [
      `Annotate this side quest (${index + 1} of ${rawPayload.quests.length}).`,
      "",
      "Preserve these fields exactly:",
      "- title",
      "- summary",
      "",
      "Then add:",
      "- goal_tags",
      "- barrier_tags",
      "- context_tags",
      "- type_tags",
      "- outcome_tags",
      "- stretch_level",
      "- cost_level",
      "- planning_level",
      "- social_level",
      "- physical_level",
      "- distance_level",
      "- night_level",
      "- avoid_flags",
      "",
      "Allowed values:",
      `goal_tags: ${GOAL_TAGS.join(", ")}`,
      `barrier_tags: ${BARRIER_TAGS.join(", ")}`,
      `context_tags: ${CONTEXT_TAGS.join(", ")}`,
      `type_tags: ${TYPE_TAGS.join(", ")}`,
      `outcome_tags: ${OUTCOME_TAGS.join(", ")}`,
      `stretch_level: ${STRETCH_LEVELS.join(", ")}`,
      `avoid_flags: ${AVOID_FLAGS.join(", ")}`,
      "",
      "Rules:",
      "- choose 1 to 3 goal_tags",
      "- choose 1 to 2 barrier_tags",
      "- choose 1 to 4 context_tags",
      "- choose 1 to 3 type_tags",
      "- choose 1 to 3 outcome_tags",
      "- cost_level is 0 to 3",
      "- planning_level is 0 to 3",
      "- social_level is 0 to 3",
      "- physical_level is 0 to 3",
      "- distance_level is 0 to 3",
      "- night_level is binary: 0 or 1",
      "- use avoid_flags only when they truly apply",
      "- annotate levels honestly, not aspirationally",
      "- be selective; do not assign broad default tags just because they vaguely fit",
      "- barrier_tags means which user frictions this quest is especially compatible with or helpful for, not which frictions are merely present in the quest",
      "- do not assign planning unless the quest is genuinely good for someone who avoids planning, or the planning friction is central to the match",
      "- do not assign spending_money as a barrier_tag unless the quest is still meaningfully suitable for someone sensitive to spending",
      "- do not assign low_energy unless the quest is truly lightweight and energy-friendly",
      "- do not assign did_something_unusual by default to almost everything; use it only when the quest clearly feels like a notable break from routine",
      "- do not assign days_less_repetitive by default to almost everything; use it only when the quest meaningfully changes the texture of the day",
      "- prefer discriminating tags over generic tags",
      "",
      "Side quest JSON:",
      JSON.stringify(quest),
    ].join("\n");

    const payload = await callStructuredOutput({
      systemPrompt,
      userPrompt,
      schemaName: "side_quest_single_annotation",
      schema: singleAnnotatedQuestSchema,
      effort: ANNOTATE_EFFORT,
    });

    if (!payload || !payload.quest) {
      throw new Error(`Annotation ${index + 1} did not return a quest object`);
    }

    annotatedQuests.push(payload.quest);
    if (onProgress) {
      await onProgress({ quests: annotatedQuests }, index + 1, rawPayload.quests.length);
    }
  }

  return { quests: annotatedQuests };
}

async function annotateExisting(rawFilePath) {
  await ensureOutputDir();
  const resolvedRawPath = path.resolve(rawFilePath);
  const rawText = await fs.readFile(resolvedRawPath, "utf8");
  const rawPayload = JSON.parse(rawText);
  if (!rawPayload?.quests || !Array.isArray(rawPayload.quests)) {
    throw new Error(`Raw file ${resolvedRawPath} does not contain a quests array`);
  }

  const annotatedPath = resolvedRawPath.endsWith(".raw.json")
    ? resolvedRawPath.replace(/\.raw\.json$/, ".annotated.json")
    : path.join(OUTPUT_DIR, `${path.basename(resolvedRawPath, ".json")}.annotated.json`);

  const existingAnnotatedPayload = await readJsonIfExists(annotatedPath);
  const existingAnnotatedQuests =
    existingAnnotatedPayload && Array.isArray(existingAnnotatedPayload.quests)
      ? existingAnnotatedPayload.quests
      : [];

  if (existingAnnotatedQuests.length > rawPayload.quests.length) {
    throw new Error(
      `Existing annotated file has ${existingAnnotatedQuests.length} quests, but raw file only has ${rawPayload.quests.length}.`
    );
  }

  if (!existingAnnotatedPayload) {
    await writeJson(annotatedPath, { quests: [] });
  } else {
    console.log(`Resuming annotation from ${existingAnnotatedQuests.length}/${rawPayload.quests.length} quests...`);
  }

  const annotatedPayload = await annotateRawQuests(
    rawPayload,
    async (partialPayload, completed, total) => {
      await writeJson(annotatedPath, partialPayload);
      console.log(`Annotated ${completed}/${total} quests...`);
    },
    existingAnnotatedQuests
  );
  await writeJson(annotatedPath, annotatedPayload);
  console.log(`Wrote annotated quests to ${annotatedPath}`);
}

// =============================================================================
// STANDALONE SUBCOMMANDS (for iterating on individual steps)
// =============================================================================

async function brainstormOnly() {
  await ensureOutputDir();
  const stamp = timestamp();
  const seedsPath = path.join(OUTPUT_DIR, `${stamp}.seeds.json`);
  console.log(`Brainstorming ${Math.ceil(SIDE_QUEST_TARGET * BRAINSTORM_OVERAGE)} seeds...`);
  const seeds = await generateAllSeeds({
    targetCount: SIDE_QUEST_TARGET,
    onProgress: async (allSeeds, batch, totalBatches) => {
      await writeJson(seedsPath, { seeds: allSeeds });
      console.log(`  Batch ${batch}/${totalBatches}: ${allSeeds.length} seeds`);
    },
  });
  console.log(`Wrote ${seeds.length} seeds to ${seedsPath}`);
}

async function critiqueOnly(seedsFilePath) {
  await ensureOutputDir();
  const resolvedPath = path.resolve(seedsFilePath);
  const payload = JSON.parse(await fs.readFile(resolvedPath, "utf8"));
  if (!payload?.seeds) throw new Error(`Seeds file ${resolvedPath} missing seeds array`);
  console.log(`Critiquing ${payload.seeds.length} seeds...`);
  const critique = await critiqueSeeds(payload.seeds);
  const survivors = critique.kept_indices.map((i) => payload.seeds[i]).filter(Boolean);
  const critiquePath = resolvedPath.replace(/\.seeds\.json$/, ".critique.json");
  await writeJson(critiquePath, { critique, survivors });
  // Survivors are also already the final quest content — write a raw.json for downstream annotation.
  const rawPath = resolvedPath.replace(/\.seeds\.json$/, ".raw.json");
  await writeJson(rawPath, { quests: survivors });
  console.log(`Kept ${survivors.length} of ${payload.seeds.length}.`);
  console.log(`Wrote ${critiquePath}`);
  console.log(`Wrote ${rawPath}`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const command = process.argv[2] || "run";

  if (command === "run") {
    await runPipeline();
    return;
  }

  if (command === "brainstorm") {
    await brainstormOnly();
    return;
  }

  if (command === "critique") {
    const seedsFilePath = process.argv[3];
    if (!seedsFilePath) {
      throw new Error("Usage: node generate-side-quests.mjs critique <seeds.json>");
    }
    await critiqueOnly(seedsFilePath);
    return;
  }

  if (command === "annotate") {
    const rawFilePath = process.argv[3];
    if (!rawFilePath) {
      throw new Error("Usage: node generate-side-quests.mjs annotate <raw-json-file>");
    }
    await annotateExisting(rawFilePath);
    return;
  }

  throw new Error(
    "Usage: node generate-side-quests.mjs [run | brainstorm | critique <seeds.json> | annotate <raw.json>]"
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
