import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Challenge } from "../types";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { supabaseStorageUrl } from "../lib/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export function PastChallengeCard({
  challenge,
  onPress,
}: {
  challenge: Challenge;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: `${supabaseStorageUrl}/${challenge.media.file_path}` }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {challenge.title}
        </Text>
        <Text
          style={styles.description}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {challenge.description}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.light.lightText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "70",
    padding: 12,
    marginTop: 10,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: colors.neutral.grey1,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: colors.light.lightText,
    fontSize: 12,
    marginTop: 6,
  },
});
