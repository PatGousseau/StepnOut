import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useLanguage } from "../contexts/LanguageContext";
import { imageService } from "../services/imageService";
import { getChallengeDifficultyColor } from "../utils/challengeDifficulty";

type ChallengePreviewCardProps = {
  title: string;
  description: string;
  difficulty: string;
  imagePath?: string | null;
  daysRemaining?: number | null;
  onPress: () => void;
};

export const ChallengePreviewCard: React.FC<ChallengePreviewCardProps> = ({
  title,
  description,
  difficulty,
  imagePath,
  daysRemaining,
  onPress,
}) => {
  const { t } = useLanguage();
  const footerLabel =
    daysRemaining === null || daysRemaining === undefined
      ? null
      : t(daysRemaining === 1 ? "Ends in 1 day" : "Ends in (days) days", { days: daysRemaining });
  const descriptionLines = footerLabel ? 2 : 3;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
    >
      <View pointerEvents="none" style={styles.glow} />
      <View pointerEvents="none" style={styles.orbitLarge} />
      <View pointerEvents="none" style={styles.orbitSmall} />
      <View pointerEvents="none" style={styles.ribbon} />

      {imagePath ? (
        <Image
          source={{ uri: imageService.getChallengeImageUrlSync(imagePath, "small") }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, styles.imageFallback]} />
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getChallengeDifficultyColor(difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>
              {t(difficulty.charAt(0).toUpperCase() + difficulty.slice(1))}
            </Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={descriptionLines}>
          {description}
        </Text>
        {!!footerLabel && (
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>{footerLabel}</Text>
          </View>
        )}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={22}
        color={colors.light.lightText}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "#EEEFFC",
    borderColor: "#B7BCE0",
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    padding: 10,
    position: "relative",
  },
  chevron: {
    alignSelf: "center",
    color: colors.light.primary,
  },
  image: {
    backgroundColor: colors.neutral.grey1,
    borderRadius: 10,
    height: 72,
    width: 72,
  },
  imageFallback: {
    backgroundColor: colors.neutral.grey1,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 4,
    zIndex: 1,
  },
  description: {
    color: colors.light.lightText,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  title: {
    color: colors.light.primary,
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
  },
  difficultyBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 1,
  },
  difficultyText: {
    color: colors.light.text,
    fontSize: 11,
    fontWeight: "600",
  },
  footerLabel: {
    color: colors.light.primary,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "600",
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginTop: 8,
  },
  glow: {
    backgroundColor: "rgba(103, 109, 160, 0.12)",
    borderRadius: 999,
    height: 90,
    position: "absolute",
    right: -18,
    top: -32,
    width: 90,
  },
  orbitLarge: {
    borderColor: "rgba(103, 109, 160, 0.14)",
    borderRadius: 999,
    borderWidth: 1,
    height: 54,
    position: "absolute",
    right: -2,
    top: 10,
    transform: [{ rotate: "-14deg" }],
    width: 54,
  },
  orbitSmall: {
    borderColor: "rgba(103, 109, 160, 0.10)",
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    position: "absolute",
    right: 18,
    top: 24,
    transform: [{ rotate: "10deg" }],
    width: 30,
  },
  ribbon: {
    backgroundColor: "rgba(103, 109, 160, 0.11)",
    borderRadius: 999,
    height: 8,
    position: "absolute",
    right: 22,
    top: 18,
    transform: [{ rotate: "-18deg" }],
    width: 38,
  },
});
