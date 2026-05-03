import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useLanguage } from "../contexts/LanguageContext";
import { imageService } from "../services/imageService";
import { captureEvent } from "../lib/posthog";
import { CHALLENGE_EVENTS } from "../constants/analyticsEvents";

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return colors.light.easyGreen;
    case "medium":
      return colors.light.mediumYellow;
    case "hard":
      return colors.light.hardRed;
    default:
      return colors.light.easyGreen;
  }
};

export const HomeChallengeBanner: React.FC = () => {
  const { t, language } = useLanguage();
  const { activeChallenge, loading } = useActiveChallenge();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });

  const daysRemaining = useMemo(() => {
    if (!activeChallenge?.created_at) return null;
    const created = new Date(activeChallenge.created_at as unknown as string);
    const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - days);
  }, [activeChallenge?.created_at]);

  if (loading || !activeChallenge) return null;

  const title = language === "it" ? activeChallenge.title_it : activeChallenge.title;
  const description =
    language === "it" ? activeChallenge.description_it : activeChallenge.description;
  const filePath = activeChallenge.media?.file_path || activeChallenge.media_file_path;
  const difficulty = activeChallenge.difficulty;

  const endsLabel =
    daysRemaining === null
      ? null
      : daysRemaining > 0
      ? t(daysRemaining === 1 ? "Ends in 1 day" : "Ends in (days) days", { days: daysRemaining })
      : t("Past challenge");

  const handlePress = () => {
    captureEvent(CHALLENGE_EVENTS.VIEWED, {
      challenge_id: activeChallenge.id,
      source: "home_banner",
    });
    router.push(`/challenge/${activeChallenge.id}`);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{t("This week's challenge")}</Text>
      <AnimatedTouchable
        style={[styles.card, { transform: [{ scale }] }]}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityRole="button"
      >
        {filePath ? (
          <Image
            source={{ uri: imageService.getChallengeImageUrlSync(filePath, "small") }}
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
                { backgroundColor: getDifficultyColor(difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>
                {t(difficulty.charAt(0).toUpperCase() + difficulty.slice(1))}
              </Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
          {endsLabel && <Text style={styles.endsLabel}>{endsLabel}</Text>}
        </View>
        <MaterialIcons
          name="chevron-right"
          size={22}
          color={colors.light.lightText}
          style={styles.chevron}
        />
      </AnimatedTouchable>
    </View>
  );
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  eyebrow: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
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
  endsLabel: {
    color: colors.light.accent,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  chevron: {
    alignSelf: "center",
  },
});
