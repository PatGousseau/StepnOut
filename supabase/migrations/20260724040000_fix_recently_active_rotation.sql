CREATE INDEX IF NOT EXISTS post_user_id_created_at_idx
  ON public.post (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION "public"."rotate_recently_active_real"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  BEGIN
    UPDATE public.profiles
    SET is_recently_active = false
    WHERE is_recently_active = true;

    UPDATE public.profiles p
    SET is_recently_active = true
    WHERE coalesce(p.last_open_at, p.created_at) >= now() - interval '24 hours'
      OR EXISTS (
        SELECT 1
        FROM public.post po
        WHERE po.user_id = p.id
          AND po.created_at >= now() - interval '24 hours'
      );
  END;
  $$;
