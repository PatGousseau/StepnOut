# dms plan (stepnout)

## goals (v1)
- 1:1 direct messages (text-only)
- realtime message delivery
- basic inbox (conversation list + unread)
- block-aware (reuse existing `public.blocks`)
- report flow (reuse `public.reports` or add dm-specific tables if needed)

## non-goals (v1)
- group chats
- media attachments
- typing indicators
- message reactions
- end-to-end encryption

## product decisions to confirm
- can anyone dm anyone, or do we need message requests / mutuals?
  - recommendation: start with "anyone can dm anyone" + blocking + reporting, then add requests if spam becomes real.
- do we allow users to delete messages? (recommend: soft-delete per-message, no hard delete)

## schema (recommended)

### `dm_conversations`
- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `last_message_at timestamptz` (denormalized for inbox sorting)

### `dm_conversation_members`
- `conversation_id uuid not null references dm_conversations(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `joined_at timestamptz not null default now()`
- `last_read_at timestamptz` (for unread)
- `archived boolean not null default false`
- `muted boolean not null default false`
- primary key `(conversation_id, user_id)`

### `dm_messages`
- `id uuid primary key default gen_random_uuid()`
- `conversation_id uuid not null references dm_conversations(id) on delete cascade`
- `sender_id uuid not null references profiles(id) on delete cascade`
- `body text not null` (text-only v1)
- `created_at timestamptz not null default now()`
- `deleted_at timestamptz` (soft delete)

indexes:
- `dm_conversation_members (user_id, conversation_id)`
- `dm_messages (conversation_id, created_at desc)`
- `dm_conversations (last_message_at desc)`

## rls + policies

principles:
- only members can read a conversation + its messages
- only members can send messages
- `sender_id` must equal `auth.uid()`
- block rules: sending is rejected if either direction has a block row

rls notes:
- easiest safe approach: db functions for membership checks (stable, reusable)
  - `public.is_dm_member(conversation_id uuid, user_id uuid)`
  - `public.dm_is_blocked(sender uuid, recipient uuid)`

policies (sketch):
- `dm_conversations`: select where exists membership for `auth.uid()`
- `dm_conversation_members`: select where `user_id = auth.uid()` OR admin
- `dm_messages`: select where member; insert where member + sender matches + not blocked

## db rpc helpers (optional but likely worth it)

### `public.get_or_create_dm_conversation(other_user_id uuid)`
- returns `conversation_id`
- ensures only one 1:1 conversation exists per pair
- creates conversation + 2 member rows transactionally

### `public.list_dm_inbox()`
- returns conversations for current user with:
  - other user id
  - last message preview + timestamp
  - unread count (computed via last_read_at)

these reduce client-side joins and make perf predictable.

## client implementation plan (expo)

### phase 0: plumbing
- add types in `src/types.ts` (or a new dm types file)
- add `src/services/dmService.ts`
- add query hooks in `src/hooks/`:
  - `useDmInbox()`
  - `useDmThread(conversationId)`
  - `useSendDmMessage(conversationId)`

### phase 1: screens (minimal)
- `src/app/(tabs)/inbox.tsx` (or a new tab) for conversation list
- `src/app/dm/[id].tsx` for thread
- add "message" action button on profile screen -> creates/opens conversation

### phase 2: realtime
- subscribe to inserts on `dm_messages` for the open conversation
- update react-query caches optimistically

### phase 3: unread + read receipts (simple)
- update `dm_conversation_members.last_read_at` when thread is focused
- compute unread count in inbox (rpc or view)

### phase 4: safety
- enforce block checks in db function/policy
- add report hooks + ui entry points

### phase 5: notifications
- edge function on new `dm_messages` insert:
  - find recipient(s)
  - respect mute/block
  - send expo push

## rollout
- behind a feature flag in `app_config` (if we want a soft launch)
- ship to internal users first

## next concrete steps
1. implement migration: tables + rls + helper functions + rpc(s)
2. implement `dmService` for:
   - get-or-create conversation
   - list inbox
   - fetch messages (paginated)
   - send message
3. add basic inbox + thread screens (no push yet)
