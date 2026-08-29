import { SideQuest } from "./sideQuests";

export type SoloExperience = "never" | "once_or_twice" | "regularly";

export type FollowupVariant = "clarify" | "deepen";

export type IntakeStatus = "in_progress" | "completed" | "abandoned";

export type LocationSource = "manual" | "gps" | "places";

export type QuestHorizon = "today" | "weekend";

/**
 * Raw answers are persisted verbatim: future personalization depends on the
 * user's actual wording, not on derived tags.
 */
export interface PersonalizedQuestIntake {
  id: number;
  user_id: string;
  answer_avoided: string | null;
  answer_bail: string | null;
  answer_solo_experience: SoloExperience | null;
  location_raw: string | null;
  location_city: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_source: LocationSource | null;
  followup_question: string | null;
  followup_variant: FollowupVariant | null;
  followup_answer: string | null;
  readback_lines: string[];
  status: IntakeStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A generated quest is an ordinary side quest scoped to one user. */
export interface PersonalizedQuest extends SideQuest {
  user_id: string;
  source: "personalized";
  intake_id: number | null;
  horizon: QuestHorizon;
}

export interface QuestFollowup {
  skip: boolean;
  question: string | null;
  variant: FollowupVariant | null;
  /** Set when the call failed, so a skip can be reported as an error not a model choice. */
  error?: boolean;
}

export interface GeneratedQuestSet {
  readback: string[];
  quests: PersonalizedQuest[];
}

/** The answers gathered so far, sent to generation. */
export interface IntakeAnswers {
  answer_avoided: string;
  answer_bail: string;
  answer_solo_experience: SoloExperience | null;
  location_raw: string;
  followup_question?: string | null;
  followup_answer?: string | null;
}

/**
 * Seam for the events pipeline. Quests come from an LLM today; a real events
 * source drops in later as a second implementation without touching the UI.
 */
export interface QuestSource {
  readonly id: string;
  generate(params: {
    intakeId: number;
    answers: IntakeAnswers;
    locale: string;
  }): Promise<GeneratedQuestSet>;
}
