import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../constants/Colors";
import { FeedSort } from "../lib/feedSort";

type Props = {
  value: FeedSort;
  onChange: (next: FeedSort) => void;
  recentLabel: string;
  popularLabel: string;
};

export const FeedSortToggle = ({ value, onChange, recentLabel, popularLabel }: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value === "recent" && styles.buttonActive]}
        onPress={() => onChange("recent")}
      >
        <Text style={[styles.text, value === "recent" && styles.textActive]}>{recentLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, value === "popular" && styles.buttonActive]}
        onPress={() => onChange("popular")}
      >
        <Text style={[styles.text, value === "popular" && styles.textActive]}>{popularLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "90",
    overflow: "hidden",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.light.background,
  },
  buttonActive: {
    backgroundColor: colors.light.primary + "14",
  },
  text: {
    fontSize: 13,
    color: colors.light.lightText,
    fontWeight: "600",
  },
  textActive: {
    color: colors.light.primary,
  },
});

export default FeedSortToggle;
