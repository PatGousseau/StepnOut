import { describe, expect, it } from "@jest/globals";

import {
  formatVoiceJournalDuration,
  getVoiceJournalDraftRecovery,
  MAX_VOICE_JOURNAL_DURATION_MS,
  normalizeVoiceJournalDuration,
} from "../voiceJournal";
import { GrowthVoiceJournal } from "../../types/growthGuidance";

const draft: GrowthVoiceJournal = {
  id: "voice-1",
  plan_id: "plan-1",
  step_id: "step-1",
  status: "review",
  object_path: "user/voice-1.m4a",
  mime_type: "audio/m4a",
  duration_ms: 12000,
  machine_transcript: "Reviewed next",
  reviewed_transcript: null,
  transcript_edited: false,
  created_at: "2026-08-30T12:00:00Z",
  updated_at: "2026-08-30T12:00:00Z",
  submitted_at: null,
};

describe("voice journal lifecycle", () => {
  it("formats recording duration and defines the three-minute limit", () => {
    expect(formatVoiceJournalDuration(65000)).toBe("1:05");
    expect(MAX_VOICE_JOURNAL_DURATION_MS).toBe(180000);
    expect(normalizeVoiceJournalDuration(180249)).toBe(180000);
  });

  it("restores an interrupted transcript at review", () => {
    expect(getVoiceJournalDraftRecovery(draft, "plan-1")).toBe("review");
  });

  it("offers retry for an upload or transcription failure", () => {
    expect(getVoiceJournalDraftRecovery({
      ...draft,
      status: "failed",
      machine_transcript: null,
    }, "plan-1")).toBe("retry");
  });

  it("discards a draft tied to a superseded plan", () => {
    expect(getVoiceJournalDraftRecovery(draft, "plan-2")).toBe("discard_stale");
  });
});
