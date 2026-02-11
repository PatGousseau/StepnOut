ALTER TABLE public.likes
  ADD COLUMN IF NOT EXISTS emoji text NOT NULL DEFAULT '❤️';

UPDATE public.likes
SET emoji = '❤️'
WHERE emoji IS NULL;

ALTER TABLE public.likes
  ADD CONSTRAINT likes_exactly_one_target
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL)
    OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  );

CREATE UNIQUE INDEX IF NOT EXISTS likes_unique_post_reaction
  ON public.likes (user_id, post_id, emoji)
  WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS likes_unique_comment_reaction
  ON public.likes (user_id, comment_id, emoji)
  WHERE comment_id IS NOT NULL;
