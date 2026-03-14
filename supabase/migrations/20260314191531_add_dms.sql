-- =============================================================================
-- DMS (1:1)
-- =============================================================================

-- conversations
CREATE TABLE IF NOT EXISTS public.dm_conversations (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message_at timestamptz,
  pair_key text NOT NULL,
  CONSTRAINT dm_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT dm_conversations_pair_key_key UNIQUE (pair_key)
);

-- members
CREATE TABLE IF NOT EXISTS public.dm_conversation_members (
  conversation_id uuid NOT NULL REFERENCES public.dm_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_read_at timestamptz,
  archived boolean DEFAULT false NOT NULL,
  muted boolean DEFAULT false NOT NULL,
  CONSTRAINT dm_conversation_members_pkey PRIMARY KEY (conversation_id, user_id)
);

-- messages
CREATE TABLE IF NOT EXISTS public.dm_messages (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.dm_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at timestamptz,
  CONSTRAINT dm_messages_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS dm_conversation_members_user_id_conversation_id_idx
  ON public.dm_conversation_members (user_id, conversation_id);

CREATE INDEX IF NOT EXISTS dm_messages_conversation_id_created_at_idx
  ON public.dm_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS dm_conversations_last_message_at_idx
  ON public.dm_conversations (last_message_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_conversation_members;

-- =============================================================================
-- helpers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.dm_pair_key(user_a uuid, user_b uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN user_a::text < user_b::text THEN user_a::text || ':' || user_b::text
    ELSE user_b::text || ':' || user_a::text
  END;
$$;

CREATE OR REPLACE FUNCTION public.dm_is_blocked(user_a uuid, user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocks b
    WHERE (b.blocker_id = user_a AND b.blocked_id = user_b)
       OR (b.blocker_id = user_b AND b.blocked_id = user_a)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_dm_conversation_member(conversation uuid, member_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    member_user_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.dm_conversation_members m
      WHERE m.conversation_id = conversation
        AND m.user_id = member_user_id
    );
$$;

-- create or fetch the 1:1 conversation for the current user and another user
CREATE OR REPLACE FUNCTION public.get_or_create_dm_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  key text;
  existing_id uuid;
  created_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF other_user_id IS NULL THEN
    RAISE EXCEPTION 'other_user_id is required';
  END IF;

  IF other_user_id = current_user_id THEN
    RAISE EXCEPTION 'cannot dm yourself';
  END IF;

  IF public.dm_is_blocked(current_user_id, other_user_id) THEN
    RAISE EXCEPTION 'cannot create conversation: blocked';
  END IF;

  key := public.dm_pair_key(current_user_id, other_user_id);

  SELECT c.id INTO existing_id
  FROM public.dm_conversations c
  WHERE c.pair_key = key;

  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  INSERT INTO public.dm_conversations (pair_key)
  VALUES (key)
  RETURNING id INTO created_id;

  INSERT INTO public.dm_conversation_members (conversation_id, user_id)
  VALUES
    (created_id, current_user_id),
    (created_id, other_user_id);

  RETURN created_id;
END;
$$;

-- keep dm_conversations.last_message_at updated
CREATE OR REPLACE FUNCTION public.dm_on_message_insert_set_last_message_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.dm_conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dm_messages_set_last_message_at ON public.dm_messages;
CREATE TRIGGER dm_messages_set_last_message_at
AFTER INSERT ON public.dm_messages
FOR EACH ROW
EXECUTE FUNCTION public.dm_on_message_insert_set_last_message_at();

-- inbox helper
CREATE OR REPLACE FUNCTION public.list_dm_inbox()
RETURNS TABLE(
  conversation_id uuid,
  other_user_id uuid,
  last_message_body text,
  last_message_at timestamptz,
  unread_count bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH my AS (
    SELECT m.conversation_id, m.last_read_at
    FROM public.dm_conversation_members m
    WHERE m.user_id = auth.uid()
      AND m.archived = false
  ),
  other AS (
    SELECT m.conversation_id, m.user_id AS other_user_id
    FROM public.dm_conversation_members m
    WHERE m.user_id <> auth.uid()
  ),
  last_message AS (
    SELECT DISTINCT ON (msg.conversation_id)
      msg.conversation_id,
      msg.body,
      msg.created_at
    FROM public.dm_messages msg
    WHERE msg.deleted_at IS NULL
    ORDER BY msg.conversation_id, msg.created_at DESC
  )
  SELECT
    my.conversation_id,
    other.other_user_id,
    last_message.body AS last_message_body,
    last_message.created_at AS last_message_at,
    (
      SELECT COUNT(*)
      FROM public.dm_messages msg
      WHERE msg.conversation_id = my.conversation_id
        AND msg.deleted_at IS NULL
        AND msg.sender_id <> auth.uid()
        AND msg.created_at > COALESCE(my.last_read_at, 'epoch'::timestamptz)
    ) AS unread_count
  FROM my
  JOIN other ON other.conversation_id = my.conversation_id
  LEFT JOIN last_message ON last_message.conversation_id = my.conversation_id
  ORDER BY last_message.created_at DESC NULLS LAST;
$$;

-- =============================================================================
-- rls
-- =============================================================================

ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

-- conversations: members can read
CREATE POLICY dm_conversations_select_member
  ON public.dm_conversations FOR SELECT
  TO authenticated
  USING (public.is_dm_conversation_member(dm_conversations.id, auth.uid()));

-- members: members can read membership rows for their conversations
CREATE POLICY dm_conversation_members_select_member
  ON public.dm_conversation_members FOR SELECT
  TO authenticated
  USING (public.is_dm_conversation_member(dm_conversation_members.conversation_id, auth.uid()));

-- members: self can update last_read_at/muted/archived
CREATE POLICY dm_conversation_members_update_self
  ON public.dm_conversation_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- messages: members can read
CREATE POLICY dm_messages_select_member
  ON public.dm_messages FOR SELECT
  TO authenticated
  USING (public.is_dm_conversation_member(dm_messages.conversation_id, auth.uid()));

-- messages: members can send, but not if blocked
CREATE POLICY dm_messages_insert_member
  ON public.dm_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_dm_conversation_member(dm_messages.conversation_id, auth.uid())
    AND NOT public.dm_is_blocked(auth.uid(), (
      SELECT m2.user_id
      FROM public.dm_conversation_members m2
      WHERE m2.conversation_id = dm_messages.conversation_id
        AND m2.user_id <> auth.uid()
      LIMIT 1
    ))
  );

-- messages: sender can soft-delete their own messages
CREATE POLICY dm_messages_update_sender
  ON public.dm_messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());
