import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const { API_URL, ANON_KEY, SERVICE_ROLE_KEY } = process.env;
if (!API_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error('API_URL, ANON_KEY, and SERVICE_ROLE_KEY are required');
}

const alice = createClient(API_URL, ANON_KEY);
const bob = createClient(API_URL, ANON_KEY);
const service = createClient(API_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let intakeId;
let planId;

try {
  const { error: aliceAuthError } = await alice.auth.signInWithPassword({
    email: 'alice@test.com',
    password: 'password123',
  });
  if (aliceAuthError) throw aliceAuthError;

  const answers = {
    current_situation: 'I prepare useful ideas for remote meetings but wait too long to share them.',
    recent_example: 'Yesterday I stayed quiet until my manager raised the same launch concern near the end.',
    desired_change: 'I want to contribute relevant ideas earlier while staying thoughtful and professional.',
    why_it_matters: 'My work would be more useful and decisions might improve.',
    prior_attempts: 'Writing notes helps me prepare but not choose a safe moment to speak.',
    likely_barriers: 'I worry about interrupting or being wrong in front of senior colleagues.',
    practice_context: 'Two recurring video meetings where I know the agenda in advance.',
    challenge_level: 'gentle',
    disliked_guidance: 'Performative confidence exercises and generic public-speaking challenges.',
    boundaries: 'Keep it within safe professional behavior and existing meetings.',
    clarifications: [],
  };

  const { data: intake, error: intakeError } = await alice
    .from('growth_intakes')
    .insert({ user_id: '11111111-1111-1111-1111-111111111111', answers })
    .select('id')
    .single();
  if (intakeError) throw intakeError;
  intakeId = intake.id;

  const { data: generated, error: generationError } = await alice.functions.invoke(
    'generate-growth-plan',
    { body: { intake_id: intakeId, locale: 'en', correction: null, plan_id: null } },
  );
  if (generationError) throw generationError;
  if (generated?.result_type !== 'proposal' || !generated.plan?.id) {
    throw new Error(`Expected a persisted proposal, received ${JSON.stringify(generated)}`);
  }
  planId = generated.plan.id;

  const { data: confirmed, error: confirmationError } = await alice.rpc(
    'confirm_growth_plan',
    { p_plan_id: planId },
  );
  if (confirmationError) throw confirmationError;
  if (confirmed?.status !== 'active') throw new Error('Plan was not activated');

  const { data: activeStep, error: stepError } = await alice
    .from('growth_steps')
    .select('id')
    .eq('status', 'active')
    .single();
  if (stepError) throw stepError;

  const journalId = randomUUID();
  const { error: journalError } = await alice.rpc('submit_growth_interaction', {
    p_interaction_id: journalId,
    p_plan_id: planId,
    p_step_id: activeStep.id,
    p_kind: 'journal',
    p_report_outcome: null,
    p_follow_up: null,
    p_journal_text: 'The meeting was cancelled, so there was no opportunity today.',
  });
  if (journalError) throw journalError;
  const { data: journalAdaptation, error: journalAdaptationError } =
    await alice.functions.invoke('adapt-growth-plan', {
      body: { interaction_id: journalId, locale: 'en' },
    });
  if (journalAdaptationError) throw journalAdaptationError;
  if (!journalAdaptation?.response?.id) throw new Error('Journal adaptation was not persisted');
  if (journalAdaptation.response.confirmation_status === 'pending') {
    const { error: rejectionError } = await alice.rpc('confirm_growth_adaptive_response', {
      p_response_id: journalAdaptation.response.id,
      p_accepted: false,
    });
    if (rejectionError) throw rejectionError;
  }

  const reportId = randomUUID();
  const { error: reportError } = await alice.rpc('submit_growth_interaction', {
    p_interaction_id: reportId,
    p_plan_id: planId,
    p_step_id: activeStep.id,
    p_kind: 'report',
    p_report_outcome: 'didnt_do_it',
    p_follow_up: 'no_opportunity',
    p_journal_text: 'The meeting was cancelled.',
  });
  if (reportError) throw reportError;
  const { data: reportAdaptation, error: reportAdaptationError } =
    await alice.functions.invoke('adapt-growth-plan', {
      body: { interaction_id: reportId, locale: 'en' },
    });
  if (reportAdaptationError) throw reportAdaptationError;
  if (!reportAdaptation?.response?.id) throw new Error('Report adaptation was not persisted');

  const { count: interactionCount, error: historyError } = await alice
    .from('growth_interactions')
    .select('id', { count: 'exact', head: true });
  if (historyError) throw historyError;
  if (interactionCount !== 2) throw new Error('Journal and report history was not retained');

  const { error: bobAuthError } = await bob.auth.signInWithPassword({
    email: 'bob@test.com',
    password: 'password123',
  });
  if (bobAuthError) throw bobAuthError;
  const { data: leakedPlans, error: bobReadError } = await bob
    .from('growth_plans')
    .select('id')
    .eq('id', planId);
  if (bobReadError) throw bobReadError;
  if (leakedPlans.length !== 0) throw new Error('Growth plan leaked across users');

  console.log('growth guidance smoke test passed');
} finally {
  if (intakeId) {
    const { data: plans } = await service
      .from('growth_plans')
      .select('id')
      .eq('intake_id', intakeId);
    const planIds = (plans || []).map(({ id }) => id);
    const { data: interactions } = planIds.length
      ? await service.from('growth_interactions').select('id').in('plan_id', planIds)
      : { data: [] };
    const interactionIds = (interactions || []).map(({ id }) => id);
    if (interactionIds.length) {
      await service.from('growth_adaptation_requests').delete().in('interaction_id', interactionIds);
      await service.from('growth_adaptive_responses').delete().in('interaction_id', interactionIds);
    }
    if (planIds.length) {
      await service.from('growth_interactions').delete().in('plan_id', planIds);
      await service.from('growth_steps').delete().in('plan_id', planIds);
    }
    await service.from('growth_plan_evidence').delete().eq('intake_id', intakeId);
    await service.from('growth_plans').delete().eq('intake_id', intakeId);
    await service.from('growth_event_preferences').delete().eq('intake_id', intakeId);
    await service.from('growth_intakes').delete().eq('id', intakeId);
  }
  await Promise.all([alice.auth.signOut(), bob.auth.signOut()]);
}
