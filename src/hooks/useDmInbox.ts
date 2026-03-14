import { useCallback, useEffect, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { dmQueryKeys } from "../services/dmQueryKeys";
import { dmService, DmInboxItem, DmProfilePreview } from "../services/dmService";

export type DmInboxListItem = DmInboxItem & {
  profile: DmProfilePreview | null;
};

const EMPTY_PROFILES: Record<string, DmProfilePreview> = {};

export const useDmInbox = (userId?: string) => {
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

  const otherUserIds = useMemo(() => {
    const ids = new Set((inboxQuery.data ?? []).map((item) => item.other_user_id));
    return Array.from(ids).sort();
  }, [inboxQuery.data]);

  const profilesQuery = useQuery({
    queryKey:
      userId && otherUserIds.length
        ? dmQueryKeys.inboxProfiles(otherUserIds)
        : ["dm", "inbox-profiles", "empty"],
    queryFn: async () => {
      const result = await dmService.fetchInboxProfiles(otherUserIds);
      if (result.error) throw new Error(result.error);
      return result.data ?? EMPTY_PROFILES;
    },
    enabled: !!userId && otherUserIds.length > 0,
    staleTime: 30000,
  });

  const items = useMemo<DmInboxListItem[]>(() => {
    const profilesById = profilesQuery.data ?? EMPTY_PROFILES;

    return (inboxQuery.data ?? []).map((item) => ({
      ...item,
      profile: profilesById[item.other_user_id] ?? null,
    }));
  }, [inboxQuery.data, profilesQuery.data]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    await inboxQuery.refetch();
  }, [inboxQuery, userId]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(userId) }).catch(() => null);
    }, [queryClient, userId])
  );

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`dm_inbox:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_conversation_members",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(userId) }).catch(() => null);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dm_conversation_members",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(userId) }).catch(() => null);
        }
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
            queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(userId) }).catch(() => null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  return {
    items,
    loading: inboxQuery.isLoading || profilesQuery.isLoading,
    refreshing: inboxQuery.isRefetching && !inboxQuery.isLoading,
    error: inboxQuery.error,
    refresh,
  };
};
