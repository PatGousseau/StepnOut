-- Add 'reaction' to the action_type constraint and add emoji column to notifications
ALTER TABLE "public"."notifications"
  DROP CONSTRAINT "notifications_action_type_check";

ALTER TABLE "public"."notifications"
  ADD CONSTRAINT "notifications_action_type_check"
  CHECK (action_type = ANY (ARRAY['like'::text, 'comment'::text, 'reaction'::text]));

ALTER TABLE "public"."notifications"
  ADD COLUMN IF NOT EXISTS "emoji" text;
