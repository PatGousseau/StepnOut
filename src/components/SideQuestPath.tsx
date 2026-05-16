import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, PanResponder, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./StyledText";
import { Loader } from "./Loader";
import { ProgressSegments } from "./ProgressSegments";
import { QuestCard, ShareQuestExperience } from "./Quest";
import { QuestHatIdle, QuestPullAnimation, SideQuestHatSvg } from "./QuestPullAnimation";
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
  SideQuest,
  SideQuestAvoidType,
  SideQuestGoal,
  SideQuestQuestionnaireDraft,
} from "../types/sideQuests";

const QUESTION_SWIPE_DISTANCE_THRESHOLD = 90;
const QUESTION_SWIPE_VELOCITY_THRESHOLD = 700;

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

type QuestionnaireRenderControls = {
  goNext: () => void;
  isTransitioning: boolean;
};

type QuestionnaireStep = {
  title: string;
  render: (controls: QuestionnaireRenderControls) => React.ReactNode;
  isComplete: boolean;
};

type QuestionnaireFlowProps = {
  onAdvanceQuestion: (stepIndex: number, stepTitle: string) => void;
  onStart: () => void;
  onSubmit: () => Promise<void>;
  questionnaireComplete: boolean;
  savingProfile: boolean;
  showIntroInitially: boolean;
  steps: QuestionnaireStep[];
};

function QuestionnaireFlow({
  onAdvanceQuestion,
  onStart,
  onSubmit,
  questionnaireComplete,
  savingProfile,
  showIntroInitially,
  steps,
}: QuestionnaireFlowProps) {
  const { t } = useLanguage();
  const hasIntro = showIntroInitially;
  const pageOffset = hasIntro ? 1 : 0;
  const pageCount = steps.length + pageOffset;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showingIntroStep = hasIntro && currentPageIndex === 0;
  const currentQuestionIndex = showingIntroStep ? -1 : currentPageIndex - pageOffset;
  const currentStep = currentQuestionIndex >= 0 ? steps[currentQuestionIndex] : null;
  const isLastQuestion = currentQuestionIndex === steps.length - 1;
  const canSwipeBack = currentPageIndex > 0;
  const canSwipeForward = !showingIntroStep && !isLastQuestion && !!currentStep?.isComplete;

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

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
          const minOffset = canSwipeForward ? -(currentPageIndex + 1) * pageWidth : baseOffset;
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

          if (shouldGoForward) {
            goNext();
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
    [canSwipeBack, canSwipeForward, currentPageIndex, goBack, goNext, isTransitioning, pageWidth, resetToCurrentPage, translateX]
  );

  const pages = hasIntro
    ? [-1, ...steps.map((_, index) => index)]
    : steps.map((_, index) => index);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.questionnaireScreen}>
        <View style={styles.questionnaireHeader}>
          {!showingIntroStep && (
            <View style={styles.stepIndicatorRow}>
              <ProgressSegments total={steps.length} activeIndex={currentQuestionIndex} />
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
                    steps[pageIndex].render({
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

export const SideQuestPath: React.FC = () => {
  const { t, language } = useLanguage();
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
  const [isDrawingQuest, setIsDrawingQuest] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedQuest, setRevealedQuest] = useState<SideQuest | null>(null);
  const revealOpacity = useRef(new Animated.Value(1)).current;
  const needsOnboarding = !profile;
  const todaysDateLabel = useMemo(() => {
    const [year, month, day] = localDay.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);

    return new Intl.DateTimeFormat(language === "it" ? "it-IT" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);
  }, [language, localDay]);

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

  const questionnaireSteps: QuestionnaireStep[] = [
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
      render: ({ goNext }) => (
        <SingleSelectSection
          title="How much activation do you want from these?"
          options={SIDE_QUEST_STRETCH_LEVEL_OPTIONS}
          selected={draft.stretch_level}
          onSelect={(stretch_level) => {
            setDraft((current) => ({ ...current, stretch_level }));
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
        step_index: -1,
        message: (error as Error).message,
      });
      Alert.alert(t("Error"), (error as Error).message);
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
      Alert.alert(t("Error"), (error as Error).message);
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
      <QuestionnaireFlow
        onAdvanceQuestion={(stepIndex, stepTitle) => {
          captureEvent(SIDE_QUEST_EVENTS.QUESTION_ADVANCED, {
            step_index: stepIndex,
            step_title: stepTitle,
            entry_point: needsOnboarding ? "onboarding" : "edit_preferences",
          });
        }}
        onStart={() => {
          if (!needsOnboarding) return;
          captureEvent(SIDE_QUEST_EVENTS.QUESTIONNAIRE_STARTED, {
            entry_point: "onboarding",
            question_count: questionnaireSteps.length,
          });
        }}
        onSubmit={submitProfile}
        questionnaireComplete={questionnaireComplete}
        savingProfile={savingProfile}
        showIntroInitially={needsOnboarding}
        steps={questionnaireSteps}
      />
    );
  }

  if (!isRevealing && (sideQuestsLoading || (todaysQuestLoading && !todaysQuest))) {
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

  const isExhausted = todaysQuestState === "exhausted" && !todaysQuest;
  const showDraw = !todaysQuest && rankedSideQuests.length > 0 && !isExhausted;

  const showHeroSection = !todaysQuest || isRevealing;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {showHeroSection && (
        <View style={styles.heroSection}>
          <View style={styles.heroGlow} />
          <View style={styles.heroLineOne} />
          <View style={styles.heroLineTwo} />
          <View style={styles.heroLineThree} />
          <View style={styles.heroContent}>
            <View style={styles.eyebrowWrap}>
              <Text style={styles.eyebrow}>{t("Side Quests")}</Text>
              <Text style={styles.eyebrowSub}>{todaysDateLabel}</Text>
            </View>

            {(showDraw || isRevealing) && (
              <View style={styles.heroStage}>
                <View style={styles.heroVisualSlot}>
                  <View style={[styles.heroVisualBase, isRevealing && styles.heroVisualBaseHidden]}>
                    <QuestHatIdle />
                  </View>
                </View>

                <Text style={[styles.heroBody, isRevealing && styles.heroBodyHidden]}>
                  {t("Today's side quest is ready to be pulled. Pick from the hat and see where it leads!")}
                </Text>

                {isRevealing && (
                  <View style={styles.heroAnimationOverlay}>
                    <QuestPullAnimation
                      quest={revealedQuest}
                      onComplete={handleRevealComplete}
                      onAbort={handleRevealAbort}
                    />
                  </View>
                )}
              </View>
            )}

            {(showDraw || isRevealing) && (
              <View style={styles.ctaWrap}>
                <TouchableOpacity
                  style={[styles.drawButton, (isDrawingQuest || isRevealing) && styles.disabledButton]}
                  disabled={isDrawingQuest || isRevealing}
                  onPress={handleDrawQuest}
                >
                  <Text style={styles.drawButtonText}>{t("Pick a quest")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {rankedSideQuests.length === 0 ? (
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyStateIcon}>
            <MaterialCommunityIcons name="compass-outline" size={20} color={colors.sideQuest.text} />
          </View>
          <Text style={styles.emptyStateTitle}>{t("No side quests yet.")}</Text>
          <Text style={styles.emptyStateBody}>
            {t("Once side quests are added, they will show up here ranked for your preferences.")}
          </Text>
        </View>
      ) : isExhausted && !isRevealing ? (
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyStateIcon}>
            <MaterialCommunityIcons name="check-all" size={20} color={colors.sideQuest.text} />
          </View>
          <Text style={styles.emptyStateTitle}>{t("You have finished every quest in the hat.")}</Text>
          <Text style={styles.emptyStateBody}>
            {t("There are no new quests left to draw right now. Once more quests are added, you will be able to pull a new one here.")}
          </Text>
        </View>
      ) : todaysQuest && !isRevealing ? (
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
      ) : null}

      {!isRevealing && (
        <View style={styles.editPrefsWrap}>
          <Text style={styles.editPrefsPrompt}>{t("Want a different mix of side quests?")}</Text>
          <TouchableOpacity
            style={styles.editPrefs}
            onPress={() => {
              captureEvent(SIDE_QUEST_EVENTS.PREFERENCES_EDIT_STARTED, {
                entry_point: "results",
                question_count: questionnaireSteps.length,
              });
              setEditingPreferences(true);
            }}
          >
            <Text style={styles.editPrefsText}>{t("Edit preferences")}</Text>
          </TouchableOpacity>
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
  disabledButton: {
    opacity: 0.5,
  },
  drawButton: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  drawButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: "700",
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
  ctaWrap: {
    alignSelf: "center",
    marginTop: 4,
    width: "80%",
  },
  eyebrow: {
    color: colors.sideQuest.text,
    fontSize: 24,
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
    marginBottom: 24,
    width: "80%",
  },
  heroBody: {
    alignSelf: "center",
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
    width: "84%",
  },
  heroAnimationOverlay: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "flex-start",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroBodyHidden: {
    opacity: 0,
  },
  heroContent: {
    minHeight: 410,
    position: "relative",
    zIndex: 1,
  },
  heroStage: {
    position: "relative",
  },
  heroVisualBase: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  heroVisualBaseHidden: {
    opacity: 0,
  },
  heroVisualSlot: {
    alignItems: "center",
    height: 240,
    justifyContent: "flex-end",
    marginBottom: 4,
    position: "relative",
  },
  heroGlow: {
    backgroundColor: colors.sideQuest.tint,
    borderRadius: 999,
    height: 152,
    left: -40,
    position: "absolute",
    top: -52,
    width: 152,
  },
  heroLineOne: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 108,
    left: -10,
    position: "absolute",
    top: 20,
    transform: [{ rotate: "16deg" }],
    width: 108,
  },
  heroLineThree: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 74,
    left: 74,
    position: "absolute",
    top: 56,
    transform: [{ rotate: "-10deg" }],
    width: 74,
  },
  heroLineTwo: {
    backgroundColor: colors.sideQuest.fill,
    borderRadius: 999,
    height: 16,
    left: 92,
    position: "absolute",
    top: 10,
    transform: [{ rotate: "-18deg" }],
    width: 64,
  },
  heroSection: {
    backgroundColor: colors.sideQuest.bg,
    borderColor: colors.sideQuest.bgBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    position: "relative",
  },
  helperText: {
    color: colors.light.lightText,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
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
  introBadge: {
    alignItems: "center",
    backgroundColor: colors.sideQuest.overlay,
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    width: 64,
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
    paddingVertical: 20,
    paddingLeft: 16,
    paddingRight: 20,
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
  pageTitle: {
    color: colors.light.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 6,
  },
  questActions: {
    alignSelf: "center",
    marginTop: 0,
    width: "80%",
  },
  questBlock: {
    paddingTop: 4,
  },
  questionnaireContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  questionnaireHeader: {
    paddingBottom: 10,
    paddingTop: 14,
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
  questionnairePages: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  questionnairePage: {
    flexShrink: 0,
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
  subtitle: {
    color: colors.light.lightText,
    fontSize: 15,
    lineHeight: 22,
  },
});
