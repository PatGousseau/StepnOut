import { FlatList, Image, Pressable, RefreshControl, SafeAreaView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { Text } from "../../components/StyledText";
import { Loader } from "../../components/Loader";
import { colors } from "../../constants/Colors";
import { imageService } from "../../services/imageService";
import { useAuth } from "../../contexts/AuthContext";
import { useDmInbox } from "../../hooks/useDmInbox";

const formatInboxTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(diffMs / 86400000);
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, loading, refreshing, refresh } = useDmInbox(user?.id);

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={[styles.listContent, items.length ? undefined : styles.emptyContainer]}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
        renderItem={({ item }) => {
          const other = item.profile;
          const displayName = other?.name || other?.username || "Unknown";
          const initials = (displayName || "?")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("");

          const lastMessage = item.last_message_body ?? "";
          const lastAt = item.last_message_at ? new Date(item.last_message_at) : null;
          const timeText = lastAt ? formatInboxTime(lastAt) : "";

          return (
            <Pressable
              onPress={() => router.push(`/dm/${item.conversation_id}`)}
              style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : undefined]}
            >
              <View style={styles.avatar}>
                {other?.profile_media?.file_path ? (
                  <Image
                    source={{
                      uri: imageService.getProfileImageUrlSync(other.profile_media.file_path, "small"),
                    }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>{initials || "?"}</Text>
                )}
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
    overflow: "hidden",
    backgroundColor: colors.light.accent2,
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "60",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 42,
    height: 42,
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
