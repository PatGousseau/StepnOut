import { useCallback, useEffect, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { dmQueryKeys } from "../services/dmQueryKeys";
import {
  DM_MESSAGES_PAGE_SIZE,
  dmService,
  DmMessage,
} from "../services/dmService";

const appendMessageToPages = (
  current: InfiniteData<DmMessage[], string | null> | undefined,
  message: DmMessage
) => {
  if (!current) {
    return {
      pageParams: [null],
      pages: [[message]],
    };
  }

  if (current.pages.some((page) => page.some((item) => item.id === message.id))) {
    return current;
  }

  const [firstPage = [], ...restPages] = current.pages;
  return {
    ...current,
    pages: [[message, ...firstPage], ...restPages],
  };
};

export const useDmThread = (conversationId?: string, userId?: string) => {
  const queryClient = useQueryClient();

  const metaQuery = useQuery({
    queryKey:
      conversationId && userId
        ? dmQueryKeys.threadMeta(conversationId, userId)
        : ["dm", "thread", "meta", "empty"],
    queryFn: async () => {
      if (!conversationId || !userId) {
        throw new Error("Missing conversation");
      }

      const result = await dmService.fetchConversationMeta(conversationId, userId);
      if (result.error) throw new Error(result.error);
      return result.data ?? null;
    },
    enabled: !!conversationId && !!userId,
    staleTime: 30000,
  });

  const messagesQuery = useInfiniteQuery({
    queryKey:
      conversationId ? dmQueryKeys.threadMessages(conversationId) : ["dm", "thread", "messages", "empty"],
    queryFn: async ({ pageParam }) => {
      if (!conversationId) {
        throw new Error("Missing conversation");
      }

      const result = await dmService.fetchMessages(conversationId, {
        limit: DM_MESSAGES_PAGE_SIZE,
        beforeCreatedAt: pageParam ?? undefined,
      });
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
    initialPageParam: null as string | null,
    enabled: !!conversationId && !!userId,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < DM_MESSAGES_PAGE_SIZE) return undefined;
      return lastPage[lastPage.length - 1]?.created_at ?? undefined;
    },
    staleTime: 30000,
  });

  const markRead = useCallback(async () => {
    if (!conversationId || !userId) return;
    const result = await dmService.markConversationRead(conversationId, userId);
    if (result.error) {
      throw new Error(result.error);
    }
    await queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(userId) });
  }, [conversationId, queryClient, userId]);

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!conversationId || !userId) {
        throw new Error("Missing conversation");
      }

      const result = await dmService.sendMessage(conversationId, userId, body);
      if (result.error || !result.data) {
        throw new Error(result.error || "Failed to send message");
      }

      return result.data;
    },
    onSuccess: async (message) => {
      if (!conversationId || !userId) return;

      queryClient.setQueryData<InfiniteData<DmMessage[], string | null>>(
        dmQueryKeys.threadMessages(conversationId),
        (current) => appendMessageToPages(current, message)
      );
      await queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(userId) });
    },
  });

  const messages = useMemo(() => {
    return messagesQuery.data?.pages.flatMap((page) => page) ?? [];
  }, [messagesQuery.data]);

  useFocusEffect(
    useCallback(() => {
      if (!conversationId || !userId) return;

      queryClient.invalidateQueries({ queryKey: dmQueryKeys.threadMessages(conversationId) }).catch(() => null);
      markRead().catch(() => null);
    }, [conversationId, markRead, queryClient, userId])
  );

  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const next = payload.new as DmMessage;

          queryClient.setQueryData<InfiniteData<DmMessage[], string | null>>(
            dmQueryKeys.threadMessages(conversationId),
            (current) => appendMessageToPages(current, next)
          );

          queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(userId) }).catch(() => null);
          if (next.sender_id !== userId) {
            markRead().catch(() => null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, markRead, queryClient, userId]);

  return {
    otherUserId: metaQuery.data?.otherUserId ?? null,
    otherUserName: metaQuery.data?.otherUserName ?? null,
    messages,
    loading: metaQuery.isLoading || messagesQuery.isLoading,
    loadingMore: messagesQuery.isFetchingNextPage,
    hasMore: messagesQuery.hasNextPage,
    sending: sendMutation.isPending,
    error: metaQuery.error || messagesQuery.error,
    sendMessage: sendMutation.mutateAsync,
    fetchNextPage: messagesQuery.fetchNextPage,
  };
};
