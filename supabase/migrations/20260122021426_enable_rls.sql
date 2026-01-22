-- Enable Row Level Security on all tables
-- This migration adds RLS policies to protect data access

-- =============================================================================
-- HELPER: Admin check function
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- PROFILES
-- Public read, self-update/delete only
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (from initial migration)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_self"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_self"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_self"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- =============================================================================
-- POST
-- Authenticated read, self-write only
-- =============================================================================
ALTER TABLE public.post ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_select_authenticated"
  ON public.post FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "post_insert_self"
  ON public.post FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_update_self"
  ON public.post FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_delete_self"
  ON public.post FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- CHALLENGES
-- Authenticated read, admin-only write
-- =============================================================================
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_authenticated"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "challenges_insert_admin"
  ON public.challenges FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "challenges_update_admin"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "challenges_delete_admin"
  ON public.challenges FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- CHALLENGES_STATUS
-- Authenticated read, admin-only write
-- =============================================================================
ALTER TABLE public.challenges_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_status_select_authenticated"
  ON public.challenges_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "challenges_status_insert_admin"
  ON public.challenges_status FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "challenges_status_update_admin"
  ON public.challenges_status FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "challenges_status_delete_admin"
  ON public.challenges_status FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- COMMENTS
-- Authenticated read, self-write only
-- =============================================================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_authenticated"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "comments_insert_self"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_self"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_self"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- LIKES
-- Authenticated read, self-write only
-- =============================================================================
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_authenticated"
  ON public.likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "likes_insert_self"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_self"
  ON public.likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- NOTIFICATIONS
-- Self-read/update/delete, authenticated can insert (for notification triggers)
-- =============================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_self"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert notifications (needed for like/comment notifications)
-- The trigger_user_id should match the inserting user
CREATE POLICY "notifications_insert_authenticated"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trigger_user_id);

CREATE POLICY "notifications_update_self"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_self"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- MEDIA
-- Authenticated read/insert, authenticated update (no user_id to enforce ownership)
-- =============================================================================
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_select_authenticated"
  ON public.media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "media_insert_authenticated"
  ON public.media FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "media_update_authenticated"
  ON public.media FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- BLOCKS
-- Self-only access (blocker can see and manage their blocks)
-- =============================================================================
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocks_select_self"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "blocks_insert_self"
  ON public.blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "blocks_delete_self"
  ON public.blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- =============================================================================
-- REPORTS
-- Self can insert, admin can read/update
-- =============================================================================
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_admin"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "reports_insert_self"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_update_admin"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- FEEDBACK
-- Authenticated can insert, admin can read
-- =============================================================================
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_select_admin"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "feedback_insert_authenticated"
  ON public.feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================================================
-- APP_CONFIG
-- Authenticated read, admin-only write
-- =============================================================================
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_config_select_authenticated"
  ON public.app_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "app_config_insert_admin"
  ON public.app_config FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "app_config_update_admin"
  ON public.app_config FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "app_config_delete_admin"
  ON public.app_config FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- SUBMISSION (currently unused, but setting up proper policies)
-- Authenticated read, self-write only
-- =============================================================================
ALTER TABLE public.submission ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submission_select_authenticated"
  ON public.submission FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "submission_insert_self"
  ON public.submission FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "submission_update_self"
  ON public.submission FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "submission_delete_self"
  ON public.submission FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- USER_PROGRESS (currently unused, but setting up proper policies)
-- Authenticated read, self-write only
-- =============================================================================
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_select_authenticated"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "user_progress_insert_self"
  ON public.user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_self"
  ON public.user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- USER_SUBMITTED_CHALLENGES (currently unused, but setting up proper policies)
-- Authenticated read, self-write only
-- =============================================================================
ALTER TABLE public.user_submitted_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_submitted_challenges_select_authenticated"
  ON public.user_submitted_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "user_submitted_challenges_insert_self"
  ON public.user_submitted_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- PUSH_TOKENS (currently unused, but setting up proper policies)
-- Self-only access
-- =============================================================================
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_select_self"
  ON public.push_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "push_tokens_insert_self"
  ON public.push_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_tokens_update_self"
  ON public.push_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_tokens_delete_self"
  ON public.push_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
