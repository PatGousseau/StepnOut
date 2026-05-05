import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Easing, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./StyledText";
import { Loader } from "./Loader";
import { ProgressSegments } from "./ProgressSegments";
import { QuestCard, ShareQuestExperience } from "./Quest";
import { useLanguage } from "../contexts/LanguageContext";
import { useSideQuests } from "../hooks/useSideQuests";
import { colors } from "../constants/Colors";
import { captureEvent } from "../lib/posthog";
import {
  SIDE_QUEST_AVOID_OPTIONS,
  SIDE_QUEST_CONTEXT_OPTIONS,
  SIDE_QUEST_EMPTY_DRAFT,
  SIDE_QUEST_GOAL_OPTIONS,
  SIDE_QUEST_HARD_SITUATION_OPTIONS,
  SIDE_QUEST_MEANINGFUL_TYPE_OPTIONS,
  SIDE_QUEST_PROGRESS_OPTIONS,
  SIDE_QUEST_STRETCH_LEVEL_OPTIONS,
} from "../constants/sideQuestOptions";
import { SIDE_QUEST_EVENTS } from "../constants/analyticsEvents";
import {
  SideQuestAvoidType,
  SideQuestGoal,
  SideQuestQuestionnaireDraft,
} from "../types/sideQuests";

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

type SingleSelectSectionProps<T extends string> = {
  title: string;
  options: { id: T; label: string }[];
  selected: T | null;
  onSelect: (value: T) => void;
};

function SingleSelectSection<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: SingleSelectSectionProps<T>) {
  const { t } = useLanguage();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t(title)}</Text>
      <View style={styles.optionsWrap}>
        {options.map((option) => {
          const active = selected === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={[styles.optionChip, active && styles.optionChipActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{t(option.label)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

type MultiSelectSectionProps<T extends string> = {
  title: string;
  options: { id: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
  helperText?: string;
};

function MultiSelectSection<T extends string>({
  title,
  options,
  selected,
  onToggle,
  helperText,
}: MultiSelectSectionProps<T>) {
  const { t } = useLanguage();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t(title)}</Text>
      {!!helperText && <Text style={styles.helperText}>{t(helperText)}</Text>}
      <View style={styles.optionsWrap}>
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onToggle(option.id)}
              style={[styles.optionChip, active && styles.optionChipActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{t(option.label)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getGoalOptionLabel(goal: SideQuestGoal) {
  return SIDE_QUEST_GOAL_OPTIONS.find((option) => option.id === goal)?.label || goal;
}

export const SideQuestPath: React.FC = () => {
  const { t } = useLanguage();
  const {
    profile,
    profileLoading,
    profileError,
    rankedSideQuests,
    sideQuestsLoading,
    sideQuestsError,
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [isDrawingQuest, setIsDrawingQuest] = useState(false);
  const hatRotate = useRef(new Animated.Value(0)).current;
  const hatScale = useRef(new Animated.Value(1)).current;
  const revealOpacity = useRef(new Animated.Value(1)).current;
  const needsOnboarding = !profile;

  useEffect(() => {
    setDraft(buildDraft(profile));
  }, [profile]);

  useEffect(() => {
    if (needsOnboarding || editingPreferences) {
      setCurrentQuestionIndex(needsOnboarding ? -1 : 0);
    }
  }, [needsOnboarding, editingPreferences]);

  const showingIntroStep = currentQuestionIndex < 0;

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

  const questionnaireSteps = [
    {
      title: "What are you craving more of right now?",
      render: () => (
        <MultiSelectSection
          title="What are you craving more of right now?"
          options={SIDE_QUEST_GOAL_OPTIONS}
          selected={draft.goal}
          onToggle={(goal) => toggleMultiValue("goal", goal)}
          helperText="Choose all that sound right"
        />
      ),
      isComplete: draft.goal.length > 0,
    },
    {
      title: "What usually keeps you in the same routine?",
      render: () => (
        <MultiSelectSection
          title="What usually keeps you in the same routine?"
          options={SIDE_QUEST_HARD_SITUATION_OPTIONS}
          selected={draft.hard_situation}
          onToggle={(hard_situation) => toggleMultiValue("hard_situation", hard_situation)}
          helperText="Choose all that apply"
        />
      ),
      isComplete: draft.hard_situation.length > 0,
    },
    {
      title: "How much activation do you want from these?",
      render: () => (
        <SingleSelectSection
          title="How much activation do you want from these?"
          options={SIDE_QUEST_STRETCH_LEVEL_OPTIONS}
          selected={draft.stretch_level}
          onSelect={(stretch_level) => setDraft((current) => ({ ...current, stretch_level }))}
        />
      ),
      isComplete: !!draft.stretch_level,
    },
    {
      title: "Where should these fit most easily?",
      render: () => (
        <MultiSelectSection
          title="Where should these fit most easily?"
          options={SIDE_QUEST_CONTEXT_OPTIONS}
          selected={draft.preferred_context}
          onToggle={(preferred_context) => toggleMultiValue("preferred_context", preferred_context)}
          helperText="Choose all that fit your life"
        />
      ),
      isComplete: draft.preferred_context.length > 0,
    },
    {
      title: "What kind of side quest sounds most appealing?",
      render: () => (
        <MultiSelectSection
          title="What kind of side quest sounds most appealing?"
          options={SIDE_QUEST_MEANINGFUL_TYPE_OPTIONS}
          selected={draft.meaningful_type}
          onToggle={(meaningful_type) => toggleMultiValue("meaningful_type", meaningful_type)}
          helperText="Choose all that appeal to you"
        />
      ),
      isComplete: draft.meaningful_type.length > 0,
    },
    {
      title: "What should we steer away from?",
      render: () => (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("What should we steer away from?")}</Text>
          <Text style={styles.helperText}>{t("Choose all that apply")}</Text>
          <View style={styles.optionsWrap}>
            {SIDE_QUEST_AVOID_OPTIONS.map((option) => {
              const active = draft.avoid_types.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => toggleAvoidType(option.id)}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{t(option.label)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ),
      isComplete: true,
    },
    {
      title: "A month from now, what would make this feel worth it?",
      render: () => (
        <MultiSelectSection
          title="A month from now, what would make this feel worth it?"
          options={SIDE_QUEST_PROGRESS_OPTIONS}
          selected={draft.progress_definition}
          onToggle={(progress_definition) => toggleMultiValue("progress_definition", progress_definition)}
          helperText="Choose all that would matter to you"
        />
      ),
      isComplete: draft.progress_definition.length > 0,
    },
  ];

  const currentStep = currentQuestionIndex >= 0 ? questionnaireSteps[currentQuestionIndex] : null;
  const isLastQuestion = currentQuestionIndex === questionnaireSteps.length - 1;

  const handleNextQuestion = () => {
    if (showingIntroStep) {
      if (needsOnboarding) {
        captureEvent(SIDE_QUEST_EVENTS.QUESTIONNAIRE_STARTED, {
          entry_point: "onboarding",
          question_count: questionnaireSteps.length,
        });
      }
      setCurrentQuestionIndex(0);
      return;
    }

    if (!currentStep?.isComplete) return;
    captureEvent(SIDE_QUEST_EVENTS.QUESTION_ADVANCED, {
      step_index: currentQuestionIndex,
      step_title: currentStep.title,
      entry_point: needsOnboarding ? "onboarding" : "edit_preferences",
    });

    if (!isLastQuestion) setCurrentQuestionIndex((current) => current + 1);
  };

  const handleBackQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((current) => current - 1);
      return;
    }

    if (currentQuestionIndex === 0) {
      setCurrentQuestionIndex(-1);
    }
  };

  const submitProfile = async () => {
    try {
      await saveProfile(draft);
      captureEvent(SIDE_QUEST_EVENTS.QUESTIONNAIRE_COMPLETED, {
        entry_point: needsOnboarding ? "onboarding" : "edit_preferences",
        question_count: questionnaireSteps.length,
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
        step_index: currentQuestionIndex,
        message: (error as Error).message,
      });
      Alert.alert(t("Error"), (error as Error).message);
    }
  };

  const animateHat = async () => {
    hatRotate.setValue(0);
    hatScale.setValue(1);
    revealOpacity.setValue(0.4);

    await new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(hatScale, {
            toValue: 1.08,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(hatScale, {
            toValue: 1,
            duration: 200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(hatRotate, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });
  };

  const handleDrawQuest = async () => {
    if (isDrawingQuest) return;

    setIsDrawingQuest(true);
    captureEvent(SIDE_QUEST_EVENTS.DAILY_DRAW_STARTED, {
      ranked_count: rankedSideQuests.length,
      local_day: localDay,
    });

    try {
      const [, result] = await Promise.all([animateHat(), drawTodaysQuest()]);
      if (result.status === "exhausted") {
        captureEvent(SIDE_QUEST_EVENTS.DAILY_DRAW_EXHAUSTED, {
          local_day: localDay,
        });
      } else {
        captureEvent(SIDE_QUEST_EVENTS.DAILY_DRAW_COMPLETED, {
          local_day: localDay,
        });
      }
    } catch (error) {
      Alert.alert(t("Error"), (error as Error).message);
    } finally {
      Animated.timing(revealOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }).start();
      setIsDrawingQuest(false);
    }
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
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.questionnaireScreen}>
          <View style={styles.questionnaireHeader}>
            {!showingIntroStep && (
              <View style={styles.stepIndicatorRow}>
                <ProgressSegments total={questionnaireSteps.length} activeIndex={currentQuestionIndex} />
              </View>
            )}
          </View>

          <ScrollView
            style={styles.questionnaireScroll}
            contentContainerStyle={styles.questionnaireContent}
            showsVerticalScrollIndicator={false}
          >
            {showingIntroStep ? (
              <View style={styles.introSection}>
                <Text style={styles.introEyebrow}>{t("A break from the usual")}</Text>
                <Text style={styles.introTitle}>{t("Set up your path")}</Text>
                <Text style={styles.introBody}>
                  {t("Not everything worthwhile has to be part of the main plot. Sometimes the best moments come from doing something a little unexpected: a detour, a tiny adventure, a plan you would not normally make on an ordinary day.")}
                </Text>
                <Text style={styles.introBody}>
                  {t("This path is here to help you break out of autopilot with prompts that feel fun, fresh, and surprisingly doable for your real life.")}
                </Text>
              </View>
            ) : (
              currentStep?.render()
            )}
          </ScrollView>

          <View style={styles.questionActions}>
            <TouchableOpacity
              style={[styles.questionBackButton, showingIntroStep && styles.questionSecondaryButtonHidden]}
              disabled={showingIntroStep}
              onPress={handleBackQuestion}
            >
              <Text style={styles.questionBackButtonText}>{t("Back")}</Text>
            </TouchableOpacity>

            {!showingIntroStep && isLastQuestion ? (
              <TouchableOpacity
                style={[styles.questionNextButton, (!questionnaireComplete || savingProfile) && styles.disabledButton]}
                disabled={!questionnaireComplete || savingProfile}
                onPress={submitProfile}
              >
                <Text style={styles.questionNextButtonText}>{savingProfile ? t("Saving...") : t("Done")}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.questionNextButton, !showingIntroStep && !currentStep?.isComplete && styles.disabledButton]}
                disabled={!showingIntroStep && !currentStep?.isComplete}
                onPress={handleNextQuestion}
              >
                <Text style={styles.questionNextButtonText}>{showingIntroStep ? t("Let's begin") : t("Next")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (sideQuestsLoading || (todaysQuestLoading && !todaysQuest)) {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.pageTitle}>{t("Side quests for right now")}</Text>
          <Text style={styles.subtitle}>
            {t("Pick one quest out of the hat each day and let it pull you somewhere slightly unexpected.")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            captureEvent(SIDE_QUEST_EVENTS.PREFERENCES_EDIT_STARTED, {
              entry_point: "results",
              question_count: questionnaireSteps.length,
            });
            setEditingPreferences(true);
          }}
        >
          <Text style={styles.secondaryButtonText}>{t("Edit preferences")}</Text>
        </TouchableOpacity>
      </View>

      {rankedSideQuests.length === 0 ? (
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateTitle}>{t("No side quests yet.")}</Text>
          <Text style={styles.emptyStateBody}>
            {t("Once side quests are added, they will show up here ranked for your preferences.")}
          </Text>
        </View>
      ) : todaysQuestState === "exhausted" && !todaysQuest ? (
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateTitle}>{t("You have finished every quest in the hat.")}</Text>
          <Text style={styles.emptyStateBody}>
            {t("There are no new quests left to draw right now. Once more quests are added, you will be able to pull a new one here.")}
          </Text>
        </View>
      ) : todaysQuest ? (
        <Animated.View style={{ opacity: revealOpacity }}>
          <QuestCard quest={todaysQuest} />
          <View style={styles.questActions}>
            <View style={styles.matchPills}>
              {rankedSideQuests
                .find((quest) => quest.id === todaysQuest.id)
                ?.matched_goal_tags.slice(0, 2)
                .map((tag) => (
                  <View key={`${todaysQuest.id}-${tag}`} style={styles.matchPill}>
                    <Text style={styles.matchPillText}>{t(getGoalOptionLabel(tag))}</Text>
                  </View>
                ))}
            </View>
            <ShareQuestExperience quest={todaysQuest} />
          </View>
        </Animated.View>
      ) : (
        <View style={styles.hatStage}>
          <View style={styles.hatCard}>
            <Text style={styles.hatEyebrow}>{t("One pull per day")}</Text>
            <Text style={styles.hatTitle}>{t("Reach into the hat")}</Text>
            <Text style={styles.hatBody}>
              {t("We will pick one quest from your ranked list, weighted toward the ones that fit you best today.")}
            </Text>
            <Animated.View
              style={[
                styles.hatIconWrap,
                {
                  transform: [
                    {
                      rotate: hatRotate.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: ["0deg", "-8deg", "10deg", "-6deg", "0deg"],
                      }),
                    },
                    { scale: hatScale },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons name="hat-fedora" size={110} color="#E78945" />
            </Animated.View>
            <TouchableOpacity
              style={[styles.drawButton, isDrawingQuest && styles.disabledButton]}
              disabled={isDrawingQuest}
              onPress={handleDrawQuest}
            >
              <Text style={styles.drawButtonText}>{isDrawingQuest ? t("Shuffling...") : t("Pick a quest")}</Text>
            </TouchableOpacity>
          </View>
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
    padding: 16,
    paddingBottom: 32,
  },
  disabledButton: {
    opacity: 0.5,
  },
  drawButton: {
    alignItems: "center",
    backgroundColor: "#E78945",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
  },
  drawButtonText: {
    color: colors.neutral.white,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyStateBody: {
    color: colors.light.lightText,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyStateCard: {
    backgroundColor: colors.light.cardBg,
    borderRadius: 16,
    padding: 18,
  },
  emptyStateTitle: {
    color: colors.light.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  hatBody: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  hatCard: {
    backgroundColor: "#FFF7EF",
    borderColor: "#F2D2A8",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  hatEyebrow: {
    color: "#B86A20",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  hatIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  hatStage: {
    paddingTop: 12,
  },
  hatTitle: {
    color: colors.light.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 12,
    textAlign: "center",
  },
  headerCopy: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  helperText: {
    color: colors.light.lightText,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  introBody: {
    color: colors.light.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  introEyebrow: {
    color: colors.light.lightText,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  introSection: {
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  introTitle: {
    color: colors.light.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 16,
  },
  matchPill: {
    backgroundColor: "#FFE7CE",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  matchPillText: {
    color: "#B86A20",
    fontSize: 12,
    fontWeight: "600",
  },
  matchPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  optionChip: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.neutral.grey2,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionChipActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  optionText: {
    color: colors.light.text,
    fontSize: 14,
    fontWeight: "600",
  },
  optionTextActive: {
    color: colors.neutral.white,
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pageTitle: {
    color: colors.light.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 6,
  },
  questActions: {
    marginTop: 14,
  },
  questionnaireContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  questionnaireHeader: {
    paddingBottom: 10,
    paddingTop: 14,
  },
  questionnaireScreen: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionnaireScroll: {
    flex: 1,
  },
  questionActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 0,
    paddingTop: 14,
  },
  questionBackButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 4,
  },
  questionBackButtonText: {
    color: colors.light.lightText,
    fontSize: 14,
    fontWeight: "600",
  },
  questionNextButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: colors.light.primary,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 42,
    minWidth: 88,
    paddingHorizontal: 18,
  },
  questionNextButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: "700",
  },
  questionSecondaryButtonHidden: {
    opacity: 0,
  },
  section: {
    paddingTop: 10,
  },
  sectionTitle: {
    color: colors.light.text,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 10,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#D7DDE8",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: colors.light.text,
    fontSize: 14,
    fontWeight: "600",
  },
  stepIndicatorRow: {
    gap: 8,
  },
  subtitle: {
    color: colors.light.lightText,
    fontSize: 15,
    lineHeight: 22,
  },
});
