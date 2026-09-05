import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import {
  dedupeGrowthEvents,
  eventModelContext,
  GROWTH_EVENT_MODEL,
  GROWTH_EVENT_PROMPT,
  GROWTH_EVENT_PROMPT_VERSION,
  GROWTH_EVENT_SCHEMA,
  validateEventSelection,
} from "../_shared/growthEvents.ts";

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return respond({ error: "method_not_allowed" }, 405);
  }
  const url = Deno.env.get("SUPABASE_URL"),
    key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!url || !key) return respond({ error: "missing_configuration" }, 500);
  const service = createClient(url, key);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return respond({ error: "unauthorized" }, 401);
  const { data: auth, error: authError } = await service.auth.getUser(token);
  if (authError || !auth.user) return respond({ error: "unauthorized" }, 401);
  let claimedId: string | null = null;
  try {
    const body = await req.json();
    if (
      typeof body?.selection_id !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(body.selection_id)
    ) return respond({ error: "selection_id_required" }, 400);
    const locale = body.locale === "it" ? "Italian" : "English";
    const { data: previous, error: previousError } = await service.from(
      "growth_event_selections",
    ).select("*").eq("id", body.selection_id).eq("user_id", auth.user.id)
      .maybeSingle();
    if (previousError) throw previousError;
    if (previous) {
      return previous.status === "started" || previous.status === "failed"
        ? respond({ error: "retry_with_new_request" }, 409)
        : respond({ selection: previous });
    }
    const { data: selection, error: claimError } = await service.rpc(
      "claim_growth_event_selection",
      { p_id: body.selection_id, p_user_id: auth.user.id },
    );
    if (claimError) throw claimError;
    claimedId = selection.id;
    const [plan, intake, step, candidatesResult, feedback, evidence] =
      await Promise.all([
        service.from("growth_plans").select(
          "goal,formulation,milestones,current_focus",
        ).eq("id", selection.plan_id).single(),
        service.from("growth_plans").select("growth_intakes(answers)").eq(
          "id",
          selection.plan_id,
        ).single(),
        service.from("growth_steps").select(
          "title,rationale,action,completion_criterion",
        ).eq("user_id", auth.user.id).eq("status", "active").maybeSingle(),
        service.rpc("growth_event_candidates", {
          p_user_id: auth.user.id,
          p_preferences: selection.preferences_snapshot,
        }),
        service.from("growth_event_selections").select(
          "rejection_reason,growth_events(title,category,location)",
        ).eq("user_id", auth.user.id).eq("status", "rejected").order(
          "created_at",
          { ascending: false },
        ).limit(12),
        service.from("growth_interactions").select(
          "kind,request_kind,report_outcome,follow_up,journal_text",
        ).eq("user_id", auth.user.id).order("created_at", { ascending: false })
          .limit(8),
      ]);
    for (
      const result of [plan, intake, step, candidatesResult, feedback, evidence]
    ) if (result.error) throw result.error;
    const candidates = dedupeGrowthEvents(candidatesResult.data || []);
    let result: ReturnType<typeof validateEventSelection> = {
      event_id: null,
      explanation: locale === "Italian"
        ? "Non ho trovato un'opportunità verificata adatta ai tuoi vincoli. Puoi continuare con il tuo passo attuale o chiedere un consiglio per una situazione quotidiana."
        : "I couldn't find a verified opportunity within your constraints. You can continue with your current step or ask for guidance for an everyday situation.",
      fit: {},
      next_step: null,
    };
    if (candidates.length) {
      if (!apiKey) throw new Error("Model configuration required");
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model: GROWTH_EVENT_MODEL,
          temperature: 0.25,
          input: [
            { role: "system", content: GROWTH_EVENT_PROMPT },
            {
              role: "user",
              content: JSON.stringify({
                locale,
                now: new Date().toISOString(),
                confirmed_plan: plan.data,
                original_evidence: intake.data,
                current_step: step.data,
                preferences: selection.preferences_snapshot,
                recent_user_evidence: evidence.data,
                prior_event_rejections: feedback.data,
                candidates: candidates.map(eventModelContext),
              }),
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "growth_event_selection",
              strict: true,
              schema: GROWTH_EVENT_SCHEMA,
            },
          },
        }),
      });
      if (!response.ok) throw new Error(`Model status ${response.status}`);
      const output = await response.json();
      const raw = output.output?.flatMap((item: { content?: unknown[] }) =>
        item.content || []
      ).find((item: { type?: string }) => item.type === "output_text")?.text;
      result = validateEventSelection(JSON.parse(raw), candidates);
    }
    const { data: saved, error: saveError } = await service.rpc(
      "finish_growth_event_selection",
      {
        p_id: selection.id,
        p_user_id: auth.user.id,
        p_event_id: result.event_id,
        p_explanation: result.explanation,
        p_step: result.next_step,
        p_model: candidates.length ? GROWTH_EVENT_MODEL : "eligibility-filter",
        p_prompt: GROWTH_EVENT_PROMPT_VERSION,
        p_event_snapshot: result.event_id
          ? candidatesResult.data.find((event: { id: string }) =>
            event.id === result.event_id
          )
          : null,
      },
    );
    if (saveError) throw saveError;
    return respond({ selection: saved });
  } catch {
    if (claimedId) {
      await service.from("growth_event_selections").update({ status: "failed" })
        .eq("id", claimedId).eq("user_id", auth.user.id).eq(
          "status",
          "started",
        );
    }
    return respond({ error: "event_selection_failed" }, 409);
  }
});
