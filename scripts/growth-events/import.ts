/** Import reviewed event/place records from an approved source. No scraping or source approval side effects. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  extractGrowthJsonLd,
  normalizeGrowthEvent,
} from "../../supabase/functions/_shared/growthEvents.ts";

const [sourceId, inputPath] = Deno.args;
if (!sourceId || !inputPath) {
  throw new Error(
    "Usage: import.ts <approved-source-id> <reviewed-records.json>",
  );
}
const url = Deno.env.get("SUPABASE_URL"),
  key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
}
const service = createClient(url, key);
const { data: source, error } = await service.from("growth_event_sources")
  .select("*").eq("id", sourceId).single();
if (error || !source?.enabled || !source.approval_reference) {
  throw new Error(
    "Source must be explicitly approved and enabled before import",
  );
}
let input: unknown;
if (inputPath.startsWith("https://")) {
  const requested = new URL(inputPath);
  if (
    requested.hostname !== new URL(source.source_url).hostname ||
    requested.username || requested.password
  ) throw new Error("Only an approved source host can be fetched");
  const response = await fetch(requested, {
    redirect: "error",
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "StepnOut approved-source importer" },
  });
  if (!response.ok || !response.body) {
    throw new Error(`Source status ${response.status}`);
  }
  const reader = response.body.getReader();
  let size = 0;
  let html = "";
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 2000000) {
      await reader.cancel();
      throw new Error("Source page too large");
    }
    html += decoder.decode(value, { stream: true });
  }
  html += decoder.decode();
  input = extractGrowthJsonLd(html, inputPath, sourceId);
} else input = JSON.parse(await Deno.readTextFile(inputPath));
if (!Array.isArray(input) || input.length > 500) {
  throw new Error("Expected at most 500 reviewed records");
}
const records = input.map((value) => normalizeGrowthEvent(value, sourceId));
const host = new URL(source.source_url).hostname;
if (records.some((record) => new URL(record.source_url).hostname !== host)) {
  throw new Error("Every record must link to the approved source host");
}
if (new Set(records.map((r) => r.source_key)).size !== records.length) {
  throw new Error("Duplicate source keys in import");
}
const { error: writeError } = await service.from("growth_events").upsert(
  records,
  { onConflict: "source_id,source_key" },
);
if (writeError) throw writeError;
console.log(
  `Imported ${records.length} reviewed opportunities from ${sourceId}.`,
);
