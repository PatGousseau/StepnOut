ALTER TABLE public.post
  ADD COLUMN IF NOT EXISTS quest_id bigint;

ALTER TABLE public.post
  DROP CONSTRAINT IF EXISTS post_quest_id_fkey;

ALTER TABLE public.post
  ADD CONSTRAINT post_quest_id_fkey
  FOREIGN KEY (quest_id) REFERENCES public.side_quests(id) ON DELETE SET NULL;

ALTER TABLE public.post
  DROP CONSTRAINT IF EXISTS post_single_context_check;

ALTER TABLE public.post
  ADD CONSTRAINT post_single_context_check
  CHECK (
    (
      CASE WHEN challenge_id IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN quest_id IS NOT NULL THEN 1 ELSE 0 END
    ) <= 1
  );

CREATE INDEX IF NOT EXISTS post_quest_id_idx ON public.post (quest_id);

CREATE TABLE IF NOT EXISTS public.side_quest_draws (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_id bigint NOT NULL REFERENCES public.side_quests(id) ON DELETE RESTRICT,
  local_day date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_day),
  UNIQUE (user_id, quest_id)
);

CREATE INDEX IF NOT EXISTS side_quest_draws_user_local_day_idx
  ON public.side_quest_draws (user_id, local_day DESC);

ALTER TABLE public.side_quest_draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "side_quest_draws_select_self"
  ON public.side_quest_draws FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "side_quest_draws_insert_self"
  ON public.side_quest_draws FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP FUNCTION IF EXISTS public.claim_daily_side_quest(bigint[], date);

CREATE OR REPLACE FUNCTION public.claim_daily_side_quest(
  ranked_quest_ids bigint[],
  requested_local_day date
)
RETURNS TABLE(
  status text,
  draw_id bigint,
  draw_local_day date,
  quest jsonb
) AS $$
DECLARE
  existing_draw public.side_quest_draws%ROWTYPE;
  selected_draw public.side_quest_draws%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF requested_local_day IS NULL THEN
    RAISE EXCEPTION 'requested_local_day is required';
  END IF;

  SELECT *
  INTO existing_draw
  FROM public.side_quest_draws sqd
  WHERE sqd.user_id = auth.uid()
    AND sqd.local_day = requested_local_day;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      'existing'::text,
      existing_draw.id,
      existing_draw.local_day,
      to_jsonb(sq.*)
    FROM public.side_quests sq
    WHERE sq.id = existing_draw.quest_id;
    RETURN;
  END IF;

  WITH ranked_candidates AS (
    SELECT
      sq.*,
      ids.ordinality::int AS rank_position
    FROM unnest(ranked_quest_ids) WITH ORDINALITY AS ids(quest_id, ordinality)
    JOIN public.side_quests sq
      ON sq.id = ids.quest_id
    LEFT JOIN public.side_quest_draws seen
      ON seen.user_id = auth.uid()
     AND seen.quest_id = sq.id
    WHERE sq.is_active = true
      AND seen.id IS NULL
  ),
  weighted_choice AS (
    SELECT id
    FROM ranked_candidates
    ORDER BY -ln(GREATEST(random(), 1e-9)) / (1.0 / rank_position)
    LIMIT 1
  ),
  inserted AS (
    INSERT INTO public.side_quest_draws (user_id, quest_id, local_day)
    SELECT auth.uid(), id, requested_local_day
    FROM weighted_choice
    ON CONFLICT (user_id, local_day) DO NOTHING
    RETURNING *
  )
  SELECT *
  INTO selected_draw
  FROM inserted;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      'created'::text,
      selected_draw.id,
      selected_draw.local_day,
      to_jsonb(sq.*)
    FROM public.side_quests sq
    WHERE sq.id = selected_draw.quest_id;
    RETURN;
  END IF;

  SELECT *
  INTO existing_draw
  FROM public.side_quest_draws sqd
  WHERE sqd.user_id = auth.uid()
    AND sqd.local_day = requested_local_day;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      'existing'::text,
      existing_draw.id,
      existing_draw.local_day,
      to_jsonb(sq.*)
    FROM public.side_quests sq
    WHERE sq.id = existing_draw.quest_id;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    'exhausted'::text,
    NULL::bigint,
    requested_local_day,
    NULL::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

GRANT EXECUTE ON FUNCTION public.claim_daily_side_quest(bigint[], date) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_popular_post_ids(
  feed_type text,
  blocked_ids uuid[] DEFAULT '{}',
  page_size int DEFAULT 20,
  page_offset int DEFAULT 0
)
RETURNS TABLE(post_id int) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id AS post_id
  FROM public.post p
  LEFT JOIN public.media m ON m.id = p.media_id
  LEFT JOIN LATERAL (
    SELECT count(*)::int AS cnt FROM public.likes l WHERE l.post_id = p.id
  ) lk ON true
  LEFT JOIN LATERAL (
    SELECT count(*)::int AS cnt FROM public.comments c WHERE c.post_id = p.id
  ) cm ON true
  WHERE
    CASE
      WHEN feed_type = 'challenge' THEN p.challenge_id IS NOT NULL
      WHEN feed_type = 'discussion' THEN p.challenge_id IS NULL
        AND p.quest_id IS NULL
        AND coalesce(p.is_welcome, false) = false
      WHEN feed_type = 'all' THEN coalesce(p.is_welcome, false) = false
      ELSE false
    END
    AND (array_length(blocked_ids, 1) IS NULL OR p.user_id != ALL(blocked_ids))
    AND (m.upload_status IS NULL OR m.upload_status NOT IN ('failed', 'pending'))
  ORDER BY
    (
      COALESCE(lk.cnt, 0)
      + 2 * COALESCE(cm.cnt, 0)
      + 3 * (CASE WHEN m.file_path IS NOT NULL THEN 1 ELSE 0 END)
      + 2 * LEAST(log(2, length(COALESCE(p.body, '')) + 1) / 3.0, 1.0)
    )
    / power(EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600.0 + 2, 0.7)
    DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Re-create profile activity RPC so the hydrated post payload includes side-quest metadata.
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
          'quest_id', p.quest_id,
          'quest_title', sq.title,
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
        left join public.side_quests sq on sq.id = p.quest_id
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
              'challenge_title', ch.title,
              'quest_title', sq.title
            )
            from public.post p
            left join public.challenges ch on ch.id = p.challenge_id
            left join public.side_quests sq on sq.id = p.quest_id
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
