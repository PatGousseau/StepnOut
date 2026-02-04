import React, { useMemo, useState } from "react";
import { Modal, Pressable, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { ReactionSummary } from "../types";

const QUICK_EMOJIS = ["❤️", "👍", "😂", "🔥", "😮", "🎉", "🙏", "😢", "😡"];

interface ReactionsBarProps {
  reactions: ReactionSummary[];
  onToggle: (emoji: string) => void;
  compact?: boolean;
}

export const ReactionsBar: React.FC<ReactionsBarProps> = ({ reactions, onToggle, compact }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const pills = useMemo(() => reactions.slice(0, compact ? 6 : 10), [reactions, compact]);

  const submit = () => {
    const emoji = value.trim();
    if (!emoji) return;
    onToggle(emoji);
    setValue("");
    setOpen(false);
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
      {pills.map((r) => (
        <TouchableOpacity
          key={r.emoji}
          onPress={() => onToggle(r.emoji)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: r.reacted ? colors.light.tint : colors.light.border,
            backgroundColor: r.reacted ? "rgba(0, 122, 255, 0.10)" : colors.light.background,
          }}
        >
          <Text style={{ fontSize: 14 }}>{r.emoji}</Text>
          <Text style={{ marginLeft: 6, fontSize: 12, color: colors.light.text }}>{r.count}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.light.border,
          backgroundColor: colors.light.background,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.light.text }}>+</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center" }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              marginHorizontal: 20,
              backgroundColor: colors.light.background,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.light.border,
            }}
          >
            <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: "600" }}>add reaction</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
              {QUICK_EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => {
                    onToggle(e);
                    setOpen(false);
                  }}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.light.border,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder="type or paste any emoji"
                placeholderTextColor={colors.light.text + "80"}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.light.border,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.light.text,
                }}
                onSubmitEditing={submit}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={submit}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: colors.light.tint,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
