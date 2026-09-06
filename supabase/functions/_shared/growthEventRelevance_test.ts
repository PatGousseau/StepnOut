import { parseEventRelevance } from "./growthEventRelevance.ts";

Deno.test("event relevance requires an explicit boolean decision", () => {
  if (!parseEventRelevance({ relevant: true }) || parseEventRelevance({ relevant: false })) {
    throw new Error("Boolean decision changed");
  }
  for (const value of [null, {}, { relevant: "true" }, { relevant: 1 }]) {
    let rejected = false;
    try { parseEventRelevance(value); } catch { rejected = true; }
    if (!rejected) throw new Error("Invalid relevance was accepted");
  }
});
