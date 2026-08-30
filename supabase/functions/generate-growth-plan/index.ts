import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import {
  buildGrowthGuidanceInput,
  GROWTH_GUIDANCE_MODEL,
  GROWTH_GUIDANCE_PROMPT_VERSION,
  GROWTH_GUIDANCE_SYSTEM_PROMPT,
  GROWTH_PLAN_SCHEMA,
  getEvidenceClarification,
  validateGrowthModelResult,
} from '../_shared/growthGuidance.ts';

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

async function fingerprint(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function generateStructuredPlan(apiKey: string, input: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROWTH_GUIDANCE_MODEL,
      temperature: 0.45,
      input: [
        { role: 'system', content: GROWTH_GUIDANCE_SYSTEM_PROMPT },
        { role: 'user', content: input },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'personalized_growth_plan',
          strict: true,
          schema: GROWTH_PLAN_SCHEMA,
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}`);
  const data = await response.json();
  const outputText = data?.output
    ?.flatMap((item: { content?: unknown[] }) => item.content || [])
    .find((item: { type?: string }) => item.type === 'output_text')?.text;
  if (typeof outputText !== 'string' || !outputText) {
    throw new Error('Model returned no structured output');
  }
  return validateGrowthModelResult(JSON.parse(outputText));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ error: 'method_not_allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  const authorization = req.headers.get('Authorization');

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !openaiApiKey) {
    return respond({ error: 'missing_server_configuration' }, 500);
  }
  if (!authorization) return respond({ error: 'unauthorized' }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const token = authorization.replace(/^Bearer\s+/i, '');
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return respond({ error: 'unauthorized' }, 401);

  const service = createClient(supabaseUrl, serviceRoleKey);
  let generationRequestId: string | null = null;

  try {
    const body = await req.json();
    const intakeId = typeof body?.intake_id === 'string' ? body.intake_id : '';
    const correction = typeof body?.correction === 'string' ? body.correction.trim() : null;
    const previousPlanId = typeof body?.plan_id === 'string' ? body.plan_id : null;
    const locale = body?.locale === 'it' ? 'it' : 'en';
    if (!intakeId) return respond({ error: 'intake_id_required' }, 400);
    if ((correction && !previousPlanId) || (previousPlanId && !correction)) {
      return respond({ error: 'correction_and_plan_id_must_be_supplied_together' }, 400);
    }

    const [
      { data: intake, error: intakeError },
      { data: eventPreferences, error: eventPreferencesError },
    ] = await Promise.all([
      service
        .from('growth_intakes')
        .select('id, user_id, answers, status')
        .eq('id', intakeId)
        .eq('user_id', authData.user.id)
        .maybeSingle(),
      service
        .from('growth_event_preferences')
        .select('enabled, approximate_location, travel_radius, availability, cost_preference, accessibility_needs')
        .eq('user_id', authData.user.id)
        .eq('intake_id', intakeId)
        .maybeSingle(),
    ]);

    if (intakeError) throw intakeError;
    if (eventPreferencesError) throw eventPreferencesError;
    if (!intake || intake.status === 'abandoned') return respond({ error: 'intake_not_found' }, 404);
    if (!correction && intake.status !== 'in_progress') {
      return respond({ error: 'invalid_generation_transition' }, 409);
    }
    if (correction && intake.status !== 'proposed') {
      return respond({ error: 'invalid_correction_transition' }, 409);
    }

    const evidenceClarification = correction
      ? null
      : getEvidenceClarification(intake.answers, locale);
    if (evidenceClarification) {
      return respond({
        result_type: 'clarification',
        clarification_question: evidenceClarification,
        plan: null,
      });
    }

    let priorPlan: unknown = null;
    if (previousPlanId) {
      const { data, error } = await service
        .from('growth_plans')
        .select('id, goal, formulation, milestones, current_focus, first_step')
        .eq('id', previousPlanId)
        .eq('intake_id', intakeId)
        .eq('user_id', authData.user.id)
        .eq('status', 'proposed')
        .maybeSingle();
      if (error) throw error;
      if (!data) return respond({ error: 'plan_not_found' }, 404);
      priorPlan = data;
    }

    const requestFingerprint = await fingerprint({
      intake_id: intakeId,
      answers: intake.answers,
      previous_plan_id: previousPlanId,
      correction,
    });
    const { data: claimedRequestId, error: claimError } = await service.rpc(
      'claim_growth_plan_generation',
      {
        p_user_id: authData.user.id,
        p_intake_id: intakeId,
        p_request_fingerprint: requestFingerprint,
        p_previous_plan_id: previousPlanId,
      },
    );
    if (claimError) throw claimError;
    if (!claimedRequestId) return respond({ error: 'generation_rate_limited' }, 429);
    generationRequestId = claimedRequestId as string;

    const generated = await generateStructuredPlan(
      openaiApiKey,
      buildGrowthGuidanceInput({
        answers: intake.answers,
        eventPreferences: eventPreferences?.enabled ? eventPreferences : null,
        locale,
        priorPlan,
        correction,
      }),
    );
    if (generated.result_type === 'clarification') {
      const { error: finishError } = await service.rpc('finish_growth_plan_generation', {
        p_request_id: generationRequestId,
        p_status: 'completed',
      });
      if (finishError) throw finishError;
      generationRequestId = null;
      return respond(generated);
    }

    const plan = generated.plan;
    if (!plan) throw new Error('Validated proposal is missing its plan');
    const { data: savedPlan, error: persistError } = await service.rpc(
      'persist_growth_plan_proposal',
      {
        p_user_id: authData.user.id,
        p_intake_id: intakeId,
        p_goal: plan.goal,
        p_formulation: plan.formulation,
        p_milestones: plan.milestones,
        p_current_focus: plan.current_focus,
        p_first_step: plan.first_step,
        p_model_name: GROWTH_GUIDANCE_MODEL,
        p_prompt_version: GROWTH_GUIDANCE_PROMPT_VERSION,
        p_expected_answers: intake.answers,
        p_expected_event_preferences: eventPreferences,
        p_previous_plan_id: previousPlanId,
        p_correction: correction,
      },
    );
    if (persistError) throw persistError;

    const { error: finishError } = await service.rpc('finish_growth_plan_generation', {
      p_request_id: generationRequestId,
      p_status: 'completed',
    });
    if (finishError) console.error('Could not finish growth generation request:', finishError);
    generationRequestId = null;

    return respond({ result_type: 'proposal', clarification_question: null, plan: savedPlan });
  } catch (error) {
    if (generationRequestId) {
      await service.rpc('finish_growth_plan_generation', {
        p_request_id: generationRequestId,
        p_status: 'failed',
      });
    }
    console.error('generate-growth-plan failed:', error);
    return respond({ error: 'growth_plan_generation_failed' }, 500);
  }
});
