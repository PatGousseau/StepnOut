import { supabase } from "../lib/supabase";

export const DM_MESSAGES_PAGE_SIZE = 50;

export type DmInboxItem = {
  conversation_id: string;
  other_user_id: string;
  last_message_body: string | null;
  last_message_at: string | null;
  unread_count: number;
};

export type DmMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
};

export type DmProfilePreview = {
  id: string;
  username: string | null;
  name: string | null;
  profile_media: { file_path: string | null } | null;
};

export type DmConversationMeta = {
  otherUserId: string | null;
  otherUserName: string | null;
};

export const dmService = {
  async getOrCreateConversation(otherUserId: string): Promise<{ data?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc("get_or_create_dm_conversation", {
        other_user_id: otherUserId,
      });

      if (error) throw error;

      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async listInbox(): Promise<{ data?: DmInboxItem[]; error?: string }> {
    try {
      const { data, error } = await supabase.rpc("list_dm_inbox");
      if (error) throw error;

      const rows = (data ?? []) as Array<Record<string, unknown>>;

      return {
        data: rows.map((row) => ({
          conversation_id: String(row.conversation_id),
          other_user_id: String(row.other_user_id),
          last_message_body:
            typeof row.last_message_body === "string" ? row.last_message_body : null,
          last_message_at: typeof row.last_message_at === "string" ? row.last_message_at : null,
          unread_count: Number(row.unread_count ?? 0),
        })),
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async fetchMessages(
    conversationId: string,
    opts?: { limit?: number; beforeCreatedAt?: string }
  ): Promise<{ data?: DmMessage[]; error?: string }> {
    try {
      const limit = opts?.limit ?? DM_MESSAGES_PAGE_SIZE;

      let query = supabase
        .from("dm_messages")
        .select("id, conversation_id, sender_id, body, created_at, deleted_at")
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (opts?.beforeCreatedAt) {
        query = query.lt("created_at", opts.beforeCreatedAt);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: (data ?? []) as DmMessage[] };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async fetchConversationMeta(
    conversationId: string,
    currentUserId: string
  ): Promise<{ data?: DmConversationMeta; error?: string }> {
    try {
      const { data: memberRows, error: memberError } = await supabase
        .from("dm_conversation_members")
        .select("user_id")
        .eq("conversation_id", conversationId);

      if (memberError) throw memberError;

      const otherUserId =
        (memberRows ?? []).map((row) => row.user_id).find((userId) => userId !== currentUserId) ?? null;

      if (!otherUserId) {
        return {
          data: {
            otherUserId: null,
            otherUserName: null,
          },
        };
      }

      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("name, username")
        .eq("id", otherUserId)
        .limit(1);

      if (profileError) throw profileError;

      const profile = profileRows?.[0];

      return {
        data: {
          otherUserId,
          otherUserName: profile?.name || profile?.username || null,
        },
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async fetchInboxProfiles(
    userIds: string[]
  ): Promise<{ data?: Record<string, DmProfilePreview>; error?: string }> {
    try {
      if (!userIds.length) return { data: {} };

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          username,
          name,
          profile_media:media!profiles_profile_media_id_fkey (
            file_path
          )
          `
        )
        .in("id", userIds);

      if (error) throw error;

      const profilesById: Record<string, DmProfilePreview> = {};
      (data ?? []).forEach((profile) => {
        profilesById[profile.id] = {
          id: profile.id,
          username: profile.username,
          name: profile.name,
          profile_media: profile.profile_media ?? null,
        };
      });

      return { data: profilesById };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string
  ): Promise<{ data?: DmMessage; error?: string }> {
    try {
      const trimmed = body.trim();
      if (!trimmed) return { error: "Message cannot be empty" };

      const { data, error } = await supabase
        .from("dm_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          body: trimmed,
        })
        .select("id, conversation_id, sender_id, body, created_at, deleted_at")
        .single();

      if (error) throw error;

      return { data: data as DmMessage };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async markConversationRead(
    conversationId: string,
    userId: string
  ): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from("dm_conversation_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);

      if (error) throw error;

      return {};
    } catch (error) {
      return { error: (error as Error).message };
    }
  },
};
