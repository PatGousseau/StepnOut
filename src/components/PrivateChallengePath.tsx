import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./StyledText";
import { Loader } from "./Loader";
import { useLanguage } from "../contexts/LanguageContext";
import { usePrivateChallenges } from "../hooks/usePrivateChallenges";
import { colors } from "../constants/Colors";
import {
  PRIVATE_CHALLENGE_AVOID_OPTIONS,
  PRIVATE_CHALLENGE_CONTEXT_OPTIONS,
  PRIVATE_CHALLENGE_EMPTY_DRAFT,
  PRIVATE_CHALLENGE_GOAL_OPTIONS,
  PRIVATE_CHALLENGE_HARD_SITUATION_OPTIONS,
  PRIVATE_CHALLENGE_MEANINGFUL_TYPE_OPTIONS,
  PRIVATE_CHALLENGE_PROGRESS_OPTIONS,
  PRIVATE_CHALLENGE_STRETCH_LEVEL_OPTIONS,
} from "../constants/privateChallengeOptions";
import {
  PrivateChallengeAvoidType,
  PrivateChallengeDifficulty,
  PrivateChallengeQuestionnaireDraft,
  PrivateChallengeSet,
} from "../types/privateChallenges";

function getSelectedChallenge(
  todaySet: PrivateChallengeSet | null,
  difficulty: PrivateChallengeDifficulty | null
) {
  if (!todaySet || !difficulty) return null;
  return todaySet.private_challenges.find((challenge) => challenge.difficulty === difficulty) || null;
}

function formatChallengeDate(date: string, language: "en" | "it") {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(language === "it" ? "it-IT" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildDraft(profile: ReturnType<typeof usePrivateChallenges>["profile"]): PrivateChallengeQuestionnaireDraft {
  if (!profile) return PRIVATE_CHALLENGE_EMPTY_DRAFT;
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

export const PrivateChallengePath: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    profile,
    profileLoading,
    profileError,
    todaySet,
    todaySetLoading,
    todaySetError,
    history,
    stats,
    saveProfile,
    savingProfile,
    completeChallenge,
    completingChallenge,
    skipToday,
    skippingToday,
  } = usePrivateChallenges();
  const [draft, setDraft] = useState<PrivateChallengeQuestionnaireDraft>(PRIVATE_CHALLENGE_EMPTY_DRAFT);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<PrivateChallengeDifficulty | null>(null);
  const [note, setNote] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const needsOnboarding = !profile;

  useEffect(() => {
    setDraft(buildDraft(profile));
  }, [profile]);

  useEffect(() => {
    if (needsOnboarding || editingPreferences) {
      setCurrentQuestionIndex(needsOnboarding ? -1 : 0);
    }
  }, [needsOnboarding, editingPreferences]);

  const showingIntroStep = needsOnboarding && currentQuestionIndex < 0;
  const selectedChallenge = getSelectedChallenge(todaySet, selectedDifficulty);

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

  const toggleMultiValue = <T extends string,>(key: keyof Pick<
    PrivateChallengeQuestionnaireDraft,
    "goal" | "hard_situation" | "preferred_context" | "meaningful_type" | "progress_definition"
  >, value: T) => {
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

  const toggleAvoidType = (value: PrivateChallengeAvoidType) => {
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
          options={PRIVATE_CHALLENGE_GOAL_OPTIONS}
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
          options={PRIVATE_CHALLENGE_HARD_SITUATION_OPTIONS}
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
          options={PRIVATE_CHALLENGE_STRETCH_LEVEL_OPTIONS}
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
          options={PRIVATE_CHALLENGE_CONTEXT_OPTIONS}
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
          options={PRIVATE_CHALLENGE_MEANINGFUL_TYPE_OPTIONS}
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
            {PRIVATE_CHALLENGE_AVOID_OPTIONS.map((option) => {
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
          options={PRIVATE_CHALLENGE_PROGRESS_OPTIONS}
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
  const getDifficultyColor = (difficulty: PrivateChallengeDifficulty) => {
    switch (difficulty) {
      case "easy":
        return colors.light.easyGreen;
      case "medium":
        return colors.light.mediumYellow;
      case "hard":
      default:
        return colors.light.hardRed;
    }
  };

  const handleNextQuestion = () => {
    if (showingIntroStep) {
      setCurrentQuestionIndex(0);
      return;
    }
    if (!currentStep?.isComplete) return;
    if (!isLastQuestion) {
      setCurrentQuestionIndex((current) => current + 1);
    }
  };

  const handleBackQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((current) => current - 1);
      return;
    }

    if (needsOnboarding && currentQuestionIndex === 0) {
      setCurrentQuestionIndex(-1);
    }
  };

  const submitProfile = async () => {
    try {
      await saveProfile(draft);
      setEditingPreferences(false);
    } catch (error) {
      Alert.alert(t("Error"), (error as Error).message);
    }
  };

  const submitCompletion = async () => {
    if (!todaySet || !selectedDifficulty) return;

    try {
      await completeChallenge({
        setId: todaySet.id,
        difficulty: selectedDifficulty,
        note,
      });
      setSelectedDifficulty(null);
      setNote("");
      Alert.alert(t("Done"), t("Challenge completed!"));
    } catch (error) {
      Alert.alert(t("Error"), (error as Error).message);
    }
  };

  const handleSkipToday = async () => {
    if (!todaySet) return;
    try {
      await skipToday(todaySet.id);
    } catch (error) {
      Alert.alert(t("Error"), (error as Error).message);
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
              <>
                <View style={styles.stepIndicatorRow}>
                  {questionnaireSteps.map((step, index) => (
                    <View
                      key={step.title}
                      style={[
                        styles.stepIndicator,
                        index < currentQuestionIndex && styles.stepIndicatorComplete,
                        index === currentQuestionIndex && styles.stepIndicatorActive,
                      ]}
                    />
                  ))}
                </View>
                {editingPreferences && (
                  <>
                    <Text style={styles.editingTitle}>{t("Edit preferences")}</Text>
                    <Text style={styles.editingSubtitle}>
                      {t("Fine-tune the kinds of side quests that fit your life right now.")}
                    </Text>
                  </>
                )}
              </>
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
              style={[
                styles.questionSecondaryButton,
                ((showingIntroStep || (!needsOnboarding && currentQuestionIndex === 0))) &&
                  styles.questionSecondaryButtonHidden,
              ]}
              disabled={showingIntroStep || (!needsOnboarding && currentQuestionIndex === 0)}
              onPress={handleBackQuestion}
            >
              <Text style={styles.questionSecondaryButtonText}>{t("Back")}</Text>
            </TouchableOpacity>

            {!showingIntroStep && isLastQuestion ? (
              <TouchableOpacity
                style={[styles.primaryButton, (!questionnaireComplete || savingProfile) && styles.disabledButton]}
                disabled={!questionnaireComplete || savingProfile}
                onPress={submitProfile}
              >
                <Text style={styles.primaryButtonText}>
                  {savingProfile ? t("Saving...") : t("Done")}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, !showingIntroStep && !currentStep?.isComplete && styles.disabledButton]}
                disabled={!showingIntroStep && !currentStep?.isComplete}
                onPress={handleNextQuestion}
              >
                <Text style={styles.primaryButtonText}>
                  {showingIntroStep ? t("Let's begin") : t("Next")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (todaySetLoading) {
    return <Loader />;
  }

  if (todaySetError) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.pageTitle}>{t("Error")}</Text>
        <Text style={styles.subtitle}>{(todaySetError as Error).message}</Text>
      </View>
    );
  }

  if (!todaySet) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.pageTitle}>{t("Error")}</Text>
        <Text style={styles.subtitle}>{t("Challenge not found")}</Text>
      </View>
    );
  }

  const completedChallenge = getSelectedChallenge(todaySet, todaySet.completed_difficulty);
  const recentHistory = history.slice(0, 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>{t("Today on your path")}</Text>
          <Text style={styles.subtitle}>{t("Complete any one of these today.")}</Text>
        </View>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingPreferences(true)}>
          <Text style={styles.secondaryButtonText}>{t("Edit preferences")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
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

      {todaySet.private_challenges.map((challenge) => {
        const isCompletedChoice = todaySet.completed_difficulty === challenge.difficulty;
        const locked = todaySet.status !== "pending";
        return (
          <View
            key={challenge.id}
            style={[
              styles.challengeCard,
              isCompletedChoice && styles.challengeCardComplete,
              locked && !isCompletedChoice && styles.challengeCardMuted,
            ]}
          >
            <View style={styles.challengeHeader}>
              <View style={[styles.challengeDifficultyPill, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
                <Text style={styles.challengeDifficulty}>{t(challenge.difficulty === "easy" ? "Easy" : challenge.difficulty === "medium" ? "Medium" : "Hard")}</Text>
              </View>
              <Text style={styles.challengeTheme}>{challenge.theme || t("Private")}</Text>
            </View>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeBody}>{challenge.description}</Text>
            <Text style={styles.metaLabel}>{t("Why this matters")}</Text>
            <Text style={styles.metaText}>{challenge.why_this_matters}</Text>
            {!!challenge.coaching_tip && (
              <>
                <Text style={styles.metaLabel}>{t("A small nudge")}</Text>
                <Text style={styles.metaText}>{challenge.coaching_tip}</Text>
              </>
            )}

            {todaySet.status === "pending" ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setSelectedDifficulty(challenge.difficulty);
                  setNote("");
                }}
              >
                <Text style={styles.primaryButtonText}>{t("Mark as done")}</Text>
              </TouchableOpacity>
            ) : isCompletedChoice ? (
              <View style={styles.completePill}>
                <Text style={styles.completePillText}>{t("Completed today")}</Text>
              </View>
            ) : null}
          </View>
        );
      })}

      {todaySet.status === "pending" ? (
        <TouchableOpacity
          style={[styles.secondaryWideButton, skippingToday && styles.disabledButton]}
          disabled={skippingToday}
          onPress={handleSkipToday}
        >
          <Text style={styles.secondaryWideButtonText}>{t("Skip today")}</Text>
        </TouchableOpacity>
      ) : todaySet.status === "skipped" ? (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>{t("Today skipped")}</Text>
          <Text style={styles.infoBannerBody}>{t("You can come back tomorrow for a new set.")}</Text>
        </View>
      ) : completedChallenge ? (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>{t("Completed today")}</Text>
          <Text style={styles.infoBannerBody}>{completedChallenge.title}</Text>
        </View>
      ) : null}

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>{t("Recent private history")}</Text>
        {recentHistory.length === 0 ? (
          <Text style={styles.emptyHistory}>{t("No private challenge history yet.")}</Text>
        ) : (
          recentHistory.map((set) => {
            const completed = getSelectedChallenge(set, set.completed_difficulty);
            return (
              <View key={set.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{formatChallengeDate(set.challenge_date, language)}</Text>
                  <Text style={styles.historyStatus}>
                    {set.status === "completed" ? t("Done") : set.status === "skipped" ? t("Skip") : t("Private")}
                  </Text>
                </View>
                <Text style={styles.historyBody}>
                  {completed?.title || t("Today skipped")}
                </Text>
                {!!set.completed_note && <Text style={styles.historyNote}>{set.completed_note}</Text>}
              </View>
            );
          })
        )}
      </View>

      <Modal visible={!!selectedDifficulty} transparent animationType="fade" onRequestClose={() => setSelectedDifficulty(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedChallenge?.title || t("Complete challenge")}</Text>
            <Text style={styles.modalSubtitle}>{t("Optional note")}</Text>
            <TextInput
              multiline
              placeholder={t("Keep this just for you...")}
              placeholderTextColor="#8B8B8B"
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setSelectedDifficulty(null)}>
                <Text style={styles.modalSecondaryText}>{t("Cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimaryButton, completingChallenge && styles.disabledButton]}
                disabled={completingChallenge}
                onPress={submitCompletion}
              >
                <Text style={styles.modalPrimaryText}>{t("Complete challenge")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  challengeBody: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  challengeCard: {
    backgroundColor: colors.light.cardBg,
    borderRadius: 12,
    marginBottom: 14,
    padding: 16,
  },
  challengeCardComplete: {
    borderColor: colors.light.success,
    borderWidth: 1,
  },
  challengeCardMuted: {
    opacity: 0.6,
  },
  centeredState: {
    alignItems: "center",
    backgroundColor: colors.light.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  challengeDifficulty: {
    color: colors.light.text,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  challengeDifficultyPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  challengeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  challengeTheme: {
    color: colors.light.lightText,
    fontSize: 12,
  },
  challengeTitle: {
    color: colors.light.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  completePill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.light.accent2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  completePillText: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: "700",
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
  emptyHistory: {
    color: colors.light.lightText,
    fontSize: 14,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  helperText: {
    color: colors.light.lightText,
    fontSize: 13,
    marginBottom: 8,
  },
  historyBody: {
    color: colors.light.text,
    fontSize: 15,
    fontWeight: "600",
  },
  historyDate: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  historyItem: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
  },
  historyNote: {
    color: colors.light.lightText,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 6,
  },
  historySection: {
    marginTop: 20,
  },
  historyStatus: {
    color: colors.light.lightText,
    fontSize: 13,
  },
  historyTitle: {
    color: colors.light.primary,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 12,
  },
  introBody: {
    color: colors.light.text,
    fontSize: 17,
    lineHeight: 28,
    marginTop: 16,
  },
  introEyebrow: {
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  introSection: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  introTitle: {
    color: colors.light.text,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 40,
    marginTop: 12,
  },
  infoBanner: {
    backgroundColor: colors.light.accent2,
    borderRadius: 12,
    marginTop: 2,
    padding: 14,
  },
  infoBannerBody: {
    color: colors.light.text,
    fontSize: 14,
    marginTop: 4,
  },
  infoBannerTitle: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  metaLabel: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 4,
    textTransform: "uppercase",
  },
  metaText: {
    color: colors.light.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 14,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.light.background,
    borderRadius: 16,
    padding: 18,
    width: "100%",
  },
  modalPrimaryButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  modalSecondaryButton: {
    backgroundColor: colors.neutral.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalSecondaryText: {
    color: colors.light.text,
    fontSize: 14,
    fontWeight: "600",
  },
  modalSubtitle: {
    color: colors.light.lightText,
    fontSize: 14,
    marginBottom: 8,
  },
  modalTitle: {
    color: colors.light.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  noteInput: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.light.accent2,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.light.text,
    fontSize: 15,
    minHeight: 110,
    padding: 12,
    textAlignVertical: "top",
  },
  optionChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    marginBottom: 8,
    marginRight: 8,
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionChipActive: {
    backgroundColor: colors.light.primary,
  },
  optionText: {
    color: "#666666",
    fontSize: 15,
    fontWeight: "600",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pageTitle: {
    color: colors.light.primary,
    fontSize: 28,
    fontWeight: "700",
  },
  editingSubtitle: {
    color: colors.light.lightText,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  editingTitle: {
    color: colors.light.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  questionActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingBottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  questionnaireContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  questionnaireHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  questionnaireScreen: {
    flex: 1,
  },
  questionnaireScroll: {
    flex: 1,
    marginTop: 20,
  },
  questionSecondaryButton: {
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  questionSecondaryButtonHidden: {
    opacity: 0,
  },
  questionSecondaryButtonText: {
    color: colors.light.text,
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 999,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.light.accent2,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryWideButton: {
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderColor: colors.light.accent2,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  secondaryWideButtonText: {
    color: colors.light.text,
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: colors.light.text,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 18,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 14,
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
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  stepIndicator: {
    backgroundColor: colors.neutral.grey2,
    borderRadius: 999,
    flex: 1,
    height: 5,
    marginHorizontal: 4,
  },
  stepIndicatorActive: {
    backgroundColor: colors.light.accent,
  },
  stepIndicatorComplete: {
    backgroundColor: colors.light.primary,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    marginBottom: 22,
  },
  subtitle: {
    color: colors.light.lightText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
});
