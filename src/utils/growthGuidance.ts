import {
  GrowthAttemptFollowUp,
  GrowthAttemptOutcome,
  GrowthIntakeAnswers,
} from "../types/growthGuidance";

export const MIN_GROWTH_CLARIFICATION_WORDS = 4;

export const GROWTH_ATTEMPT_FOLLOW_UPS: Record<
  "attempted" | "not_attempted",
  Array<[GrowthAttemptFollowUp, string]>
> = {
  attempted: [
    ["easier_than_expected", "Easier than expected"],
    ["about_the_same", "About the same"],
    ["harder_than_expected", "Harder than expected"],
    ["not_sure", "Not sure"],
    ["other", "Other"],
  ],
  not_attempted: [
    ["no_opportunity", "No opportunity"],
    ["forgot", "Forgot"],
    ["too_uncomfortable", "Too uncomfortable"],
    ["not_relevant", "Not relevant"],
    ["other", "Other"],
  ],
};

export function getGrowthAttemptFollowUps(outcome: GrowthAttemptOutcome) {
  return GROWTH_ATTEMPT_FOLLOW_UPS[
    outcome === "didnt_do_it" ? "not_attempted" : "attempted"
  ];
}

export function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export type GrowthIntakeQuestionStep =
  | "situation"
  | "direction"
  | "attempts"
  | "barriers"
  | "preferences"
  | "boundaries";

export function getGrowthIntakeResumeStep(
  answers: GrowthIntakeAnswers
): GrowthIntakeQuestionStep {
  if (!answers.current_situation.trim() || !answers.recent_example.trim()) return "situation";
  if (!answers.desired_change.trim() || !answers.why_it_matters.trim()) return "direction";
  if (!answers.prior_attempts.trim()) return "attempts";
  if (!answers.likely_barriers.trim() || !answers.practice_context.trim()) return "barriers";
  if (!answers.disliked_guidance.trim()) return "preferences";
  return "boundaries";
}
