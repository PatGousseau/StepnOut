import React, { useRef, useState } from "react";
import { Modal, Pressable, TouchableOpacity, View, ViewStyle, TextStyle } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { ReactionSummary } from "../types";

const EMOJIS = ["😂", "😭", "🔝", "🥺", "🤗", "🫠"];

interface ReactionsBarProps {
  reactions: ReactionSummary[];
  onToggle: (emoji: string) => void;
  isLiked: boolean;
  likeCount: number;
  onLikeToggle: () => void;
}

export const ReactionsBar: React.FC<ReactionsBarProps> = ({
  reactions,
  onToggle,
  isLiked,
  likeCount,
  onLikeToggle,
}) => {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<View>(null);

  const reactedEmojis = new Set(reactions.filter((r) => r.reacted).map((r) => r.emoji));

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
      <TouchableOpacity onPress={onLikeToggle} style={pillStyle}>
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
          onPress={() => onToggle(r.emoji)}
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
