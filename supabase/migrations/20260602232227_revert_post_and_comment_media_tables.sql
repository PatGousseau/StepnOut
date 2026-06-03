BEGIN;

-- Revert the multi-media join tables while preserving existing single-media support.
DROP TABLE IF EXISTS public.post_media;
DROP TABLE IF EXISTS public.comment_media;

COMMIT;
