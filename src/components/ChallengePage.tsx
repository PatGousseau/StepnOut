import React, { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { ChallengeCard } from "./Challenge";
import { PatrizioExample } from "./Challenge";
import { ShareExperience } from "./Challenge";
import { useLanguage } from "../contexts/LanguageContext";
import { ChallengeSkeleton } from "./Skeleton";
import { useQuery } from "@tanstack/react-query";
import { challengeService } from "../services/challengeService";

interface ChallengePageProps {
  id?: number;
}

export const ChallengePage: React.FC<ChallengePageProps> = ({ id }) => {
  const { t, language } = useLanguage();
  const params = useLocalSearchParams();
  
  // Get challenge ID from prop or URL params
  const challengeId = id ?? (params.id ? parseInt(String(params.id)) : undefined);
  
  const [refreshing, setRefreshing] = useState(false);

  // Use React Query to fetch challenge data
  const {
    data: challenge,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: () => {
      if (!challengeId) {
        throw new Error("Invalid challenge ID");
      }
      return challengeService.fetchChallengeById(challengeId);
    },
    enabled: !!challengeId,
    staleTime: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return <ChallengeSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>{t("Error loading challenge")}</Text>
      </View>
    );
  }

  // Challenge not found
  if (!challenge) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>{t("Challenge not found")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t("Challenge")}</Text>
        <Text style={styles.endsIn}>
          {challenge.daysRemaining > 0
            ? t(challenge.daysRemaining === 1 ? "Ends in 1 day" : "Ends in (days) days", {
                days: challenge.daysRemaining,
              })
            : t("Past challenge")}
        </Text>
        <ChallengeCard
          challenge={{
            ...challenge,
            title: language === "it" ? challenge.title_it : challenge.title,
            description: language === "it" ? challenge.description_it : challenge.description,
          }}
        />
        <PatrizioExample
          challenge={{
            ...challenge,
            title: language === "it" ? challenge.title_it : challenge.title,
            description: language === "it" ? challenge.description_it : challenge.description,
          }}
        />
        {challenge.daysRemaining > 0 && <ShareExperience challenge={challenge} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  content: {
    backgroundColor: colors.light.cardBg,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 20,
  },
  endsIn: {
    color: colors.light.lightText,
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    color: colors.light.primary,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
});
