import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/Colors";
import {
  SIDE_QUEST_AVOID_OPTIONS,
  SIDE_QUEST_CONTEXT_OPTIONS,
  SIDE_QUEST_GOAL_OPTIONS,
  SIDE_QUEST_HARD_SITUATION_OPTIONS,
  SIDE_QUEST_MEANINGFUL_TYPE_OPTIONS,
  SIDE_QUEST_PROGRESS_OPTIONS,
  SIDE_QUEST_STRETCH_LEVEL_OPTIONS,
} from "../../constants/sideQuestOptions";
import { useLanguage } from "../../contexts/LanguageContext";
import { ProgressSegments } from "../ProgressSegments";
import { SideQuestHatSvg } from "../QuestPullAnimation";
import { Text } from "../StyledText";
import {
  SideQuestAvoidType,
  SideQuestGoal,
  SideQuestHardSituation,
  SideQuestMeaningfulType,
  SideQuestPreferredContext,
  SideQuestProgressDefinition,
  SideQuestQuestionnaireDraft,
  SideQuestStretchLevel,
} from "../../types/sideQuests";

const QUESTION_SWIPE_DISTANCE_THRESHOLD = 90;
const QUESTION_SWIPE_VELOCITY_THRESHOLD = 700;

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

type QuestionnaireRenderControls = {
  goNext: () => void;
  isTransitioning: boolean;
};

type QuestionnaireStep = {
  title: string;
  render: (controls: QuestionnaireRenderControls) => React.ReactNode;
  isComplete: boolean;
};

type SideQuestQuestionnaireProps = {
  draft: SideQuestQuestionnaireDraft;
  needsOnboarding: boolean;
  questionnaireComplete: boolean;
  savingProfile: boolean;
  onAdvanceQuestion: (stepIndex: number, stepTitle: string) => void;
  onStart: () => void;
  onSubmit: () => Promise<void>;
  onToggleGoal: (value: SideQuestGoal) => void;
  onToggleHardSituation: (value: SideQuestHardSituation) => void;
  onSetStretchLevel: (value: SideQuestStretchLevel) => void;
  onTogglePreferredContext: (value: SideQuestPreferredContext) => void;
  onToggleMeaningfulType: (value: SideQuestMeaningfulType) => void;
  onToggleAvoidType: (value: SideQuestAvoidType) => void;
  onToggleProgressDefinition: (value: SideQuestProgressDefinition) => void;
};

export function SideQuestQuestionnaire({
  draft,
  needsOnboarding,
  questionnaireComplete,
  savingProfile,
  onAdvanceQuestion,
  onStart,
  onSubmit,
  onToggleGoal,
  onToggleHardSituation,
  onSetStretchLevel,
  onTogglePreferredContext,
  onToggleMeaningfulType,
  onToggleAvoidType,
  onToggleProgressDefinition,
}: SideQuestQuestionnaireProps) {
  const { t } = useLanguage();
  const hasIntro = needsOnboarding;
  const pageOffset = hasIntro ? 1 : 0;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCurrentPageIndex(0);
  }, [hasIntro]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const questionnaireSteps: QuestionnaireStep[] = [
    {
      title: "What are you craving more of right now?",
      render: () => (
        <MultiSelectSection
          title="What are you craving more of right now?"
          options={SIDE_QUEST_GOAL_OPTIONS}
          selected={draft.goal}
          onToggle={onToggleGoal}
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
          onToggle={onToggleHardSituation}
          helperText="Choose all that apply"
        />
      ),
      isComplete: draft.hard_situation.length > 0,
    },
    {
      title: "How much activation do you want from these?",
      render: ({ goNext }) => (
        <SingleSelectSection
          title="How much activation do you want from these?"
          options={SIDE_QUEST_STRETCH_LEVEL_OPTIONS}
          selected={draft.stretch_level}
          onSelect={(stretchLevel) => {
            onSetStretchLevel(stretchLevel);
            goNext();
          }}
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
          onToggle={onTogglePreferredContext}
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
          onToggle={onToggleMeaningfulType}
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
                  onPress={() => onToggleAvoidType(option.id)}
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
          onToggle={onToggleProgressDefinition}
          helperText="Choose all that would matter to you"
        />
      ),
      isComplete: draft.progress_definition.length > 0,
    },
  ];

  const pageCount = questionnaireSteps.length + pageOffset;
  const showingIntroStep = hasIntro && currentPageIndex === 0;
  const currentQuestionIndex = showingIntroStep ? -1 : currentPageIndex - pageOffset;
  const currentStep = currentQuestionIndex >= 0 ? questionnaireSteps[currentQuestionIndex] : null;
  const isLastQuestion = currentQuestionIndex === questionnaireSteps.length - 1;
  const canSwipeBack = currentPageIndex > 0;
  const canSwipeForward = !showingIntroStep && !!currentStep?.isComplete;

  useEffect(() => {
    if (!pageWidth) return;
    translateX.setValue(-currentPageIndex * pageWidth);
  }, [currentPageIndex, pageWidth, translateX]);

  const animateToPage = useCallback((nextPageIndex: number) => {
    if (isTransitioning || nextPageIndex === currentPageIndex) return;

    if (!pageWidth) {
      setCurrentPageIndex(nextPageIndex);
      return;
    }

    setIsTransitioning(true);
    Animated.timing(translateX, {
      toValue: -nextPageIndex * pageWidth,
      duration: 240,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPageIndex(nextPageIndex);
      setIsTransitioning(false);
    });
  }, [currentPageIndex, isTransitioning, pageWidth, translateX]);

  const goBack = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    if (!canSwipeBack || isTransitioning) return;
    animateToPage(currentPageIndex - 1);
  }, [animateToPage, canSwipeBack, currentPageIndex, isTransitioning]);

  const goNext = useCallback(() => {
    if (showingIntroStep) {
      onStart();
      animateToPage(1);
      return;
    }

    if (!currentStep?.isComplete || isTransitioning) return;
    onAdvanceQuestion(currentQuestionIndex, currentStep.title);

    if (!isLastQuestion) {
      animateToPage(currentPageIndex + 1);
    }
  }, [
    animateToPage,
    currentPageIndex,
    currentQuestionIndex,
    currentStep,
    isLastQuestion,
    isTransitioning,
    onAdvanceQuestion,
    onStart,
    showingIntroStep,
  ]);

  const resetToCurrentPage = useCallback(() => {
    Animated.spring(translateX, {
      toValue: -currentPageIndex * pageWidth,
      friction: 10,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [currentPageIndex, pageWidth, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          (canSwipeBack || canSwipeForward) &&
          !isTransitioning &&
          Math.abs(gestureState.dx) > 8 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          (canSwipeBack || canSwipeForward) &&
          !isTransitioning &&
          Math.abs(gestureState.dx) > 8 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderMove: (_, gestureState) => {
          const baseOffset = -currentPageIndex * pageWidth;
          const minOffset = canSwipeForward && !isLastQuestion ? -(currentPageIndex + 1) * pageWidth : baseOffset;
          const maxOffset = canSwipeBack ? -(currentPageIndex - 1) * pageWidth : baseOffset;
          const nextOffset = baseOffset + gestureState.dx;
          translateX.setValue(Math.max(minOffset, Math.min(maxOffset, nextOffset)));
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldGoBack =
            canSwipeBack && (
              gestureState.dx > QUESTION_SWIPE_DISTANCE_THRESHOLD ||
              gestureState.vx > QUESTION_SWIPE_VELOCITY_THRESHOLD / 1000
            );
          const shouldGoForward =
            canSwipeForward && (
              gestureState.dx < -QUESTION_SWIPE_DISTANCE_THRESHOLD ||
              gestureState.vx < -QUESTION_SWIPE_VELOCITY_THRESHOLD / 1000
            );

          if (shouldGoForward && !isLastQuestion) {
            goNext();
            return;
          }

          if (shouldGoForward && isLastQuestion) {
            onSubmit();
            return;
          }

          if (shouldGoBack) {
            goBack();
            return;
          }

          resetToCurrentPage();
        },
        onPanResponderTerminate: () => {
          resetToCurrentPage();
        },
      }),
    [canSwipeBack, canSwipeForward, currentPageIndex, goBack, goNext, isLastQuestion, isTransitioning, onSubmit, pageWidth, resetToCurrentPage, translateX]
  );

  const pages = hasIntro
    ? [-1, ...questionnaireSteps.map((_, index) => index)]
    : questionnaireSteps.map((_, index) => index);

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

        <View
          style={styles.questionnaireViewport}
          {...panResponder.panHandlers}
          onLayout={(event) => {
            const nextWidth = event.nativeEvent.layout.width;
            if (nextWidth !== pageWidth) {
              setPageWidth(nextWidth);
            }
          }}
        >
          <Animated.View
            style={[
              styles.questionnairePages,
              {
                width: Math.max(pageWidth, 1) * pageCount,
                transform: [{ translateX }],
              },
            ]}
          >
            {pages.map((pageIndex) => (
              <View
                key={pageIndex < 0 ? "intro" : `question-${pageIndex}`}
                style={[styles.questionnairePage, { width: Math.max(pageWidth, 1) }]}
              >
                <ScrollView
                  contentContainerStyle={styles.questionnaireContent}
                  keyboardShouldPersistTaps="handled"
                  scrollEnabled={!isTransitioning}
                  showsVerticalScrollIndicator={false}
                >
                  {pageIndex < 0 ? (
                    <View style={styles.introSection}>
                      <View style={styles.introHero}>
                        <View style={styles.introHeroGlow} />
                        <View style={styles.introHeroLineOne} />
                        <View style={styles.introHeroLineTwo} />
                        <View style={styles.introHeroLineThree} />
                        <View style={styles.introHeroContent}>
                          <View style={styles.introBadge}>
                            <SideQuestHatSvg width={44} height={44} />
                          </View>
                          <View style={styles.introHeaderCopy}>
                            <Text style={styles.introTitle}>{t("Side quests")}</Text>
                            <Text style={styles.introEyebrow}>{t("A break from the usual")}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.introContentBlock}>
                        <Text style={styles.introBody}>
                          {t("The goal is to help you break out of autopilot with prompts that feel fun, fresh, and surprisingly doable in real life.")}
                        </Text>

                        <View style={styles.introPoints}>
                          <View style={styles.introPoint}>
                            <View style={styles.introPointIcon}>
                              <Text style={styles.introPointNumber}>{t("1")}</Text>
                            </View>
                            <View style={styles.introPointCopy}>
                              <Text style={styles.introPointTitle}>{t("Answer a few quick questions")}</Text>
                              <Text style={styles.introPointText}>
                                {t("Tell us what sounds good, what fits your life, and how much of a stretch you want.")}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.introPoint}>
                            <View style={styles.introPointIcon}>
                              <Text style={styles.introPointNumber}>{t("2")}</Text>
                            </View>
                            <View style={styles.introPointCopy}>
                              <Text style={styles.introPointTitle}>{t("Draw one side quest each day")}</Text>
                              <Text style={styles.introPointText}>
                                {t("Each day, you'll get the chance to pull a new quest from the hat.")}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.introPoint}>
                            <View style={styles.introPointIcon}>
                              <Text style={styles.introPointNumber}>{t("3")}</Text>
                            </View>
                            <View style={styles.introPointCopy}>
                              <Text style={styles.introPointTitle}>{t("Build a little more variety")}</Text>
                              <Text style={styles.introPointText}>
                                {t("Over time, these quests are meant to help you break routine and try things you might not have picked on your own.")}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.introButton} onPress={goNext}>
                        <Text style={styles.introButtonText}>{t("Let's begin")}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    questionnaireSteps[pageIndex].render({
                      goNext: () => {
                        if (autoAdvanceTimeoutRef.current) {
                          clearTimeout(autoAdvanceTimeoutRef.current);
                        }

                        autoAdvanceTimeoutRef.current = setTimeout(() => {
                          goNext();
                          autoAdvanceTimeoutRef.current = null;
                        }, 160);
                      },
                      isTransitioning,
                    })
                  )}
                </ScrollView>
              </View>
            ))}
          </Animated.View>
        </View>

        {!showingIntroStep && (
          <View style={styles.questionActions}>
            {isLastQuestion ? (
              <TouchableOpacity
                style={[styles.questionNextButton, (!questionnaireComplete || savingProfile || isTransitioning) && styles.disabledButton]}
                disabled={!questionnaireComplete || savingProfile || isTransitioning}
                onPress={onSubmit}
              >
                <Text style={styles.questionNextButtonText}>{savingProfile ? t("Saving...") : t("Done")}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.questionNextButton, (!currentStep?.isComplete || isTransitioning) && styles.disabledButton]}
                disabled={!currentStep?.isComplete || isTransitioning}
                onPress={goNext}
              >
                <Text style={styles.questionNextButtonText}>{t("Next")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  helperText: {
    color: colors.light.lightText,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  introBadge: {
    alignItems: "center",
    backgroundColor: colors.sideQuest.overlay,
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  introBody: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 2,
  },
  introButton: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  introButtonText: {
    color: colors.neutral.white,
    fontSize: 15,
    fontWeight: "700",
  },
  introContentBlock: {
    paddingHorizontal: 4,
  },
  introEyebrow: {
    color: colors.sideQuest.text,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 0,
    textTransform: "uppercase",
  },
  introHeaderCopy: {
    flex: 1,
  },
  introHero: {
    backgroundColor: colors.sideQuest.bg,
    borderColor: colors.sideQuest.bgBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
    paddingLeft: 16,
    paddingRight: 20,
    paddingVertical: 20,
    position: "relative",
  },
  introHeroContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    position: "relative",
    zIndex: 1,
  },
  introHeroGlow: {
    backgroundColor: colors.sideQuest.tint,
    borderRadius: 999,
    height: 160,
    position: "absolute",
    right: -34,
    top: -46,
    width: 160,
  },
  introHeroLineOne: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 110,
    position: "absolute",
    right: -18,
    top: 18,
    transform: [{ rotate: "14deg" }],
    width: 110,
  },
  introHeroLineThree: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 86,
    position: "absolute",
    right: 18,
    top: 54,
    transform: [{ rotate: "-10deg" }],
    width: 86,
  },
  introHeroLineTwo: {
    backgroundColor: colors.sideQuest.fill,
    borderRadius: 999,
    height: 10,
    position: "absolute",
    right: 26,
    top: 32,
    transform: [{ rotate: "-18deg" }],
    width: 74,
  },
  introPoint: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  introPointCopy: {
    flex: 1,
  },
  introPointIcon: {
    alignItems: "center",
    backgroundColor: colors.sideQuest.bgAlt,
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    marginTop: 2,
    width: 30,
  },
  introPointNumber: {
    color: colors.sideQuest.text,
    fontSize: 14,
    fontWeight: "800",
  },
  introPointText: {
    color: colors.light.lightText,
    fontSize: 14,
    lineHeight: 20,
  },
  introPointTitle: {
    color: colors.light.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },
  introPoints: {
    gap: 14,
    marginTop: 20,
  },
  introSection: {
    flex: 1,
    justifyContent: "flex-start",
    paddingBottom: 24,
    paddingTop: 10,
  },
  introTitle: {
    color: colors.light.text,
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 30,
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
  questionnaireContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  questionnaireHeader: {
    paddingBottom: 10,
    paddingTop: 14,
  },
  questionnairePage: {
    flexShrink: 0,
  },
  questionnairePages: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  questionnaireScreen: {
    flex: 1,
    paddingHorizontal: 16,
    position: "relative",
  },
  questionnaireViewport: {
    flex: 1,
    overflow: "hidden",
    paddingBottom: 84,
  },
  questionActions: {
    backgroundColor: colors.light.background,
    bottom: 0,
    left: 16,
    paddingBottom: 4,
    paddingTop: 14,
    position: "absolute",
    right: 16,
  },
  questionNextButton: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
    width: "100%",
  },
  questionNextButtonText: {
    color: colors.neutral.white,
    fontSize: 15,
    fontWeight: "700",
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
  stepIndicatorRow: {
    gap: 8,
  },
});
