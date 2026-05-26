import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { AppAlert } from "./AppAlert";
import { Text } from "./StyledText";
import { Loader } from "./Loader";
import { useLanguage } from "../contexts/LanguageContext";
import { useSideQuests } from "../hooks/useSideQuests";
import { colors } from "../constants/Colors";
import { captureEvent } from "../lib/posthog";
import { SIDE_QUEST_EMPTY_DRAFT } from "../constants/sideQuestOptions";
import { SIDE_QUEST_EVENTS } from "../constants/analyticsEvents";
import {
  SideQuest,
  SideQuestAvoidType,
  SideQuestGoal,
  SideQuestHardSituation,
  SideQuestMeaningfulType,
  SideQuestPreferredContext,
  SideQuestProgressDefinition,
  SideQuestQuestionnaireDraft,
  SideQuestStretchLevel,
} from "../types/sideQuests";
import { SideQuestDailyDraw } from "./sideQuest/SideQuestDailyDraw";
import { SideQuestQuestionnaire } from "./sideQuest/SideQuestQuestionnaire";
import { SideQuestResults } from "./sideQuest/SideQuestResults";
import { QuestPreviewCard } from "./ChallengePreviewCard";

function buildDraft(profile: ReturnType<typeof useSideQuests>["profile"]): SideQuestQuestionnaireDraft {
  if (!profile) return SIDE_QUEST_EMPTY_DRAFT;
  return {
    goal: profile.goal,
    hard_situation: profile.hard_situation,
    stretch_level: profile.stretch_level,
    preferred_context: profile.preferred_context,
    meaningful_type: profile.meaningful_type,
    avoid_types: profile.avoid_types || [],
    progress_definition: profile.progress_definition,
  };
}

export const SideQuestPath: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    profile,
    profileLoading,
    profileError,
    rankedSideQuests,
    sideQuestsLoading,
    sideQuestsError,
    drawHistory,
    drawHistoryLoading,
    drawHistoryError,
    todaysQuest,
    todaysQuestState,
    todaysQuestLoading,
    drawTodaysQuest,
    saveProfile,
    savingProfile,
    localDay,
  } = useSideQuests();
  const [draft, setDraft] = useState<SideQuestQuestionnaireDraft>(SIDE_QUEST_EMPTY_DRAFT);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [isDrawingQuest, setIsDrawingQuest] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedQuest, setRevealedQuest] = useState<SideQuest | null>(null);
  const revealOpacity = useRef(new Animated.Value(1)).current;
  const needsOnboarding = !profile;
  const questionCount = 7;
  const formatQuestDateLabel = useMemo(
    () => (dayValue: string) => {
      const [year, month, day] = dayValue.split("-").map(Number);
      const date = new Date(year, month - 1, day, 12);

      return new Intl.DateTimeFormat(language === "it" ? "it-IT" : "en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(date);
    },
    [language]
  );

  const todaysDateLabel = useMemo(() => formatQuestDateLabel(localDay), [formatQuestDateLabel, localDay]);

  const pastDrawnQuests = useMemo(
    () =>
      drawHistory.filter(({ draw }) => draw.local_day !== localDay),
    [drawHistory, localDay]
  );

  useEffect(() => {
    setDraft(buildDraft(profile));
  }, [profile]);

  const questionnaireComplete = useMemo(
    () =>
      draft.goal.length > 0 &&
      draft.hard_situation.length > 0 &&
      !!draft.stretch_level &&
      draft.preferred_context.length > 0 &&
      draft.meaningful_type.length > 0 &&
      draft.progress_definition.length > 0,
    [draft]
  );

  const toggleMultiValue = <T extends string,>(
    key: keyof Pick<
      SideQuestQuestionnaireDraft,
      "goal" | "hard_situation" | "preferred_context" | "meaningful_type" | "progress_definition"
    >,
    value: T
  ) => {
    setDraft((current) => {
      const existing = current[key] as T[];
      return {
        ...current,
        [key]: existing.includes(value)
          ? existing.filter((item) => item !== value)
          : [...existing, value],
      };
    });
  };

  const toggleAvoidType = (value: SideQuestAvoidType) => {
    setDraft((current) => {
      const existing = current.avoid_types;
      return {
        ...current,
        avoid_types: existing.includes(value)
          ? existing.filter((item) => item !== value)
          : [...existing, value],
      };
    });
  };

  const submitProfile = async () => {
    try {
      await saveProfile(draft);
      captureEvent(SIDE_QUEST_EVENTS.QUESTIONNAIRE_COMPLETED, {
        entry_point: needsOnboarding ? "onboarding" : "edit_preferences",
        question_count: questionCount,
        goal_count: draft.goal.length,
        hard_situation_count: draft.hard_situation.length,
        preferred_context_count: draft.preferred_context.length,
        meaningful_type_count: draft.meaningful_type.length,
        avoid_types_count: draft.avoid_types.length,
        progress_definition_count: draft.progress_definition.length,
      });
      setEditingPreferences(false);
    } catch (error) {
      captureEvent(SIDE_QUEST_EVENTS.QUESTIONNAIRE_SAVE_FAILED, {
        entry_point: needsOnboarding ? "onboarding" : "edit_preferences",
        step_index: -1,
        message: (error as Error).message,
      });
      AppAlert.show(t("Error"), (error as Error).message);
    }
  };

  const fadeInQuest = () => {
    revealOpacity.setValue(0);
    Animated.timing(revealOpacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  };

  const handleDrawQuest = async () => {
    if (isDrawingQuest) return;

    setIsDrawingQuest(true);
    setIsRevealing(true);
    setRevealedQuest(null);
    captureEvent(SIDE_QUEST_EVENTS.DAILY_DRAW_STARTED, {
      ranked_count: rankedSideQuests.length,
      local_day: localDay,
    });

    try {
      const result = await drawTodaysQuest();

      if (result.status === "exhausted") {
        captureEvent(SIDE_QUEST_EVENTS.DAILY_DRAW_EXHAUSTED, { local_day: localDay });
        setIsRevealing(false);
        setRevealedQuest(null);
        setIsDrawingQuest(false);
      } else if (result.quest) {
        captureEvent(SIDE_QUEST_EVENTS.DAILY_DRAW_COMPLETED, { local_day: localDay });
        // The animation is already playing — pass the quest in so it can finish the reveal.
        setRevealedQuest(result.quest);
      } else {
        setIsRevealing(false);
        setRevealedQuest(null);
        setIsDrawingQuest(false);
      }
    } catch (error) {
      AppAlert.show(t("Error"), (error as Error).message);
      setIsRevealing(false);
      setRevealedQuest(null);
      setIsDrawingQuest(false);
    }
  };

  const handleRevealComplete = () => {
    fadeInQuest();
    setIsRevealing(false);
    setRevealedQuest(null);
    setIsDrawingQuest(false);
  };

  const handleRevealAbort = () => {
    setIsRevealing(false);
    setRevealedQuest(null);
    setIsDrawingQuest(false);
  };

  if (profileLoading) {
    return <Loader />;
  }

  if (profileError) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.pageTitle}>{t("Error")}</Text>
        <Text style={styles.subtitle}>{(profileError as Error).message}</Text>
      </View>
    );
  }

  if (needsOnboarding || editingPreferences) {
    return (
      <SideQuestQuestionnaire
        onAdvanceQuestion={(stepIndex, stepTitle) => {
          captureEvent(SIDE_QUEST_EVENTS.QUESTION_ADVANCED, {
            step_index: stepIndex,
            step_title: stepTitle,
            entry_point: needsOnboarding ? "onboarding" : "edit_preferences",
          });
        }}
        draft={draft}
        needsOnboarding={needsOnboarding}
        onStart={() => {
          if (!needsOnboarding) return;
          captureEvent(SIDE_QUEST_EVENTS.QUESTIONNAIRE_STARTED, {
            entry_point: "onboarding",
            question_count: questionCount,
          });
        }}
        onSubmit={submitProfile}
        onSetStretchLevel={(stretchLevel: SideQuestStretchLevel) => {
          setDraft((current) => ({ ...current, stretch_level: stretchLevel }));
        }}
        onToggleAvoidType={toggleAvoidType}
        onToggleGoal={(goal: SideQuestGoal) => toggleMultiValue("goal", goal)}
        onToggleHardSituation={(hardSituation: SideQuestHardSituation) => toggleMultiValue("hard_situation", hardSituation)}
        onToggleMeaningfulType={(meaningfulType: SideQuestMeaningfulType) => toggleMultiValue("meaningful_type", meaningfulType)}
        onTogglePreferredContext={(preferredContext: SideQuestPreferredContext) =>
          toggleMultiValue("preferred_context", preferredContext)
        }
        onToggleProgressDefinition={(progressDefinition: SideQuestProgressDefinition) =>
          toggleMultiValue("progress_definition", progressDefinition)
        }
        questionnaireComplete={questionnaireComplete}
        savingProfile={savingProfile}
      />
    );
  }

  if (!isRevealing && (sideQuestsLoading || drawHistoryLoading || (todaysQuestLoading && !todaysQuest))) {
    return <Loader />;
  }

  if (sideQuestsError) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.pageTitle}>{t("Error")}</Text>
        <Text style={styles.subtitle}>{(sideQuestsError as Error).message}</Text>
      </View>
    );
  }

  if (drawHistoryError) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.pageTitle}>{t("Error")}</Text>
        <Text style={styles.subtitle}>{(drawHistoryError as Error).message}</Text>
      </View>
    );
  }

  const isExhausted = todaysQuestState === "exhausted" && !todaysQuest;
  const showDraw = !todaysQuest && rankedSideQuests.length > 0 && !isExhausted;

  const showHeroSection = !todaysQuest || isRevealing;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <SideQuestDailyDraw
        isDrawingQuest={isDrawingQuest}
        isRevealing={isRevealing}
        localDayLabel={todaysDateLabel}
        onDrawQuest={handleDrawQuest}
        onRevealAbort={handleRevealAbort}
        onRevealComplete={handleRevealComplete}
        revealedQuest={revealedQuest}
        showDraw={showDraw}
        showHeroSection={showHeroSection}
      />

      <SideQuestResults
        isExhausted={isExhausted}
        isRevealing={isRevealing}
        rankedSideQuests={rankedSideQuests}
        revealOpacity={revealOpacity}
        todaysQuest={todaysQuest}
      />

      {!isRevealing && (
        <View style={styles.editPrefsWrap}>
          <Text style={styles.editPrefsPrompt}>{t("Want a different mix of side quests?")}</Text>
          <TouchableOpacity
            style={styles.editPrefs}
            onPress={() => {
              captureEvent(SIDE_QUEST_EVENTS.PREFERENCES_EDIT_STARTED, {
                entry_point: "results",
                question_count: questionCount,
              });
              setEditingPreferences(true);
            }}
          >
            <Text style={styles.editPrefsText}>{t("Edit preferences")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isRevealing && pastDrawnQuests.length > 0 && (
        <View style={styles.pastSection}>
          <Text style={styles.sectionTitle}>{t("Past side quests")}</Text>
          {pastDrawnQuests.map(({ draw, quest }) => (
            <View key={draw.id} style={styles.pastQuestCard}>
              <QuestPreviewCard
                title={quest.title}
                description={quest.summary}
                footerLabel={formatQuestDateLabel(draw.local_day)}
                onPress={() => router.push(`/quest/${quest.id}`)}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centeredState: {
    alignItems: "center",
    backgroundColor: colors.light.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  pastQuestCard: {
    marginBottom: 12,
  },
  pastSection: {
    paddingTop: 28,
  },
  editPrefs: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editPrefsPrompt: {
    color: colors.light.lightText,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  editPrefsText: {
    color: colors.light.lightText,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  editPrefsWrap: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 24,
  },
  pageTitle: {
    color: colors.light.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 6,
  },
  sectionTitle: {
    color: colors.sideQuest.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    color: colors.light.lightText,
    fontSize: 15,
    lineHeight: 22,
  },
});
