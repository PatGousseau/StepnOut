#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));

function usage() {
  throw new Error(
    "Usage: node scripts/side-quests/build-side-quest-migration.mjs <annotated-json-file> <migration-file-name.sql>"
  );
}

function getMigrationPath(migrationFileName) {
  if (!migrationFileName.endsWith(".sql")) {
    throw new Error("Migration file name must end with .sql");
  }

  return path.resolve(ROOT, "..", "..", "supabase", "migrations", migrationFileName);
}

async function main() {
  const annotatedFilePath = process.argv[2];
  const migrationFileName = process.argv[3];

  if (!annotatedFilePath || !migrationFileName) {
    usage();
  }

  const resolvedAnnotatedPath = path.resolve(annotatedFilePath);
  const migrationPath = getMigrationPath(migrationFileName);

  const payload = JSON.parse(await fs.readFile(resolvedAnnotatedPath, "utf8"));
  if (!payload || !Array.isArray(payload.quests)) {
    throw new Error("Annotated JSON file must be an object with a quests array");
  }

  const quests = payload.quests.map(({ duration_minutes, ...quest }) => quest);
  const json = JSON.stringify({ quests }, null, 2);

  const sql = `WITH payload AS (
  SELECT $sidequests$${json}$sidequests$::jsonb AS data
)
INSERT INTO public.side_quests (
  title,
  summary,
  goal_tags,
  barrier_tags,
  context_tags,
  type_tags,
  outcome_tags,
  stretch_level,
  cost_level,
  planning_level,
  social_level,
  physical_level,
  distance_level,
  night_level,
  avoid_flags,
  is_active
)
SELECT
  title,
  summary,
  goal_tags,
  barrier_tags,
  context_tags,
  type_tags,
  outcome_tags,
  stretch_level,
  cost_level,
  planning_level,
  social_level,
  physical_level,
  distance_level,
  night_level,
  avoid_flags,
  true
FROM payload,
jsonb_to_recordset(payload.data -> 'quests') AS q(
  title text,
  summary text,
  goal_tags text[],
  barrier_tags text[],
  context_tags text[],
  type_tags text[],
  outcome_tags text[],
  stretch_level text,
  cost_level integer,
  planning_level integer,
  social_level integer,
  physical_level integer,
  distance_level integer,
  night_level integer,
  avoid_flags text[]
);
`;

  await fs.writeFile(migrationPath, sql, "utf8");
  console.log(`Wrote ${quests.length} quests to ${migrationPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
