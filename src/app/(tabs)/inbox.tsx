import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { Text } from "../../components/StyledText";
import { Loader } from "../../components/Loader";
import { colors } from "../../constants/Colors";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { dmService, DmInboxItem } from "../../services/dmService";

type ProfilePreview = {
  id: string;
  username: string | null;
  name: string | null;
};

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<DmInboxItem[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, ProfilePreview>>({});

  const otherUserIds = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.other_user_id)));
  }, [items]);

  const fetchProfiles = useCallback(async (userIds: string[]) => {
    if (!userIds.length) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, name")
      .in("id", userIds);

    if (error) {
      console.error("Error fetching dm inbox profiles:", error);
      return;
    }

    const next: Record<string, ProfilePreview> = {};
    (data ?? []).forEach((p) => {
      next[p.id] = {
        id: p.id,
        username: p.username,
        name: p.name,
      };
    });

    setProfilesById((prev) => ({ ...prev, ...next }));
  }, []);

  const fetchInbox = useCallback(async () => {
    setRefreshing(true);
    const result = await dmService.listInbox();
    if (result.error) {
      console.error("Error fetching dm inbox:", result.error);
    } else {
      setItems(result.data ?? []);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const result = await dmService.listInbox();
      if (!cancelled) {
        if (result.data) setItems(result.data);
        if (result.error) console.error("Error fetching dm inbox:", result.error);
        setLoading(false);
      }
    };

    if (user) run();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    fetchProfiles(otherUserIds);
  }, [otherUserIds, fetchProfiles]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Sign in to use messages.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.conversation_id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchInbox} />}
        contentContainerStyle={[styles.listContent, items.length ? undefined : styles.emptyContainer]}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
        renderItem={({ item }) => {
          const other = profilesById[item.other_user_id];
          const displayName = other?.name || other?.username || "Unknown";
          const initials = (displayName || "?")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("");

          const lastMessage = item.last_message_body ?? "";
          const lastAt = item.last_message_at ? new Date(item.last_message_at) : null;
          const timeText = lastAt
            ? lastAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
            : "";

          return (
            <Pressable
              onPress={() => router.push(`/dm/${item.conversation_id}`)}
              style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : undefined]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "?"}</Text>
              </View>

              <View style={styles.rowMain}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {displayName}
                  </Text>
                  {!!timeText && <Text style={styles.rowTime}>{timeText}</Text>}
                </View>

                <View style={styles.rowBottom}>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {lastMessage}
                  </Text>
                  {item.unread_count > 0 ? (
                    <View style={styles.unreadPill}>
                      <Text style={styles.unreadText}>{item.unread_count}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "90",
    backgroundColor: colors.neutral.white,
  },
  cardPressed: {
    opacity: 0.9,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.light.accent2,
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "60",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.light.primary,
  },
  rowMain: {
    flex: 1,
    gap: 6,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.light.text,
  },
  rowTime: {
    fontSize: 12,
    color: colors.light.lightText,
  },
  rowSubtitle: {
    flex: 1,
    fontSize: 13,
    color: colors.light.lightText,
  },
  unreadPill: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    color: colors.light.lightText,
  },
});
