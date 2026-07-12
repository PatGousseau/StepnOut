BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.post_media_items_id_seq;

ALTER TABLE public.post_media_items
  ADD COLUMN IF NOT EXISTS id bigint;

ALTER TABLE public.post_media_items
  ALTER COLUMN id SET DEFAULT nextval('public.post_media_items_id_seq');

UPDATE public.post_media_items
SET id = nextval('public.post_media_items_id_seq')
WHERE id IS NULL;

ALTER TABLE public.post_media_items
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE public.post_media_items
  DROP CONSTRAINT IF EXISTS post_media_pkey;

ALTER TABLE public.post_media_items
  ADD CONSTRAINT post_media_items_pkey PRIMARY KEY (id);

ALTER TABLE public.post_media_items
  ADD CONSTRAINT post_media_items_post_media_key UNIQUE (post_id, media_id);

ALTER SEQUENCE public.post_media_items_id_seq
  OWNED BY public.post_media_items.id;

CREATE SEQUENCE IF NOT EXISTS public.comment_media_items_id_seq;

ALTER TABLE public.comment_media_items
  ADD COLUMN IF NOT EXISTS id bigint;

ALTER TABLE public.comment_media_items
  ALTER COLUMN id SET DEFAULT nextval('public.comment_media_items_id_seq');

UPDATE public.comment_media_items
SET id = nextval('public.comment_media_items_id_seq')
WHERE id IS NULL;

ALTER TABLE public.comment_media_items
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE public.comment_media_items
  DROP CONSTRAINT IF EXISTS comment_media_pkey;

ALTER TABLE public.comment_media_items
  ADD CONSTRAINT comment_media_items_pkey PRIMARY KEY (id);

ALTER TABLE public.comment_media_items
  ADD CONSTRAINT comment_media_items_comment_media_key UNIQUE (comment_id, media_id);

ALTER SEQUENCE public.comment_media_items_id_seq
  OWNED BY public.comment_media_items.id;

COMMIT;
