import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildGrowthAdaptationInput,
  getGrowthAdaptationRepair,
  getGrowthAdaptationSchema,
  GROWTH_ADAPTATION_SYSTEM_PROMPT,
  validateGrowthAdaptationResult,
} from "./growthAdaptation.ts";

const nextStep = {
  title: "Ask one follow-up",
  rationale:
    "This tests the part of the interaction that still felt difficult.",
  action:
    "Ask one relevant follow-up question in the next after-class conversation.",
  completion_criterion:
    "Ask one follow-up, regardless of how long the conversation lasts.",
  if_then_plan: null,
};

Deno.test("accepts a report response with a concrete next step", () => {
  const result = validateGrowthAdaptationResult({
    response_type: "next_step",
    message:
      "Starting felt easier; continuing is the useful part to test next.",
    clarification_question: null,
    next_step: nextStep,
    proposed_plan_update: null,
    proposed_step_completion: false,
  }, "report");
  assertEquals(result.next_step?.title, "Ask one follow-up");
});

Deno.test("requests a forced revision when structured evidence contradicts the plan", () => {
  const repair = getGrowthAdaptationRepair(
    {
      response_type: "next_step",
      message: "Try another greeting.",
      clarification_question: null,
      next_step: nextStep,
      proposed_plan_update: null,
      proposed_step_completion: false,
    },
    "report",
    true,
  );
  assertEquals(repair?.forcePlanRevision, true);
});

Deno.test("requests one reconsideration for a report-only reflection", () => {
  const repair = getGrowthAdaptationRepair(
    {
      response_type: "reflection",
      message: "That is useful evidence.",
      clarification_question: null,
      next_step: null,
      proposed_plan_update: null,
      proposed_step_completion: false,
    },
    "report",
    false,
  );
  assertEquals(repair?.forcePlanRevision, false);
});

Deno.test("rejects a journal-only completion flag on a report", () => {
  assertThrows(() =>
    validateGrowthAdaptationResult({
      response_type: "next_step",
      message: "You completed it, so here is the next step.",
      clarification_question: null,
      next_step: nextStep,
      proposed_plan_update: null,
      proposed_step_completion: true,
    }, "report")
  );
});

Deno.test("report schema disallows journal-only implicit completion", () => {
  assertEquals(
    getGrowthAdaptationSchema("report").properties.proposed_step_completion,
    { type: "boolean", enum: [false] },
  );
});

Deno.test("journal schema disallows completion when there is no active step", () => {
  assertEquals(
    getGrowthAdaptationSchema("journal", false, false).properties
      .proposed_step_completion,
    { type: "boolean", enum: [false] },
  );
});

Deno.test("rejects a completion proposal when the journal has no active step", () => {
  assertThrows(() =>
    validateGrowthAdaptationResult(
      {
        response_type: "reflection",
        message: "There is no active step to complete.",
        clarification_question: null,
        next_step: null,
        proposed_plan_update: null,
        proposed_step_completion: true,
      },
      "journal",
      false,
    )
  );
});

Deno.test("rejects a completion question when the journal has no active step", () => {
  assertThrows(() =>
    validateGrowthAdaptationResult(
      {
        response_type: "clarification",
        message: "This sounds like a completed action.",
        clarification_question:
          "Should this count as completing the active step?",
        next_step: null,
        proposed_plan_update: null,
        proposed_step_completion: false,
      },
      "journal",
      false,
    )
  );
});

Deno.test("requires a complete next step with a plan revision", () => {
  assertThrows(() =>
    validateGrowthAdaptationResult({
      response_type: "plan_revision",
      message: "The recent evidence suggests the focus was wrong.",
      clarification_question: null,
      next_step: null,
      proposed_plan_update: {
        goal: "Reconnect with drawing for enjoyment.",
        formulation:
          "Time matters, but productivity may not be the useful frame.",
        milestones: [
          {
            title: "Notice enjoyment",
            description: "Identify satisfying moments.",
          },
          {
            title: "Return gently",
            description: "Make brief contact with drawing.",
          },
          {
            title: "Protect the practice",
            description: "Find a sustainable context.",
          },
        ],
        current_focus: "Reconnect with enjoyment.",
        evidence_summary:
          "The user said the scheduling focus missed why drawing matters.",
      },
      proposed_step_completion: false,
    }, "journal")
  );
});

Deno.test("derives response type from a valid next step", () => {
  const result = validateGrowthAdaptationResult({
    response_type: "reflection",
    message: "A small continuation experiment fits the evidence.",
    clarification_question: null,
    next_step: nextStep,
    proposed_plan_update: null,
    proposed_step_completion: false,
  }, "report");
  assertEquals(result.response_type, "next_step");
});

Deno.test("context keeps model responses separate from user evidence", () => {
  const input = JSON.parse(buildGrowthAdaptationInput({
    locale: "en",
    originalIntake: { desired_change: "Speak earlier" },
    plan: {
      goal: "Contribute earlier",
      formulation: "Discomfort may be the main blocker.",
    },
    activeStep: nextStep,
    interaction: {
      kind: "report",
      report_outcome: "partly",
      follow_up: "easier_than_expected",
    },
    recentInteractions: [
      { report_outcome: "didnt_do_it", follow_up: "no_opportunity" },
      { report_outcome: "didnt_do_it", follow_up: "not_relevant" },
    ],
    selectedOlderEvidence: [{ report_outcome: "did_it" }],
    recentResponses: [{ message: "Maybe you were avoiding it." }],
  }));
  assertEquals(
    input.recent_user_evidence_newest_first[0].follow_up,
    "no_opportunity",
  );
  assertEquals(
    input.recent_model_responses_not_user_evidence[0].message,
    "Maybe you were avoiding it.",
  );
  assertEquals(input.selected_older_user_evidence[0].report_outcome, "did_it");
  assertEquals(input.decision_context.report_has_closed_active_step, true);
  assertEquals(
    input.decision_context.requires_plan_revision_for_repeated_contradiction,
    true,
  );
});

Deno.test("does not force another revision once the plan is opportunity-focused", () => {
  const input = JSON.parse(buildGrowthAdaptationInput({
    locale: "en",
    originalIntake: {},
    plan: { formulation: "Limited opportunities are the current constraint." },
    activeStep: nextStep,
    interaction: {
      kind: "report",
      report_outcome: "didnt_do_it",
      follow_up: "no_opportunity",
    },
    recentInteractions: [
      { report_outcome: "didnt_do_it", follow_up: "not_relevant" },
      { report_outcome: "partly", follow_up: "easier_than_expected" },
    ],
    recentResponses: [],
  }));
  assertEquals(
    input.decision_context.requires_plan_revision_for_repeated_contradiction,
    false,
  );
});

Deno.test("does not treat a negated blocker in a retained revision as current", () => {
  const input = JSON.parse(buildGrowthAdaptationInput({
    locale: "en",
    originalIntake: {},
    plan: {
      formulation:
        "Limited opportunities to meet neighbors, rather than discomfort, are the main barrier to initiating contact.",
    },
    activeStep: nextStep,
    interaction: {
      kind: "report",
      report_outcome: "didnt_do_it",
      follow_up: "no_opportunity",
    },
    recentInteractions: [
      { report_outcome: "didnt_do_it", follow_up: "not_relevant" },
      { report_outcome: "partly", follow_up: "easier_than_expected" },
    ],
    recentResponses: [],
  }));
  assertEquals(
    input.decision_context.requires_plan_revision_for_repeated_contradiction,
    false,
  );
});

Deno.test("normalizes an explicit journal count question into a pending completion", () => {
  const result = validateGrowthAdaptationResult({
    response_type: "clarification",
    message: "This sounds like the active behavior.",
    clarification_question: "Should this count as completing the active step?",
    next_step: null,
    proposed_plan_update: null,
    proposed_step_completion: false,
  }, "journal");
  assertEquals(result.proposed_step_completion, true);
});

Deno.test("keeps a reviewed voice transcript identifiable in model context", () => {
  const input = JSON.parse(buildGrowthAdaptationInput({
    locale: "en",
    originalIntake: {},
    plan: { goal: "Contribute earlier" },
    activeStep: nextStep,
    interaction: {
      kind: "journal",
      journal_text: "I did not talk to them.",
      voice_journal_id: "reviewed-voice-journal",
    },
    recentInteractions: [],
    recentResponses: [],
  }));
  assertEquals(
    input.current_user_interaction.voice_journal_id,
    "reviewed-voice-journal",
  );
  assertEquals(
    input.current_user_interaction.journal_text,
    "I did not talk to them.",
  );
});

Deno.test("voice guidance prompt covers uncertainty, emotional weight, and safety", () => {
  assertEquals(
    GROWTH_ADAPTATION_SYSTEM_PROMPT.includes("transcription uncertainty"),
    true,
  );
  assertEquals(
    GROWTH_ADAPTATION_SYSTEM_PROMPT.includes(
      "Longer or more emotional speech is not stronger evidence",
    ),
    true,
  );
  assertEquals(
    GROWTH_ADAPTATION_SYSTEM_PROMPT.includes("self-harm, immediate danger"),
    true,
  );
});
