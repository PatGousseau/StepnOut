-- Events are contextual step suggestions, not a separately enabled finder.
-- Keep previously expressed constraints; "local" is a product-owned 25 km.
create function public.growth_event_context(p_user_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce((select to_jsonb(p) from public.growth_event_preferences p
    where user_id = p_user_id), '{}'::jsonb)
    || jsonb_build_object('enabled', true, 'travel_radius', '25');
$$;
revoke all on function public.growth_event_context(uuid) from public,anon,authenticated;
grant execute on function public.growth_event_context(uuid) to service_role;

create function public.set_growth_guidance_city(p_source_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_source public.growth_event_sources; v_intake uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  select * into v_source from public.growth_event_sources
    where id=p_source_id and enabled and approval_reference is not null;
  if not found then raise exception 'City unavailable'; end if;
  select intake_id into v_intake from public.growth_plans where user_id=auth.uid() and status='active';
  if v_intake is null then raise exception 'Active plan required'; end if;
  insert into public.growth_event_preferences(user_id,intake_id,enabled,approximate_location,latitude,longitude,travel_radius)
    values(auth.uid(),v_intake,true,v_source.area,round(v_source.latitude::numeric,2),round(v_source.longitude::numeric,2),'25')
  on conflict(user_id) do update set approximate_location=excluded.approximate_location,
    latitude=excluded.latitude,longitude=excluded.longitude,updated_at=now();
end;
$$;
revoke all on function public.set_growth_guidance_city(text) from public,anon;
grant execute on function public.set_growth_guidance_city(text) to authenticated;

-- Serialize automatic checks and reuse the result across remounts/devices.
create function public.growth_accepted_event_detail(p_event_id uuid)
returns setof public.growth_events language sql stable security definer set search_path = '' as $$
  select e.* from public.growth_events e
  where e.id=p_event_id
    and exists(select 1 from public.growth_steps s where s.user_id=auth.uid()
      and s.event_id=e.id and s.status='active')
    and public.growth_event_eligible(e.id,public.growth_event_context(auth.uid()))
    and not exists(select 1 from public.growth_events cancelled
      join public.growth_event_sources source on source.id=cancelled.source_id
      where source.enabled and source.approval_reference is not null
        and cancelled.status='cancelled' and cancelled.verified_at>=e.verified_at
        and public.growth_same_occurrence(e,cancelled));
$$;
revoke all on function public.growth_accepted_event_detail(uuid) from public,anon;
grant execute on function public.growth_accepted_event_detail(uuid) to authenticated;

create function public.claim_automatic_growth_event(p_user_id uuid,p_step_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_row public.growth_event_selections; v_version bigint; v_prefs jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  if not exists(select 1 from public.growth_steps s join public.growth_plans p on p.id=s.plan_id
    where s.id=p_step_id and s.user_id=p_user_id and s.status='active' and p.status='active' and s.event_id is null)
    then raise exception 'Active non-event step required'; end if;
  if exists(select 1 from public.growth_adaptive_responses where user_id=p_user_id and confirmation_status='pending')
    or exists(select 1 from public.growth_interactions i where i.user_id=p_user_id
      and not exists(select 1 from public.growth_adaptive_responses r where r.interaction_id=i.id))
    then raise exception 'Resolve the current response first'; end if;
  select coalesce((select version from public.growth_guidance_context_versions where user_id=p_user_id),0) into v_version;
  v_prefs := public.growth_event_context(p_user_id);
  select * into v_row from public.growth_event_selections where user_id=p_user_id and step_id=p_step_id
    and context_version=v_version and preferences_snapshot=v_prefs
    and (status <> 'proposed' or (
      event_snapshot = (select to_jsonb(e) from public.growth_events e where e.id=event_id)
      and public.growth_event_eligible(event_id,v_prefs)))
    and created_at > now() - case when status='started' then interval '2 minutes'
      when status='failed' then interval '5 minutes' else interval '24 hours' end
    order by created_at desc limit 1;
  if found then return jsonb_build_object('selection',to_jsonb(v_row),'claimed',false); end if;
  v_row := public.claim_growth_event_selection(gen_random_uuid(),p_user_id);
  return jsonb_build_object('selection',to_jsonb(v_row),'claimed',true);
end;
$$;
revoke all on function public.claim_automatic_growth_event(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_automatic_growth_event(uuid,uuid) to service_role;


create or replace function public.claim_growth_event_selection(p_id uuid, p_user_id uuid)
returns public.growth_event_selections language plpgsql security definer set search_path = '' as $$
declare v_result public.growth_event_selections; v_plan uuid; v_step uuid; v_prefs jsonb; v_version bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select * into v_result from public.growth_event_selections where id = p_id and user_id = p_user_id;
  if found then return v_result; end if;
  if exists (select 1 from public.growth_event_selections where user_id = p_user_id and status = 'started' and created_at > now() - interval '2 minutes')
    or (select count(*) from public.growth_event_requests where user_id = p_user_id and created_at > now() - interval '1 hour') >= 12 then
    raise exception 'Event selection in progress or rate limited';
  end if;
  select id into v_plan from public.growth_plans where user_id = p_user_id and status = 'active';
  select id into v_step from public.growth_steps where user_id = p_user_id and status = 'active';
  v_prefs := public.growth_event_context(p_user_id);
  if v_plan is null or v_step is null then raise exception 'Active plan and step required'; end if;
  select version into v_version from public.growth_guidance_context_versions where user_id = p_user_id;
  insert into public.growth_event_requests(id,user_id) values(p_id,p_user_id);
  insert into public.growth_event_selections(id,user_id,plan_id,step_id,preferences_snapshot,context_version)
  values(p_id,p_user_id,v_plan,v_step,v_prefs,coalesce(v_version,0)) returning * into v_result;
  update public.growth_event_selections set status='failed'
  where user_id=p_user_id and id<>p_id and status in ('proposed','no_match','started');
  return v_result;
end;
$$;

create or replace function public.choose_growth_event(p_selection_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_selection public.growth_event_selections; v_prefs jsonb; v_step uuid; v_sequence integer; v_version bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  perform pg_advisory_xact_lock(282,1);
  select * into v_selection from public.growth_event_selections where id = p_selection_id and user_id = auth.uid() for update;
  if not found then raise exception 'Suggestion not found'; end if;
  if v_selection.status = 'accepted' and p_reason is null then return; end if;
  if v_selection.status = 'rejected' and v_selection.rejection_reason = p_reason then return; end if;
  if v_selection.status <> 'proposed' then raise exception 'Suggestion is no longer available'; end if;
  if p_reason is not null then
    update public.growth_event_selections set status = 'rejected', rejection_reason = p_reason where id = p_selection_id;
    return;
  end if;
  v_prefs := public.growth_event_context(auth.uid());
  select version into v_version from public.growth_guidance_context_versions where user_id = auth.uid();
  select id into v_step from public.growth_steps where user_id = auth.uid() and status = 'active';
  if v_prefs is distinct from v_selection.preferences_snapshot
    or coalesce(v_version,0) <> v_selection.context_version
    or v_step is distinct from v_selection.step_id
    or not exists(select 1 from public.growth_plans where id = v_selection.plan_id and status = 'active' and user_id = auth.uid())
    or (select to_jsonb(e) from public.growth_events e where e.id = v_selection.event_id) is distinct from v_selection.event_snapshot
    or not public.growth_event_eligible(v_selection.event_id, v_prefs)
    or not exists(select 1 from public.growth_event_candidates(auth.uid(),v_prefs) where id = v_selection.event_id) then
    raise exception 'Suggestion context or event changed; find a new match';
  end if;
  if exists(select 1 from public.growth_adaptive_responses where user_id = auth.uid() and confirmation_status = 'pending')
    or exists(select 1 from public.growth_interactions i where i.user_id = auth.uid() and not exists(select 1 from public.growth_adaptive_responses r where r.interaction_id = i.id)) then
    raise exception 'Resolve the current check-in first';
  end if;
  update public.growth_steps set status = 'replaced', ended_at = now() where id = v_step;
  select coalesce(max(sequence),0)+1 into v_sequence from public.growth_steps where user_id = auth.uid();
  insert into public.growth_steps(plan_id,user_id,sequence,title,rationale,action,completion_criterion,if_then_plan,accepted_at,event_id)
  values(v_selection.plan_id,auth.uid(),v_sequence,v_selection.proposed_step->>'title',v_selection.proposed_step->>'rationale',
    v_selection.proposed_step->>'action',v_selection.proposed_step->>'completion_criterion',v_selection.proposed_step->>'if_then_plan',now(),v_selection.event_id);
  update public.growth_event_selections set status = 'accepted' where id = p_selection_id;
  update public.growth_event_selections set status = 'failed' where user_id = auth.uid() and id <> p_selection_id and status in ('proposed','no_match');
end;
$$;

create or replace function public.finish_growth_event_selection(
  p_id uuid, p_user_id uuid, p_event_id uuid, p_explanation text, p_step jsonb, p_model text, p_prompt text, p_event_snapshot jsonb
) returns public.growth_event_selections language plpgsql security definer set search_path = '' as $$
declare v_row public.growth_event_selections; v_prefs jsonb; v_step uuid; v_version bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  perform pg_advisory_xact_lock(282,1);
  select * into v_row from public.growth_event_selections where id = p_id and user_id = p_user_id and status = 'started' for update;
  if not found then raise exception 'Selection expired'; end if;
  v_prefs := public.growth_event_context(p_user_id);
  select id into v_step from public.growth_steps where user_id = p_user_id and status = 'active';
  select version into v_version from public.growth_guidance_context_versions where user_id = p_user_id;
  if v_prefs is distinct from v_row.preferences_snapshot or v_step is distinct from v_row.step_id
    or coalesce(v_version,0) <> v_row.context_version
    or not exists(select 1 from public.growth_plans where id = v_row.plan_id and status = 'active') then
    raise exception 'Selection context changed';
  end if;
  if p_event_id is not null and (not public.growth_event_eligible(p_event_id,v_prefs)
    or (select to_jsonb(e) from public.growth_events e where e.id = p_event_id) is distinct from p_event_snapshot
    or not exists(select 1 from public.growth_event_candidates(p_user_id,v_prefs) where id = p_event_id)
    or p_step is null or nullif(btrim(p_step->>'action'),'') is null
    or nullif(btrim(p_step->>'completion_criterion'),'') is null) then raise exception 'Ineligible event step'; end if;
  update public.growth_event_selections set status = case when p_event_id is null then 'no_match' else 'proposed' end,
    event_id = p_event_id, event_snapshot = p_event_snapshot, explanation = p_explanation, proposed_step = p_step, model_name = p_model, prompt_version = p_prompt
  where id = p_id returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.growth_event_detail(p_selection_id uuid)
returns setof public.growth_events language sql stable security definer set search_path = '' as $$
  select e.* from public.growth_event_selections s
  cross join lateral public.growth_event_candidates(auth.uid(),public.growth_event_context(auth.uid())) e
  where s.id = p_selection_id and s.user_id = auth.uid() and s.status = 'proposed'
    and s.step_id = (select id from public.growth_steps where user_id=auth.uid() and status='active')
    and s.context_version = coalesce((select version from public.growth_guidance_context_versions where user_id=auth.uid()),0)
    and s.preferences_snapshot = public.growth_event_context(auth.uid()) and e.id = s.event_id and s.event_snapshot = to_jsonb(e);
$$;
