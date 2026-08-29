import { GrowthIntakeAnswers } from "../types/growthGuidance";

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
