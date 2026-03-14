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
import { Stack, useLocalSearchParams } from "expo-router";

import { Text } from "../../components/StyledText";
import { Loader } from "../../components/Loader";
import { colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { dmService, DmMessage } from "../../services/dmService";
import { supabase } from "../../lib/supabase";

export default function DmThreadScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = typeof id === "string" ? id : undefined;

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const myUserId = user?.id;

  const sorted = useMemo(() => {
    return [...messages].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [messages]);

  useEffect(() => {
    if (!conversationId || !myUserId) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const result = await dmService.fetchMessages(conversationId);
      if (!cancelled) {
        if (result.data) setMessages(result.data);
        if (result.error) console.error("Error fetching dm messages:", result.error);
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
              renderItem={({ item }) => {
                const isMine = item.sender_id === myUserId;

                return (
                  <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                        {item.body}
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
                <Text style={styles.sendText}>Send</Text>
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
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
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
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  bubbleMine: {
    backgroundColor: colors.light.primary,
  },
  bubbleTheirs: {
    backgroundColor: colors.neutral.white,
  },
  bubbleText: {
    fontSize: 15,
  },
  bubbleTextMine: {
    color: colors.neutral.white,
  },
  bubbleTextTheirs: {
    color: colors.neutral.black,
  },
  composer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.grey2,
    backgroundColor: colors.light.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    color: colors.light.text,
  },
  sendButton: {
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendPressed: {
    opacity: 0.9,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: colors.neutral.white,
    fontWeight: "700",
  },
});
