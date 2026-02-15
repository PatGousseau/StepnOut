-- adds a single-cursor activity feed (posts + comments) for profile pages

create or replace function public.get_profile_activity(
  p_user_id uuid,
  p_limit int default 20,
  p_before timestamptz default null
)
returns table (
  item_type text,
  item_id int,
  created_at timestamptz
)
language sql
stable
as $$
  select *
  from (
    select
      'post'::text as item_type,
      p.id as item_id,
      p.created_at as created_at
    from public.post p
    left join public.media m on m.id = p.media_id
    where p.user_id = p_user_id
      and coalesce(p.is_welcome, false) = false
      and (
        m.upload_status is null
        or m.upload_status not in ('failed', 'pending')
      )
      and (
        p_before is null
        or p.created_at < p_before
      )

    union all

    select
      'comment'::text as item_type,
      c.id as item_id,
      c.created_at::timestamptz as created_at
    from public.comments c
    where c.user_id = p_user_id
      and (
        p_before is null
        or c.created_at::timestamptz < p_before
      )
  ) activity
  order by created_at desc, item_type desc, item_id desc
  limit p_limit;
$$;

grant execute on function public.get_profile_activity(uuid, int, timestamptz) to authenticated;
