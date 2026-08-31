\set ON_ERROR_STOP on

begin;

create function pg_temp.assert_true(value boolean, message text)
returns void language plpgsql as $test$
begin
  if not value then raise exception '%', message; end if;
end;
$test$;

create function pg_temp.expect_journal_blocked(
  interaction_id uuid, plan_id uuid, step_id uuid, journal_text text
)
returns void language plpgsql as $test$
begin
  begin
    perform public.submit_growth_interaction(
      interaction_id, plan_id, step_id, 'journal', null, null, journal_text
    );
    raise exception 'Concurrent journal unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Concurrent journal unexpectedly succeeded' then raise; end if;
  end;
end;
$test$;

create function pg_temp.expect_interaction_blocked(
  interaction_id uuid, plan_id uuid, step_id uuid
)
returns void language plpgsql as $test$
begin
  begin
    perform public.submit_growth_interaction(
      interaction_id, plan_id, step_id, 'report', 'did_it', 'about_the_same', null
    );
    raise exception 'Invalid interaction unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Invalid interaction unexpectedly succeeded' then raise; end if;
  end;
end;
$test$;

insert into public.growth_intakes (id, user_id, answers, status)
values (
  'cccccccc-cccc-cccc-cccc-ccccccccccc3',
  '11111111-1111-1111-1111-111111111111',
  '{"source":"alice"}'::jsonb,
  'confirmed'
);

insert into public.growth_plans (
  id, intake_id, user_id, version, status, goal, formulation, milestones,
  current_focus, first_step, model_name, prompt_version, confirmed_at
) values (
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  'cccccccc-cccc-cccc-cccc-ccccccccccc3',
  '11111111-1111-1111-1111-111111111111',
  99, 'active', 'Contribute earlier', 'Timing may be the current blocker.',
  '[{"title":"Start","description":"Contribute once"},{"title":"Continue","description":"Ask a follow-up"},{"title":"Repeat","description":"Try another context"}]'::jsonb,
  'Start one interaction',
  '{"title":"Ask one question","rationale":"Learn from one attempt","action":"Ask in the meeting","completion_criterion":"Ask once","if_then_plan":null}'::jsonb,
  'test-model', 'test-prompt', now()
);

insert into public.growth_steps (
  id, plan_id, user_id, sequence, title, rationale, action, completion_criterion
) values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  '11111111-1111-1111-1111-111111111111',
  99, 'Ask one question', 'Learn from one attempt', 'Ask in the meeting', 'Ask once'
);

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;

select id from public.submit_growth_interaction(
  'ffffffff-ffff-ffff-ffff-fffffffffff6',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
  'report', 'didnt_do_it', 'no_opportunity', null
) \gset report_

select pg_temp.assert_true(
  (select status = 'attempted' from public.growth_steps where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5'),
  'A report did not close its exact active step'
);
select pg_temp.assert_true(
  (select count(*) = 1 from public.growth_interactions where id = :'report_id'::uuid),
  'The report was not retained chronologically'
);

select id from public.submit_growth_interaction(
  'ffffffff-ffff-ffff-ffff-fffffffffff6',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
  'report', 'didnt_do_it', 'no_opportunity', null
) \gset retry_
select pg_temp.assert_true(:'retry_id' = :'report_id', 'A retry duplicated the report');

select pg_temp.expect_interaction_blocked(
  'aaaaaaaa-1111-1111-1111-111111111111',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5'
);

reset role;

select id from public.persist_growth_adaptive_response(
  '11111111-1111-1111-1111-111111111111', :'report_id'::uuid, 'next_step',
  'The cancelled meeting was an opportunity constraint, not evidence of reluctance.', null,
  '{"title":"Use the next meeting","rationale":"Preserve the relevant experiment","action":"Ask one question in the next scheduled meeting","completion_criterion":"Ask once","if_then_plan":null}'::jsonb,
  null, false, 'test-model', 'test-prompt'
) \gset response_

select pg_temp.assert_true(
  (select count(*) = 1 from public.growth_steps where user_id = '11111111-1111-1111-1111-111111111111' and status = 'active'),
  'Report adaptation did not leave exactly one active step'
);

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
set local role authenticated;
select pg_temp.assert_true((select count(*) = 0 from public.growth_interactions), 'RLS exposed another user''s report');
select pg_temp.assert_true((select count(*) = 0 from public.growth_adaptive_responses), 'RLS exposed another user''s response');
select pg_temp.expect_interaction_blocked(
  'aaaaaaaa-2222-2222-2222-222222222222',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  (select id from public.growth_steps where user_id = '11111111-1111-1111-1111-111111111111' and status = 'active')
);

reset role;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;

select id from public.submit_growth_interaction(
  'aaaaaaaa-3333-3333-3333-333333333333',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  (select id from public.growth_steps where status = 'active'),
  'journal', null, null, 'I wonder whether a different setting would fit better.'
) \gset rejected_journal_

select pg_temp.expect_journal_blocked(
  'aaaaaaaa-4444-4444-4444-444444444444',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  (select id from public.growth_steps where status = 'active'),
  'I unexpectedly asked the question during today''s meeting.'
);

select id from public.growth_steps where status = 'active' \gset preserved_step_

reset role;
select id from public.persist_growth_adaptive_response(
  '11111111-1111-1111-1111-111111111111', :'rejected_journal_id'::uuid, 'next_step',
  'A different setting could be worth trying.', null,
  '{"title":"Try after the meeting","rationale":"Test a different context","action":"Ask one question after the meeting","completion_criterion":"Ask once","if_then_plan":null}'::jsonb,
  null, false, 'test-model', 'test-prompt'
) \gset rejected_response_

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;
select confirmation_status from public.confirm_growth_adaptive_response(
  :'rejected_response_id'::uuid, false
) \gset rejection_
select pg_temp.assert_true(:'rejection_confirmation_status' = 'rejected', 'Rejection was not retained');
select pg_temp.assert_true(
  (select id = :'preserved_step_id'::uuid from public.growth_steps where status = 'active'),
  'Rejecting a proposed step changed the active step'
);

select id from public.submit_growth_interaction(
  'aaaaaaaa-4444-4444-4444-444444444444',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  (select id from public.growth_steps where status = 'active'),
  'journal', null, null, 'I unexpectedly asked the question during today''s meeting.'
) \gset journal_

reset role;
select id from public.persist_growth_adaptive_response(
  '11111111-1111-1111-1111-111111111111', :'journal_id'::uuid, 'reflection',
  'That sounds like the active behavior. Confirm whether it should count.', null,
  null, null, true, 'test-model', 'test-prompt'
) \gset journal_response_

select pg_temp.assert_true(
  (select count(*) = 1 from public.growth_steps where status = 'active'),
  'A journal silently completed the active step'
);

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;
select confirmation_status from public.confirm_growth_adaptive_response(
  :'journal_response_id'::uuid, true
) \gset confirmation_
select pg_temp.assert_true(:'confirmation_confirmation_status' = 'accepted', 'Confirmation was not retained');
select pg_temp.assert_true(
  (select count(*) = 0 from public.growth_steps where status = 'active'),
  'Confirmed implicit completion did not close the step'
);

select id from public.submit_growth_interaction(
  'aaaaaaaa-5555-5555-5555-555555555555',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  null, 'journal', null, null,
  'The last few attempts show that opportunity, not timing anxiety, was the real blocker.'
) \gset revision_journal_

reset role;
select id from public.persist_growth_adaptive_response(
  '11111111-1111-1111-1111-111111111111', :'revision_journal_id'::uuid, 'plan_revision',
  'The reports point to an opportunity constraint. This revision stays tentative.', null,
  '{"title":"Use a scheduled context","rationale":"Create a reliable opportunity","action":"Choose one recurring meeting","completion_criterion":"Name the next meeting","if_then_plan":null}'::jsonb,
  '{"goal":"Contribute earlier","formulation":"A missing reliable opportunity may be the main blocker.","milestones":[{"title":"Create an opportunity","description":"Choose a recurring context"},{"title":"Contribute once","description":"Share one point"},{"title":"Repeat","description":"Try another meeting"}],"current_focus":"Create a reliable opportunity","evidence_summary":"Three reports cited missing or cancelled opportunities."}'::jsonb,
  false, 'test-model', 'test-prompt'
) \gset revision_response_

select pg_temp.assert_true(
  (select status = 'active' from public.growth_plans where id = 'dddddddd-dddd-dddd-dddd-ddddddddddd4'),
  'A proposed plan revision changed persistent state before confirmation'
);

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;
select confirmation_status from public.confirm_growth_adaptive_response(
  :'revision_response_id'::uuid, true
) \gset revision_confirmation_
select pg_temp.assert_true(
  (select status = 'superseded' from public.growth_plans where id = 'dddddddd-dddd-dddd-dddd-ddddddddddd4'),
  'Confirmed revision did not preserve and supersede the earlier plan'
);
select pg_temp.assert_true(
  (select count(*) = 1 from public.growth_plans where user_id = '11111111-1111-1111-1111-111111111111' and status = 'active'),
  'Confirmed revision did not leave exactly one active plan'
);
select pg_temp.assert_true(
  (select count(*) = 1 from public.growth_steps where user_id = '11111111-1111-1111-1111-111111111111' and status = 'active'),
  'Confirmed revision did not leave exactly one active step'
);

rollback;
