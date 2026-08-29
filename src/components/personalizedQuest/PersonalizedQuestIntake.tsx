import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { usePersonalizedQuestIntake } from "../../hooks/usePersonalizedQuestIntake";
import { captureEvent } from "../../lib/posthog";
import { PERSONALIZED_QUEST_EVENTS } from "../../constants/analyticsEvents";
import { GeneratedQuestSet, SoloExperience } from "../../types/personalizedQuests";
import { FeatureActionButton } from "../FeatureActionButton";
import { ProgressSegments } from "../ProgressSegments";
import { QuestCard, ShareQuestExperience } from "../Quest";
import { Text } from "../StyledText";
import { IntakeReadback } from "./IntakeReadback";
import { IntakeTextQuestion } from "./IntakeTextQuestion";

type Step = "avoided" | "bail" | "context" | "followup" | "readback" | "quests";

const SOLO_OPTIONS: { id: SoloExperience; label: string }[] = [
  { id: "never", label: "Never" },
  { id: "once_or_twice", label: "Once or twice" },
  { id: "regularly", label: "Yeah, regularly" },
];

// The follow-up is conditional, so it is excluded from the progress count and
// the bar simply holds still on that screen.
const PROGRESS_STEPS: Step[] = ["avoided", "bail", "context", "readback", "quests"];

export const PersonalizedQuestIntake: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const {
    intakeId,
    followup,
    questSet,
    generating,
    generationFailed,
    start,
    trackStep,
    saveAnswer,
    startBackgroundWork,
    resolveFollowup,
    finalize,
    abandon,
  } = usePersonalizedQuestIntake();

  const [step, setStep] = useState<Step>("avoided");
  const [avoided, setAvoided] = useState("");
  const [bail, setBail] = useState("");
  const [solo, setSolo] = useState<SoloExperience | null>(null);
  const [location, setLocation] = useState("");
  const [followupAnswer, setFollowupAnswer] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await start();
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [start]);

  useEffect(() => {
    trackStep(step);
  }, [step, trackStep]);

  const progressIndex = useMemo(() => {
    const index = PROGRESS_STEPS.indexOf(step);
    // On the follow-up, hold the bar where the context step left it.
    return index === -1 ? PROGRESS_STEPS.indexOf("context") : index;
  }, [step]);

  const handleClose = useCallback(() => {
    // Once the quests exist the intake is already marked completed, so closing
    // here must not overwrite that status (or double-count in the funnel).
    if (step !== "quests" && !questSet) abandon(step);
    router.back();
  }, [abandon, questSet, router, step]);

  /**
   * The read-back is the payoff screen, so an empty one is worse than none.
   * If the model returned no lines, go straight to the quests.
   */
  const skipEmptyReadback = useCallback((generated: GeneratedQuestSet | null) => {
    if (generated && generated.readback.length === 0) {
      setStep("quests");
    }
  }, []);

  const goToBail = useCallback(async () => {
    if (!avoided.trim()) return;
    await saveAnswer({ answer_avoided: avoided.trim() });
    setStep("bail");
  }, [avoided, saveAnswer]);

  const goToContext = useCallback(async () => {
    if (!bail.trim()) return;
    await saveAnswer({ answer_bail: bail.trim() });

    // Both background calls start here. Steps 3 and 4 are their wall time.
    if (intakeId) startBackgroundWork(intakeId);

    setStep("context");
  }, [bail, intakeId, saveAnswer, startBackgroundWork]);

  const leaveContext = useCallback(async () => {
    if (!solo) return;
    await saveAnswer({ answer_solo_experience: solo, location_raw: location.trim() });

    const result = await resolveFollowup();

    if (result.skip || !result.question) {
      setStep("readback");
      const generated = await finalize(null);
      skipEmptyReadback(generated);
      return;
    }

    setStep("followup");
  }, [finalize, location, resolveFollowup, saveAnswer, skipEmptyReadback, solo]);

  const leaveFollowup = useCallback(async () => {
    setStep("readback");
    const generated = await finalize(followupAnswer.trim() || null);
    skipEmptyReadback(generated);
  }, [finalize, followupAnswer, skipEmptyReadback]);

  useEffect(() => {
    if (step === "readback" && questSet) {
      captureEvent(PERSONALIZED_QUEST_EVENTS.READBACK_VIEWED, {
        line_count: questSet.readback.length,
      });
    }
  }, [questSet, step]);

  const goToQuests = useCallback(() => {
    captureEvent(PERSONALIZED_QUEST_EVENTS.QUESTS_VIEWED, {
      quest_count: questSet?.quests.length ?? 0,
    });
    setStep("quests");
  }, [questSet]);

  if (starting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.sideQuest.base} />
        </View>
      </SafeAreaView>
    );
  }

  const renderStep = () => {
    switch (step) {
      case "avoided":
        return (
          <IntakeTextQuestion
            question="What's something you've been meaning to do for months and still haven't?"
            placeholder="that pottery class, travelling alone, asking someone out"
            value={avoided}
            onChangeText={setAvoided}
            onSubmit={goToBail}
            autoFocus
          />
        );

      case "bail":
        return (
          <IntakeTextQuestion
            question="What would make you bail on something you'd already said yes to?"
            placeholder="going alone, having to talk in front of people, late nights"
            value={bail}
            onChangeText={setBail}
            onSubmit={goToContext}
            autoFocus
          />
        );

      case "context":
        return (
          <View style={styles.contextStep}>
            <Text style={styles.question}>{t("Ever gone to something like that on your own?")}</Text>

            <View style={styles.optionsWrap}>
              {SOLO_OPTIONS.map((option) => {
                const active = solo === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSolo(option.id)}
                    style={[styles.optionChip, active && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {t(option.label)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>{t("Where are you based?")}</Text>
              <TextInput
                style={styles.locationInput}
                value={location}
                onChangeText={setLocation}
                placeholder={t("Milano, Navigli")}
                placeholderTextColor={colors.light.lightText}
                multiline={false}
                returnKeyType="done"
                maxLength={120}
              />
            </View>
          </View>
        );

      case "followup":
        return (
          <IntakeTextQuestion
            question={followup.question || ""}
            placeholder="a sentence is plenty"
            value={followupAnswer}
            onChangeText={setFollowupAnswer}
            onSubmit={leaveFollowup}
            autoFocus
          />
        );

      case "readback":
        if (generating || !questSet) {
          return (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.sideQuest.base} />
              <Text style={styles.waitingText}>{t("Working out what's in your way...")}</Text>
            </View>
          );
        }
        return <IntakeReadback lines={questSet.readback} />;

      case "quests": {
        // The 24-hour quest is the one they act on now, so it leads; the
        // weekend quest follows as what comes after it.
        const todayQuest = questSet?.quests.find((quest) => quest.horizon === "today");
        const weekendQuest = questSet?.quests.find((quest) => quest.horizon === "weekend");

        return (
          <View style={styles.questsStep}>
            {!!todayQuest && (
              <View style={styles.questBlock}>
                <Text style={styles.questsHeading}>{t("Your first challenge")}</Text>
                <Text style={styles.questsSubheading}>{t("Do this one in the next 24 hours")}</Text>
                <QuestCard quest={todayQuest} eyebrowText={t("Next 24 hours")} />
                <ShareQuestExperience quest={todayQuest} />
              </View>
            )}

            {!!weekendQuest && (
              <View style={styles.questBlockSecondary}>
                <Text style={styles.questsThenHeading}>{t("Then, this weekend")}</Text>
                <QuestCard quest={weekendQuest} eyebrowText={t("This weekend")} />
                <ShareQuestExperience quest={weekendQuest} />
              </View>
            )}
          </View>
        );
      }
    }
  };

  const renderFooter = () => {
    switch (step) {
      case "avoided":
        return (
          <FeatureActionButton
            title={t("Next")}
            onPress={goToBail}
            disabled={!avoided.trim()}
            tone="coral"
            variant="pill"
            fullWidth
          />
        );

      case "bail":
        return (
          <FeatureActionButton
            title={t("Next")}
            onPress={goToContext}
            disabled={!bail.trim()}
            tone="coral"
            variant="pill"
            fullWidth
          />
        );

      case "context":
        return (
          <FeatureActionButton
            title={t("Next")}
            onPress={leaveContext}
            disabled={!solo}
            tone="coral"
            variant="pill"
            fullWidth
          />
        );

      case "followup":
        return (
          <FeatureActionButton
            title={followupAnswer.trim() ? t("Next") : t("Skip")}
            onPress={leaveFollowup}
            tone="coral"
            variant="pill"
            fullWidth
          />
        );

      case "readback":
        if (generationFailed) {
          return (
            <FeatureActionButton
              title={t("Close")}
              onPress={handleClose}
              tone="coral"
              variant="pill"
              fullWidth
            />
          );
        }
        return (
          <FeatureActionButton
            title={t("Show me my first challenge")}
            onPress={goToQuests}
            disabled={generating || !questSet}
            tone="coral"
            variant="pill"
            fullWidth
          />
        );

      case "quests":
        return (
          <FeatureActionButton
            title={t("Done")}
            onPress={() => router.back()}
            tone="coral"
            variant="pill"
            fullWidth
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>{t("Close")}</Text>
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <ProgressSegments total={PROGRESS_STEPS.length} activeIndex={progressIndex} />
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {generationFailed && step === "readback" && (
            <Text style={styles.errorText}>
              {t("Something went wrong building your quests. Try again in a moment.")}
            </Text>
          )}
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>{renderFooter()}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  closeButton: {
    paddingVertical: 4,
  },
  closeText: {
    color: colors.light.lightText,
    fontSize: 15,
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  contextStep: {
    gap: 24,
  },
  errorText: {
    color: colors.sideQuest.text,
    fontSize: 15,
    marginBottom: 16,
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  locationBlock: {
    gap: 10,
  },
  locationInput: {
    borderBottomColor: colors.sideQuest.bgBorder,
    borderBottomWidth: 2,
    color: colors.light.text,
    fontSize: 18,
    paddingBottom: 10,
  },
  locationLabel: {
    color: colors.light.text,
    fontSize: 17,
    fontWeight: "600",
  },
  optionChip: {
    backgroundColor: colors.sideQuest.bg,
    borderColor: colors.sideQuest.bgBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionChipActive: {
    backgroundColor: colors.sideQuest.base,
    borderColor: colors.sideQuest.text,
  },
  optionText: {
    color: colors.sideQuest.textStrong,
    fontSize: 15,
  },
  optionTextActive: {
    color: colors.neutral.white,
    fontWeight: "600",
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  progressWrap: {
    flex: 1,
  },
  question: {
    color: colors.light.text,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  questBlock: {
    gap: 12,
  },
  questBlockSecondary: {
    borderTopColor: colors.sideQuest.bgBorder,
    borderTopWidth: 1,
    gap: 12,
    paddingTop: 28,
  },
  questsHeading: {
    color: colors.light.text,
    fontSize: 26,
    fontWeight: "800",
  },
  questsStep: {
    gap: 28,
  },
  questsSubheading: {
    color: colors.light.lightText,
    fontSize: 15,
    marginTop: -6,
  },
  questsThenHeading: {
    color: colors.light.lightText,
    fontSize: 17,
    fontWeight: "700",
  },
  waitingText: {
    color: colors.light.lightText,
    fontSize: 15,
  },
});
