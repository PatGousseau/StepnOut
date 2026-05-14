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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "70",
    padding: 10,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.neutral.grey1,
  },
  imageFallback: {
    backgroundColor: colors.neutral.grey1,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.light.primary,
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
  description: {
    color: colors.light.lightText,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 8,
  },
  footerLabel: {
    color: colors.light.accent,
    fontSize: 11,
    fontWeight: "600",
    flexShrink: 1,
  },
  chevron: {
    alignSelf: "center",
  },
});
