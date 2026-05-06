import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useLanguage } from "../contexts/LanguageContext";
import { captureEvent } from "../lib/posthog";
import { CHALLENGE_EVENTS } from "../constants/analyticsEvents";
import { ChallengePreviewCard } from "./ChallengePreviewCard";

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
    return 7 - days;
  }, [activeChallenge?.created_at]);

  if (loading || !activeChallenge || daysRemaining === null || daysRemaining <= 0) return null;

  const title = language === "it" ? activeChallenge.title_it : activeChallenge.title;
  const description =
    language === "it" ? activeChallenge.description_it : activeChallenge.description;
  const filePath = activeChallenge.media?.file_path || activeChallenge.media_file_path;

  const handlePress = () => {
    captureEvent(CHALLENGE_EVENTS.VIEWED, {
      challenge_id: activeChallenge.id,
      source: "home_banner",
    });
    router.push(`/challenge/${activeChallenge.id}`);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{t("Do this week's challenge")}</Text>
      <Animated.View style={{ transform: [{ scale }] }}>
        <ChallengePreviewCard
          title={title}
          description={description}
          difficulty={activeChallenge.difficulty}
          imagePath={filePath}
          daysRemaining={daysRemaining}
          onPress={handlePress}
        />
      </Animated.View>
    </View>
  );
};

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
});
