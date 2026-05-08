-- Allow admins to insert notifications with any trigger_user_id (e.g. the
-- "Stepn Out" system profile for Notify All), not just their own auth.uid().
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;

CREATE POLICY "notifications_insert_authenticated"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trigger_user_id OR public.is_admin());
