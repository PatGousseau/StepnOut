-- daily personalized push notifications
--
-- creates an rpc that returns pushable users + a small activity summary
-- and schedules a daily cron to call the edge function

create or replace function public.get_daily_notification_candidates()
returns table (
  user_id uuid,
  push_token text,
  username text,
  name text,
  post_count bigint,
  comment_count bigint,
  last_post_body text,
  last_comment_body text,
  last_activity_at timestamptz
)
language sql
stable
as $$
  select
    p.id as user_id,
    p.push_token,
    p.username,
    p.name,
    coalesce(pc.post_count, 0) as post_count,
    coalesce(cc.comment_count, 0) as comment_count,
    lp.body as last_post_body,
    lc.body as last_comment_body,
    greatest(
      lp.created_at,
      (lc.created_at at time zone 'utc')
    ) as last_activity_at
  from public.profiles p
  left join lateral (
    select count(*)::bigint as post_count
    from public.post
    where user_id = p.id
  ) pc on true
  left join lateral (
    select count(*)::bigint as comment_count
    from public.comments
    where user_id = p.id
  ) cc on true
  left join lateral (
    select body, created_at
    from public.post
    where user_id = p.id
    order by created_at desc nulls last
    limit 1
  ) lp on true
  left join lateral (
    select body, created_at
    from public.comments
    where user_id = p.id
    order by created_at desc nulls last
    limit 1
  ) lc on true
  where p.push_token is not null;
$$;

-- schedule at 17:00 utc (9am pacific)
-- note: this uses the same service role jwt pattern already present in remote_schema

do $$
declare
  existing_job_id int;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'daily_personalized_push'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform
    cron.schedule(
      'daily_personalized_push',
      '0 17 * * *',
      $$
        select
          net.http_post(
            'https://kiplxlahalqyahstmmjg.supabase.co/functions/v1/send-daily-personalized-notifications',
            json_build_object(
              'Authorization',
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM5MTE1MSwiZXhwIjoyMDQ0OTY3MTUxfQ.qTUtndeAxu4IUDQucVzlBowkwgAh6W1S6j4x5QeWJv4'
            )::jsonb,
            '{}'::jsonb
          );
      $$
    );
end $$;
