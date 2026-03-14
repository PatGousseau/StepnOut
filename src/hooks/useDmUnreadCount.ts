import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { dmQueryKeys } from "../services/dmQueryKeys";
import { dmService, DmInboxItem } from "../services/dmService";

export const useDmUnreadCount = (userId?: string) => {
  const queryClient = useQueryClient();

  const inboxQuery = useQuery({
    queryKey: userId ? dmQueryKeys.inbox(userId) : ["dm", "inbox", "anonymous"],
    queryFn: async () => {
      const result = await dmService.listInbox();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!userId) return;

    const invalidateInbox = () => {
      queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(userId) }).catch(() => null);
    };

    const channel = supabase
      .channel(`dm_unread:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_conversation_members",
          filter: `user_id=eq.${userId}`,
        },
        invalidateInbox
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dm_conversation_members",
          filter: `user_id=eq.${userId}`,
        },
        invalidateInbox
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
        },
        (payload) => {
          const row = payload.new as { conversation_id?: string };
          const cachedItems = queryClient.getQueryData<DmInboxItem[]>(dmQueryKeys.inbox(userId)) ?? [];
          const isKnownConversation = cachedItems.some(
            (item) => item.conversation_id === row?.conversation_id
          );

          if (isKnownConversation) {
            invalidateInbox();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const unreadCount = (inboxQuery.data ?? []).reduce(
    (sum, item) => sum + Math.max(0, item.unread_count ?? 0),
    0
  );

  return {
    unreadCount,
    loading: inboxQuery.isLoading,
  };
};
