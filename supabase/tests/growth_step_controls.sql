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

create function pg_temp.expect_step_completion_proposal_blocked(
  user_id uuid, interaction_id uuid
)
returns void language plpgsql as $test$
begin
  begin
    perform public.persist_growth_adaptive_response(
      user_id, interaction_id, 'reflection', 'Count this as complete.', null,
      null, null, true, 'test-model', 'test-prompt'
    );
    raise exception 'Invalid step completion proposal unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Invalid step completion proposal unexpectedly succeeded' then raise; end if;
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


select id from public.set_growth_step_choice('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'accept');
select pg_temp.assert_true((select accepted_at is not null from public.growth_steps where status = 'active'), 'Acceptance not saved');
select id from public.request_growth_guidance('aaaaaaaa-5555-5555-5555-555555555555',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5','easier','A group is too much; I can speak to one classmate.') \gset request_
select pg_temp.assert_true((select status = 'active' from public.growth_steps where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5'), 'Request closed step');
select id from public.request_growth_guidance(:'request_id'::uuid,
  'dddddddd-dddd-dddd-dddd-ddddddddddd4','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5','easier','A group is too much; I can speak to one classmate.') \gset retry_
select pg_temp.assert_true(:'request_id' = :'retry_id', 'Retry duplicated request');
reset role;
select pg_temp.expect_step_completion_proposal_blocked('11111111-1111-1111-1111-111111111111', :'request_id'::uuid);
select id from public.persist_growth_adaptive_response('11111111-1111-1111-1111-111111111111', :'request_id'::uuid,
  'next_step','Try a familiar classmate.',null,
  '{"title":"Ask a classmate","rationale":"Practice initiating safely","action":"Ask a familiar classmate one question","completion_criterion":"Ask the question","if_then_plan":null}'::jsonb,
  null,false,'test','step-controls') \gset response_
select pg_temp.assert_true((select count(*) = 1 from public.growth_steps where status = 'active'), 'Unconfirmed request replaced step');
set local role authenticated;
select id from public.confirm_growth_adaptive_response(:'response_id'::uuid,true);
select pg_temp.assert_true((select status = 'replaced' from public.growth_steps where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5'), 'Replacement history lost');
select id from public.growth_steps where status = 'active' \gset active_
select id from public.set_growth_step_choice(:'active_id'::uuid,'dismiss');
select id from public.set_growth_step_choice(:'active_id'::uuid,'dismiss');
select pg_temp.assert_true((select count(*) = 0 from public.growth_steps where status = 'active'), 'Dismissal failed');
select pg_temp.assert_true((select count(*) = 1 from public.growth_plans where status = 'active'), 'Dismissal altered plan');
reset role;
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',true);
set local role authenticated;
select pg_temp.assert_true((select count(*) = 0 from public.growth_interactions), 'Requests exposed across users');
rollback;

