ALTER TABLE public.likes
  ADD COLUMN IF NOT EXISTS emoji text NOT NULL DEFAULT '❤️';

UPDATE public.likes
SET emoji = '❤️'
WHERE emoji IS NULL;

-- Remove duplicate likes (keep the oldest one per user/post and user/comment)
DELETE FROM public.likes a
USING public.likes b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.post_id IS NOT DISTINCT FROM b.post_id
  AND a.comment_id IS NOT DISTINCT FROM b.comment_id
  AND a.emoji = b.emoji;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'likes_exactly_one_target'
  ) THEN
    ALTER TABLE public.likes
      ADD CONSTRAINT likes_exactly_one_target
      CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL)
        OR
        (post_id IS NULL AND comment_id IS NOT NULL)
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS likes_unique_post_reaction
  ON public.likes (user_id, post_id, emoji)
  WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS likes_unique_comment_reaction
  ON public.likes (user_id, comment_id, emoji)
  WHERE comment_id IS NOT NULL;
