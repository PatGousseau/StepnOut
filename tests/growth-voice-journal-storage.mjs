import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const { API_URL, ANON_KEY, SERVICE_ROLE_KEY } = process.env;
if (!API_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error('API_URL, ANON_KEY, and SERVICE_ROLE_KEY are required');
}

const aliceId = '11111111-1111-1111-1111-111111111111';
const alice = createClient(API_URL, ANON_KEY);
const bob = createClient(API_URL, ANON_KEY);
const service = createClient(API_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const intakeId = randomUUID();
const planId = randomUUID();
const stepId = randomUUID();
const voiceId = randomUUID();
const interactionId = randomUUID();
const objectPath = `${aliceId}/${voiceId}.m4a`;

try {
  const [{ error: aliceAuthError }, { error: bobAuthError }] = await Promise.all([
    alice.auth.signInWithPassword({ email: 'alice@test.com', password: 'password123' }),
    bob.auth.signInWithPassword({ email: 'bob@test.com', password: 'password123' }),
  ]);
  if (aliceAuthError) throw aliceAuthError;
  if (bobAuthError) throw bobAuthError;

  const { error: intakeError } = await service.from('growth_intakes').insert({
    id: intakeId,
    user_id: aliceId,
    answers: { source: 'voice-storage-test' },
    status: 'confirmed',
  });
  if (intakeError) throw intakeError;
  const { error: planError } = await service.from('growth_plans').insert({
    id: planId,
    intake_id: intakeId,
    user_id: aliceId,
    version: 299,
    status: 'active',
    goal: 'Contribute earlier',
    formulation: 'Timing may be the current blocker.',
    milestones: [
      { title: 'Start', description: 'Contribute once' },
      { title: 'Continue', description: 'Ask a follow-up' },
      { title: 'Repeat', description: 'Try another context' },
    ],
    current_focus: 'Start one interaction',
    first_step: {
      title: 'Ask one question',
      rationale: 'Learn from one attempt',
      action: 'Ask in the meeting',
      completion_criterion: 'Ask once',
      if_then_plan: null,
    },
    model_name: 'test-model',
    prompt_version: 'test-prompt',
    confirmed_at: new Date().toISOString(),
  });
  if (planError) throw planError;
  const { error: stepError } = await service.from('growth_steps').insert({
    id: stepId,
    plan_id: planId,
    user_id: aliceId,
    sequence: 299,
    title: 'Ask one question',
    rationale: 'Learn from one attempt',
    action: 'Ask in the meeting',
    completion_criterion: 'Ask once',
  });
  if (stepError) throw stepError;

  const { error: beginError } = await alice.rpc('begin_growth_voice_journal', {
    p_voice_journal_id: voiceId,
    p_plan_id: planId,
    p_step_id: stepId,
    p_mime_type: 'audio/m4a',
    p_duration_ms: 12000,
  });
  if (beginError) throw beginError;

  const { error: uploadError } = await alice.storage
    .from('growth-journal-audio')
    .upload(objectPath, new Uint8Array([0, 1, 2, 3]), {
      contentType: 'audio/m4a',
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { error: bobDownloadError } = await bob.storage
    .from('growth-journal-audio')
    .download(objectPath);
  if (!bobDownloadError) throw new Error('Another user downloaded private journal audio');
  const { error: bobSignedUrlError } = await bob.storage
    .from('growth-journal-audio')
    .createSignedUrl(objectPath, 60);
  if (!bobSignedUrlError) throw new Error('Another user created a signed audio URL');
  const { data: bobVoiceRows, error: bobVoiceError } = await bob
    .from('growth_voice_journals')
    .select('id')
    .eq('id', voiceId);
  if (bobVoiceError) throw bobVoiceError;
  if (bobVoiceRows.length) throw new Error('Another user read private transcript metadata');

  const { error: reviewError } = await service.from('growth_voice_journals').update({
    status: 'review',
    machine_transcript: 'I did talk to them.',
    updated_at: new Date().toISOString(),
  }).eq('id', voiceId);
  if (reviewError) throw reviewError;
  const { error: submitError } = await alice.rpc('submit_growth_voice_journal', {
    p_voice_journal_id: voiceId,
    p_interaction_id: interactionId,
    p_reviewed_transcript: 'I did not talk to them.',
  });
  if (submitError) throw submitError;

  const { data: deletion, error: deletionError } = await alice.functions.invoke(
    'delete-growth-journal',
    { body: { interaction_id: interactionId } },
  );
  if (deletionError) {
    const detail = deletionError.context
      ? await deletionError.context.text()
      : deletionError.message;
    throw new Error(`Delete function failed: ${detail}`);
  }
  if (!deletion?.deleted) throw new Error(`Deletion failed: ${JSON.stringify(deletion)}`);

  const [{ data: retainedInteraction }, { data: retainedVoice }, { error: retainedAudioError }] =
    await Promise.all([
      service.from('growth_interactions').select('id').eq('id', interactionId),
      service.from('growth_voice_journals').select('id').eq('id', voiceId),
      service.storage.from('growth-journal-audio').download(objectPath),
    ]);
  if (retainedInteraction?.length || retainedVoice?.length || !retainedAudioError) {
    throw new Error('Voice journal deletion retained audio, transcript, or evidence');
  }

  console.log('growth voice journal storage test passed');
} finally {
  await service.storage.from('growth-journal-audio').remove([objectPath]);
  await service.from('growth_adaptive_responses').delete().eq('interaction_id', interactionId);
  await service.from('growth_adaptation_requests').delete().eq('interaction_id', interactionId);
  await service.from('growth_interactions').delete().eq('id', interactionId);
  await service.from('growth_voice_journals').delete().eq('id', voiceId);
  await service.from('growth_steps').delete().eq('id', stepId);
  await service.from('growth_plan_evidence').delete().eq('intake_id', intakeId);
  await service.from('growth_plans').delete().eq('id', planId);
  await service.from('growth_intakes').delete().eq('id', intakeId);
  await Promise.all([alice.auth.signOut(), bob.auth.signOut()]);
}
