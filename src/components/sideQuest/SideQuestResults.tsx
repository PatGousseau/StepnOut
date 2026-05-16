import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../../constants/Colors";
import { SIDE_QUEST_GOAL_OPTIONS } from "../../constants/sideQuestOptions";
import { useLanguage } from "../../contexts/LanguageContext";
import { RankedSideQuest, SideQuest, SideQuestGoal } from "../../types/sideQuests";
import { QuestCard, ShareQuestExperience } from "../Quest";
import { Text } from "../StyledText";

function getGoalOptionLabel(goal: SideQuestGoal) {
  return SIDE_QUEST_GOAL_OPTIONS.find((option) => option.id === goal)?.label || goal;
}

type SideQuestResultsProps = {
  isExhausted: boolean;
  isRevealing: boolean;
  rankedSideQuests: RankedSideQuest[];
  revealOpacity: Animated.Value;
  todaysQuest: SideQuest | null;
};

export function SideQuestResults({
  isExhausted,
  isRevealing,
  rankedSideQuests,
  revealOpacity,
  todaysQuest,
}: SideQuestResultsProps) {
  const { t } = useLanguage();

  if (rankedSideQuests.length === 0) {
    return (
      <View style={styles.emptyStateCard}>
        <View style={styles.emptyStateIcon}>
          <MaterialCommunityIcons name="compass-outline" size={20} color={colors.sideQuest.text} />
        </View>
        <Text style={styles.emptyStateTitle}>{t("No side quests yet.")}</Text>
        <Text style={styles.emptyStateBody}>
          {t("Once side quests are added, they will show up here ranked for your preferences.")}
        </Text>
      </View>
    );
  }

  if (isExhausted && !isRevealing) {
    return (
      <View style={styles.emptyStateCard}>
        <View style={styles.emptyStateIcon}>
          <MaterialCommunityIcons name="check-all" size={20} color={colors.sideQuest.text} />
        </View>
        <Text style={styles.emptyStateTitle}>{t("You have finished every quest in the hat.")}</Text>
        <Text style={styles.emptyStateBody}>
          {t("There are no new quests left to draw right now. Once more quests are added, you will be able to pull a new one here.")}
        </Text>
      </View>
    );
  }

  if (todaysQuest && !isRevealing) {
    return (
      <Animated.View style={[styles.questBlock, { opacity: revealOpacity }]}>
        <QuestCard
          quest={todaysQuest}
          tags={
            rankedSideQuests
              .find((quest) => quest.id === todaysQuest.id)
              ?.matched_goal_tags.slice(0, 2)
              .map((tag) => t(getGoalOptionLabel(tag))) ?? []
          }
        />
        <View style={styles.questActions}>
          <ShareQuestExperience quest={todaysQuest} />
        </View>
      </Animated.View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  emptyStateBody: {
    color: colors.light.lightText,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyStateCard: {
    backgroundColor: "#FFF7EF",
    borderColor: "#F0D1A9",
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  emptyStateIcon: {
    alignItems: "center",
    backgroundColor: colors.sideQuest.bgAlt,
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    marginBottom: 14,
    width: 40,
  },
  emptyStateTitle: {
    color: colors.light.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  questActions: {
    alignSelf: "center",
    marginTop: 0,
    width: "80%",
  },
  questBlock: {
    paddingTop: 4,
  },
});
