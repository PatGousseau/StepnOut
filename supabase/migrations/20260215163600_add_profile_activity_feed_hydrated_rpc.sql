-- returns hydrated profile activity rows (posts + comments) to avoid multiple client roundtrips

create or replace function public.get_profile_activity_hydrated(
  p_user_id uuid,
  p_limit int default 20,
  p_before_created_at timestamptz default null,
  p_before_type text default null,
  p_before_id int default null
)
returns table (
  item_type text,
  item_id int,
  created_at timestamptz,
  post jsonb,
  comment jsonb
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
  select
    a.item_type,
    a.item_id,
    a.created_at,
    case
      when a.item_type = 'post' then (
        select jsonb_build_object(
          'id', p.id,
          'user_id', p.user_id,
          'created_at', p.created_at,
          'featured', p.featured,
          'body', p.body,
          'media_id', p.media_id,
          'challenge_id', p.challenge_id,
          'is_welcome', p.is_welcome,
          'challenge_title', ch.title,
          'media', case
            when m.file_path is null then null
            else jsonb_build_object('file_path', m.file_path)
          end,
          'likes_count', (select count(*) from public.likes l where l.post_id = p.id),
          'comments_count', (select count(*) from public.comments c where c.post_id = p.id),
          'liked', exists(
            select 1
            from public.likes l
            where l.post_id = p.id
              and l.user_id = auth.uid()
          ),
          'comment_previews', (
            select coalesce(jsonb_agg(
              jsonb_build_object(
                'username', pr.username,
                'text', c.body,
                'replyToUsername', pr_parent.username
              )
              order by c.created_at asc
            ), '[]'::jsonb)
            from (
              select c1.*
              from public.comments c1
              where c1.post_id = p.id
              order by c1.created_at asc
              limit 3
            ) c
            left join public.profiles pr on pr.id = c.user_id
            left join public.comments c_parent on c_parent.id = c.parent_comment_id
            left join public.profiles pr_parent on pr_parent.id = c_parent.user_id
          )
        )
        from public.post p
        left join public.media m on m.id = p.media_id
        left join public.challenges ch on ch.id = p.challenge_id
        where p.id = a.item_id
      )
      else null
    end as post,
    case
      when a.item_type = 'comment' then (
        select jsonb_build_object(
          'id', c.id,
          'user_id', c.user_id,
          'post_id', c.post_id,
          'parent_comment_id', c.parent_comment_id,
          'created_at', c.created_at,
          'text', c.body,
          'likes_count', (select count(*) from public.likes l where l.comment_id = c.id),
          'liked', exists(
            select 1
            from public.likes l
            where l.comment_id = c.id
              and l.user_id = auth.uid()
          ),
          'post', (
            select jsonb_build_object(
              'id', p.id,
              'body', p.body,
              'created_at', p.created_at,
              'challenge_title', ch.title
            )
            from public.post p
            left join public.challenges ch on ch.id = p.challenge_id
            where p.id = c.post_id
          )
        )
        from public.comments c
        where c.id = a.item_id
      )
      else null
    end as comment
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

grant execute on function public.get_profile_activity_hydrated(uuid, int, timestamptz, text, int) to authenticated;
