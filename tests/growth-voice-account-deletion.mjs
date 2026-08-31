import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const { API_URL, ANON_KEY, SERVICE_ROLE_KEY } = process.env;
if (!API_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error('API_URL, ANON_KEY, and SERVICE_ROLE_KEY are required');
}

const service = createClient(API_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const user = createClient(API_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const password = `Voice-${randomUUID()}-test`;
const email = `voice-delete-${randomUUID()}@test.local`;
let userId = '';
let objectPath = '';

try {
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: `voice-${randomUUID()}`, display_name: 'Voice deletion test' },
  });
  if (createError || !created.user) throw createError || new Error('User was not created');
  userId = created.user.id;

  const intakeId = randomUUID();
  const planId = randomUUID();
  const voiceId = randomUUID();
  objectPath = `${userId}/${voiceId}.m4a`;
  const { error: intakeError } = await service.from('growth_intakes').insert({
    id: intakeId,
    user_id: userId,
    answers: { source: 'account-deletion-test' },
    status: 'confirmed',
  });
  if (intakeError) throw intakeError;
  const { error: planError } = await service.from('growth_plans').insert({
    id: planId,
    intake_id: intakeId,
    user_id: userId,
    version: 1,
    status: 'active',
    goal: 'Test deletion',
    formulation: 'Test only',
    milestones: [
      { title: 'One', description: 'One' },
      { title: 'Two', description: 'Two' },
      { title: 'Three', description: 'Three' },
    ],
    current_focus: 'Test',
    first_step: {
      title: 'Test', rationale: 'Test', action: 'Test',
      completion_criterion: 'Test', if_then_plan: null,
    },
    model_name: 'test-model',
    prompt_version: 'test-prompt',
    confirmed_at: new Date().toISOString(),
  });
  if (planError) throw planError;
  const { error: voiceError } = await service.from('growth_voice_journals').insert({
    id: voiceId,
    user_id: userId,
    plan_id: planId,
    status: 'uploading',
    object_path: objectPath,
    mime_type: 'audio/m4a',
    duration_ms: 1000,
  });
  if (voiceError) throw voiceError;
  const { error: uploadError } = await service.storage
    .from('growth-journal-audio')
    .upload(objectPath, new Uint8Array([0, 1, 2, 3]), { contentType: 'audio/m4a' });
  if (uploadError) throw uploadError;

  const { error: signInError } = await user.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  const { data: deleted, error: deleteError } = await user.functions.invoke(
    'delete-account',
    { body: { user_id: userId } },
  );
  if (deleteError) {
    const detail = deleteError.context ? await deleteError.context.text() : deleteError.message;
    throw new Error(`Delete account function failed: ${detail}`);
  }
  if (!deleted?.deleted) throw new Error(`Account deletion failed: ${JSON.stringify(deleted)}`);

  const [{ data: retainedUser }, { error: retainedAudioError }] = await Promise.all([
    service.auth.admin.getUserById(userId),
    service.storage.from('growth-journal-audio').download(objectPath),
  ]);
  if (retainedUser.user || !retainedAudioError) {
    throw new Error('Account deletion retained the auth user or private journal audio');
  }
  userId = '';
  objectPath = '';
  console.log('growth voice account deletion test passed');
} finally {
  if (objectPath) await service.storage.from('growth-journal-audio').remove([objectPath]);
  if (userId) await service.auth.admin.deleteUser(userId);
  await user.auth.signOut();
}
