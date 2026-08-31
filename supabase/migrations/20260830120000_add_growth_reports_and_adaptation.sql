create table public.growth_steps (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.growth_plans(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  status text not null default 'active'
    check (status in ('active', 'attempted', 'replaced', 'dismissed')),
  title text not null check (char_length(title) between 1 and 120),
  rationale text not null check (char_length(rationale) between 1 and 500),
  action text not null check (char_length(action) between 1 and 500),
  completion_criterion text not null check (char_length(completion_criterion) between 1 and 300),
  if_then_plan text check (if_then_plan is null or char_length(if_then_plan) <= 400),
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  unique (user_id, sequence)
);

create unique index growth_steps_one_active_per_user
  on public.growth_steps(user_id)
  where status = 'active';

create table public.growth_interactions (
  id uuid primary key,
  plan_id uuid not null references public.growth_plans(id) on delete restrict,
  step_id uuid references public.growth_steps(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('report', 'journal')),
  report_outcome text check (report_outcome in ('did_it', 'partly', 'didnt_do_it')),
  follow_up text check (follow_up in (
    'easier_than_expected', 'about_the_same', 'harder_than_expected', 'not_sure',
    'no_opportunity', 'forgot', 'too_uncomfortable', 'not_relevant', 'other'
  )),
  journal_text text check (journal_text is null or char_length(journal_text) between 1 and 4000),
  step_snapshot jsonb,
  created_at timestamptz not null default now(),
  check (
    (kind = 'report' and step_id is not null and report_outcome is not null and follow_up is not null)
    or (kind = 'journal' and report_outcome is null and follow_up is null and journal_text is not null)
  )
);

create index growth_interactions_user_created_idx
  on public.growth_interactions(user_id, created_at desc);

create table public.growth_adaptive_responses (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.growth_plans(id) on delete restrict,
  interaction_id uuid not null unique references public.growth_interactions(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  response_type text not null
    check (response_type in ('reflection', 'clarification', 'next_step', 'plan_revision')),
  message text not null check (char_length(message) between 1 and 1600),
  clarification_question text
    check (clarification_question is null or char_length(clarification_question) <= 300),
  next_step jsonb,
  proposed_plan_update jsonb,
  proposed_step_completion boolean not null default false,
  confirmation_status text not null default 'none'
    check (confirmation_status in ('none', 'pending', 'accepted', 'rejected')),
  model_name text not null,
  prompt_version text not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  check (
    confirmation_status = 'pending'
    or (confirmation_status = 'none' and proposed_plan_update is null and not proposed_step_completion)
    or confirmation_status in ('accepted', 'rejected')
  )
);

create table public.growth_adaptation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  interaction_id uuid not null references public.growth_interactions(id) on delete cascade,
  status text not null default 'started' check (status in ('started', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index growth_adaptation_requests_user_created_idx
  on public.growth_adaptation_requests(user_id, created_at desc);

create unique index growth_adaptive_responses_one_pending_per_user
  on public.growth_adaptive_responses(user_id)
  where confirmation_status = 'pending';

alter table public.growth_steps enable row level security;
alter table public.growth_interactions enable row level security;
alter table public.growth_adaptive_responses enable row level security;
alter table public.growth_adaptation_requests enable row level security;

create policy "Users can read own growth steps"
  on public.growth_steps for select using (auth.uid() = user_id);
create policy "Users can read own growth interactions"
  on public.growth_interactions for select using (auth.uid() = user_id);
create policy "Users can read own adaptive responses"
  on public.growth_adaptive_responses for select using (auth.uid() = user_id);
create policy "Users can read own adaptation requests"
  on public.growth_adaptation_requests for select using (auth.uid() = user_id);

create or replace function public.confirm_growth_plan(p_plan_id uuid)
returns public.growth_plans
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.growth_plans;
  v_step jsonb;
  v_sequence integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  select * into v_plan from public.growth_plans
  where id = p_plan_id and user_id = auth.uid() and status = 'proposed'
  for update;
  if not found then raise exception 'Proposed growth plan not found'; end if;

  update public.growth_plans set status = 'superseded'
  where user_id = auth.uid() and status = 'active';
  update public.growth_steps set status = 'replaced', ended_at = now()
  where user_id = auth.uid() and status = 'active';

  update public.growth_plans set status = 'active', confirmed_at = now()
  where id = p_plan_id returning * into v_plan;
  update public.growth_plans set status = 'rejected'
  where user_id = auth.uid() and status = 'proposed' and id <> p_plan_id;
  update public.growth_intakes set status = 'confirmed', updated_at = now()
  where id = v_plan.intake_id and user_id = auth.uid();

  insert into public.growth_plan_evidence (user_id, intake_id, plan_id, kind, content)
  values (auth.uid(), v_plan.intake_id, v_plan.id, 'confirmation', jsonb_build_object('confirmed', true));

  v_step := v_plan.first_step;
  select coalesce(max(sequence), 0) + 1 into v_sequence
  from public.growth_steps where user_id = auth.uid();
  insert into public.growth_steps (
    plan_id, user_id, sequence, title, rationale, action, completion_criterion, if_then_plan
  ) values (
    v_plan.id, auth.uid(), v_sequence, v_step->>'title', v_step->>'rationale',
    v_step->>'action', v_step->>'completion_criterion', v_step->>'if_then_plan'
  );

  return v_plan;
end;
$$;

insert into public.growth_steps (
  plan_id, user_id, sequence, title, rationale, action, completion_criterion, if_then_plan
)
select plan.id, plan.user_id, 1, plan.first_step->>'title', plan.first_step->>'rationale',
  plan.first_step->>'action', plan.first_step->>'completion_criterion', plan.first_step->>'if_then_plan'
from public.growth_plans plan
where plan.status = 'active'
  and not exists (
    select 1 from public.growth_steps step where step.user_id = plan.user_id and step.status = 'active'
  );

create or replace function public.submit_growth_interaction(
  p_interaction_id uuid,
  p_plan_id uuid,
  p_step_id uuid,
  p_kind text,
  p_report_outcome text,
  p_follow_up text,
  p_journal_text text
)
returns public.growth_interactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_interaction public.growth_interactions;
  v_step public.growth_steps;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  select * into v_interaction from public.growth_interactions
  where id = p_interaction_id and user_id = auth.uid();
  if found then return v_interaction; end if;

  perform 1 from public.growth_plans
  where id = p_plan_id and user_id = auth.uid() and status = 'active'
  for update;
  if not found then raise exception 'Active growth plan not found'; end if;
  if exists (
    select 1 from public.growth_adaptive_responses
    where user_id = auth.uid() and confirmation_status = 'pending'
  ) then
    raise exception 'Resolve the pending growth proposal before another check-in';
  end if;
  if exists (
    select 1
    from public.growth_interactions interaction
    where interaction.user_id = auth.uid()
      and not exists (
        select 1 from public.growth_adaptive_responses response
        where response.interaction_id = interaction.id
      )
  ) then
    raise exception 'Finish the previous growth check-in before starting another';
  end if;

  if p_kind not in ('report', 'journal') then raise exception 'Invalid interaction kind'; end if;
  if p_kind = 'report' then
    if p_report_outcome not in ('did_it', 'partly', 'didnt_do_it') or p_follow_up is null then
      raise exception 'A report outcome and follow-up are required';
    end if;
    if p_report_outcome in ('did_it', 'partly')
      and p_follow_up not in ('easier_than_expected', 'about_the_same', 'harder_than_expected', 'not_sure', 'other') then
      raise exception 'Invalid follow-up for attempted step';
    end if;
    if p_report_outcome = 'didnt_do_it'
      and p_follow_up not in ('no_opportunity', 'forgot', 'too_uncomfortable', 'not_relevant', 'other') then
      raise exception 'Invalid follow-up for non-attempt';
    end if;
    select * into v_step from public.growth_steps
    where id = p_step_id and user_id = auth.uid() and plan_id = p_plan_id and status = 'active'
    for update;
    if not found then raise exception 'Active growth step not found'; end if;
  elsif p_journal_text is null or btrim(p_journal_text) = '' then
    raise exception 'Journal text is required';
  elsif p_step_id is not null then
    select * into v_step from public.growth_steps
    where id = p_step_id and user_id = auth.uid() and plan_id = p_plan_id and status = 'active';
    if not found then raise exception 'Active growth step not found'; end if;
  end if;

  insert into public.growth_interactions (
    id, plan_id, step_id, user_id, kind, report_outcome, follow_up, journal_text, step_snapshot
  ) values (
    p_interaction_id, p_plan_id, p_step_id, auth.uid(), p_kind, p_report_outcome, p_follow_up,
    nullif(btrim(p_journal_text), ''),
    case when v_step.id is null then null else jsonb_build_object(
      'title', v_step.title, 'rationale', v_step.rationale, 'action', v_step.action,
      'completion_criterion', v_step.completion_criterion, 'if_then_plan', v_step.if_then_plan
    ) end
  ) returning * into v_interaction;

  if p_kind = 'report' then
    update public.growth_steps set status = 'attempted', ended_at = now() where id = v_step.id;
  end if;
  return v_interaction;
end;
$$;

revoke all on function public.submit_growth_interaction(uuid, uuid, uuid, text, text, text, text)
  from public, anon;
grant execute on function public.submit_growth_interaction(uuid, uuid, uuid, text, text, text, text)
  to authenticated;

create or replace function public.claim_growth_adaptation(p_user_id uuid, p_interaction_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_request_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if not exists (
    select 1 from public.growth_interactions
    where id = p_interaction_id and user_id = p_user_id
  ) then return null; end if;
  if exists (
    select 1 from public.growth_adaptive_responses
    where interaction_id = p_interaction_id and user_id = p_user_id
  ) then return null; end if;
  if exists (
    select 1 from public.growth_adaptive_responses
    where user_id = p_user_id and confirmation_status = 'pending'
  ) then return null; end if;
  if exists (
    select 1 from public.growth_adaptation_requests
    where user_id = p_user_id and status = 'started' and created_at > now() - interval '2 minutes'
  ) then return null; end if;
  if (select count(*) from public.growth_adaptation_requests
      where user_id = p_user_id and created_at > now() - interval '1 hour') >= 20 then
    return null;
  end if;
  insert into public.growth_adaptation_requests (user_id, interaction_id)
  values (p_user_id, p_interaction_id) returning id into v_request_id;
  return v_request_id;
end;
$$;

create or replace function public.finish_growth_adaptation(p_request_id uuid, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_status not in ('completed', 'failed') then raise exception 'Invalid generation status'; end if;
  update public.growth_adaptation_requests set status = p_status, finished_at = now()
  where id = p_request_id and status = 'started';
end;
$$;

revoke all on function public.claim_growth_adaptation(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_growth_adaptation(uuid, uuid) to service_role;
revoke all on function public.finish_growth_adaptation(uuid, text) from public, anon, authenticated;
grant execute on function public.finish_growth_adaptation(uuid, text) to service_role;

create or replace function public.persist_growth_adaptive_response(
  p_user_id uuid,
  p_interaction_id uuid,
  p_response_type text,
  p_message text,
  p_clarification_question text,
  p_next_step jsonb,
  p_proposed_plan_update jsonb,
  p_proposed_step_completion boolean,
  p_model_name text,
  p_prompt_version text
)
returns public.growth_adaptive_responses
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_interaction public.growth_interactions;
  v_response public.growth_adaptive_responses;
  v_sequence integer;
  v_confirmation text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select * into v_response from public.growth_adaptive_responses
  where interaction_id = p_interaction_id and user_id = p_user_id;
  if found then return v_response; end if;

  select interaction.* into v_interaction
  from public.growth_interactions interaction
  join public.growth_plans plan on plan.id = interaction.plan_id
  where interaction.id = p_interaction_id and interaction.user_id = p_user_id and plan.status = 'active'
  for update of interaction, plan;
  if not found then raise exception 'Current growth interaction not found'; end if;
  if p_proposed_step_completion and (
    v_interaction.kind <> 'journal' or v_interaction.step_id is null
  ) then
    raise exception 'Step completion requires a journal tied to an active step';
  end if;

  v_confirmation := case
    when p_proposed_plan_update is not null or p_proposed_step_completion
      or (v_interaction.kind = 'journal' and p_next_step is not null)
    then 'pending' else 'none' end;

  if v_confirmation = 'pending' and exists (
    select 1 from public.growth_adaptive_responses
    where user_id = p_user_id and confirmation_status = 'pending'
  ) then
    raise exception 'Another growth proposal is awaiting confirmation';
  end if;

  insert into public.growth_adaptive_responses (
    plan_id, interaction_id, user_id, response_type, message, clarification_question,
    next_step, proposed_plan_update, proposed_step_completion, confirmation_status,
    model_name, prompt_version
  ) values (
    v_interaction.plan_id, v_interaction.id, p_user_id, p_response_type, p_message,
    p_clarification_question, p_next_step, p_proposed_plan_update,
    p_proposed_step_completion, v_confirmation, p_model_name, p_prompt_version
  ) returning * into v_response;

  if v_interaction.kind = 'report' and p_next_step is not null
    and p_proposed_plan_update is null then
    select coalesce(max(sequence), 0) + 1 into v_sequence
    from public.growth_steps where user_id = p_user_id;
    insert into public.growth_steps (
      plan_id, user_id, sequence, title, rationale, action, completion_criterion, if_then_plan
    ) values (
      v_interaction.plan_id, p_user_id, v_sequence, p_next_step->>'title',
      p_next_step->>'rationale', p_next_step->>'action',
      p_next_step->>'completion_criterion', p_next_step->>'if_then_plan'
    );
  end if;
  return v_response;
end;
$$;

revoke all on function public.persist_growth_adaptive_response(
  uuid, uuid, text, text, text, jsonb, jsonb, boolean, text, text
) from public, anon, authenticated;
grant execute on function public.persist_growth_adaptive_response(
  uuid, uuid, text, text, text, jsonb, jsonb, boolean, text, text
) to service_role;

create or replace function public.confirm_growth_adaptive_response(
  p_response_id uuid,
  p_accepted boolean
)
returns public.growth_adaptive_responses
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_response public.growth_adaptive_responses;
  v_plan public.growth_plans;
  v_new_plan public.growth_plans;
  v_update jsonb;
  v_step jsonb;
  v_version integer;
  v_sequence integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  select * into v_response from public.growth_adaptive_responses
  where id = p_response_id and user_id = auth.uid() and confirmation_status = 'pending'
  for update;
  if not found then raise exception 'Pending adaptive response not found'; end if;
  select * into v_plan from public.growth_plans
  where id = v_response.plan_id and user_id = auth.uid() and status = 'active'
  for update;
  if not found then raise exception 'Active growth plan not found'; end if;

  if p_accepted then
    if v_response.proposed_step_completion then
      update public.growth_steps set status = 'attempted', ended_at = now()
      where id = (select step_id from public.growth_interactions where id = v_response.interaction_id)
        and user_id = auth.uid() and status = 'active';
    end if;

    if v_response.proposed_plan_update is not null then
      v_update := v_response.proposed_plan_update;
      update public.growth_plans set status = 'superseded' where id = v_plan.id;
      update public.growth_steps set status = 'replaced', ended_at = now()
      where user_id = auth.uid() and status = 'active';
      select coalesce(max(version), 0) + 1 into v_version
      from public.growth_plans where user_id = auth.uid();
      v_step := coalesce(v_response.next_step, v_plan.first_step);
      insert into public.growth_plans (
        intake_id, user_id, version, status, goal, formulation, milestones,
        current_focus, first_step, model_name, prompt_version, confirmed_at
      ) values (
        v_plan.intake_id, auth.uid(), v_version, 'active', v_update->>'goal',
        v_update->>'formulation', v_update->'milestones', v_update->>'current_focus',
        v_step, v_response.model_name, v_response.prompt_version, now()
      ) returning * into v_new_plan;
      select coalesce(max(sequence), 0) + 1 into v_sequence
      from public.growth_steps where user_id = auth.uid();
      insert into public.growth_steps (
        plan_id, user_id, sequence, title, rationale, action, completion_criterion, if_then_plan
      ) values (
        v_new_plan.id, auth.uid(), v_sequence, v_step->>'title', v_step->>'rationale',
        v_step->>'action', v_step->>'completion_criterion', v_step->>'if_then_plan'
      );
      insert into public.growth_plan_evidence (user_id, intake_id, plan_id, kind, content)
      values (
        auth.uid(), v_plan.intake_id, v_new_plan.id, 'confirmation',
        jsonb_build_object(
          'confirmed', true, 'revision_of', v_plan.id,
          'source_interaction_id', v_response.interaction_id,
          'evidence_summary', v_update->>'evidence_summary'
        )
      );
    elsif v_response.next_step is not null then
      update public.growth_steps set status = 'replaced', ended_at = now()
      where user_id = auth.uid() and status = 'active';
      select coalesce(max(sequence), 0) + 1 into v_sequence
      from public.growth_steps where user_id = auth.uid();
      v_step := v_response.next_step;
      insert into public.growth_steps (
        plan_id, user_id, sequence, title, rationale, action, completion_criterion, if_then_plan
      ) values (
        v_plan.id, auth.uid(), v_sequence, v_step->>'title', v_step->>'rationale',
        v_step->>'action', v_step->>'completion_criterion', v_step->>'if_then_plan'
      );
    end if;
  end if;

  update public.growth_adaptive_responses
  set confirmation_status = case when p_accepted then 'accepted' else 'rejected' end,
      confirmed_at = now()
  where id = v_response.id returning * into v_response;
  return v_response;
end;
$$;

revoke all on function public.confirm_growth_adaptive_response(uuid, boolean) from public, anon;
grant execute on function public.confirm_growth_adaptive_response(uuid, boolean) to authenticated;

grant select on public.growth_steps to authenticated;
grant select on public.growth_interactions to authenticated;
grant select on public.growth_adaptive_responses to authenticated;
grant select on public.growth_adaptation_requests to authenticated;
