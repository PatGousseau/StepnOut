\set ON_ERROR_STOP on

begin;

create function pg_temp.assert_true(value boolean, message text)
returns void language plpgsql as $test$
begin
  if not value then raise exception '%', message; end if;
end;
$test$;

create function pg_temp.expect_confirm_blocked(plan_id uuid)
returns void language plpgsql as $test$
begin
  begin
    perform public.confirm_growth_plan(plan_id);
    raise exception 'Cross-user plan confirmation unexpectedly succeeded';
  exception
    when others then
      if sqlerrm = 'Cross-user plan confirmation unexpectedly succeeded' then raise; end if;
  end;
end;
$test$;

create function pg_temp.expect_intake_rewrite_blocked(p_intake_id uuid)
returns void language plpgsql as $test$
begin
  begin
    update public.growth_intakes
    set answers = '{"source":"rewritten"}'::jsonb
    where id = p_intake_id;
    raise exception 'Finalized intake evidence was rewritten';
  exception
    when others then
      if sqlerrm = 'Finalized intake evidence was rewritten' then raise; end if;
  end;
end;
$test$;

create function pg_temp.expect_stale_correction_blocked(p_plan_id uuid)
returns void language plpgsql as $test$
begin
  begin
    perform public.persist_growth_plan_proposal(
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      'Late goal',
      'Late formulation',
      '[{"title":"One","description":"First"},{"title":"Two","description":"Second"},{"title":"Three","description":"Third"}]'::jsonb,
      'Late focus',
      '{"title":"Late step","rationale":"Late","action":"Late","completion_criterion":"Late","if_then_plan":null}'::jsonb,
      'test-model',
      'test-prompt',
      '{"source":"alice"}'::jsonb,
      '{"enabled":false,"approximate_location":"","travel_radius":"","availability":"","cost_preference":"","accessibility_needs":""}'::jsonb,
      p_plan_id,
      'A correction that finished after confirmation'
    );
    raise exception 'Stale correction persistence unexpectedly succeeded';
  exception
    when others then
      if sqlerrm = 'Stale correction persistence unexpectedly succeeded' then raise; end if;
  end;
end;
$test$;

create function pg_temp.expect_input_snapshot_blocked()
returns void language plpgsql as $test$
begin
  begin
    perform public.persist_growth_plan_proposal(
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      'Stale goal',
      'Stale formulation',
      '[{"title":"One","description":"First"},{"title":"Two","description":"Second"},{"title":"Three","description":"Third"}]'::jsonb,
      'Stale focus',
      '{"title":"Stale step","rationale":"Stale","action":"Stale","completion_criterion":"Stale","if_then_plan":null}'::jsonb,
      'test-model',
      'test-prompt',
      '{"source":"alice"}'::jsonb,
      null,
      null,
      null
    );
    raise exception 'Stale input snapshot persistence unexpectedly succeeded';
  exception
    when others then
      if sqlerrm = 'Stale input snapshot persistence unexpectedly succeeded' then raise; end if;
  end;
end;
$test$;

insert into public.growth_intakes (id, user_id, answers)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', '{"source":"alice"}'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', '{"source":"bob"}'::jsonb);

insert into public.growth_event_preferences (user_id, intake_id)
values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1');

select pg_temp.expect_input_snapshot_blocked();

select public.claim_growth_plan_generation(
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'alice-initial-request',
  null
) as id \gset alice_request_

select public.finish_growth_plan_generation(:'alice_request_id'::uuid, 'completed');

select id from public.persist_growth_plan_proposal(
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'Alice goal',
  'A tentative Alice formulation.',
  '[{"title":"One","description":"First"},{"title":"Two","description":"Second"},{"title":"Three","description":"Third"}]'::jsonb,
  'Alice focus',
  '{"title":"Alice step","rationale":"Learn","action":"Try","completion_criterion":"One attempt","if_then_plan":null}'::jsonb,
  'test-model',
  'test-prompt',
  '{"source":"alice"}'::jsonb,
  '{"enabled":false,"approximate_location":"","travel_radius":"","availability":"","cost_preference":"","accessibility_needs":""}'::jsonb,
  null,
  null
) \gset alice_plan_

select pg_temp.assert_true(
  public.claim_growth_plan_generation(
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'alice-invalid-repeat',
    null
  ) is null,
  'Generation claim ignored the intake state transition'
);

select id from public.persist_growth_plan_proposal(
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
  'Bob goal',
  'A tentative Bob formulation.',
  '[{"title":"One","description":"First"},{"title":"Two","description":"Second"},{"title":"Three","description":"Third"}]'::jsonb,
  'Bob focus',
  '{"title":"Bob step","rationale":"Learn","action":"Try","completion_criterion":"One attempt","if_then_plan":null}'::jsonb,
  'test-model',
  'test-prompt',
  '{"source":"bob"}'::jsonb,
  null,
  null,
  null
) \gset bob_plan_

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;

select pg_temp.assert_true(
  (select count(*) = 1 from public.growth_intakes),
  'RLS exposed another user''s intake'
);
select pg_temp.assert_true(
  (select count(*) = 1 from public.growth_plans),
  'RLS exposed another user''s plan'
);
select pg_temp.expect_confirm_blocked(:'bob_plan_id'::uuid);

select status from public.confirm_growth_plan(:'alice_plan_id'::uuid) \gset confirmed_

select pg_temp.assert_true(
  :'confirmed_status' = 'active',
  'Owner could not activate their proposed plan'
);
select pg_temp.assert_true(
  exists (
    select 1 from public.growth_plan_evidence
    where plan_id = :'alice_plan_id'::uuid and kind = 'confirmation'
  ),
  'Confirmation evidence was not retained'
);

reset role;

select pg_temp.expect_intake_rewrite_blocked('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1');
select pg_temp.expect_stale_correction_blocked(:'alice_plan_id'::uuid);

rollback;
