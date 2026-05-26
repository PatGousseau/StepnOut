import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { colors } from "../constants/Colors";
import { sideQuestService } from "../services/sideQuestService";
import { Loader } from "./Loader";
import { QuestCard, ShareQuestExperience } from "./Quest";
import { Text } from "./StyledText";

function getLocalDayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const QuestPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const questId = params.id ? parseInt(String(params.id), 10) : undefined;
  const localDay = useMemo(() => getLocalDayString(), []);

  const drawHistoryQuery = useQuery({
    queryKey: ["side-quest-draw-history", user?.id],
    queryFn: () => sideQuestService.fetchDrawHistory(user!.id),
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const historyEntry = useMemo(
    () => drawHistoryQuery.data?.find(({ quest }) => quest.id === questId) ?? null,
    [drawHistoryQuery.data, questId]
  );

  const drawDateLabel = useMemo(() => {
    if (!historyEntry) return null;

    const [year, month, day] = historyEntry.draw.local_day.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);

    return new Intl.DateTimeFormat(language === "it" ? "it-IT" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);
  }, [historyEntry, language]);

  if (drawHistoryQuery.isLoading) {
    return <Loader />;
  }

  if (drawHistoryQuery.error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>{t("Error")}</Text>
        <Text style={styles.subtitle}>{(drawHistoryQuery.error as Error).message}</Text>
      </View>
    );
  }

  if (!historyEntry || !questId) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>{t("Quest not found")}</Text>
      </View>
    );
  }

  const isToday = historyEntry.draw.local_day === localDay;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={styles.heroSection}>
        <View style={styles.eyebrowWrap}>
          <Text style={styles.eyebrow}>{isToday ? t("Today's quest") : t("Past quest")}</Text>
          {!!drawDateLabel && <Text style={styles.eyebrowSub}>{drawDateLabel}</Text>}
        </View>

        <QuestCard quest={historyEntry.quest} eyebrowText={isToday ? t("Today's quest") : t("Past quest")} />

        <View style={styles.ctaWrap}>
          <ShareQuestExperience quest={historyEntry.quest} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  ctaWrap: {
    alignSelf: "center",
    width: "80%",
  },
  eyebrow: {
    color: colors.sideQuest.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  eyebrowSub: {
    color: colors.light.lightText,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  eyebrowWrap: {
    alignSelf: "center",
    marginBottom: 20,
    width: "80%",
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  subtitle: {
    color: colors.light.lightText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  title: {
    color: colors.light.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
});
