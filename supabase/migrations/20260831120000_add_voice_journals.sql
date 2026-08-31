create table public.growth_voice_journals (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.growth_plans(id) on delete restrict,
  step_id uuid references public.growth_steps(id) on delete restrict,
  status text not null default 'uploading'
    check (status in ('uploading', 'transcribing', 'review', 'submitted', 'failed')),
  object_path text not null unique,
  mime_type text not null check (mime_type in ('audio/m4a', 'audio/mp4')),
  duration_ms integer not null check (duration_ms between 500 and 180000),
  machine_transcript text
    check (machine_transcript is null or char_length(machine_transcript) between 1 and 4000),
  reviewed_transcript text
    check (reviewed_transcript is null or char_length(reviewed_transcript) between 1 and 4000),
  transcript_edited boolean not null default false,
  last_error text check (last_error is null or char_length(last_error) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  check (object_path = user_id::text || '/' || id::text || '.m4a'),
  check (
    (status in ('uploading', 'transcribing', 'failed') and reviewed_transcript is null)
    or (status = 'review' and machine_transcript is not null and reviewed_transcript is null)
    or (status = 'submitted' and machine_transcript is null and reviewed_transcript is not null)
  )
);

create unique index growth_voice_journals_one_draft_per_user
  on public.growth_voice_journals(user_id)
  where status <> 'submitted';

create table public.growth_voice_transcription_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  voice_journal_id uuid references public.growth_voice_journals(id) on delete set null,
  created_at timestamptz not null default now()
);

create index growth_voice_transcription_requests_user_created
  on public.growth_voice_transcription_requests(user_id, created_at desc);

alter table public.growth_voice_transcription_requests enable row level security;

create table public.growth_guidance_context_versions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  version bigint not null default 0
);

alter table public.growth_guidance_context_versions enable row level security;

alter table public.growth_adaptation_requests
  add column context_version bigint not null default 0;

create or replace function public.claim_growth_adaptation(
  p_user_id uuid,
  p_interaction_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request_id uuid;
  v_context_version bigint;
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
    where user_id = p_user_id and status = 'started'
      and created_at > now() - interval '2 minutes'
  ) then return null; end if;
  if (select count(*) from public.growth_adaptation_requests
      where user_id = p_user_id and created_at > now() - interval '1 hour') >= 20 then
    return null;
  end if;
  insert into public.growth_guidance_context_versions(user_id)
  values (p_user_id) on conflict (user_id) do nothing;
  select version into v_context_version
  from public.growth_guidance_context_versions where user_id = p_user_id;
  insert into public.growth_adaptation_requests (
    user_id, interaction_id, context_version
  ) values (
    p_user_id, p_interaction_id, v_context_version
  ) returning id into v_request_id;
  return v_request_id;
end;
$$;

create or replace function public.persist_growth_adaptive_response_if_current(
  p_request_id uuid,
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
  v_request_version bigint;
  v_current_version bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select context_version into v_request_version
  from public.growth_adaptation_requests
  where id = p_request_id and user_id = p_user_id
    and interaction_id = p_interaction_id and status = 'started'
  for update;
  if not found then raise exception 'Growth adaptation request is no longer active'; end if;
  select version into v_current_version
  from public.growth_guidance_context_versions where user_id = p_user_id;
  if v_current_version is distinct from v_request_version then
    raise exception 'Growth adaptation context was invalidated';
  end if;
  return public.persist_growth_adaptive_response(
    p_user_id, p_interaction_id, p_response_type, p_message,
    p_clarification_question, p_next_step, p_proposed_plan_update,
    p_proposed_step_completion, p_model_name, p_prompt_version
  );
end;
$$;

revoke all on function public.persist_growth_adaptive_response_if_current(
  uuid, uuid, uuid, text, text, text, jsonb, jsonb, boolean, text, text
) from public, anon, authenticated;
grant execute on function public.persist_growth_adaptive_response_if_current(
  uuid, uuid, uuid, text, text, text, jsonb, jsonb, boolean, text, text
) to service_role;

alter table public.growth_interactions
  add column voice_journal_id uuid unique
    references public.growth_voice_journals(id) on delete restrict;

alter table public.growth_voice_journals enable row level security;

create policy "Users can read own voice journal metadata"
  on public.growth_voice_journals for select
  using (auth.uid() = user_id);

grant select on public.growth_voice_journals to authenticated;

create or replace function public.claim_growth_voice_transcription_for_user(
  p_user_id uuid,
  p_voice_journal_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if not exists (
    select 1 from public.growth_voice_journals
    where id = p_voice_journal_id and user_id = p_user_id
  ) then
    return false;
  end if;
  if (
    select count(*) from public.growth_voice_transcription_requests
    where user_id = p_user_id and created_at >= now() - interval '1 hour'
  ) >= 6 then
    return false;
  end if;
  insert into public.growth_voice_transcription_requests(user_id, voice_journal_id)
  values (p_user_id, p_voice_journal_id);
  return true;
end;
$$;

revoke all on function public.claim_growth_voice_transcription_for_user(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.claim_growth_voice_transcription_for_user(uuid, uuid)
  to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'growth-journal-audio', 'growth-journal-audio', false, 10485760,
  array['audio/m4a', 'audio/mp4']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read own growth journal audio"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'growth-journal-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.growth_voice_journals voice
      where voice.user_id = auth.uid() and voice.object_path = name
    )
  );

create policy "Users can upload own growth journal audio"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'growth-journal-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.growth_voice_journals voice
      where voice.user_id = auth.uid() and voice.object_path = name
    )
  );

create policy "Users can replace own growth journal audio"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'growth-journal-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.growth_voice_journals voice
      where voice.user_id = auth.uid() and voice.object_path = name
    )
  )
  with check (
    bucket_id = 'growth-journal-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.growth_voice_journals voice
      where voice.user_id = auth.uid() and voice.object_path = name
    )
  );

create policy "Users can delete own growth journal audio"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'growth-journal-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.growth_voice_journals voice
      where voice.user_id = auth.uid() and voice.object_path = name
    )
  );

create or replace function public.begin_growth_voice_journal(
  p_voice_journal_id uuid,
  p_plan_id uuid,
  p_step_id uuid,
  p_mime_type text,
  p_duration_ms integer
)
returns public.growth_voice_journals
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_voice public.growth_voice_journals;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  select * into v_voice from public.growth_voice_journals
  where id = p_voice_journal_id and user_id = auth.uid();
  if found then return v_voice; end if;

  perform 1 from public.growth_plans
  where id = p_plan_id and user_id = auth.uid() and status = 'active';
  if not found then raise exception 'Active growth plan not found'; end if;

  if p_step_id is not null then
    perform 1 from public.growth_steps
    where id = p_step_id and plan_id = p_plan_id and user_id = auth.uid()
      and status = 'active';
    if not found then raise exception 'Active growth step not found'; end if;
  end if;

  if p_mime_type not in ('audio/m4a', 'audio/mp4') then
    raise exception 'Unsupported voice journal format';
  end if;
  if p_duration_ms < 500 or p_duration_ms > 180000 then
    raise exception 'Voice journal duration is out of range';
  end if;

  insert into public.growth_voice_journals (
    id, user_id, plan_id, step_id, object_path, mime_type, duration_ms
  ) values (
    p_voice_journal_id, auth.uid(), p_plan_id, p_step_id,
    auth.uid()::text || '/' || p_voice_journal_id::text || '.m4a',
    p_mime_type, p_duration_ms
  ) returning * into v_voice;
  return v_voice;
end;
$$;

revoke all on function public.begin_growth_voice_journal(uuid, uuid, uuid, text, integer)
  from public, anon;
grant execute on function public.begin_growth_voice_journal(uuid, uuid, uuid, text, integer)
  to authenticated;

create or replace function public.submit_growth_voice_journal(
  p_voice_journal_id uuid,
  p_interaction_id uuid,
  p_reviewed_transcript text
)
returns public.growth_interactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_voice public.growth_voice_journals;
  v_interaction public.growth_interactions;
  v_reviewed text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  select * into v_interaction from public.growth_interactions
  where voice_journal_id = p_voice_journal_id and user_id = auth.uid();
  if found then return v_interaction; end if;

  select * into v_voice from public.growth_voice_journals
  where id = p_voice_journal_id and user_id = auth.uid()
  for update;
  if not found or v_voice.status <> 'review' then
    raise exception 'Voice journal transcript is not ready for review';
  end if;

  v_reviewed := btrim(p_reviewed_transcript);
  if v_reviewed = '' or char_length(v_reviewed) > 4000 then
    raise exception 'Reviewed transcript is required and must be 4000 characters or fewer';
  end if;

  v_interaction := public.submit_growth_interaction(
    p_interaction_id, v_voice.plan_id, v_voice.step_id,
    'journal', null, null, v_reviewed
  );

  update public.growth_interactions
  set voice_journal_id = v_voice.id
  where id = v_interaction.id and user_id = auth.uid()
  returning * into v_interaction;

  update public.growth_voice_journals
  set status = 'submitted', reviewed_transcript = v_reviewed,
      transcript_edited = v_reviewed is distinct from v_voice.machine_transcript,
      machine_transcript = null, last_error = null,
      submitted_at = now(), updated_at = now()
  where id = v_voice.id;

  return v_interaction;
end;
$$;

revoke all on function public.submit_growth_voice_journal(uuid, uuid, text)
  from public, anon;
grant execute on function public.submit_growth_voice_journal(uuid, uuid, text)
  to authenticated;

create or replace function public.delete_growth_voice_draft_for_user(
  p_user_id uuid,
  p_voice_journal_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  delete from public.growth_voice_journals
  where id = p_voice_journal_id and user_id = p_user_id and status <> 'submitted';
  if not found then raise exception 'Voice journal draft not found'; end if;
end;
$$;

revoke all on function public.delete_growth_voice_draft_for_user(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.delete_growth_voice_draft_for_user(uuid, uuid)
  to service_role;

create or replace function public.delete_growth_journal_for_user(
  p_user_id uuid,
  p_interaction_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_interaction public.growth_interactions;
  v_voice_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select * into v_interaction from public.growth_interactions
  where id = p_interaction_id and user_id = p_user_id and kind = 'journal'
  for update;
  if not found then raise exception 'Journal entry not found'; end if;

  v_voice_id := v_interaction.voice_journal_id;
  insert into public.growth_guidance_context_versions(user_id, version)
  values (p_user_id, 1)
  on conflict (user_id) do update
    set version = public.growth_guidance_context_versions.version + 1;
  update public.growth_adaptation_requests
  set status = 'failed', finished_at = now()
  where user_id = p_user_id and status = 'started';
  update public.growth_plan_evidence
  set content = (content - 'source_interaction_id' - 'evidence_summary') ||
    jsonb_build_object('source_deleted', true)
  where user_id = p_user_id and created_at >= v_interaction.created_at;
  delete from public.growth_adaptation_requests
  where user_id = p_user_id and interaction_id in (
    select interaction_id from public.growth_adaptive_responses
    where user_id = p_user_id and created_at >= v_interaction.created_at
  );
  delete from public.growth_adaptive_responses
  where user_id = p_user_id and created_at >= v_interaction.created_at;
  delete from public.growth_adaptation_requests
  where interaction_id = v_interaction.id and user_id = p_user_id;
  delete from public.growth_interactions where id = v_interaction.id;
  if v_voice_id is not null then
    delete from public.growth_voice_journals
    where id = v_voice_id and user_id = p_user_id;
  end if;
end;
$$;

revoke all on function public.delete_growth_journal_for_user(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.delete_growth_journal_for_user(uuid, uuid)
  to service_role;
