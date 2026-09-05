-- Requests share the journal evidence/confirmation lifecycle, with explicit intent.
alter table public.growth_interactions add column request_kind text
  check (request_kind in ('easier', 'change', 'immediate', 'period', 'review'));
alter table public.growth_interactions add constraint growth_request_is_text
  check (request_kind is null or (kind = 'journal' and voice_journal_id is null));
alter table public.growth_steps add column accepted_at timestamptz;

create function public.request_growth_guidance(
  p_interaction_id uuid, p_plan_id uuid, p_step_id uuid,
  p_request_kind text, p_context text
) returns public.growth_interactions
language plpgsql security definer set search_path = '' as $$
declare v_interaction public.growth_interactions;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if p_request_kind is null or p_request_kind not in ('easier', 'change', 'immediate', 'period', 'review') then
    raise exception 'Invalid guidance request';
  end if;
  select * into v_interaction from public.growth_interactions
  where id = p_interaction_id and user_id = auth.uid();
  if found then
    if v_interaction.request_kind is distinct from p_request_kind
      or v_interaction.journal_text is distinct from btrim(p_context)
      or v_interaction.plan_id <> p_plan_id
      or v_interaction.step_id is distinct from p_step_id then
      raise exception 'Request id already used';
    end if;
    return v_interaction;
  end if;
  if p_request_kind in ('easier', 'change') and p_step_id is null then
    raise exception 'An active step is required';
  end if;
  v_interaction := public.submit_growth_interaction(
    p_interaction_id, p_plan_id, p_step_id, 'journal', null, null, p_context
  );
  update public.growth_interactions set request_kind = p_request_kind
  where id = v_interaction.id returning * into v_interaction;
  return v_interaction;
end;
$$;
revoke all on function public.request_growth_guidance(uuid, uuid, uuid, text, text) from public, anon;
grant execute on function public.request_growth_guidance(uuid, uuid, uuid, text, text) to authenticated;

create function public.set_growth_step_choice(p_step_id uuid, p_choice text)
returns public.growth_steps
language plpgsql security definer set search_path = '' as $$
declare v_step public.growth_steps;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if p_choice is null or p_choice not in ('accept', 'dismiss') then raise exception 'Invalid step choice'; end if;
  select * into v_step from public.growth_steps
  where id = p_step_id and user_id = auth.uid() for update;
  if not found then raise exception 'Step not found'; end if;
  if p_choice = 'dismiss' and v_step.status = 'dismissed' then return v_step; end if;
  if v_step.status <> 'active' then raise exception 'Step is no longer active'; end if;
  if exists (select 1 from public.growth_adaptive_responses where user_id = auth.uid() and confirmation_status = 'pending')
    or exists (select 1 from public.growth_interactions i where i.user_id = auth.uid()
      and not exists (select 1 from public.growth_adaptive_responses r where r.interaction_id = i.id)) then
    raise exception 'Resolve the current check-in first';
  end if;
  update public.growth_steps set
    accepted_at = case when p_choice = 'accept' then coalesce(accepted_at, now()) else accepted_at end,
    status = case when p_choice = 'dismiss' then 'dismissed' else status end,
    ended_at = case when p_choice = 'dismiss' then now() else ended_at end
  where id = p_step_id returning * into v_step;
  return v_step;
end;
$$;
revoke all on function public.set_growth_step_choice(uuid, text) from public, anon;
grant execute on function public.set_growth_step_choice(uuid, text) to authenticated;

create function public.guard_growth_request_response() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.proposed_step_completion and exists (
    select 1 from public.growth_interactions where id = new.interaction_id and request_kind is not null
  ) then raise exception 'A guidance request cannot complete a step'; end if;
  return new;
end;
$$;
create trigger growth_request_response_guard before insert or update on public.growth_adaptive_responses
for each row execute function public.guard_growth_request_response();
