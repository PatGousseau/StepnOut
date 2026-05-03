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
const QUEST_COUNT = Number(process.env.SIDE_QUEST_COUNT || 500);
const MAX_OUTPUT_TOKENS = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 120000);
const OPENAI_HEADERS_TIMEOUT_MS = Number(process.env.OPENAI_HEADERS_TIMEOUT_MS || 10 * 60 * 1000);
const OPENAI_BODY_TIMEOUT_MS = Number(process.env.OPENAI_BODY_TIMEOUT_MS || 10 * 60 * 1000);
const OPENAI_BACKGROUND_MODE = process.env.OPENAI_BACKGROUND_MODE !== "0";
const OPENAI_BACKGROUND_POLL_MS = Number(process.env.OPENAI_BACKGROUND_POLL_MS || 5000);

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

const rawQuestSchema = {
  type: "object",
  properties: {
    quests: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          why_it_hits: { type: "string" },
          instructions: { type: "string" },
        },
        required: ["title", "summary", "why_it_hits", "instructions"],
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
        why_it_hits: { type: "string" },
        instructions: { type: "string" },
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
        "why_it_hits",
        "instructions",
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
      console.log(`Background response ${responseId} for ${schemaName}: ${status}`);
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

async function callStructuredOutput({ systemPrompt, userPrompt, schemaName, schema, background = false }) {
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

function validateQuestCount(payload, expectedCount, label) {
  if (!payload || !Array.isArray(payload.quests)) {
    throw new Error(`${label} payload is missing quests array`);
  }

  if (payload.quests.length !== expectedCount) {
    throw new Error(`${label} produced ${payload.quests.length} quests, expected ${expectedCount}`);
  }
}

async function generateRawQuests() {
  const systemPrompt = [
    "You are generating a large catalog of side quests for a consumer app.",
    "A side quest is a one-day activity that breaks routine.",
    "It should feel interesting, fun, fresh, fulfilling, or lightly growth-oriented.",
    "It should not read like therapy homework or a formal self-improvement challenge.",
    "You are not annotating the quests yet, but you must generate them with enough diversity that a later annotation pass can meaningfully cover the full preference space.",
    "Return valid JSON only.",
  ].join("\n");

  const userPrompt = [
    `Generate exactly ${QUEST_COUNT} unique side quests.`,
    "",
    "Each quest must contain only these fields:",
    "- title",
    "- summary",
    "- why_it_hits",
    "- instructions",
    "",
    "Requirements:",
    "- every quest must be doable in one day",
    "- most quests should be free or cheap",
    "- most quests should take 10 to 120 minutes",
    "- at least 60% should happen outside the home in some way",
    "- include a mix of solo and social quests",
    "- include playful, creative, exploratory, reflective, and lightly edgy ideas",
    "- avoid duplicate or near-duplicate ideas",
    "- avoid repetitive wording patterns",
    "- avoid generic motivational copy",
    "- avoid unsafe or illegal ideas",
    "- avoid defaulting to content creation tasks",
    "- do not overuse obvious 'talk to a stranger' style comfort-zone exercises",
    "",
    "These are the preference dimensions the later annotation pass will use. You should generate quests that collectively span this space.",
    "",
    `goal dimensions: ${GOAL_TAGS.join(", ")}`,
    `barrier dimensions: ${BARRIER_TAGS.join(", ")}`,
    `context dimensions: ${CONTEXT_TAGS.join(", ")}`,
    `type dimensions: ${TYPE_TAGS.join(", ")}`,
    `outcome dimensions: ${OUTCOME_TAGS.join(", ")}`,
    `stretch dimensions: ${STRETCH_LEVELS.join(", ")}`,
    `avoid dimensions: ${AVOID_FLAGS.join(", ")}`,
    "",
    "Coverage requirements across the full set:",
    "- include quests that are clearly easy_win, moderate_push, and bold_nudge in spirit",
    "- include quests that clearly fit at_home, near_home, out_in_the_city, with_other_people, and solo contexts",
    "- include quests that are clearly playful, creative, exploratory, social, reflective, and growth_edge",
    "- include some quests that would naturally map to each goal dimension",
    "- include some quests that would naturally map to each outcome dimension",
    "- include some quests that would naturally trigger avoid flags like spending_money, nighttime, going_far, group_social_situations, or lots_of_planning",
    "- do not let the set collapse into mostly solo, near_home, easy_win, playful quests",
    "- some quests should be clearly daytime and some should clearly require evening or nighttime",
    "- some quests should be fully free and some should require a small amount of spending",
    "- some quests should be spontaneous and some should require a bit more setup",
    "",
    "The overall set should feel broad and well-spanned, not concentrated in one mood or one difficulty band.",
    "",
    "Writing style:",
    "- short vivid titles",
    "- concrete summaries",
    "- concise why_it_hits",
    "- instructions should be one compact paragraph, not a numbered list",
    "- do not over-index on quirky, whimsical, or mischievous ideas",
    "- only some quests should feel playful",
    "- many quests should instead feel grounded, curious, social, reflective, intimate, cinematic, or quietly adventurous",
    "- vary the emotional tone of the set, not just the activity type",
  ].join("\n");

  const payload = await callStructuredOutput({
    systemPrompt,
    userPrompt,
    schemaName: "side_quest_raw_catalog",
    schema: rawQuestSchema,
    background: OPENAI_BACKGROUND_MODE,
  });

  validateQuestCount(payload, QUEST_COUNT, "Raw generation");
  return payload;
}

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
      annotatedQuest.summary !== rawQuest.summary ||
      annotatedQuest.why_it_hits !== rawQuest.why_it_hits ||
      annotatedQuest.instructions !== rawQuest.instructions
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
      "- why_it_hits",
      "- instructions",
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

async function runFullPipeline() {
  await ensureOutputDir();

  console.log(`Generating ${QUEST_COUNT} raw side quests with ${MODEL}...`);
  const rawPayload = await generateRawQuests();
  const stamp = timestamp();
  const rawPath = path.join(OUTPUT_DIR, `${stamp}.raw.json`);
  await writeJson(rawPath, rawPayload);
  console.log(`Wrote raw quests to ${rawPath}`);

  console.log(`Annotating ${QUEST_COUNT} side quests with ${MODEL}...`);
  const annotatedPath = path.join(OUTPUT_DIR, `${stamp}.annotated.json`);
  await writeJson(annotatedPath, { quests: [] });
  const annotatedPayload = await annotateRawQuests(rawPayload, async (partialPayload, completed, total) => {
    await writeJson(annotatedPath, partialPayload);
    console.log(`Annotated ${completed}/${total} quests...`);
  });
  await writeJson(annotatedPath, annotatedPayload);
  console.log(`Wrote annotated quests to ${annotatedPath}`);
}

async function annotateExisting(rawFilePath) {
  await ensureOutputDir();
  const resolvedRawPath = path.resolve(rawFilePath);
  const rawText = await fs.readFile(resolvedRawPath, "utf8");
  const rawPayload = JSON.parse(rawText);
  validateQuestCount(rawPayload, rawPayload.quests.length, "Existing raw file");

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

async function main() {
  const command = process.argv[2] || "run";

  if (command === "run") {
    await runFullPipeline();
    return;
  }

  if (command === "generate") {
    await ensureOutputDir();
    const rawPayload = await generateRawQuests();
    const stamp = timestamp();
    const rawPath = path.join(OUTPUT_DIR, `${stamp}.raw.json`);
    await writeJson(rawPath, rawPayload);
    console.log(`Wrote raw quests to ${rawPath}`);
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

  throw new Error("Usage: node generate-side-quests.mjs [run|generate|annotate <raw-json-file>]");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
