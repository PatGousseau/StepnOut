-- Admin analytics helper: completion distribution
-- Uses post.challenge_id as the source of truth for challenge completions

CREATE OR REPLACE FUNCTION public.admin_completion_distribution()
RETURNS TABLE(bucket text, user_count bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT b.bucket, COUNT(*)::bigint AS user_count
  FROM (
    SELECT p.id,
      CASE
        WHEN COALESCE(pc.completions, 0) = 0 THEN '0'
        WHEN pc.completions = 1 THEN '1'
        WHEN pc.completions = 2 THEN '2'
        WHEN pc.completions = 3 THEN '3'
        WHEN pc.completions = 4 THEN '4'
        ELSE '5+'
      END AS bucket
    FROM public.profiles p
    LEFT JOIN (
      SELECT user_id, COUNT(*)::int AS completions
      FROM public.post
      WHERE challenge_id IS NOT NULL
      GROUP BY user_id
    ) pc ON pc.user_id = p.id
    WHERE public.is_admin()
  ) b
  GROUP BY b.bucket
  ORDER BY CASE b.bucket
    WHEN '0' THEN 0
    WHEN '1' THEN 1
    WHEN '2' THEN 2
    WHEN '3' THEN 3
    WHEN '4' THEN 4
    ELSE 5
  END;
$$;
