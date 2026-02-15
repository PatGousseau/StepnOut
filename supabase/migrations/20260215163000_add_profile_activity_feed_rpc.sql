-- adds a single-cursor activity feed (posts + comments) for profile pages

create or replace function public.get_profile_activity(
  p_user_id uuid,
  p_limit int default 20,
  p_before_created_at timestamptz default null,
  p_before_type text default null,
  p_before_id int default null
)
returns table (
  item_type text,
  item_id int,
  created_at timestamptz
)
language sql
stable
as $$
  with activity as (
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

    union all

    select
      'comment'::text as item_type,
      c.id as item_id,
      c.created_at::timestamptz as created_at
    from public.comments c
    where c.user_id = p_user_id
  )
  select a.*
  from activity a
  where (
    p_before_created_at is null
    or p_before_type is null
    or p_before_id is null
    or (a.created_at, a.item_type, a.item_id) < (p_before_created_at, p_before_type, p_before_id)
  )
  order by a.created_at desc, a.item_type desc, a.item_id desc
  limit p_limit;
$$;

grant execute on function public.get_profile_activity(uuid, int, timestamptz, text, int) to authenticated;
