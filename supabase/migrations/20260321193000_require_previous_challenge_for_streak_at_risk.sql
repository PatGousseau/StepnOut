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
  ),
  previous_challenge AS (
    SELECT c_prev.id
    FROM public.challenges c_prev
    JOIN active_challenge ac ON ac.challenge_id <> c_prev.id
    ORDER BY c_prev.created_at DESC, c_prev.id DESC
    LIMIT 1
  )
  SELECT
    p.id AS user_id,
    p.push_token,
    ac.challenge_id,
    coalesce(c.title_it, c.title) AS challenge_title
  FROM active_challenge ac
  JOIN previous_challenge pc ON true
  JOIN public.challenges c ON c.id = ac.challenge_id
  JOIN public.profiles p ON p.push_token IS NOT NULL
  WHERE ac.end_date > now()
    AND ac.end_date <= now() + interval '3 days'
    AND coalesce(p.last_open_at, p.created_at) >= now() - interval '14 days'
    -- user completed the previous challenge
    AND EXISTS (
      SELECT 1
      FROM public.post po
      WHERE po.user_id = p.id
        AND po.challenge_id = pc.id
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
