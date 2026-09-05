import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import {
  buildGrowthAdaptationInput,
  getGrowthAdaptationDecisionContext,
  getGrowthAdaptationRepair,
  getGrowthAdaptationSchema,
  GROWTH_ADAPTATION_MODEL,
  GROWTH_ADAPTATION_PROMPT_VERSION,
  GROWTH_ADAPTATION_SYSTEM_PROMPT,
  validateGrowthAdaptationResult,
} from "../_shared/growthAdaptation.ts";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

async function generateAdaptation(
  apiKey: string,
  input: string,
  interactionKind: "report" | "journal",
  requiresPlanRevision: boolean,
  canProposeStepCompletion: boolean,
  isGuidanceRequest: boolean,
) {
  const requestGeneration = async (
    repairInstruction: string | null,
    forcePlanRevision = false,
  ) => {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROWTH_ADAPTATION_MODEL,
        temperature: 0.35,
        input: [
          { role: "system", content: GROWTH_ADAPTATION_SYSTEM_PROMPT },
          {
            role: "user",
            content: repairInstruction
              ? `${input}\n\nApplication contract correction:\n${repairInstruction}`
              : input,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "growth_adaptation",
            strict: true,
            schema: getGrowthAdaptationSchema(
              interactionKind,
              forcePlanRevision,
              canProposeStepCompletion,
            ),
          },
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }
    const data = await response.json();
    const outputText = data?.output
      ?.flatMap((item: { content?: unknown[] }) => item.content || [])
      .find((item: { type?: string }) => item.type === "output_text")?.text;
    if (typeof outputText !== "string" || !outputText) {
      throw new Error("Model returned no structured adaptation");
    }
    return validateGrowthAdaptationResult(
      JSON.parse(outputText),
      interactionKind,
      canProposeStepCompletion,
      isGuidanceRequest,
    );
  };

  const generated = await requestGeneration(null);
  const repair = getGrowthAdaptationRepair(
    generated,
    interactionKind,
    requiresPlanRevision,
  );
  if (repair) {
    return requestGeneration(repair.instruction, repair.forcePlanRevision);
  }
  return generated;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return respond({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  const authorization = req.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !openaiApiKey) {
    return respond({ error: "missing_server_configuration" }, 500);
  }
  if (!authorization) return respond({ error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const token = authorization.replace(/^Bearer\s+/i, "");
  const { data: authData, error: authError } = await userClient.auth.getUser(
    token,
  );
  if (authError || !authData.user) {
    return respond({ error: "unauthorized" }, 401);
  }

  const service = createClient(supabaseUrl, serviceRoleKey);
  let requestId: string | null = null;
  try {
    const body = await req.json();
    const interactionId = typeof body?.interaction_id === "string"
      ? body.interaction_id
      : "";
    const locale = body?.locale === "it" ? "it" : "en";
    if (!interactionId) {
      return respond({ error: "interaction_id_required" }, 400);
    }

    const { data: existing, error: existingError } = await service
      .from("growth_adaptive_responses")
      .select("*")
      .eq("interaction_id", interactionId)
      .eq("user_id", authData.user.id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return respond({ response: existing });

    const { data: interaction, error: interactionError } = await service
      .from("growth_interactions")
      .select("*")
      .eq("id", interactionId)
      .eq("user_id", authData.user.id)
      .maybeSingle();
    if (interactionError) throw interactionError;
    if (!interaction) return respond({ error: "interaction_not_found" }, 404);

    const { data: plan, error: planError } = await service
      .from("growth_plans")
      .select(
        "id, intake_id, version, status, goal, formulation, milestones, current_focus, first_step",
      )
      .eq("id", interaction.plan_id)
      .eq("user_id", authData.user.id)
      .eq("status", "active")
      .maybeSingle();
    if (planError) throw planError;
    if (!plan) return respond({ error: "active_plan_not_found" }, 409);

    const { data: claimedId, error: claimError } = await service.rpc(
      "claim_growth_adaptation",
      { p_user_id: authData.user.id, p_interaction_id: interactionId },
    );
    if (claimError) throw claimError;
    if (!claimedId) {
      return respond({ error: "adaptation_in_progress_or_rate_limited" }, 429);
    }
    requestId = claimedId as string;

    const [
      intakeResult,
      stepResult,
      interactionsResult,
      responsesResult,
      evidenceResult,
    ] = await Promise.all([
      service.from("growth_intakes").select("answers").eq(
        "id",
        plan.intake_id,
      ).single(),
      service.from("growth_steps").select("*").eq("user_id", authData.user.id)
        .eq("status", "active").maybeSingle(),
      service.from("growth_interactions").select(
        "id, kind, request_kind, report_outcome, follow_up, journal_text, voice_journal_id, step_snapshot, created_at",
      )
        .eq("user_id", authData.user.id)
        .neq("id", interactionId)
        .order("created_at", {
          ascending: false,
        }).limit(24),
      service.from("growth_adaptive_responses").select(
        "response_type, message, clarification_question, proposed_plan_update, confirmation_status, created_at",
      )
        .eq("user_id", authData.user.id).order("created_at", {
          ascending: false,
        }).limit(8),
      service.from("growth_plan_evidence")
        .select("kind, content, created_at")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);
    if (intakeResult.error) throw intakeResult.error;
    if (stepResult.error) throw stepResult.error;
    if (interactionsResult.error) throw interactionsResult.error;
    if (responsesResult.error) throw responsesResult.error;
    if (evidenceResult.error) throw evidenceResult.error;

    const recentInteractions = (interactionsResult.data || []).slice(0, 8);
    const decisionContext = getGrowthAdaptationDecisionContext(
      interaction,
      recentInteractions,
      plan,
    );
    const generated = await generateAdaptation(
      openaiApiKey,
      buildGrowthAdaptationInput({
        locale,
        originalIntake: intakeResult.data.answers,
        plan,
        activeStep: stepResult.data || interaction.step_snapshot,
        interaction,
        recentInteractions,
        selectedOlderEvidence: [
          ...(interactionsResult.data || []).slice(8, 12),
          ...(evidenceResult.data || []),
        ],
        recentResponses: responsesResult.data || [],
      }),
      interaction.kind,
      decisionContext.requires_plan_revision_for_repeated_contradiction,
      interaction.kind === "journal" && interaction.step_id !== null &&
        !interaction.request_kind,
      !!interaction.request_kind,
    );

    const { data: saved, error: persistError } = await service.rpc(
      "persist_growth_adaptive_response_if_current",
      {
        p_request_id: requestId,
        p_user_id: authData.user.id,
        p_interaction_id: interactionId,
        p_response_type: generated.response_type,
        p_message: generated.message,
        p_clarification_question: generated.clarification_question,
        p_next_step: generated.next_step,
        p_proposed_plan_update: generated.proposed_plan_update,
        p_proposed_step_completion: generated.proposed_step_completion,
        p_model_name: GROWTH_ADAPTATION_MODEL,
        p_prompt_version: GROWTH_ADAPTATION_PROMPT_VERSION,
      },
    );
    if (persistError) throw persistError;
    await service.rpc("finish_growth_adaptation", {
      p_request_id: requestId,
      p_status: "completed",
    });
    requestId = null;
    return respond({ response: saved });
  } catch (error) {
    if (requestId) {
      await service.rpc("finish_growth_adaptation", {
        p_request_id: requestId,
        p_status: "failed",
      });
    }
    console.error("adapt-growth-plan failed:", error);
    return respond({ error: "growth_adaptation_failed" }, 500);
  }
});
