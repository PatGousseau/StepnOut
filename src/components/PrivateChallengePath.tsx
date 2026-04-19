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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    setDraft(buildDraft(profile));
  }, [profile]);

  useEffect(() => {
    if (needsOnboarding || editingPreferences) {
      setCurrentQuestionIndex(0);
    }
  }, [needsOnboarding, editingPreferences]);

  const needsOnboarding = !profile;
  const selectedChallenge = getSelectedChallenge(todaySet, selectedDifficulty);

  const questionnaireComplete = useMemo(
    () =>
      !!draft.goal &&
      !!draft.hard_situation &&
      !!draft.stretch_level &&
      !!draft.preferred_context &&
      !!draft.meaningful_type &&
      !!draft.progress_definition,
    [draft]
  );

  const toggleAvoidType = (value: PrivateChallengeAvoidType) => {
    setDraft((current) => {
      if (value === "none") {
        return { ...current, avoid_types: current.avoid_types.includes("none") ? [] : ["none"] };
      }

      const existing = current.avoid_types.filter((item) => item !== "none");
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
      title: "What do you want more of right now?",
      render: () => (
        <SingleSelectSection
          title="What do you want more of right now?"
          options={PRIVATE_CHALLENGE_GOAL_OPTIONS}
          selected={draft.goal}
          onSelect={(goal) => setDraft((current) => ({ ...current, goal }))}
        />
      ),
      isComplete: !!draft.goal,
    },
    {
      title: "Which situations feel hardest to you?",
      render: () => (
        <SingleSelectSection
          title="Which situations feel hardest to you?"
          options={PRIVATE_CHALLENGE_HARD_SITUATION_OPTIONS}
          selected={draft.hard_situation}
          onSelect={(hard_situation) => setDraft((current) => ({ ...current, hard_situation }))}
        />
      ),
      isComplete: !!draft.hard_situation,
    },
    {
      title: "How much stretch do you want most days?",
      render: () => (
        <SingleSelectSection
          title="How much stretch do you want most days?"
          options={PRIVATE_CHALLENGE_STRETCH_LEVEL_OPTIONS}
          selected={draft.stretch_level}
          onSelect={(stretch_level) => setDraft((current) => ({ ...current, stretch_level }))}
        />
      ),
      isComplete: !!draft.stretch_level,
    },
    {
      title: "Where do you want these challenges to happen most often?",
      render: () => (
        <SingleSelectSection
          title="Where do you want these challenges to happen most often?"
          options={PRIVATE_CHALLENGE_CONTEXT_OPTIONS}
          selected={draft.preferred_context}
          onSelect={(preferred_context) => setDraft((current) => ({ ...current, preferred_context }))}
        />
      ),
      isComplete: !!draft.preferred_context,
    },
    {
      title: "What kind of challenge feels most meaningful?",
      render: () => (
        <SingleSelectSection
          title="What kind of challenge feels most meaningful?"
          options={PRIVATE_CHALLENGE_MEANINGFUL_TYPE_OPTIONS}
          selected={draft.meaningful_type}
          onSelect={(meaningful_type) => setDraft((current) => ({ ...current, meaningful_type }))}
        />
      ),
      isComplete: !!draft.meaningful_type,
    },
    {
      title: "Which challenges should we avoid?",
      render: () => (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Which challenges should we avoid?")}</Text>
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
      title: "What would feel like progress in a month?",
      render: () => (
        <SingleSelectSection
          title="What would feel like progress in a month?"
          options={PRIVATE_CHALLENGE_PROGRESS_OPTIONS}
          selected={draft.progress_definition}
          onSelect={(progress_definition) => setDraft((current) => ({ ...current, progress_definition }))}
        />
      ),
      isComplete: !!draft.progress_definition,
    },
  ];

  const currentStep = questionnaireSteps[currentQuestionIndex];
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
    if (!currentStep?.isComplete) return;
    if (!isLastQuestion) {
      setCurrentQuestionIndex((current) => current + 1);
    }
  };

  const handleBackQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((current) => current - 1);
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
      <ScrollView style={styles.container} contentContainerStyle={styles.questionnaireContent}>
        <Text style={styles.pageTitle}>
          {t(needsOnboarding ? "Set up your path" : "Edit preferences")}
        </Text>
        <Text style={styles.subtitle}>
          {t("Answer a few quick questions so your daily challenges feel personal.")}
        </Text>
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

        <View style={styles.questionCard}>
          <Text style={styles.stepCounter}>
            {t("Question (current) of (total)", {
              current: currentQuestionIndex + 1,
              total: questionnaireSteps.length,
            })}
          </Text>
          {currentStep.render()}
        </View>

        <View style={styles.questionActions}>
          <TouchableOpacity
            style={[
              styles.questionSecondaryButton,
              currentQuestionIndex === 0 && styles.questionSecondaryButtonHidden,
            ]}
            disabled={currentQuestionIndex === 0}
            onPress={handleBackQuestion}
          >
            <Text style={styles.questionSecondaryButtonText}>{t("Back")}</Text>
          </TouchableOpacity>

          {isLastQuestion ? (
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
              style={[styles.primaryButton, !currentStep.isComplete && styles.disabledButton]}
              disabled={!currentStep.isComplete}
              onPress={handleNextQuestion}
            >
              <Text style={styles.primaryButtonText}>{t("Next")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    backgroundColor: colors.neutral.white,
    borderColor: colors.light.accent2,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionChipActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  optionText: {
    color: colors.light.text,
    fontSize: 14,
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
  questionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  questionCard: {
    backgroundColor: colors.light.cardBg,
    borderRadius: 12,
    marginTop: 8,
    padding: 18,
  },
  questionnaireContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    paddingBottom: 32,
  },
  questionSecondaryButton: {
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderColor: colors.light.accent2,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minWidth: 96,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    borderRadius: 12,
    marginTop: 8,
    minWidth: 110,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
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
    marginBottom: 18,
  },
  sectionTitle: {
    color: colors.light.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
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
  stepCounter: {
    color: colors.light.lightText,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  stepIndicator: {
    backgroundColor: colors.neutral.grey2,
    borderRadius: 999,
    flex: 1,
    height: 6,
    marginHorizontal: 3,
  },
  stepIndicatorActive: {
    backgroundColor: colors.light.accent,
  },
  stepIndicatorComplete: {
    backgroundColor: colors.light.primary,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  subtitle: {
    color: colors.light.lightText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
});
