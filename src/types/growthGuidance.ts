export type GrowthIntakeStatus = "in_progress" | "proposed" | "confirmed" | "abandoned";

export type GrowthChallengeLevel = "gentle" | "balanced" | "stretch";

export interface GrowthIntakeAnswers {
  current_situation: string;
  recent_example: string;
  desired_change: string;
  why_it_matters: string;
  prior_attempts: string;
  likely_barriers: string;
  practice_context: string;
  challenge_level: GrowthChallengeLevel;
  disliked_guidance: string;
  boundaries: string;
  clarifications: Array<{ question: string; answer: string }>;
}

export interface GrowthEventPreferences {
  enabled: boolean;
  approximate_location: string;
  travel_radius: string;
  availability: string;
  cost_preference: string;
  accessibility_needs: string;
}

export interface GrowthIntake {
  id: string;
  user_id: string;
  answers: GrowthIntakeAnswers;
  status: GrowthIntakeStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface GrowthMilestone {
  title: string;
  description: string;
}

export interface GrowthFirstStep {
  title: string;
  rationale: string;
  action: string;
  completion_criterion: string;
  if_then_plan: string | null;
}

export interface GrowthPlanProposal {
  id: string;
  intake_id: string;
  user_id: string;
  version: number;
  status: "proposed" | "active" | "rejected" | "superseded";
  goal: string;
  formulation: string;
  milestones: GrowthMilestone[];
  current_focus: string;
  first_step: GrowthFirstStep;
  created_at: string;
  confirmed_at: string | null;
}

export type GrowthAttemptOutcome = "did_it" | "partly" | "didnt_do_it";

export type GrowthAttemptFollowUp =
  | "easier_than_expected"
  | "about_the_same"
  | "harder_than_expected"
  | "not_sure"
  | "no_opportunity"
  | "forgot"
  | "too_uncomfortable"
  | "not_relevant"
  | "other";

export interface GrowthStep extends GrowthFirstStep {
  id: string;
  plan_id: string;
  user_id: string;
  sequence: number;
  status: "active" | "attempted" | "replaced" | "dismissed";
  created_at: string;
  ended_at: string | null;
}

export interface GrowthInteraction {
  id: string;
  plan_id: string;
  step_id: string | null;
  user_id: string;
  kind: "report" | "journal";
  report_outcome: GrowthAttemptOutcome | null;
  follow_up: GrowthAttemptFollowUp | null;
  journal_text: string | null;
  step_snapshot: GrowthFirstStep | null;
  created_at: string;
}

export interface GrowthPlanUpdate {
  goal: string;
  formulation: string;
  milestones: GrowthMilestone[];
  current_focus: string;
  evidence_summary: string;
}

export interface GrowthAdaptiveResponse {
  id: string;
  plan_id: string;
  interaction_id: string;
  user_id: string;
  response_type: "reflection" | "clarification" | "next_step" | "plan_revision";
  message: string;
  clarification_question: string | null;
  next_step: GrowthFirstStep | null;
  proposed_plan_update: GrowthPlanUpdate | null;
  proposed_step_completion: boolean;
  confirmation_status: "none" | "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface GrowthPlanExperience {
  plan: GrowthPlanProposal;
  activeStep: GrowthStep | null;
  interactions: GrowthInteraction[];
  latestResponse: GrowthAdaptiveResponse | null;
  pendingInteractionId: string | null;
}

export type GrowthGenerationResult =
  | { result_type: "clarification"; clarification_question: string; plan: null }
  | { result_type: "proposal"; clarification_question: null; plan: GrowthPlanProposal };

export const EMPTY_GROWTH_INTAKE: GrowthIntakeAnswers = {
  current_situation: "",
  recent_example: "",
  desired_change: "",
  why_it_matters: "",
  prior_attempts: "",
  likely_barriers: "",
  practice_context: "",
  challenge_level: "balanced",
  disliked_guidance: "",
  boundaries: "",
  clarifications: [],
};

export const EMPTY_EVENT_PREFERENCES: GrowthEventPreferences = {
  enabled: false,
  approximate_location: "",
  travel_radius: "",
  availability: "",
  cost_preference: "",
  accessibility_needs: "",
};
