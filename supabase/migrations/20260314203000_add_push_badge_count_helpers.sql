CREATE OR REPLACE FUNCTION public.get_unread_notification_count(target_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.notifications n
  WHERE n.user_id = target_user_id
    AND n.is_read = false;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_dm_count(target_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH my AS (
    SELECT m.conversation_id, m.last_read_at
    FROM public.dm_conversation_members m
    WHERE m.user_id = target_user_id
      AND m.archived = false
      AND public.can_access_dm_conversation(m.conversation_id, target_user_id)
  )
  SELECT COALESCE(SUM(
    (
      SELECT COUNT(*)
      FROM public.dm_messages msg
      WHERE msg.conversation_id = my.conversation_id
        AND msg.deleted_at IS NULL
        AND msg.sender_id <> target_user_id
        AND msg.created_at > COALESCE(my.last_read_at, 'epoch'::timestamptz)
    )
  ), 0)
  FROM my;
$$;
