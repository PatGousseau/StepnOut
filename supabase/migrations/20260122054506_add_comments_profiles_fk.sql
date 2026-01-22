-- Add foreign key from comments.user_id to profiles.id
-- This enables Supabase to join comments with profiles in queries

ALTER TABLE "public"."comments"
    ADD CONSTRAINT "comments_user_id_profiles_fkey"
    FOREIGN KEY ("user_id")
    REFERENCES "public"."profiles"("id");
