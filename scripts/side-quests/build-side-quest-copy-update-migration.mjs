#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { buildSideQuestSnapshot } from "./review/export-side-quests-for-review.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const MIGRATIONS_DIR = path.resolve(ROOT, "..", "..", "supabase", "migrations");

function usage() {
  throw new Error(
    "Usage: node scripts/side-quests/build-side-quest-copy-update-migration.mjs <edited-copy-json-file> <migration-file-name.sql>"
  );
}

function getMigrationPath(migrationFileName) {
  if (!migrationFileName.endsWith(".sql")) {
    throw new Error("Migration file name must end with .sql");
  }

  return path.join(MIGRATIONS_DIR, migrationFileName);
}

function validateEditedPayload(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.quests)) {
    throw new Error("Edited copy JSON must be an object with a quests array");
  }
}

function escapeSqlString(value) {
  return value.replaceAll("'", "''");
}

function buildUpdates({ currentQuests, editedQuests }) {
  const currentById = new Map(
    (currentQuests || [])
      .filter((quest) => quest && quest.is_active !== false)
      .map((quest) => [quest.id, quest])
  );
  const seenIds = new Set();
  const updates = [];

  for (const quest of editedQuests) {
    if (!quest || !Number.isInteger(quest.id) || quest.id <= 0) {
      throw new Error("Every edited quest must include a positive integer id");
    }

    if (seenIds.has(quest.id)) {
      throw new Error(`Duplicate quest id in edited copy JSON: ${quest.id}`);
    }
    seenIds.add(quest.id);

    if (typeof quest.title !== "string" || typeof quest.summary !== "string") {
      throw new Error(`Quest ${quest.id} must include string title and summary`);
    }

    const currentQuest = currentById.get(quest.id);
    const originalTitle = typeof quest.original_title === "string" ? quest.original_title : currentQuest?.title;
    const originalSummary =
      typeof quest.original_summary === "string" ? quest.original_summary : currentQuest?.summary;

    if (!originalTitle || !originalSummary) {
      throw new Error(`Quest ${quest.id} is missing original title/summary context`);
    }

    if (quest.title !== originalTitle || quest.summary !== originalSummary) {
      updates.push({
        id: quest.id,
        oldTitle: originalTitle,
        newTitle: quest.title,
        oldSummary: originalSummary,
        newSummary: quest.summary,
      });
    }
  }

  return updates.sort((a, b) => a.id - b.id);
}

function buildValuesSql(updates) {
  return updates
    .map(
      (update) => `      (
        ${update.id}::bigint,
        '${escapeSqlString(update.oldTitle)}',
        '${escapeSqlString(update.newTitle)}',
        '${escapeSqlString(update.oldSummary)}',
        '${escapeSqlString(update.newSummary)}'
      )`
    )
    .join(",\n");
}

function buildSql({ updates, editedFilePath }) {
  const idsSql = updates.map((update) => update.id).join(", ");
  const valuesSql = buildValuesSql(updates);
  const updateCount = updates.length;

  return `-- Generated from ${editedFilePath}
-- Updates quest copy for ${updateCount} active side quests.

BEGIN;

DO $migration$
DECLARE
  quest_ids bigint[] := ARRAY[${idsSql}]::bigint[];
  expected_count integer := ${updateCount};
  matched_count integer;
  updated_count integer;
BEGIN
  SELECT count(*)
  INTO matched_count
  FROM public.side_quests
  WHERE id = ANY (quest_ids);

  IF matched_count <> expected_count THEN
    RAISE EXCEPTION 'Expected % side quests to exist, found %', expected_count, matched_count;
  END IF;

  WITH updates (id, old_title, new_title, old_summary, new_summary) AS (
    VALUES
${valuesSql}
  )
  UPDATE public.side_quests AS sq
  SET
    title = updates.new_title,
    summary = updates.new_summary,
    updated_at = now()
  FROM updates
  WHERE sq.id = updates.id
    AND sq.title = updates.old_title
    AND sq.summary = updates.old_summary;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count <> expected_count THEN
    RAISE EXCEPTION 'Expected % side quests to update, updated %', expected_count, updated_count;
  END IF;
END $migration$;

COMMIT;
`;
}

async function main() {
  const editedFilePath = process.argv[2];
  const migrationFileName = process.argv[3];

  if (!editedFilePath || !migrationFileName) {
    usage();
  }

  const migrationPath = getMigrationPath(migrationFileName);
  const resolvedEditedPath = path.resolve(editedFilePath);
  const editedPayload = JSON.parse(await fs.readFile(resolvedEditedPath, "utf8"));
  validateEditedPayload(editedPayload);

  const updates = buildUpdates({
    currentQuests: [],
    editedQuests: editedPayload.quests,
  });

  if (updates.length === 0) {
    throw new Error("No title or summary changes found in edited copy JSON");
  }

  const sql = buildSql({
    updates,
    editedFilePath: resolvedEditedPath,
  });

  await fs.writeFile(migrationPath, sql, "utf8");
  console.log(`Wrote copy update migration for ${updates.length} quests to ${migrationPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
