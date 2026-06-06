#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { buildSideQuestSnapshot } from "./review/export-side-quests-for-review.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const DEFAULT_OUTPUT_PATH = path.join(ROOT, "output", "active-side-quest-copy.json");

function usage() {
  throw new Error(
    "Usage: node scripts/side-quests/export-side-quest-copy.mjs [output-json-file]"
  );
}

function toEditableQuest(quest) {
  return {
    id: quest.id,
    title: quest.title,
    summary: quest.summary,
    original_title: quest.title,
    original_summary: quest.summary,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 1) {
    usage();
  }

  const outputPath = args[0] ? path.resolve(args[0]) : DEFAULT_OUTPUT_PATH;
  const snapshot = await buildSideQuestSnapshot();
  const quests = (snapshot.quests || [])
    .filter((quest) => quest && quest.is_active !== false)
    .map(toEditableQuest)
    .sort((a, b) => a.id - b.id);

  const payload = {
    source: snapshot.source,
    generatedAt: new Date().toISOString(),
    questCount: quests.length,
    quests,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Wrote ${quests.length} active side quests to ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
