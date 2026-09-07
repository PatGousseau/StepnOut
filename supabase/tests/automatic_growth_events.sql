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



-- Automatic matching works without an opt-in record or a location.
select public.claim_automatic_growth_event('11111111-1111-1111-1111-111111111111','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5') as first_claim \gset
select pg_temp.assert_true((:'first_claim'::jsonb->>'claimed')::boolean,'First check was not claimed');
select public.claim_automatic_growth_event('11111111-1111-1111-1111-111111111111','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5') as cached \gset
select pg_temp.assert_true(not (:'cached'::jsonb->>'claimed')::boolean,'Parallel request duplicated work');
select pg_temp.assert_true((select count(*)=1 from public.growth_event_requests where user_id='11111111-1111-1111-1111-111111111111'),'Cache consumed quota');
select public.finish_growth_event_selection((:'first_claim'::jsonb->'selection'->>'id')::uuid,'11111111-1111-1111-1111-111111111111',null,'',null,'needs-city','test',null);
select public.claim_automatic_growth_event('11111111-1111-1111-1111-111111111111','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5') as finished \gset
select pg_temp.assert_true(:'finished'::jsonb->'selection'->>'model_name'='needs-city','Missing city decision was not cached');
insert into public.growth_event_sources(id,name,source_url,enabled,approval_reference,area,latitude,longitude)
values('automatic-fixture','Synthetic','https://example.org',true,'TEST ONLY','Fabriano',43.34,12.91);
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',true);
set local role authenticated;
select public.set_growth_guidance_city('automatic-fixture');
reset role;
select pg_temp.assert_true(public.growth_event_context('11111111-1111-1111-1111-111111111111')->>'travel_radius'='25','Local radius was not product owned');
select public.claim_automatic_growth_event('11111111-1111-1111-1111-111111111111','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5') as changed \gset
select pg_temp.assert_true((:'changed'::jsonb->>'claimed')::boolean,'City change did not invalidate cache');
select pg_temp.assert_true(not has_function_privilege('authenticated','public.claim_automatic_growth_event(uuid,uuid)','EXECUTE'),'Client can claim work for another user');
select pg_temp.assert_true(not has_function_privilege('authenticated','public.growth_event_context(uuid)','EXECUTE'),'Client can read another user context');
rollback;
