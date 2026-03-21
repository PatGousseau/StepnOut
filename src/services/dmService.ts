import { supabase } from "../lib/supabase";

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
      const limit = opts?.limit ?? 50;

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

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string
  ): Promise<{ error?: string }> {
    try {
      const trimmed = body.trim();
      if (!trimmed) return { error: "Message cannot be empty" };

      const { error } = await supabase.from("dm_messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        body: trimmed,
      });

      if (error) throw error;

      return {};
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
