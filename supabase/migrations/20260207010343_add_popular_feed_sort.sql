-- Indexes for efficient popularity scoring
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments (post_id);

-- Function to return post IDs sorted by popularity score
-- Score: (likes + 2*comments + 3*hasMedia + 2*textBonus) / (ageHours + 2)^1.5
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
    -- Feed type filter
    CASE
      WHEN feed_type = 'challenge' THEN p.challenge_id IS NOT NULL
      WHEN feed_type = 'discussion' THEN p.challenge_id IS NULL
        AND (p.is_welcome IS NULL OR p.is_welcome = false)
    END
    -- Exclude blocked users
    AND (array_length(blocked_ids, 1) IS NULL OR p.user_id != ALL(blocked_ids))
    -- Exclude failed/pending uploads
    AND (m.upload_status IS NULL OR m.upload_status NOT IN ('failed', 'pending'))
  ORDER BY
    (
      COALESCE(lk.cnt, 0)
      + 2 * COALESCE(cm.cnt, 0)
      + 3 * (CASE WHEN m.file_path IS NOT NULL THEN 1 ELSE 0 END)
      + 2 * LEAST(log(2, length(COALESCE(p.body, '')) + 1) / 3.0, 1.0)
    )
    / power(EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600.0 + 2, 1.5)
    DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;
