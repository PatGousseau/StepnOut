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
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GROWTH_GUIDANCE_EVENTS } from "../../constants/analyticsEvents";
import { colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { captureEvent } from "../../lib/posthog";
import { growthGuidanceService } from "../../services/growthGuidanceService";
import {
  EMPTY_GROWTH_INTAKE,
  GrowthChallengeLevel,
  GrowthIntakeAnswers,
  GrowthPlanProposal,
} from "../../types/growthGuidance";
import {
  countWords,
  getGrowthIntakeResumeStep,
  MIN_GROWTH_CLARIFICATION_WORDS,
} from "../../utils/growthGuidance";
import { ProgressSegments } from "../ProgressSegments";
import { Text } from "../StyledText";
import { GrowthPlanCard } from "./GrowthPlanCard";
import { GrowthPlanExperience } from "./GrowthPlanExperience";
import { GrowthButton } from "./GrowthUI";

type Step =
  | "intro"
  | "situation"
  | "direction"
  | "attempts"
  | "barriers"
  | "preferences"
  | "boundaries"
  | "clarification"
  | "proposal"
  | "correction"
  | "confirmed";

const INTAKE_STEPS: Step[] = [
  "situation",
  "direction",
  "attempts",
  "barriers",
  "preferences",
  "boundaries",
  "proposal",
];

function QuestionInput({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <View style={styles.questionBlock}>
      <Text style={styles.question}>{t(label)}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={t(placeholder)}
        placeholderTextColor={colors.light.lightText}
        multiline
        maxLength={800}
        textAlignVertical="top"
      />
    </View>
  );
}

export function PersonalizedGrowthIntake() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [step, setStep] = useState<Step>("intro");
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<GrowthIntakeAnswers>({ ...EMPTY_GROWTH_INTAKE });
  const [plan, setPlan] = useState<GrowthPlanProposal | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState("");
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [clarificationContext, setClarificationContext] = useState<"intake" | "correction">(
    "intake"
  );
  const [pendingCorrection, setPendingCorrection] = useState("");
  const [correction, setCorrection] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const clarificationWordCount = countWords(clarificationAnswer);
  const clarificationCanContinue = clarificationContext === "correction"
    ? !!clarificationAnswer.trim()
    : clarificationWordCount >= MIN_GROWTH_CLARIFICATION_WORDS;

  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setLoading(false);
      return;
    }
    Promise.all([
      growthGuidanceService.fetchCurrentPlan(user.id),
      growthGuidanceService.fetchLatestInProgressIntake(user.id),
    ])
      .then(async ([current, draft]) => {
        if (!active) return;
        if (current) {
          setPlan(current);
          setIntakeId(current.intake_id);
          setStep(current.status === "active" ? "confirmed" : "proposal");
          return;
        }
        if (draft) {
          const restoredAnswers = { ...EMPTY_GROWTH_INTAKE, ...draft.answers };
          setAnswers(restoredAnswers);
          setIntakeId(draft.id);
          setStep(getGrowthIntakeResumeStep(restoredAnswers));
        }
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    captureEvent(GROWTH_GUIDANCE_EVENTS.STEP_VIEWED, { step });
  }, [step]);

  const updateAnswer = useCallback(
    <K extends keyof GrowthIntakeAnswers>(key: K, value: GrowthIntakeAnswers[K]) => {
      setAnswers((current) => ({ ...current, [key]: value }));
    },
    []
  );


  const start = async () => {
    if (!user?.id || saving) return;
    setSaving(true);
    setErrorMessage("");
    try {
      const intake = await growthGuidanceService.createIntake(user.id, answers);
      setIntakeId(intake.id);
      captureEvent(GROWTH_GUIDANCE_EVENTS.INTAKE_STARTED, { intake_id: intake.id });
      setStep("situation");
    } catch {
      setErrorMessage(t("We couldn't start your plan. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const saveAndGo = async (nextStep: Step) => {
    if (!intakeId || saving) return;
    setSaving(true);
    setErrorMessage("");
    try {
      await growthGuidanceService.saveIntake(intakeId, answers);
      setStep(nextStep);
    } catch {
      setErrorMessage(t("We couldn't save that answer. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const runGeneration = async (correctionText?: string, previousPlanId?: string) => {
    if (!intakeId || saving) return;
    setSaving(true);
    setErrorMessage("");
    try {
      const result = await growthGuidanceService.generateProposal({
        intakeId,
        locale: language,
        correction: correctionText,
        planId: previousPlanId,
      });
      if (result.result_type === "clarification") {
        setClarificationQuestion(result.clarification_question);
        setClarificationAnswer("");
        setClarificationContext(correctionText ? "correction" : "intake");
        setPendingCorrection(correctionText || "");
        captureEvent(GROWTH_GUIDANCE_EVENTS.CLARIFICATION_REQUESTED, {
          context: correctionText ? "correction" : "intake",
        });
        setStep("clarification");
        return;
      }
      setPlan(result.plan);
      captureEvent(
        correctionText
          ? GROWTH_GUIDANCE_EVENTS.PROPOSAL_CORRECTED
          : GROWTH_GUIDANCE_EVENTS.PROPOSAL_GENERATED,
        { plan_version: result.plan.version }
      );
      setStep("proposal");
    } catch {
      captureEvent(GROWTH_GUIDANCE_EVENTS.GENERATION_FAILED, {
        context: correctionText ? "correction" : "intake",
      });
      setErrorMessage(t("We couldn't build your plan. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const finishIntake = async () => {
    if (!intakeId || !user?.id || saving) return;
    setSaving(true);
    setErrorMessage("");
    try {
      await growthGuidanceService.saveIntake(intakeId, answers);
    } catch {
      setErrorMessage(t("We couldn't save that answer. Please try again."));
      setSaving(false);
      return;
    }
    setSaving(false);
    await runGeneration();
  };

  const submitClarification = async () => {
    if (!clarificationCanContinue || !intakeId) return;
    if (clarificationContext === "correction" && plan) {
      const expandedCorrection = `${pendingCorrection}\n${clarificationQuestion}: ${clarificationAnswer.trim()}`;
      await runGeneration(expandedCorrection, plan.id);
      return;
    }

    const nextAnswers = {
      ...answers,
      clarifications: [
        ...answers.clarifications,
        { question: clarificationQuestion, answer: clarificationAnswer.trim() },
      ],
    };
    setAnswers(nextAnswers);
    setSaving(true);
    setErrorMessage("");
    try {
      await growthGuidanceService.saveIntake(intakeId, nextAnswers);
    } catch {
      setErrorMessage(t("We couldn't save that answer. Please try again."));
      setSaving(false);
      return;
    }
    setSaving(false);
    await runGeneration();
  };

  const submitCorrection = async () => {
    if (!correction.trim() || !plan) return;
    await runGeneration(correction.trim(), plan.id);
  };

  const confirmPlan = async () => {
    if (!plan || saving) return;
    setSaving(true);
    setErrorMessage("");
    try {
      const confirmed = await growthGuidanceService.confirmPlan(plan.id);
      setPlan(confirmed);
      captureEvent(GROWTH_GUIDANCE_EVENTS.PLAN_CONFIRMED, {
        plan_version: confirmed.version,
      });
      setStep("confirmed");
    } catch {
      setErrorMessage(t("We couldn't confirm your plan. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const close = () => {
    router.navigate("/(tabs)");
  };

  const progressIndex = useMemo(() => {
    if (step === "clarification") return 5;
    const index = INTAKE_STEPS.indexOf(step);
    return Math.max(0, index);
  }, [step]);

  const canContinue = useMemo(() => {
    switch (step) {
      case "situation":
        return !!answers.current_situation.trim() && !!answers.recent_example.trim();
      case "direction":
        return !!answers.desired_change.trim() && !!answers.why_it_matters.trim();
      case "attempts":
        return !!answers.prior_attempts.trim();
      case "barriers":
        return !!answers.likely_barriers.trim() && !!answers.practice_context.trim();
      case "preferences":
        return !!answers.disliked_guidance.trim();
      case "boundaries":
        return !!answers.boundaries.trim();
      default:
        return true;
    }
  }, [answers, step]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (step) {
      case "intro":
        return (
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>{t("PERSONALIZED GROWTH")}</Text>
            <Text style={styles.title}>{t("Take a small step toward a change that matters")}</Text>
            <Text style={styles.introBody}>
              {t(
                "Tell us what feels difficult. Together we’ll find a goal and a practical first step."
              )}
            </Text>
            <View style={styles.promiseCard}>
              <Text style={styles.promiseTitle}>{t("You stay in control")}</Text>
              <Text style={styles.introBody}>
                {t(
                  "The plan is a starting hypothesis. You can correct it before anything becomes active, and you never have to share a location."
                )}
              </Text>
            </View>
            <Text style={styles.disclaimer}>
              {t("This is personal-growth guidance, not mental-health treatment or diagnosis.")}
            </Text>
          </View>
        );
      case "situation":
        return (
          <View style={styles.questions}>
            <QuestionInput
              label="Where do you feel stuck or limited right now?"
              placeholder="Describe it in the way you would to a friend"
              value={answers.current_situation}
              onChangeText={(value) => updateAnswer("current_situation", value)}
            />
            <QuestionInput
              label="What is one recent time this showed up?"
              placeholder="What happened, and what did you do?"
              value={answers.recent_example}
              onChangeText={(value) => updateAnswer("recent_example", value)}
            />
          </View>
        );
      case "direction":
        return (
          <View style={styles.questions}>
            <QuestionInput
              label="If this changed, what would be different?"
              placeholder="You do not need to turn it into a formal goal"
              value={answers.desired_change}
              onChangeText={(value) => updateAnswer("desired_change", value)}
            />
            <QuestionInput
              label="Why would that matter to you?"
              placeholder="What would it make possible or bring back into your life?"
              value={answers.why_it_matters}
              onChangeText={(value) => updateAnswer("why_it_matters", value)}
            />
          </View>
        );
      case "attempts":
        return (
          <QuestionInput
            label="What have you already tried, and what helped or did not help?"
            placeholder="It is okay if the answer is 'nothing yet'"
            value={answers.prior_attempts}
            onChangeText={(value) => updateAnswer("prior_attempts", value)}
          />
        );
      case "barriers":
        return (
          <View style={styles.questions}>
            <QuestionInput
              label="What tends to get in the way?"
              placeholder="Skills, opportunities, discomfort, energy, priorities, or something else"
              value={answers.likely_barriers}
              onChangeText={(value) => updateAnswer("likely_barriers", value)}
            />
            <QuestionInput
              label="Where and when could practice realistically fit?"
              placeholder="Think about your real week, not an ideal one"
              value={answers.practice_context}
              onChangeText={(value) => updateAnswer("practice_context", value)}
            />
          </View>
        );
      case "preferences":
        return (
          <View style={styles.questions}>
            <View style={styles.questionBlock}>
              <Text style={styles.question}>{t("How should the first step feel?")}</Text>
              <View style={styles.chips}>
                {([
                  ["gentle", "Gentle start"],
                  ["balanced", "Balanced push"],
                  ["stretch", "Meaningful stretch"],
                ] as Array<[GrowthChallengeLevel, string]>).map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.chip,
                      answers.challenge_level === value && styles.chipActive,
                    ]}
                    onPress={() => updateAnswer("challenge_level", value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        answers.challenge_level === value && styles.chipTextActive,
                      ]}
                    >
                      {t(label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <QuestionInput
              label="What kinds of guidance do you dislike?"
              placeholder="For example: pep talks, public challenges, rigid schedules, productivity advice"
              value={answers.disliked_guidance}
              onChangeText={(value) => updateAnswer("disliked_guidance", value)}
            />
          </View>
        );
      case "boundaries":
        return (
          <View style={styles.questions}>
            <QuestionInput
              label="What boundaries or constraints should we respect?"
              placeholder="Settings, people, topics, risk, accessibility, cost, travel, or anything else"
              value={answers.boundaries}
              onChangeText={(value) => updateAnswer("boundaries", value)}
            />
          </View>
        );
      case "clarification":
        return (
          <View style={styles.questions}>
            <Text style={styles.eyebrow}>{t("ONE MORE THING")}</Text>
            <QuestionInput
              label={clarificationQuestion}
              placeholder={clarificationContext === "intake"
                ? "Write at least 4 words"
                : "A short answer is enough"}
              value={clarificationAnswer}
              onChangeText={setClarificationAnswer}
            />
            {clarificationContext === "intake" && (
              <Text style={styles.optionalHint}>
                {t("At least 4 words are required. (count)/4", {
                  count: clarificationWordCount,
                })}
              </Text>
            )}
            <Text style={styles.optionalHint}>
              {t("We'd rather ask than invent a detail that changes your plan.")}
            </Text>
          </View>
        );
      case "proposal":
        return plan ? (
          <View style={styles.planWrap}>
            <GrowthPlanCard plan={plan} />
            <Text style={styles.fitQuestion}>{t("Does this plan fit what you meant?")}</Text>
          </View>
        ) : null;
      case "correction":
        return (
          <View style={styles.questions}>
            <Text style={styles.title}>{t("What did we get wrong?")}</Text>
            <Text style={styles.introBody}>
              {t("Tell us what doesn’t fit. We’ll rethink the plan.")}
            </Text>
            <TextInput
              style={[styles.input, styles.correctionInput]}
              value={correction}
              onChangeText={setCorrection}
              placeholder={t("For example: I want enjoyment, not achievement")}
              placeholderTextColor={colors.light.lightText}
              multiline
              maxLength={800}
              autoFocus
              textAlignVertical="top"
            />
          </View>
        );
      case "confirmed":
        return null;
    }
  };

  const renderFooter = () => {
    if (saving) {
      return (
        <View style={styles.savingFooter}>
          <ActivityIndicator color={colors.light.primary} />
          <Text style={styles.optionalHint}>
            {t(step === "boundaries" || step === "clarification" || step === "correction"
              ? "Building your plan..."
              : "Saving...")}
          </Text>
        </View>
      );
    }
    switch (step) {
      case "intro":
        return <GrowthButton title={t("Start the conversation")} onPress={start} />;
      case "situation":
        return <GrowthButton title={t("Next")} onPress={() => saveAndGo("direction")} disabled={!canContinue} />;
      case "direction":
        return <GrowthButton title={t("Next")} onPress={() => saveAndGo("attempts")} disabled={!canContinue} />;
      case "attempts":
        return <GrowthButton title={t("Next")} onPress={() => saveAndGo("barriers")} disabled={!canContinue} />;
      case "barriers":
        return <GrowthButton title={t("Next")} onPress={() => saveAndGo("preferences")} disabled={!canContinue} />;
      case "preferences":
        return <GrowthButton title={t("Next")} onPress={() => saveAndGo("boundaries")} disabled={!canContinue} />;
      case "boundaries":
        return <GrowthButton title={t("Build my plan")} onPress={finishIntake} disabled={!canContinue} />;
      case "clarification":
        return <GrowthButton title={t("Continue")} onPress={submitClarification} disabled={!clarificationCanContinue} />;
      case "proposal":
        return (
          <View style={styles.footerActions}>
            <GrowthButton title={t("This fits")} onPress={confirmPlan} />
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep("correction")}>
              <Text style={styles.secondaryButtonText}>{t("Not quite — let me explain")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "correction":
        return <GrowthButton title={t("Revise my plan")} onPress={submitCorrection} disabled={!correction.trim()} />;
      case "confirmed":
        return null;
    }
  };

  if (step === "confirmed" && plan) return <GrowthPlanExperience initialPlan={plan} />;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={close} style={styles.closeButton}>
            <Text style={styles.closeText}>{t("Close")}</Text>
          </TouchableOpacity>
          {step !== "intro" && step !== "confirmed" && (
            <View style={styles.progressWrap}>
              <ProgressSegments total={INTAKE_STEPS.length} activeIndex={progressIndex} />
            </View>
          )}
          {INTAKE_STEPS.indexOf(step) > 0 && step !== "proposal" && <TouchableOpacity accessibilityRole="button" disabled={saving} style={styles.closeButton} onPress={() => setStep(INTAKE_STEPS[INTAKE_STEPS.indexOf(step) - 1])}><Text style={styles.secondaryButtonText}>{t("Back")}</Text></TouchableOpacity>}
        </View>
        <ScrollView
          key={step}
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
          {renderContent()}
        </ScrollView>
        <View style={styles.footer}>{renderFooter()}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: "center", flex: 1, justifyContent: "center" },
  chip: {
    backgroundColor: colors.light.accent3,
    borderColor: colors.light.accent2,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: colors.light.primary, borderColor: colors.light.primary },
  chipText: { color: colors.light.primary, fontSize: 14, fontWeight: "600" },
  chipTextActive: { color: colors.neutral.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  closeButton: { paddingVertical: 6 },
  closeText: { color: colors.light.lightText, fontSize: 15 },
  container: { backgroundColor: colors.light.background, flex: 1 },
  content: { flexGrow: 1, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 24, width: "100%", maxWidth: 680, alignSelf: "center" },
  correctionInput: { minHeight: 150 },
  disclaimer: { color: colors.light.lightText, fontSize: 13, lineHeight: 19 },
  error: {
    backgroundColor: "#FCE8E8",
    borderRadius: 10,
    color: colors.light.alertRed,
    fontSize: 14,
    marginBottom: 16,
    padding: 12,
  },
  eyebrow: { color: colors.light.primary, fontSize: 13, fontWeight: "800", letterSpacing: 1.1 },
  fitQuestion: { color: colors.light.text, fontSize: 21, fontWeight: "800", lineHeight: 28 },
  flex: { flex: 1 },
  footer: { paddingBottom: 10, paddingHorizontal: 20, paddingTop: 8 },
  footerActions: { gap: 8 },
  header: { alignItems: "center", flexDirection: "row", gap: 16, paddingHorizontal: 20, paddingTop: 8 },
  input: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.neutral.grey2,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.light.text,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 96,
    padding: 13,
  },
  intro: { gap: 22 },
  introBody: { color: colors.light.text, fontSize: 16, lineHeight: 24 },
  optionalHint: { color: colors.light.lightText, fontSize: 13, lineHeight: 18 },
  planWrap: { gap: 28 },
  progressWrap: { flex: 1 },
  promiseCard: { backgroundColor: colors.light.accent2, borderRadius: 16, gap: 8, padding: 17 },
  promiseTitle: { color: colors.light.primary, fontSize: 17, fontWeight: "800" },
  question: { color: colors.light.text, fontSize: 20, fontWeight: "700", lineHeight: 27 },
  questionBlock: { gap: 10 },
  questions: { gap: 28 },
  savingFooter: { alignItems: "center", gap: 8, minHeight: 54 },
  secondaryButton: { alignItems: "center", padding: 12 },
  secondaryButtonText: { color: colors.light.primary, fontSize: 15, fontWeight: "700" },
  title: { color: colors.light.text, fontSize: 29, fontWeight: "800", lineHeight: 37 },
});
