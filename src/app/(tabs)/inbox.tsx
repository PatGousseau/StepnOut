import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
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
        onRefresh={fetchInbox}
        refreshing={refreshing}
        contentContainerStyle={items.length ? undefined : styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
        renderItem={({ item }) => {
          const other = profilesById[item.other_user_id];
          const name = other?.name || other?.username || "Unknown";

          return (
            <Pressable
              onPress={() => router.push(`/dm/${item.conversation_id}`)}
              style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : undefined]}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{name}</Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {item.last_message_body ?? ""}
                </Text>
              </View>
              {item.unread_count > 0 ? (
                <View style={styles.unreadPill}>
                  <Text style={styles.unreadText}>{item.unread_count}</Text>
                </View>
              ) : null}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey2,
  },
  rowPressed: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowSubtitle: {
    fontSize: 14,
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
    color: "white",
    fontSize: 12,
    fontWeight: "700",
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
