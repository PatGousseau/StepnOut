-- Fix foreign key constraints for comment deletion
-- Add ON DELETE CASCADE to notifications and reports tables
-- This fixes the issue where deleting a comment fails due to foreign key violations

-- Drop and recreate notifications_comment_id_fkey with CASCADE
ALTER TABLE "public"."notifications"
  DROP CONSTRAINT IF EXISTS "notifications_comment_id_fkey";

ALTER TABLE "public"."notifications"
  ADD CONSTRAINT "notifications_comment_id_fkey"
  FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;

-- Drop and recreate reports_comment_id_fkey with CASCADE
ALTER TABLE "public"."reports"
  DROP CONSTRAINT IF EXISTS "reports_comment_id_fkey";

ALTER TABLE "public"."reports"
  ADD CONSTRAINT "reports_comment_id_fkey"
  FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;
