\set ON_ERROR_STOP on

begin;

create function pg_temp.assert_true(value boolean, message text)
returns void language plpgsql as $test$
begin
  if not value then raise exception '%', message; end if;
end;
$test$;

create function pg_temp.expect_voice_submit_blocked(
  voice_id uuid, interaction_id uuid, transcript text
)
returns void language plpgsql as $test$
begin
  begin
    perform public.submit_growth_voice_journal(voice_id, interaction_id, transcript);
    raise exception 'Unauthorized voice journal submission unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Unauthorized voice journal submission unexpectedly succeeded' then raise; end if;
  end;
end;
$test$;

create function pg_temp.expect_invalidated_adaptation_blocked(
  request_id uuid, interaction_id uuid
)
returns void language plpgsql as $test$
begin
  begin
    perform public.persist_growth_adaptive_response_if_current(
      request_id,
      '11111111-1111-1111-1111-111111111111',
      interaction_id,
      'reflection',
      'This response must not survive journal deletion.',
      null, null, null, false, 'test-model', 'test-prompt'
    );
    raise exception 'Invalidated adaptation unexpectedly persisted';
  exception when others then
    if sqlerrm = 'Invalidated adaptation unexpectedly persisted' then raise; end if;
  end;
end;
$test$;

insert into public.growth_intakes (id, user_id, answers, status)
values (
  'cccccccc-cccc-cccc-cccc-ccccccccccc8',
  '11111111-1111-1111-1111-111111111111',
  '{"source":"voice-test"}'::jsonb,
  'confirmed'
);

insert into public.growth_plans (
  id, intake_id, user_id, version, status, goal, formulation, milestones,
  current_focus, first_step, model_name, prompt_version, confirmed_at
) values (
  'dddddddd-dddd-dddd-dddd-ddddddddddd9',
  'cccccccc-cccc-cccc-cccc-ccccccccccc8',
  '11111111-1111-1111-1111-111111111111',
  199, 'active', 'Contribute earlier', 'Timing may be the current blocker.',
  '[{"title":"Start","description":"Contribute once"},{"title":"Continue","description":"Ask a follow-up"},{"title":"Repeat","description":"Try another context"}]'::jsonb,
  'Start one interaction',
  '{"title":"Ask one question","rationale":"Learn from one attempt","action":"Ask in the meeting","completion_criterion":"Ask once","if_then_plan":null}'::jsonb,
  'test-model', 'test-prompt', now()
);

insert into public.growth_steps (
  id, plan_id, user_id, sequence, title, rationale, action, completion_criterion
) values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee9',
  'dddddddd-dddd-dddd-dddd-ddddddddddd9',
  '11111111-1111-1111-1111-111111111111',
  199, 'Ask one question', 'Learn from one attempt', 'Ask in the meeting', 'Ask once'
);

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;

select id from public.begin_growth_voice_journal(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9',
  'dddddddd-dddd-dddd-dddd-ddddddddddd9',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee9',
  'audio/m4a', 12000
) \gset voice_

select pg_temp.assert_true(
  (select count(*) = 0 from public.growth_interactions),
  'An unreviewed transcript became chronological evidence'
);

reset role;
update public.growth_voice_journals
set status = 'review', machine_transcript = 'I did talk to them.', updated_at = now()
where id = :'voice_id'::uuid;

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
set local role authenticated;
select pg_temp.assert_true(
  (select count(*) = 0 from public.growth_voice_journals),
  'RLS exposed another user''s audio or transcript metadata'
);
select pg_temp.expect_voice_submit_blocked(
  :'voice_id'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9',
  'I did not talk to them.'
);

reset role;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;

select id from public.submit_growth_voice_journal(
  :'voice_id'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9',
  'I did not talk to them.'
) \gset interaction_

select pg_temp.assert_true(
  (select journal_text = 'I did not talk to them.' and voice_journal_id = :'voice_id'::uuid
   from public.growth_interactions where id = :'interaction_id'::uuid),
  'The reviewed transcript did not become the exact journal evidence'
);
select pg_temp.assert_true(
  (select status = 'submitted' and machine_transcript is null
      and reviewed_transcript = 'I did not talk to them.' and transcript_edited
   from public.growth_voice_journals where id = :'voice_id'::uuid),
  'Submission retained the machine transcript or lost the reviewed correction'
);
select pg_temp.assert_true(
  (select id from public.submit_growth_voice_journal(
    :'voice_id'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbba9',
    'A retry with a different body must not replace evidence.'
  )) = :'interaction_id'::uuid,
  'An ambiguous committed voice submission was not idempotently reconciled'
);

reset role;
insert into public.growth_interactions (
  id, plan_id, user_id, kind, journal_text, created_at
) values (
  '99999999-9999-9999-9999-999999999991',
  'dddddddd-dddd-dddd-dddd-ddddddddddd9',
  '11111111-1111-1111-1111-111111111111',
  'journal', 'A later entry.', now() + interval '1 second'
);
insert into public.growth_adaptive_responses (
  plan_id, interaction_id, user_id, response_type, message,
  model_name, prompt_version, created_at
) values (
  'dddddddd-dddd-dddd-dddd-ddddddddddd9',
  '99999999-9999-9999-9999-999999999991',
  '11111111-1111-1111-1111-111111111111',
  'reflection', 'A later response paraphrasing the voice journal.',
  'test-model', 'test-prompt', now() + interval '2 seconds'
);
insert into public.growth_interactions (
  id, plan_id, user_id, kind, journal_text, created_at
) values (
  '99999999-9999-9999-9999-999999999992',
  'dddddddd-dddd-dddd-dddd-ddddddddddd9',
  '11111111-1111-1111-1111-111111111111',
  'journal', 'An interaction whose response is still generating.',
  now() + interval '3 seconds'
);
select public.claim_growth_adaptation(
  '11111111-1111-1111-1111-111111111111',
  '99999999-9999-9999-9999-999999999992'
) as id \gset adaptation_request_
select pg_temp.assert_true(public.claim_growth_voice_transcription_for_user(
  '11111111-1111-1111-1111-111111111111', :'voice_id'::uuid
), 'First transcription quota claim was rejected');
select public.claim_growth_voice_transcription_for_user(
  '11111111-1111-1111-1111-111111111111', :'voice_id'::uuid
);
select public.claim_growth_voice_transcription_for_user(
  '11111111-1111-1111-1111-111111111111', :'voice_id'::uuid
);
select public.claim_growth_voice_transcription_for_user(
  '11111111-1111-1111-1111-111111111111', :'voice_id'::uuid
);
select public.claim_growth_voice_transcription_for_user(
  '11111111-1111-1111-1111-111111111111', :'voice_id'::uuid
);
select public.claim_growth_voice_transcription_for_user(
  '11111111-1111-1111-1111-111111111111', :'voice_id'::uuid
);
select pg_temp.assert_true(not public.claim_growth_voice_transcription_for_user(
  '11111111-1111-1111-1111-111111111111', :'voice_id'::uuid
), 'Hourly transcription quota allowed a seventh external request');
insert into public.growth_plan_evidence (
  user_id, intake_id, plan_id, kind, content
) values (
  '11111111-1111-1111-1111-111111111111',
  'cccccccc-cccc-cccc-cccc-ccccccccccc8',
  'dddddddd-dddd-dddd-dddd-ddddddddddd9',
  'confirmation',
  jsonb_build_object(
    'confirmed', true,
    'source_interaction_id', :'interaction_id'::text,
    'evidence_summary', 'Deleted transcript-derived detail'
  )
);
select public.delete_growth_journal_for_user(
  '11111111-1111-1111-1111-111111111111', :'interaction_id'::uuid
);
select pg_temp.assert_true(
  (select count(*) = 0 from public.growth_interactions where id = :'interaction_id'::uuid),
  'Journal deletion retained chronological evidence'
);
select pg_temp.assert_true(
  (select count(*) = 0 from public.growth_voice_journals where id = :'voice_id'::uuid),
  'Journal deletion retained transcript metadata'
);
select pg_temp.assert_true(
  (select content->>'evidence_summary' is null
      and content->>'source_interaction_id' is null
      and (content->>'source_deleted')::boolean
   from public.growth_plan_evidence
   where plan_id = 'dddddddd-dddd-dddd-dddd-ddddddddddd9'
   order by created_at desc limit 1),
  'Journal deletion retained derived evidence content'
);
select pg_temp.assert_true(
  (select count(*) = 0 from public.growth_adaptive_responses
   where interaction_id = '99999999-9999-9999-9999-999999999991'),
  'Journal deletion retained a later model response that could paraphrase it'
);
select pg_temp.assert_true(
  (select count(*) = 1 from public.growth_interactions
   where id = '99999999-9999-9999-9999-999999999991'),
  'Journal deletion removed a later user-authored interaction'
);
select pg_temp.assert_true(
  (select status = 'failed' from public.growth_adaptation_requests
   where id = :'adaptation_request_id'::uuid),
  'Journal deletion did not cancel an in-flight adaptation'
);
select pg_temp.expect_invalidated_adaptation_blocked(
  :'adaptation_request_id'::uuid,
  '99999999-9999-9999-9999-999999999992'
);

rollback;
