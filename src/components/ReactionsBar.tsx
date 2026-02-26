import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { LikeableItem, ReactionSummary, ReactionUser } from "../types";
import { postService } from "../services/postService";
import { useLanguage } from "../contexts/LanguageContext";

const EMOJIS = ["😂", "😭", "🔝", "🥺", "🤗", "🫠"];

interface ReactionsBarProps {
  item: LikeableItem;
  reactions: ReactionSummary[];
  onToggle: (emoji: string) => void;
  isLiked: boolean;
  likeCount: number;
  onLikeToggle: () => void;
}

export const ReactionsBar: React.FC<ReactionsBarProps> = ({
  item,
  reactions,
  onToggle,
  isLiked,
  likeCount,
  onLikeToggle,
}) => {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<View>(null);

  const [usersOpen, setUsersOpen] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [users, setUsers] = useState<ReactionUser[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const didLongPressRef = useRef(false);

  const SKELETON_ROWS = useMemo(() => Array.from({ length: 8 }, () => ({})), []);

  const selectedReactionCount = useMemo(() => {
    if (!selectedEmoji || selectedEmoji === "❤️") return 0;
    const r = reactions.find((x) => x.emoji === selectedEmoji);
    return r?.count ?? 0;
  }, [reactions, selectedEmoji]);

  const reactedEmojis = useMemo(
    () => new Set(reactions.filter((r) => r.reacted).map((r) => r.emoji)),
    [reactions]
  );

  const handleOpen = () => {
    buttonRef.current?.measureInWindow((x, y) => {
      setPopoverPos({ x, y });
      setOpen(true);
    });
  };

  const selectEmoji = (emoji: string) => {
    onToggle(emoji);
    setOpen(false);
  };

  const openUsers = async (emoji: string) => {
    setSelectedEmoji(emoji);
    setUsersOpen(true);
    setUsersLoading(true);
    setUsersError(null);

    try {
      const rows = await postService.fetchReactionUsers(item, emoji);
      setUsers(rows);
    } catch (error) {
      console.error("Error fetching reaction users:", error);
      setUsersError(t("Failed to load"));
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handlePressEmoji = (emoji: string) => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    onToggle(emoji);
  };

  const handlePressLike = () => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    onLikeToggle();
  };

  const getReactionPillStyle = (reacted: boolean): ViewStyle => ({
    ...pillStyle,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: reacted ? colors.light.primary : colors.neutral.grey2,
    ...(reacted ? { backgroundColor: colors.light.accent2 } : {}),
  });

  const getCountStyle = (reacted: boolean): TextStyle => ({
    ...countStyle,
    ...(reacted ? { color: colors.light.primary, fontWeight: "700" } : {}),
  });

  const getEmojiOptionStyle = (reacted: boolean): ViewStyle => ({
    ...emojiOptionStyle,
    ...(reacted ? { backgroundColor: colors.light.accent2 } : {}),
  });

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        onPress={handlePressLike}
        onLongPress={() => {
          didLongPressRef.current = true;
          openUsers("❤️");
        }}
        delayLongPress={350}
        style={pillStyle}
      >
        <Icon
          name={isLiked ? "heart" : "heart-o"}
          size={14}
          color={isLiked ? "#eb656b" : colors.neutral.grey1}
        />
        <Text style={countStyle}>{likeCount}</Text>
      </TouchableOpacity>

      {reactions.map((r) => (
        <TouchableOpacity
          key={r.emoji}
          onPress={() => handlePressEmoji(r.emoji)}
          onLongPress={() => {
            didLongPressRef.current = true;
            openUsers(r.emoji);
          }}
          delayLongPress={350}
          style={getReactionPillStyle(r.reacted)}
        >
          <Text style={emojiStyle}>{r.emoji}</Text>
          <Text style={getCountStyle(r.reacted)}>{r.count}</Text>
        </TouchableOpacity>
      ))}

      <View ref={buttonRef} collapsable={false}>
        <TouchableOpacity onPress={handleOpen} style={addButtonStyle}>
          <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color={"#888"} />
          <Text style={addPlusStyle}>+</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={modalBackdropStyle}>
          <View
            style={[
              popoverStyle,
              { top: popoverPos.y - 52, left: Math.max(8, popoverPos.x - 160) },
            ]}
          >
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => selectEmoji(e)}
                style={getEmojiOptionStyle(reactedEmojis.has(e))}
              >
                <Text style={emojiOptionText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={usersOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setUsersOpen(false)}
      >
        <Pressable onPress={() => setUsersOpen(false)} style={usersBackdropStyle}>
          <Pressable style={usersModalStyle}>
            <View style={usersGrabberStyle} />
            <View style={usersHeaderStyle}>
              <View style={usersHeaderPillWrapStyle}>
                {selectedEmoji === "❤️" ? (
                  <View style={pillStyle}>
                    <Icon name="heart" size={14} color="#eb656b" />
                    <Text style={countStyle}>{likeCount}</Text>
                  </View>
                ) : (
                  <View style={getReactionPillStyle(true)}>
                    <Text style={emojiStyle}>{selectedEmoji}</Text>
                    <Text style={getCountStyle(true)}>{selectedReactionCount}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setUsersOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="times" size={14} color={colors.neutral.grey1} />
              </TouchableOpacity>
            </View>

            {usersError ? (
              <View style={usersLoadingStyle}>
                <Text style={usersErrorStyle}>{usersError}</Text>
              </View>
            ) : (
              <FlatList
                data={usersLoading ? SKELETON_ROWS : users}
                keyExtractor={(u, idx) => (usersLoading ? `skeleton-${idx}` : (u as ReactionUser).id)}
                contentContainerStyle={usersListStyle}
                renderItem={({ item }) => {
                  if (usersLoading) {
                    return (
                      <View style={userRowStyle}>
                        <View style={userAvatarSkeletonStyle} />
                        <View style={userTextColStyle}>
                          <View style={userNameSkeletonStyle} />
                          <View style={userUsernameSkeletonStyle} />
                        </View>
                      </View>
                    );
                  }

                  const u = item as ReactionUser;
                  return (
                    <TouchableOpacity
                      style={userRowStyle}
                      onPress={() => {
                        setUsersOpen(false);
                        router.push(`/profile/${u.id}`);
                      }}
                    >
                      {u.profileImageUrl ? (
                        <Image source={{ uri: u.profileImageUrl }} style={userAvatarStyle} />
                      ) : (
                        <View style={userAvatarPlaceholderStyle}>
                          <MaterialCommunityIcons
                            name="account-circle"
                            size={44}
                            color={colors.neutral.grey1}
                          />
                        </View>
                      )}
                      <View style={userTextColStyle}>
                        <Text style={userNameStyle} numberOfLines={1}>
                          {u.name}
                        </Text>
                        <Text style={userUsernameStyle} numberOfLines={1}>
                          @{u.username}
                        </Text>
                      </View>
                      <Icon name="chevron-right" size={12} color={colors.neutral.grey1} />
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={userSeparatorStyle} />}
                ListEmptyComponent={
                  usersLoading ? null : (
                    <View style={usersLoadingStyle}>
                      <Text style={usersEmptyStyle}>
                        {selectedEmoji === "❤️" ? t("No Likes Yet") : t("No Reactions Yet")}
                      </Text>
                    </View>
                  )
                }
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const containerStyle: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 4,
};

const pillStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 2,
  paddingVertical: 2,
};

const emojiStyle: TextStyle = {
  fontSize: 12,
};

const countStyle: TextStyle = {
  marginLeft: 3,
  fontSize: 11,
  color: colors.light.text,
};

const addButtonStyle: ViewStyle = {
  paddingHorizontal: 4,
  paddingVertical: 2,
};

const addPlusStyle: TextStyle = {
  position: "absolute",
  top: -1,
  right: 0,
  fontSize: 9,
  color: "#888",
  fontWeight: "700",
};

const modalBackdropStyle: ViewStyle = {
  flex: 1,
};

const popoverStyle: ViewStyle = {
  position: "absolute",
  flexDirection: "row",
  backgroundColor: "#fff",
  borderRadius: 20,
  paddingHorizontal: 4,
  paddingVertical: 4,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5,
};

const emojiOptionStyle: ViewStyle = {
  padding: 4,
  borderRadius: 999,
};

const emojiOptionText: TextStyle = {
  fontSize: 22,
};

const usersBackdropStyle: ViewStyle = {
  flex: 1,
  justifyContent: "flex-end",
  backgroundColor: "rgba(0,0,0,0.35)",
};

const usersModalStyle: ViewStyle = {
  backgroundColor: colors.light.background,
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  maxHeight: "75%",
  minHeight: 420,
  overflow: "hidden",
  paddingBottom: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 6,
};

const usersGrabberStyle: ViewStyle = {
  alignSelf: "center",
  marginTop: 10,
  marginBottom: 6,
  width: 44,
  height: 5,
  borderRadius: 999,
  backgroundColor: colors.neutral.grey2,
};

const usersHeaderStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingTop: 6,
  paddingBottom: 12,
  borderBottomWidth: 1,
  borderBottomColor: colors.neutral.grey2,
  backgroundColor: colors.light.background,
};

const usersHeaderPillWrapStyle: ViewStyle = {
  flex: 1,
};

const usersLoadingStyle: ViewStyle = {
  padding: 16,
  alignItems: "center",
  justifyContent: "center",
};

const usersCloseButtonStyle: ViewStyle = {};

const usersListStyle: ViewStyle = {
  paddingVertical: 8,
};

const userRowStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 10,
};

const userSeparatorStyle: ViewStyle = {
  height: 1,
  backgroundColor: colors.neutral.grey2,
  marginLeft: 68,
};

const userAvatarStyle: ImageStyle = {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: colors.neutral.grey2,
};

const userAvatarPlaceholderStyle: ViewStyle = {
  width: 42,
  height: 42,
  alignItems: "center",
  justifyContent: "center",
};

const userAvatarSkeletonStyle: ViewStyle = {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: colors.neutral.grey2,
};

const userNameSkeletonStyle: ViewStyle = {
  height: 12,
  width: "55%",
  borderRadius: 6,
  backgroundColor: colors.neutral.grey2,
};

const userUsernameSkeletonStyle: ViewStyle = {
  height: 10,
  width: "40%",
  borderRadius: 6,
  marginTop: 6,
  backgroundColor: colors.neutral.grey2,
};

const userTextColStyle: ViewStyle = {
  marginLeft: 10,
  flex: 1,
};

const userNameStyle: TextStyle = {
  fontSize: 13,
  fontWeight: "700",
  color: colors.light.text,
};

const userUsernameStyle: TextStyle = {
  fontSize: 12,
  color: colors.neutral.grey1,
  marginTop: 1,
};

const usersEmptyStyle: TextStyle = {
  fontSize: 12,
  color: colors.neutral.grey1,
};

const usersErrorStyle: TextStyle = {
  fontSize: 12,
  color: colors.neutral.grey1,
};
