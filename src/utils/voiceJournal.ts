import { GrowthVoiceJournal } from "../types/growthGuidance";

export const MAX_VOICE_JOURNAL_DURATION_MS = 180000;

export function normalizeVoiceJournalDuration(durationMs: number) {
  return Math.min(Math.max(0, durationMs), MAX_VOICE_JOURNAL_DURATION_MS);
}

export function formatVoiceJournalDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export function getVoiceJournalDraftRecovery(
  draft: GrowthVoiceJournal,
  activePlanId: string
): "discard_stale" | "review" | "retry" {
  if (draft.plan_id !== activePlanId) return "discard_stale";
  if (draft.status === "review" && draft.machine_transcript) return "review";
  return "retry";
}
