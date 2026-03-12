-- Replace notification SQL functions to use `post` table instead of deprecated `user_progress` and `submission` tables

-- Users eligible for streak-at-risk (3 days left, has completed >=1 challenge, no submission for current challenge)
CREATE OR REPLACE FUNCTION public.get_streak_at_risk_candidates()
RETURNS TABLE (
  user_id uuid,
  push_token text,
  challenge_id int,
  challenge_title text
)
LANGUAGE sql STABLE AS $$
  WITH active_challenge AS (
    SELECT cs.challenge_id, cs.end_date
    FROM public.challenges_status cs
    WHERE cs.is_active = true
    ORDER BY cs.end_date DESC
    LIMIT 1
  )
  SELECT
    p.id AS user_id,
    p.push_token,
    ac.challenge_id,
    coalesce(c.title_it, c.title) AS challenge_title
  FROM active_challenge ac
  JOIN public.challenges c ON c.id = ac.challenge_id
  JOIN public.profiles p ON p.push_token IS NOT NULL
  WHERE ac.end_date > now()
    AND ac.end_date <= now() + interval '3 days'
    AND coalesce(p.last_open_at, p.created_at) >= now() - interval '14 days'
    -- user has completed at least 1 challenge
    AND EXISTS (
      SELECT 1
      FROM public.post po
      WHERE po.user_id = p.id
        AND po.challenge_id IS NOT NULL
    )
    -- user has NOT submitted for the current active challenge
    AND NOT EXISTS (
      SELECT 1
      FROM public.post po
      WHERE po.user_id = p.id
        AND po.challenge_id = ac.challenge_id
    )
    -- user has NOT already been notified for this challenge
    AND NOT EXISTS (
      SELECT 1
      FROM public.push_notification_log l
      WHERE l.user_id = p.id
        AND l.type = 'streak_at_risk'
        AND l.challenge_id = ac.challenge_id
    );
$$;

-- Users eligible for personalized nudge (3-14 days inactive, completed >=1 challenge)
CREATE OR REPLACE FUNCTION public.get_personalized_nudge_candidates()
RETURNS TABLE (
  user_id uuid,
  push_token text,
  name text,
  last_challenge_title text,
  days_since_last_open int,
  total_challenges_completed int,
  streak int
)
LANGUAGE sql STABLE AS $$
  WITH last_nudge AS (
    SELECT ln.user_id, max(ln.created_at) AS last_nudge_at
    FROM public.push_notification_log ln
    WHERE ln.type = 'personalized_nudge'
    GROUP BY ln.user_id
  ),
  user_challenge_counts AS (
    SELECT
      po.user_id,
      count(DISTINCT po.challenge_id)::int AS total_completed
    FROM public.post po
    WHERE po.challenge_id IS NOT NULL
    GROUP BY po.user_id
  )
  SELECT
    p.id AS user_id,
    p.push_token,
    p.name,
    coalesce(ch.title_it, ch.title) AS last_challenge_title,
    floor(extract(epoch from (now() - coalesce(p.last_open_at, p.created_at))) / 86400)::int AS days_since_last_open,
    ucc.total_completed AS total_challenges_completed,
    0 AS streak
  FROM public.profiles p
  JOIN user_challenge_counts ucc ON ucc.user_id = p.id
  LEFT JOIN last_nudge lnudge ON lnudge.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT po.challenge_id
    FROM public.post po
    WHERE po.user_id = p.id
      AND po.challenge_id IS NOT NULL
    ORDER BY po.created_at DESC
    LIMIT 1
  ) last_post ON true
  LEFT JOIN public.challenges ch ON ch.id = last_post.challenge_id
  WHERE p.push_token IS NOT NULL
    AND ucc.total_completed >= 1
    AND coalesce(p.last_open_at, p.created_at) >= now() - interval '14 days'
    AND coalesce(p.last_open_at, p.created_at) <= now() - interval '3 days'
    AND (lnudge.last_nudge_at IS NULL OR lnudge.last_nudge_at < coalesce(p.last_open_at, p.created_at));
$$;
