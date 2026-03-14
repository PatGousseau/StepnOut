import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";

import { Text } from "../../components/StyledText";
import { Loader } from "../../components/Loader";
import { AnimatedSendButton } from "../../components/AnimatedSendButton";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useDmThread } from "../../hooks/useDmThread";
import { imageService } from "../../services/imageService";
import { dmQueryKeys } from "../../services/dmQueryKeys";
import { postService } from "../../services/postService";
import { DmMessage } from "../../services/dmService";

function AnimatedMessageBubble({
  item,
  isMine,
}: {
  item: DmMessage;
  isMine: boolean;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const createdAt = new Date(item.created_at);
  const timeText = createdAt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View
      style={[
        styles.messageAnimationWrap,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
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
    </Animated.View>
  );
}

export default function DmThreadScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = typeof id === "string" ? id : undefined;

  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [text, setText] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const myUserId = user?.id;
  const {
    otherUserId,
    otherUserName,
    otherUserProfileMediaPath,
    messages,
    loading,
    loadingMore,
    hasMore,
    sending,
    sendMessage,
    fetchNextPage,
  } = useDmThread(conversationId, myUserId);

  const sorted = useMemo(() => {
    return [...messages].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [messages]);

  const avatarUri = otherUserProfileMediaPath
    ? imageService.getProfileImageUrlSync(otherUserProfileMediaPath, "small")
    : null;
  const avatarInitials = (otherUserName || "M")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const onSend = async () => {
    if (!conversationId || !myUserId) return;

    const body = text;
    setText("");

    try {
      await sendMessage(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message";
      console.error("Error sending dm message:", message);
      Alert.alert("Couldn’t send", message);
      setText(body);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    await fetchNextPage();
  };

  const handleBlock = () => {
    if (!user?.id || !otherUserId) return;

    Alert.alert(t("Block user"), t("Are you sure you want to block this user?"), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Block"),
        style: "destructive",
        onPress: async () => {
          const success = await postService.blockUser(user.id, otherUserId);
          if (!success) return;

          await queryClient.invalidateQueries({ queryKey: dmQueryKeys.inbox(user.id) });
          if (conversationId) {
            await queryClient.invalidateQueries({ queryKey: dmQueryKeys.threadMessages(conversationId) });
          }
          router.replace("/inbox");
        },
      },
    ]);
  };

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {loading ? (
          <Loader />
        ) : (
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
          >
            <View style={styles.conversationMeta}>
              <Pressable
                onPress={() => {
                  if (otherUserId) router.push(`/profile/${otherUserId}`);
                }}
                disabled={!otherUserId}
                style={({ pressed }) => [
                  styles.metaMainPressable,
                  pressed && otherUserId ? styles.conversationMetaPressed : undefined,
                ]}
              >
                <View style={styles.avatar}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{avatarInitials || "?"}</Text>
                  )}
                </View>
                <View style={styles.metaCopy}>
                  <Text style={styles.metaName} numberOfLines={1}>
                    {otherUserName || "Message"}
                  </Text>
                  <Text style={styles.metaHint} numberOfLines={1}>
                    {t("View profile")}
                  </Text>
                </View>
              </Pressable>
              <Menu style={styles.menuContainer}>
                <MenuTrigger>
                  <View style={styles.menuTrigger}>
                    <MaterialIcons name="more-horiz" size={22} color={colors.light.primary} />
                  </View>
                </MenuTrigger>
                <MenuOptions customStyles={menuOptionsStyles}>
                  <MenuOption onSelect={handleBlock}>
                    <View style={styles.menuOptionRow}>
                      <MaterialIcons name="block" size={20} color={colors.light.alertRed} />
                      <Text style={styles.menuOptionText}>{t("Block user")}</Text>
                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>

            <FlatList
              data={sorted}
              keyExtractor={(item) => item.id}
              inverted
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              onEndReached={loadMore}
              onEndReachedThreshold={0.2}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>Say hi.</Text>
                </View>
              }
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMoreWrap}>
                    <Text style={styles.loadingMoreText}>Loading…</Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => {
                const isMine = item.sender_id === myUserId;
                return <AnimatedMessageBubble item={item} isMine={isMine} />;
              }}
            />

            <View
              style={[
                styles.composer,
                keyboardVisible ? styles.composerKeyboardOpen : styles.composerKeyboardClosed,
              ]}
            >
              <View style={styles.inputShell}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Message"
                  placeholderTextColor={colors.light.lightText}
                  style={styles.input}
                  editable
                  multiline
                  blurOnSubmit={false}
                />
                <View style={styles.sendButtonWrap}>
                  <AnimatedSendButton
                    hasContent={text.trim().length > 0}
                    onPress={onSend}
                    disabled={sending}
                    size="medium"
                  />
                </View>
              </View>
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
  conversationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grey1 + "90",
    backgroundColor: colors.light.background,
  },
  metaMainPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    borderRadius: 12,
    paddingVertical: 4,
    paddingRight: 4,
  },
  conversationMetaPressed: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "60",
    backgroundColor: colors.light.accent2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.light.primary,
  },
  metaCopy: {
    flex: 1,
    gap: 2,
  },
  metaName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.light.text,
  },
  metaHint: {
    fontSize: 12,
    color: colors.light.lightText,
  },
  menuContainer: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  menuTrigger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  menuOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 4,
  },
  menuOptionText: {
    fontSize: 14,
    color: colors.light.alertRed,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    flexGrow: 1,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  messageAnimationWrap: {
    width: "100%",
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
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.grey1 + "90",
    backgroundColor: colors.light.background,
  },
  composerKeyboardClosed: {
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
  },
  composerKeyboardOpen: {
    paddingBottom: Platform.OS === "ios" ? 20 : 14,
  },
  emptyWrap: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.light.lightText,
  },
  loadingMoreWrap: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMoreText: {
    color: colors.light.lightText,
    fontSize: 12,
  },
  input: {
    flex: 1,
    paddingRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: colors.light.text,
    minHeight: 40,
    maxHeight: 100,
  },
  inputShell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingRight: 6,
  },
  sendButtonWrap: {
    alignSelf: "flex-end",
    paddingBottom: 6,
    paddingRight: 2,
  },
});

const menuOptionsStyles = {
  optionsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 28,
  },
};
