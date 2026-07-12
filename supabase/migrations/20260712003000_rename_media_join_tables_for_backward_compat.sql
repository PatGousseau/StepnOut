BEGIN;

ALTER TABLE IF EXISTS public.post_media
  RENAME TO post_media_items;

ALTER TABLE IF EXISTS public.comment_media
  RENAME TO comment_media_items;

ALTER INDEX IF EXISTS public.post_media_media_id_idx
  RENAME TO post_media_items_media_id_idx;

ALTER INDEX IF EXISTS public.comment_media_media_id_idx
  RENAME TO comment_media_items_media_id_idx;

COMMIT;
