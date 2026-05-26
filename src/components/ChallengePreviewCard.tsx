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

type QuestPreviewCardProps = {
  title: string;
  description: string;
  footerLabel?: string | null;
  onPress: () => void;
};

type SharedPreviewCardProps = {
  title: string;
  description: string;
  footerLabel?: string | null;
  onPress: () => void;
  accentVariant: "challenge" | "quest";
  badge: React.ReactNode;
  imagePath?: string | null;
};

function SharedPreviewCard({
  title,
  description,
  footerLabel,
  onPress,
  accentVariant,
  badge,
  imagePath,
}: SharedPreviewCardProps) {
  const variantStyles = accentVariant === "quest" ? questStyles : challengeStyles;
  const descriptionLines = footerLabel ? 2 : 3;

  return (
    <TouchableOpacity
      style={[styles.card, variantStyles.card]}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
    >
      {accentVariant === "challenge" && (
        <>
          <View pointerEvents="none" style={[styles.glow, variantStyles.glow]} />
          <View pointerEvents="none" style={[styles.orbitLarge, variantStyles.orbitLarge]} />
          <View pointerEvents="none" style={[styles.orbitSmall, variantStyles.orbitSmall]} />
          <View pointerEvents="none" style={[styles.ribbon, variantStyles.ribbon]} />
        </>
      )}
      {accentVariant === "quest" && (
        <>
          <View pointerEvents="none" style={[styles.glow, variantStyles.glow]} />
          <View pointerEvents="none" style={[styles.orbitLarge, variantStyles.orbitLarge]} />
          <View pointerEvents="none" style={[styles.orbitSmall, variantStyles.orbitSmall]} />
          <View pointerEvents="none" style={[styles.ribbon, variantStyles.ribbon]} />
        </>
      )}

      {imagePath ? (
        <Image
          source={{ uri: imageService.getChallengeImageUrlSync(imagePath, "small") }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, styles.imageFallback, variantStyles.imageFallback]}>
          {accentVariant === "quest" && (
            <MaterialIcons name="explore" size={30} color={colors.sideQuest.text} />
          )}
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, variantStyles.title]} numberOfLines={2}>
            {title}
          </Text>
          {badge}
        </View>
        <Text style={styles.description} numberOfLines={descriptionLines}>
          {description}
        </Text>
        {!!footerLabel && (
          <View style={styles.footerRow}>
            <Text style={[styles.footerLabel, variantStyles.footerLabel]}>{footerLabel}</Text>
          </View>
        )}
      </View>

      <MaterialIcons
        name="chevron-right"
        size={22}
        color={accentVariant === "quest" ? colors.sideQuest.text : colors.light.primary}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
}

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

  return (
    <SharedPreviewCard
      title={title}
      description={description}
      footerLabel={footerLabel}
      onPress={onPress}
      accentVariant="challenge"
      imagePath={imagePath}
      badge={
        <View
          style={[
            styles.badge,
            {
              backgroundColor: getChallengeDifficultyColor(difficulty),
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {t(difficulty.charAt(0).toUpperCase() + difficulty.slice(1))}
          </Text>
        </View>
      }
    />
  );
};

export const QuestPreviewCard: React.FC<QuestPreviewCardProps> = ({
  title,
  description,
  footerLabel,
  onPress,
}) => {
  return (
    <SharedPreviewCard
      title={title}
      description={description}
      footerLabel={footerLabel}
      onPress={onPress}
      accentVariant="quest"
      badge={null}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    marginTop: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.light.text,
    fontSize: 11,
    fontWeight: "600",
  },
  card: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    padding: 10,
    position: "relative",
  },
  chevron: {
    alignSelf: "center",
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
  footerLabel: {
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
    borderRadius: 999,
    height: 90,
    position: "absolute",
    right: -18,
    top: -32,
    width: 90,
  },
  image: {
    backgroundColor: colors.neutral.grey1,
    borderRadius: 10,
    height: 72,
    width: 72,
  },
  imageFallback: {
    alignItems: "center",
    overflow: "hidden",
    justifyContent: "center",
  },
  orbitLarge: {
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
    borderRadius: 999,
    height: 8,
    position: "absolute",
    right: 22,
    top: 18,
    transform: [{ rotate: "-18deg" }],
    width: 38,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
});

const challengeStyles = {
  card: {
    backgroundColor: "#EEEFFC",
    borderColor: "#B7BCE0",
  },
  footerLabel: {
    color: colors.light.primary,
  },
  glow: {
    backgroundColor: "rgba(103, 109, 160, 0.12)",
  },
  imageFallback: {
    backgroundColor: colors.neutral.grey1,
  },
  orbitLarge: {
    borderColor: "rgba(103, 109, 160, 0.14)",
  },
  orbitSmall: {
    borderColor: "rgba(103, 109, 160, 0.10)",
  },
  ribbon: {
    backgroundColor: "rgba(103, 109, 160, 0.11)",
  },
  title: {
    color: colors.light.primary,
  },
};

const questStyles = {
  badge: {
    backgroundColor: colors.sideQuest.bg,
    borderColor: colors.sideQuest.bgBorder,
    borderWidth: 1,
  },
  badgeText: {
    color: colors.sideQuest.text,
  },
  card: {
    backgroundColor: colors.sideQuest.bg,
    borderColor: colors.sideQuest.bgBorder,
  },
  footerLabel: {
    color: colors.sideQuest.text,
  },
  glow: {
    backgroundColor: colors.sideQuest.tint,
  },
  imageFallback: {
    backgroundColor: colors.sideQuest.highlightSoft,
    borderColor: colors.sideQuest.bgBorder,
    borderWidth: 1,
  },
  orbitLarge: {
    borderColor: "rgba(161, 78, 57, 0.11)",
  },
  orbitSmall: {
    borderColor: "rgba(161, 78, 57, 0.09)",
  },
  ribbon: {
    backgroundColor: colors.sideQuest.fill,
  },
  title: {
    color: colors.sideQuest.textStrong,
  },
};
