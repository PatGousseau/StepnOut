import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Text } from "../../components/StyledText";
import { Loader } from "../../components/Loader";
import { colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { dmService, DmMessage } from "../../services/dmService";
import { supabase } from "../../lib/supabase";
import Icon from "react-native-vector-icons/Ionicons";

export default function DmThreadScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = typeof id === "string" ? id : undefined;

  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState<string | null>(null);

  const myUserId = user?.id;

  const sorted = useMemo(() => {
    return [...messages].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [messages]);

  useEffect(() => {
    if (!conversationId || !myUserId) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);

      const [{ data: memberRows, error: memberError }, messagesResult] = await Promise.all([
        supabase
          .from("dm_conversation_members")
          .select("user_id")
          .eq("conversation_id", conversationId),
        dmService.fetchMessages(conversationId),
      ]);

      if (!cancelled) {
        if (memberError) {
          console.error("Error fetching dm members:", memberError);
        } else {
          const otherId = (memberRows ?? []).map((r) => r.user_id).find((uid) => uid !== myUserId);
          if (otherId) {
            const { data: profileRows, error: profileError } = await supabase
              .from("profiles")
              .select("name, username")
              .eq("id", otherId)
              .limit(1);

            if (profileError) {
              console.error("Error fetching dm other profile:", profileError);
            } else {
              const p = profileRows?.[0];
              setOtherUserName(p?.name || p?.username || null);
            }
          }
        }

        if (messagesResult.data) setMessages(messagesResult.data);
        if (messagesResult.error) console.error("Error fetching dm messages:", messagesResult.error);

        setLoading(false);
      }

      dmService.markConversationRead(conversationId, myUserId).catch(() => null);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [conversationId, myUserId]);

  useEffect(() => {
    if (!conversationId || !myUserId) return;

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
          setMessages((prev) => {
            if (prev.some((m) => m.id === next.id)) return prev;
            return [next, ...prev];
          });

          dmService.markConversationRead(conversationId, myUserId).catch(() => null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, myUserId]);

  const onSend = async () => {
    if (!conversationId || !myUserId) return;

    setSending(true);
    const body = text;
    setText("");

    const result = await dmService.sendMessage(conversationId, myUserId, body);
    if (result.error) {
      console.error("Error sending dm message:", result.error);
      setText(body);
    }

    setSending(false);
  };

  if (!conversationId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Invalid conversation.</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Sign in to use messages.</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBack}>
            <Icon name="chevron-back" size={28} color={colors.light.text} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {otherUserName || "Message"}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <Loader />
        ) : (
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          >
            <FlatList
              data={sorted}
              keyExtractor={(item) => item.id}
              inverted
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isMine = item.sender_id === myUserId;
                const createdAt = new Date(item.created_at);
                const timeText = createdAt.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                        {item.body}
                      </Text>
                      <Text style={[styles.bubbleTime, isMine ? styles.bubbleTimeMine : styles.bubbleTimeTheirs]}>
                        {timeText}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />

            <View style={styles.composer}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Message"
                placeholderTextColor={colors.light.lightText}
                style={styles.input}
                editable={!sending}
                multiline
              />
              <Pressable
                onPress={onSend}
                disabled={sending || !text.trim()}
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed ? styles.sendPressed : undefined,
                  sending || !text.trim() ? styles.sendDisabled : undefined,
                ]}
              >
                <Icon name="send" size={18} color={colors.neutral.white} style={styles.sendIcon} />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grey1 + "90",
    backgroundColor: colors.light.background,
  },
  headerBack: {
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.light.text,
  },
  headerSpacer: {
    width: 40,
    height: 36,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowMine: {
    justifyContent: "flex-end",
  },
  bubbleRowTheirs: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  bubbleMine: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  bubbleTheirs: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.neutral.grey1 + "60",
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: colors.neutral.white,
  },
  bubbleTextTheirs: {
    color: colors.neutral.black,
  },
  bubbleTime: {
    marginTop: 6,
    fontSize: 11,
  },
  bubbleTimeMine: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "right",
  },
  bubbleTimeTheirs: {
    color: colors.light.lightText,
    textAlign: "right",
  },
  composer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.grey1 + "90",
    backgroundColor: colors.light.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "60",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    color: colors.light.text,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    transform: [{ rotate: "-45deg" }],
    marginLeft: 2,
  },
  sendPressed: {
    opacity: 0.9,
  },
  sendDisabled: {
    opacity: 0.5,
  },
});
