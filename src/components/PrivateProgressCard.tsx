import React from "react";
import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Text } from "./StyledText";
import { useLanguage } from "../contexts/LanguageContext";
import { privateChallengeService, computePrivateChallengeStats } from "../services/privateChallengeService";
import { colors } from "../constants/Colors";

type PrivateProgressCardProps = {
  userId: string;
};

export const PrivateProgressCard: React.FC<PrivateProgressCardProps> = ({ userId }) => {
  const { t } = useLanguage();
  const { data } = useQuery({
    queryKey: ["private-challenge-history", userId],
    queryFn: () => privateChallengeService.fetchHistory(userId),
    enabled: !!userId,
    staleTime: 30000,
  });

  const stats = computePrivateChallengeStats(data || []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("Your private path")}</Text>
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>{t("Private streak")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.longestStreak}</Text>
          <Text style={styles.statLabel}>{t("Longest streak")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCompleted}</Text>
          <Text style={styles.statLabel}>{t("Private completions")}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F6F7FA",
    borderColor: "#D7DDE8",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: 10,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  statLabel: {
    color: colors.light.lightText,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  statValue: {
    color: colors.light.primary,
    fontSize: 22,
    fontWeight: "700",
  },
  title: {
    color: colors.light.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },
});
