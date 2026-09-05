create table public.growth_event_sources (
  id text primary key,
  name text not null,
  source_url text not null check (source_url ~ '^https://'),
  enabled boolean not null default false,
  approval_reference text,
  area text not null,
  latitude numeric not null check (latitude between -90 and 90),
  longitude numeric not null check (longitude between -180 and 180),
  check (not enabled or nullif(btrim(approval_reference), '') is not null)
);
create table public.growth_events (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.growth_event_sources(id),
  source_key text not null,
  title text not null,
  description text not null,
  category text not null,
  source_url text not null check (source_url ~ '^https://'),
  provenance jsonb not null default '[]',
  kind text not null check (kind in ('event', 'place')),
  starts_at timestamptz,
  timezone text not null default 'Europe/Rome',
  ends_at timestamptz,
  availability text,
  location text not null,
  latitude numeric not null check (latitude between -90 and 90),
  longitude numeric not null check (longitude between -180 and 180),
  cost_eur numeric check (cost_eur >= 0),
  wheelchair_accessible boolean,
  accessibility text,
  minimum_age integer check (minimum_age >= 0),
  status text not null check (status in ('active', 'cancelled', 'unverified')),
  verified_at timestamptz not null,
  unique(source_id, source_key),
  check ((kind = 'event' and starts_at is not null) or (kind = 'place' and starts_at is null and availability is not null)),
  check (ends_at is null or ends_at > starts_at)
);
create index growth_events_available on public.growth_events(status, starts_at);
alter table public.growth_event_sources enable row level security;
alter table public.growth_events enable row level security;
create policy "Approved event sources" on public.growth_event_sources for select to authenticated using (enabled and approval_reference is not null);
create policy "Approved events" on public.growth_events for select to authenticated using (
  exists (select 1 from public.growth_event_sources s where s.id = source_id and s.enabled and s.approval_reference is not null)
);
grant select on public.growth_event_sources, public.growth_events to authenticated;

alter table public.growth_event_preferences
  add column latitude numeric check (latitude between -90 and 90 and latitude = round(latitude, 2)),
  add column longitude numeric check (longitude between -180 and 180 and longitude = round(longitude, 2)),
  add column max_cost_eur numeric check (max_cost_eur >= 0),
  add column wheelchair_required boolean not null default false,
  add column event_types text not null default '';

create table public.growth_event_selections (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.growth_plans(id),
  step_id uuid references public.growth_steps(id),
  preferences_snapshot jsonb not null,
  context_version bigint not null default 0,
  event_id uuid references public.growth_events(id),
  event_snapshot jsonb,
  explanation text,
  proposed_step jsonb,
  status text not null default 'started' check (status in ('started','proposed','no_match','failed','accepted','rejected')),
  rejection_reason text check (rejection_reason in ('too_much','not_relevant','too_far','bad_timing','wrong_type','stale')),
  model_name text,
  prompt_version text,
  created_at timestamptz not null default now(),
  check (status not in ('proposed','accepted','rejected') or (event_id is not null and proposed_step is not null))
);
create index growth_event_selections_user_created on public.growth_event_selections(user_id, created_at desc);
create table public.growth_event_requests (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index growth_event_requests_user_created on public.growth_event_requests(user_id,created_at desc);
alter table public.growth_event_requests enable row level security;
alter table public.growth_event_selections enable row level security;
create policy "Own event suggestions" on public.growth_event_selections for select to authenticated using (user_id = auth.uid());
grant select on public.growth_event_selections to authenticated;
alter table public.growth_steps add column event_id uuid references public.growth_events(id);

create function public.growth_event_eligible(p_event_id uuid, p_preferences jsonb)
returns boolean language sql stable set search_path = '' as $$
  select coalesce((select e.status = 'active' and s.enabled and s.approval_reference is not null
    and e.verified_at <= now()
    and e.verified_at > now() - case when e.kind = 'event' then interval '48 hours' else interval '7 days' end
    and (e.kind = 'place' or e.starts_at > now())
    and (e.minimum_age is null or e.minimum_age <= 18)
    and (not coalesce((p_preferences->>'wheelchair_required')::boolean, false) or e.wheelchair_accessible = true)
    and (p_preferences->>'max_cost_eur' is null or e.cost_eur <= (p_preferences->>'max_cost_eur')::numeric)
    and (p_preferences->>'enabled')::boolean = true
    and p_preferences->>'latitude' is not null and p_preferences->>'longitude' is not null
    and case when p_preferences->>'travel_radius' ~ '^[0-9]+([.][0-9]+)?$' then
      6371 * 2 * asin(least(1, sqrt(
        power(sin(radians(e.latitude::double precision - (p_preferences->>'latitude')::double precision) / 2), 2) +
        cos(radians((p_preferences->>'latitude')::double precision)) * cos(radians(e.latitude::double precision)) *
        power(sin(radians(e.longitude::double precision - (p_preferences->>'longitude')::double precision) / 2), 2)
      ))) <= least(100, (p_preferences->>'travel_radius')::numeric) else false end
    from public.growth_events e join public.growth_event_sources s on s.id = e.source_id
    where e.id = p_event_id), false);
$$;

create function public.claim_growth_event_selection(p_id uuid, p_user_id uuid)
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
  select to_jsonb(p) into v_prefs from public.growth_event_preferences p where user_id = p_user_id and enabled;
  if v_plan is null or v_prefs is null then raise exception 'Active plan and enabled preferences required'; end if;
  select version into v_version from public.growth_guidance_context_versions where user_id = p_user_id;
  insert into public.growth_event_requests(id,user_id) values(p_id,p_user_id);
  insert into public.growth_event_selections(id,user_id,plan_id,step_id,preferences_snapshot,context_version)
  values(p_id,p_user_id,v_plan,v_step,v_prefs,coalesce(v_version,0)) returning * into v_result;
  update public.growth_event_selections set status='failed'
  where user_id=p_user_id and id<>p_id and status in ('proposed','no_match','started');
  return v_result;
end;
$$;
revoke all on function public.claim_growth_event_selection(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_growth_event_selection(uuid,uuid) to service_role;

create function public.choose_growth_event(p_selection_id uuid, p_reason text)
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
  select to_jsonb(p) into v_prefs from public.growth_event_preferences p where user_id = auth.uid();
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
revoke all on function public.choose_growth_event(uuid,text) from public,anon;
grant execute on function public.choose_growth_event(uuid,text) to authenticated;

-- Removing preferences also removes stored location snapshots and matching interpretations.
create function public.clear_growth_event_context() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(old.user_id::text,0));
  delete from public.growth_event_selections where user_id = old.user_id;
  return old;
end;
$$;
create trigger clear_growth_event_context before delete on public.growth_event_preferences
for each row execute function public.clear_growth_event_context();

create function public.lock_growth_event_preferences() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,0));
  return new;
end;
$$;
create trigger lock_growth_event_preferences before insert or update on public.growth_event_preferences
for each row execute function public.lock_growth_event_preferences();

create function public.finish_growth_event_selection(
  p_id uuid, p_user_id uuid, p_event_id uuid, p_explanation text, p_step jsonb, p_model text, p_prompt text, p_event_snapshot jsonb
) returns public.growth_event_selections language plpgsql security definer set search_path = '' as $$
declare v_row public.growth_event_selections; v_prefs jsonb; v_step uuid; v_version bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  perform pg_advisory_xact_lock(282,1);
  select * into v_row from public.growth_event_selections where id = p_id and user_id = p_user_id and status = 'started' for update;
  if not found then raise exception 'Selection expired'; end if;
  select to_jsonb(p) into v_prefs from public.growth_event_preferences p where user_id = p_user_id;
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
revoke all on function public.finish_growth_event_selection(uuid,uuid,uuid,text,jsonb,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.finish_growth_event_selection(uuid,uuid,uuid,text,jsonb,text,text,jsonb) to service_role;

create function public.invalidate_growth_event_evidence() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.growth_guidance_context_versions(user_id,version) values(new.user_id,1)
  on conflict(user_id) do update set version = public.growth_guidance_context_versions.version + 1;
  return new;
end;
$$;
create trigger growth_evidence_version after insert on public.growth_interactions
for each row execute function public.invalidate_growth_event_evidence();

create function public.clear_growth_event_journal_context() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.growth_event_selections where user_id = old.user_id and created_at >= old.created_at;
  return old;
end;
$$;
create trigger clear_growth_event_journal_context before delete on public.growth_interactions
for each row execute function public.clear_growth_event_journal_context();

create function public.growth_same_occurrence(a public.growth_events, b public.growth_events)
returns boolean language sql immutable set search_path = '' as $$
  select a.kind = b.kind and a.starts_at is not distinct from b.starts_at
    and regexp_replace(lower(a.title),'[^[:alnum:]]','','g') = regexp_replace(lower(b.title),'[^[:alnum:]]','','g')
    and 6371 * 2 * asin(least(1,sqrt(power(sin(radians((a.latitude-b.latitude)::double precision)/2),2)
      + cos(radians(a.latitude::double precision))*cos(radians(b.latitude::double precision))*power(sin(radians((a.longitude-b.longitude)::double precision)/2),2)))) < 0.1;
$$;

create function public.growth_event_candidates(p_user_id uuid, p_preferences jsonb)
returns setof public.growth_events language sql stable security definer set search_path = '' as $$
  select e.* from public.growth_events e
  where public.growth_event_eligible(e.id,p_preferences)
    and not exists(select 1 from public.growth_event_selections s join public.growth_events rejected on rejected.id = s.event_id
      where s.user_id = p_user_id and s.status in ('rejected','accepted') and public.growth_same_occurrence(e,rejected))
    and not exists(select 1 from public.growth_events cancelled join public.growth_event_sources source on source.id = cancelled.source_id
      where source.enabled and cancelled.status = 'cancelled' and cancelled.verified_at >= e.verified_at and public.growth_same_occurrence(e,cancelled))
  order by e.starts_at nulls last, e.verified_at desc limit 80;
$$;
revoke all on function public.growth_event_candidates(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.growth_event_candidates(uuid,jsonb) to service_role;

-- Read-time eligibility uses the same clock, duplicate and preference checks as acceptance.
create function public.growth_event_detail(p_selection_id uuid)
returns setof public.growth_events language sql stable security definer set search_path = '' as $$
  select e.* from public.growth_event_selections s
  join public.growth_event_preferences p on p.user_id = s.user_id
  cross join lateral public.growth_event_candidates(auth.uid(),to_jsonb(p)) e
  where s.id = p_selection_id and s.user_id = auth.uid() and s.status = 'proposed'
    and s.preferences_snapshot = to_jsonb(p) and e.id = s.event_id and s.event_snapshot = to_jsonb(e);
$$;
revoke all on function public.growth_event_detail(uuid) from public,anon;
grant execute on function public.growth_event_detail(uuid) to authenticated;

create function public.lock_growth_inventory() returns trigger language plpgsql set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(282,1);
  return null;
end;
$$;
create trigger lock_growth_inventory before insert or update or delete on public.growth_events
for each statement execute function public.lock_growth_inventory();
create trigger lock_growth_sources before insert or update or delete on public.growth_event_sources
for each statement execute function public.lock_growth_inventory();
