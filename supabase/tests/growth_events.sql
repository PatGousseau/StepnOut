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


insert into public.growth_event_sources(id,name,source_url,enabled,approval_reference,area,latitude,longitude)
values('fixture','Library fixtures','https://example.org',true,'TEST ONLY','Fabriano',43.34,12.91),
('duplicate','Other fixtures','https://example.net',true,'TEST ONLY','Fabriano',43.34,12.91);
insert into public.growth_event_preferences(user_id,intake_id,enabled,approximate_location,travel_radius,latitude,longitude,max_cost_eur,wheelchair_required)
values('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-ccccccccccc3',true,'Fabriano','5',43.34,12.91,10,true);
insert into public.growth_events(id,source_id,source_key,title,description,category,source_url,kind,starts_at,location,latitude,longitude,cost_eur,wheelchair_accessible,status,verified_at)
values('abababab-abab-abab-abab-abababababab','fixture','club','Library club','Facilitated conversation','community','https://example.org/club','event',now()+interval '1 day','Library',43.34,12.91,0,true,'active',now());
select to_jsonb(p) as prefs from public.growth_event_preferences p where user_id='11111111-1111-1111-1111-111111111111' \gset
select pg_temp.assert_true(public.growth_event_eligible('abababab-abab-abab-abab-abababababab',:'prefs'::jsonb),'Suitable event excluded');
update public.growth_events set cost_eur=null;
select pg_temp.assert_true(not public.growth_event_eligible('abababab-abab-abab-abab-abababababab',:'prefs'::jsonb),'Unknown cost treated as within budget');
update public.growth_events set cost_eur=0,wheelchair_accessible=null;
select pg_temp.assert_true(not public.growth_event_eligible('abababab-abab-abab-abab-abababababab',:'prefs'::jsonb),'Unknown access treated as accessible');
update public.growth_events set wheelchair_accessible=true,verified_at=now()-interval '3 days';
select pg_temp.assert_true(not public.growth_event_eligible('abababab-abab-abab-abab-abababababab',:'prefs'::jsonb),'Stale event eligible');
update public.growth_events set verified_at=now(),latitude=45;
select pg_temp.assert_true(not public.growth_event_eligible('abababab-abab-abab-abab-abababababab',:'prefs'::jsonb),'Far event eligible');
update public.growth_events set latitude=43.34,status='cancelled';
select pg_temp.assert_true(not public.growth_event_eligible('abababab-abab-abab-abab-abababababab',:'prefs'::jsonb),'Cancelled event eligible');
update public.growth_events set status='active';
select id from public.claim_growth_event_selection('abababab-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111') \gset selection_
select id from public.finish_growth_event_selection(:'selection_id'::uuid,'11111111-1111-1111-1111-111111111111','abababab-abab-abab-abab-abababababab',
'The structured library setting offers repeated contact.',
'{"title":"Introduce yourself","rationale":"Practice starting contact","action":"Attend and introduce yourself to one person","completion_criterion":"Introduce yourself once","if_then_plan":null}'::jsonb,
'test','test',(select to_jsonb(e) from public.growth_events e where id='abababab-abab-abab-abab-abababababab'));
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',true);
set local role authenticated;
select pg_temp.assert_true((select count(*)=0 from public.growth_event_selections),'Selection exposed across users');
select pg_temp.assert_true((select count(*)=0 from public.growth_event_detail(:'selection_id'::uuid)),'Detail exposed across users');
reset role;
create function pg_temp.expect_event_choice_blocked(selection_id uuid) returns void language plpgsql as $$
begin
  begin
    perform public.choose_growth_event(selection_id,null);
    raise exception 'Invalid event acceptance succeeded';
  exception when others then
    if sqlerrm = 'Invalid event acceptance succeeded' then raise; end if;
  end;
end;
$$;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',true);
select pg_temp.assert_true((select count(*)=1 from public.growth_event_detail(:'selection_id'::uuid)),'Eligible detail hidden');
update public.growth_events set status='cancelled';
select pg_temp.assert_true((select count(*)=0 from public.growth_event_detail(:'selection_id'::uuid)),'Cancelled detail shown');
update public.growth_events set status='active',starts_at=now()-interval '1 hour';
update public.growth_event_selections set event_snapshot=(select to_jsonb(e) from public.growth_events e where id='abababab-abab-abab-abab-abababababab');
select pg_temp.assert_true((select count(*)=0 from public.growth_event_detail(:'selection_id'::uuid)),'Expired detail shown');
update public.growth_events set starts_at=now()+interval '1 day';
update public.growth_event_selections set event_snapshot=(select to_jsonb(e) from public.growth_events e where id='abababab-abab-abab-abab-abababababab');
update public.growth_events set location='A changed venue';
select pg_temp.expect_event_choice_blocked(:'selection_id'::uuid);
update public.growth_events set location='Library';
insert into public.growth_events(source_id,source_key,title,description,category,source_url,kind,starts_at,location,latitude,longitude,cost_eur,wheelchair_accessible,status,verified_at)
select 'duplicate','cancelled-copy',title,description,category,'https://example.net/club',kind,starts_at,location,latitude,longitude,cost_eur,wheelchair_accessible,'cancelled',verified_at
from public.growth_events where id='abababab-abab-abab-abab-abababababab';
select pg_temp.assert_true((select count(*)=0 from public.growth_event_candidates('11111111-1111-1111-1111-111111111111',:'prefs'::jsonb)),'Duplicate cancellation was ignored');
select pg_temp.expect_event_choice_blocked(:'selection_id'::uuid);
delete from public.growth_events where source_id='duplicate';
update public.growth_event_preferences set availability='Changed availability';
select pg_temp.expect_event_choice_blocked(:'selection_id'::uuid);
update public.growth_event_preferences set availability=(:'prefs'::jsonb)->>'availability';
set local role authenticated;
select public.choose_growth_event(:'selection_id'::uuid,null);
select public.choose_growth_event(:'selection_id'::uuid,null);
select pg_temp.assert_true((select count(*)=1 from public.growth_steps where status='active'),'Event acceptance violated single step');
select pg_temp.assert_true((select event_id is not null and accepted_at is not null from public.growth_steps where status='active'),'Event step provenance or confirmation lost');
reset role;
select pg_temp.assert_true((select count(*)=0 from public.growth_event_candidates('11111111-1111-1111-1111-111111111111',:'prefs'::jsonb)),'Accepted occurrence recommended again');
-- New occurrence demonstrates rejection and privacy deletion.
update public.growth_event_selections set status='rejected',rejection_reason='too_far';
select pg_temp.assert_true((select count(*)=0 from public.growth_event_candidates('11111111-1111-1111-1111-111111111111',:'prefs'::jsonb)),'Rejected occurrence recommended again');
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',true);
set local role authenticated;
delete from public.growth_event_preferences where user_id=auth.uid();
select pg_temp.assert_true((select count(*)=0 from public.growth_event_selections),'Location snapshots survived preference deletion');
select pg_temp.assert_true((select count(*)=1 from public.growth_steps where status='active'),'Preference deletion erased confirmed step');
reset role;
select pg_temp.assert_true((select count(*)=1 from public.growth_event_requests where user_id='11111111-1111-1111-1111-111111111111'),'Preference deletion erased request quota');
rollback;
