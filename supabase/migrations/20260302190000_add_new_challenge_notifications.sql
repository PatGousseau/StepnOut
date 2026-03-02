-- allow system notifications + add new challenge notification type

ALTER TABLE "public"."notifications"
  ALTER COLUMN "trigger_user_id" DROP NOT NULL;

ALTER TABLE "public"."notifications"
  ADD COLUMN IF NOT EXISTS "challenge_id" bigint;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notifications_action_type_check'
      AND conrelid = 'public.notifications'::regclass
  ) THEN
    ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_action_type_check";
  END IF;
END $$;

ALTER TABLE "public"."notifications"
  ADD CONSTRAINT "notifications_action_type_check"
  CHECK (action_type = ANY (ARRAY['like'::text, 'comment'::text, 'reaction'::text, 'new_challenge'::text]));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notifications_challenge_id_fkey'
      AND conrelid = 'public.notifications'::regclass
  ) THEN
    ALTER TABLE "public"."notifications"
      ADD CONSTRAINT "notifications_challenge_id_fkey"
      FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "notifications_user_id_is_read_idx"
  ON "public"."notifications" (user_id, is_read);
