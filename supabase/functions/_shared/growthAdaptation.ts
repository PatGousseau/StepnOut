export const GROWTH_ADAPTATION_MODEL = "gpt-4.1-mini";
export const GROWTH_ADAPTATION_PROMPT_VERSION = "growth-adaptation-v1";

type StepDraft = {
  title: string;
  rationale: string;
  action: string;
  completion_criterion: string;
  if_then_plan: string | null;
};

type PlanUpdate = {
  goal: string;
  formulation: string;
  milestones: Array<{ title: string; description: string }>;
  current_focus: string;
  evidence_summary: string;
};

export type GrowthAdaptationResult = {
  response_type: "reflection" | "clarification" | "next_step" | "plan_revision";
  message: string;
  clarification_question: string | null;
  next_step: StepDraft | null;
  proposed_plan_update: PlanUpdate | null;
  proposed_step_completion: boolean;
};

export type GrowthAdaptationRepair = {
  instruction: string;
  forcePlanRevision: boolean;
};

const boundedString = (maxLength: number) => ({ type: "string", maxLength });
const nullableString = (maxLength: number) => ({
  anyOf: [boundedString(maxLength), { type: "null" }],
});

const stepSchema = {
  type: "object",
  properties: {
    title: boundedString(120),
    rationale: boundedString(500),
    action: boundedString(500),
    completion_criterion: boundedString(300),
    if_then_plan: nullableString(400),
  },
  required: [
    "title",
    "rationale",
    "action",
    "completion_criterion",
    "if_then_plan",
  ],
  additionalProperties: false,
};

export const GROWTH_ADAPTATION_SCHEMA = {
  type: "object",
  properties: {
    response_type: {
      type: "string",
      enum: ["reflection", "clarification", "next_step", "plan_revision"],
    },
    message: boundedString(1600),
    clarification_question: nullableString(300),
    next_step: { anyOf: [stepSchema, { type: "null" }] },
    proposed_plan_update: {
      anyOf: [
        {
          type: "object",
          properties: {
            goal: boundedString(600),
            formulation: boundedString(1000),
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: boundedString(120),
                  description: boundedString(400),
                },
                required: ["title", "description"],
                additionalProperties: false,
              },
            },
            current_focus: boundedString(500),
            evidence_summary: boundedString(1000),
          },
          required: [
            "goal",
            "formulation",
            "milestones",
            "current_focus",
            "evidence_summary",
          ],
          additionalProperties: false,
        },
        { type: "null" },
      ],
    },
    proposed_step_completion: { type: "boolean" },
  },
  required: [
    "response_type",
    "message",
    "clarification_question",
    "next_step",
    "proposed_plan_update",
    "proposed_step_completion",
  ],
  additionalProperties: false,
};

export function getGrowthAdaptationSchema(
  interactionKind: "report" | "journal",
  forcePlanRevision = false,
  canProposeStepCompletion = true,
) {
  const completionSchema = interactionKind === "report" ||
      !canProposeStepCompletion
    ? { type: "boolean", enum: [false] }
    : GROWTH_ADAPTATION_SCHEMA.properties.proposed_step_completion;
  if (forcePlanRevision) {
    return {
      ...GROWTH_ADAPTATION_SCHEMA,
      properties: {
        ...GROWTH_ADAPTATION_SCHEMA.properties,
        response_type: { type: "string", enum: ["plan_revision"] },
        clarification_question: { type: "null" },
        next_step: stepSchema,
        proposed_plan_update:
          GROWTH_ADAPTATION_SCHEMA.properties.proposed_plan_update.anyOf[0],
        proposed_step_completion: completionSchema,
      },
    };
  }
  if (interactionKind === "journal" && canProposeStepCompletion) {
    return GROWTH_ADAPTATION_SCHEMA;
  }
  return {
    ...GROWTH_ADAPTATION_SCHEMA,
    properties: {
      ...GROWTH_ADAPTATION_SCHEMA.properties,
      proposed_step_completion: completionSchema,
    },
  };
}

export const GROWTH_ADAPTATION_SYSTEM_PROMPT =
  `You adapt a confirmed, non-clinical personal growth plan using user-supplied evidence.

Evidence boundaries:
- Attempt reports, journal text, corrections, and confirmed revisions are evidence. Your own earlier responses and plan language are not evidence about the user.
- Keep interpretations tentative. Never diagnose, guilt, pressure, inflate praise, or turn one emotional entry into a lasting personal fact.
- A journal that appears to complete the active step must set proposed_step_completion true and ask for confirmation. Never silently count it.
- Before that confirmation, do not call the journal evidence progress, readiness, or a completed step. Ask plainly whether it should count as the step report.
- A changed goal, formulation, milestones, or focus must be a plan_revision grounded in an evidence_summary and must wait for user confirmation.

Adaptation:
- Distinguish capability, opportunity, and motivation explanations. No opportunity is not avoidance; forgetting is not discomfort; partial attempts can contain useful evidence.
- After a structured didn't-do-it / no-opportunity report caused by a one-time cancellation, return a next_step that preserves or reschedules the relevant experiment for the next real opportunity. Reflection alone would leave no active step.
- Completion does not require increased difficulty. Relevance outweighs completion. Repetition, consolidation, a different context, clarification, reflection, or no next step may be best.
- A next step must be safe, voluntary, specific, under the user's control, and connected to the confirmed goal and boundaries.
- After a report, next_step may repeat or replace the prior experiment. After a journal, a next step is only a proposal requiring confirmation.
- A structured report has already closed the active step. Before returning reflection alone, account for the fact that the user will have no active step. When the report describes a useful continuation target or says the completed action was irrelevant, return a next_step that addresses that evidence.
- If evidence is ambiguous, choose clarification. If reflection is more useful, return reflection with no next step.
- When three or more attempts materially contradict the working formulation, you must summarize the actual evidence and return a plan_revision with a meaningfully different strategy rather than reflection alone.
- Treat this as a clear contradiction requiring plan_revision when the history contains at least two opportunity or relevance failures plus an attempted interaction that was easier than expected, while the plan still names discomfort as the main blocker. A different next step alone is not enough because the stale formulation would remain persistent.
- When the input's decision_context.requires_plan_revision_for_repeated_contradiction is true, return plan_revision. This flag only counts the structured user evidence described above; it is not a model inference.
- Respect inactivity without inventing missed work or a backlog.
- When someone returns after a long gap without saying whether the old step still fits, return clarification and ask whether that exact step still fits. Do not infer missed work.
- When a report says a completed step was not relevant to the desired change, relevance outweighs completion: return a next_step that changes context or strategy toward the confirmed goal rather than reflection alone.

Output rules:
- clarification requires clarification_question and no next_step or plan update.
- next_step requires a complete next_step.
- plan_revision requires both a complete proposed_plan_update and a complete next_step.
- In a plan revision, order milestones so the current focus is first and later directions follow.
- reflection has no plan update. It may have no next step.
- proposed_step_completion is only for a journal that appears to report the active behavior.
- Write all user-visible text in the requested locale.`;

export function getGrowthAdaptationDecisionContext(
  interaction: unknown,
  recentInteractions: unknown[],
  plan?: unknown,
) {
  const current = interaction && typeof interaction === "object"
    ? interaction as Record<string, unknown>
    : {};
  const priorRecords = recentInteractions.filter((item) =>
    !!item && typeof item === "object"
  ) as Array<Record<string, unknown>>;
  const opportunityOrRelevanceCount =
    priorRecords.filter((item) =>
      item.follow_up === "no_opportunity" || item.follow_up === "not_relevant"
    ).length + (
      current.follow_up === "no_opportunity" ||
        current.follow_up === "not_relevant"
        ? 1
        : 0
    );
  const easierAttemptCount =
    priorRecords.filter((item) =>
      (item.report_outcome === "did_it" || item.report_outcome === "partly") &&
      item.follow_up === "easier_than_expected"
    ).length + (
      (current.report_outcome === "did_it" ||
          current.report_outcome === "partly") &&
        current.follow_up === "easier_than_expected"
        ? 1
        : 0
    );
  const planRecord = plan && typeof plan === "object"
    ? plan as Record<string, unknown>
    : {};
  const formulation = typeof planRecord.formulation === "string"
    ? planRecord.formulation.toLocaleLowerCase()
    : "";
  const opportunityFocus =
    /(?:main(?:ly)?|primary|current|actual|real|barrier|constraint|focus|rather than|instead of|soprattutto|principale|vincolo|ostacolo)[^.]{0,120}(?:opportunit|occasion|access|availability|timing|encounter|incontr|occas|disponibil|contesto)|(?:opportunit|occasion|access|availability|timing|encounter|incontr|occas|disponibil|contesto)[^.]{0,120}(?:main(?:ly)?|primary|current|actual|real|barrier|constraint|focus|rather than|instead of|soprattutto|principale|vincolo|ostacolo)/u
      .test(formulation);
  const planStillCentersInternalBlocker =
    /\b(discomfort|uncomfortable|anxious|anxiety|fear|afraid|avoid\w*|reluctan\w*|confidence|disagio|ansia|paura|evit\w*|riluttan\w*|fiducia)\b/u
      .test(formulation) && !opportunityFocus;
  return {
    report_has_closed_active_step: current.kind === "report",
    opportunity_or_relevance_report_count: opportunityOrRelevanceCount,
    easier_attempt_report_count: easierAttemptCount,
    current_plan_still_centers_internal_blocker:
      planStillCentersInternalBlocker,
    requires_plan_revision_for_repeated_contradiction:
      opportunityOrRelevanceCount >= 2 && easierAttemptCount >= 1 &&
      planStillCentersInternalBlocker,
  };
}

export function getGrowthAdaptationRepair(
  result: GrowthAdaptationResult,
  interactionKind: "report" | "journal",
  requiresPlanRevision: boolean,
): GrowthAdaptationRepair | null {
  if (requiresPlanRevision && result.response_type !== "plan_revision") {
    return {
      instruction:
        "The structured user-evidence counts require a plan revision. Return a tentative, evidence-grounded plan_revision with a meaningfully different strategy and next step; do not return reflection or only a replacement step.",
      forcePlanRevision: true,
    };
  }
  if (interactionKind === "report" && result.response_type === "reflection") {
    return {
      instruction:
        "The explicit report already closed the active step. Reconsider the user's own report and optional detail for an actionable continuation. When they identified a continuation difficulty or said the action was irrelevant, return a next_step that addresses it. Keep reflection only if no step or clarification is genuinely more useful.",
      forcePlanRevision: false,
    };
  }
  return null;
}

export function buildGrowthAdaptationInput(params: {
  locale: string;
  originalIntake: unknown;
  plan: unknown;
  activeStep: unknown;
  interaction: unknown;
  recentInteractions: unknown[];
  selectedOlderEvidence?: unknown[];
  recentResponses: unknown[];
}) {
  const decisionContext = getGrowthAdaptationDecisionContext(
    params.interaction,
    params.recentInteractions,
    params.plan,
  );
  return JSON.stringify(
    {
      locale: params.locale === "it" ? "Italian" : "English",
      original_intake_primary_evidence: params.originalIntake,
      confirmed_working_plan: params.plan,
      active_step: params.activeStep,
      current_user_interaction: params.interaction,
      decision_context: decisionContext,
      recent_user_evidence_newest_first: params.recentInteractions.slice(0, 8),
      selected_older_user_evidence: (params.selectedOlderEvidence || []).slice(
        0,
        6,
      ),
      recent_model_responses_not_user_evidence: params.recentResponses.slice(
        0,
        8,
      ),
    },
    null,
    2,
  );
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validStep(step: StepDraft | null) {
  return !!step && isText(step.title) && isText(step.rationale) &&
    isText(step.action) &&
    isText(step.completion_criterion) &&
    (step.if_then_plan === null || isText(step.if_then_plan));
}

function validPlanUpdate(update: PlanUpdate | null) {
  return !!update && isText(update.goal) && isText(update.formulation) &&
    isText(update.current_focus) && isText(update.evidence_summary) &&
    Array.isArray(update.milestones) && update.milestones.length >= 3 &&
    update.milestones.length <= 4 &&
    update.milestones.every((item) =>
      isText(item?.title) && isText(item?.description)
    );
}

export function validateGrowthAdaptationResult(
  value: unknown,
  interactionKind: "report" | "journal",
  canProposeStepCompletion = true,
): GrowthAdaptationResult {
  if (!value || typeof value !== "object") {
    throw new Error("Adaptation output is not an object");
  }
  const result = value as GrowthAdaptationResult;
  if (
    !["reflection", "clarification", "next_step", "plan_revision"].includes(
      result.response_type,
    ) ||
    !isText(result.message) ||
    typeof result.proposed_step_completion !== "boolean"
  ) {
    throw new Error("Adaptation output does not satisfy the base contract");
  }
  if (
    result.proposed_step_completion &&
    (interactionKind !== "journal" || !canProposeStepCompletion)
  ) {
    throw new Error(
      "Only journal evidence tied to an active step can propose implicit step completion",
    );
  }
  const countQuestion = result.clarification_question || "";
  const asksToCountJournal = interactionKind === "journal" &&
    /\b(?:should|would you like|do you want|vuoi|dovrei|desideri)\b[\s\S]{0,180}\b(?:count|complet\w*|resoconto|conta\w*)\b/iu
      .test(countQuestion);
  if (asksToCountJournal && !canProposeStepCompletion) {
    throw new Error(
      "A journal without an active step cannot ask to confirm step completion",
    );
  }
  const normalized = asksToCountJournal
    ? { ...result, proposed_step_completion: true }
    : result;
  if (normalized.clarification_question !== null) {
    if (
      !isText(normalized.clarification_question) ||
      normalized.next_step !== null ||
      normalized.proposed_plan_update !== null
    ) throw new Error("Invalid clarification response");
    return { ...normalized, response_type: "clarification" };
  }
  if (normalized.proposed_plan_update !== null) {
    if (
      !validPlanUpdate(normalized.proposed_plan_update) ||
      !validStep(normalized.next_step)
    ) throw new Error("Plan revision is incomplete");
    return { ...normalized, response_type: "plan_revision" };
  }
  if (normalized.next_step !== null) {
    if (!validStep(normalized.next_step)) {
      throw new Error("Next-step response is missing a valid step");
    }
    return { ...normalized, response_type: "next_step" };
  }
  return { ...normalized, response_type: "reflection" };
}
