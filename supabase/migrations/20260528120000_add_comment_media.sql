ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS media_id bigint REFERENCES public.media(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.comment_media (
  comment_id integer NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  media_id bigint NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  position smallint NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT comment_media_pkey PRIMARY KEY (comment_id, media_id),
  CONSTRAINT comment_media_comment_position_key UNIQUE (comment_id, position),
  CONSTRAINT comment_media_position_check CHECK (position >= 0 AND position < 4)
);

CREATE INDEX IF NOT EXISTS comment_media_media_id_idx
  ON public.comment_media(media_id);

INSERT INTO public.comment_media (comment_id, media_id, position)
SELECT id, media_id, 0
FROM public.comments
WHERE media_id IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE public.comment_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_media_select_authenticated"
  ON public.comment_media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "comment_media_insert_comment_owner"
  ON public.comment_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.comments
      WHERE comments.id = comment_media.comment_id
        AND comments.user_id = auth.uid()
    )
  );

CREATE POLICY "comment_media_update_comment_owner"
  ON public.comment_media FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.comments
      WHERE comments.id = comment_media.comment_id
        AND comments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.comments
      WHERE comments.id = comment_media.comment_id
        AND comments.user_id = auth.uid()
    )
  );

CREATE POLICY "comment_media_delete_comment_owner"
  ON public.comment_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.comments
      WHERE comments.id = comment_media.comment_id
        AND comments.user_id = auth.uid()
    )
  );

GRANT ALL ON TABLE public.comment_media TO anon;
GRANT ALL ON TABLE public.comment_media TO authenticated;
GRANT ALL ON TABLE public.comment_media TO service_role;
