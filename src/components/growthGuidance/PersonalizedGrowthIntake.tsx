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
  EMPTY_EVENT_PREFERENCES,
  EMPTY_GROWTH_INTAKE,
  GrowthChallengeLevel,
  GrowthEventPreferences,
  GrowthIntakeAnswers,
  GrowthPlanProposal,
} from "../../types/growthGuidance";
import {
  countWords,
  getGrowthIntakeResumeStep,
  MIN_GROWTH_CLARIFICATION_WORDS,
} from "../../utils/growthGuidance";
import { FeatureActionButton } from "../FeatureActionButton";
import { ProgressSegments } from "../ProgressSegments";
import { Text } from "../StyledText";
import { GrowthPlanCard } from "./GrowthPlanCard";

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

function OptionalInput({
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
    <View style={styles.optionalBlock}>
      <Text style={styles.optionalLabel}>{t(label)}</Text>
      <TextInput
        style={styles.optionalInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={t(placeholder)}
        placeholderTextColor={colors.light.lightText}
        maxLength={300}
      />
    </View>
  );
}

export function PersonalizedGrowthIntake() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const restoredPreferencesError = t(
    "We restored your answers, but couldn't load your optional event preferences. Retry before building your direction."
  );
  const [step, setStep] = useState<Step>("intro");
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<GrowthIntakeAnswers>({ ...EMPTY_GROWTH_INTAKE });
  const [eventPreferences, setEventPreferences] = useState<GrowthEventPreferences>({
    ...EMPTY_EVENT_PREFERENCES,
  });
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
  const [eventPreferencesReady, setEventPreferencesReady] = useState(true);
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
          setEventPreferencesReady(false);
          void growthGuidanceService.fetchEventPreferencesForIntake(user.id, draft.id)
            .then((preferences) => {
              if (!active) return;
              setEventPreferences({
                ...EMPTY_EVENT_PREFERENCES,
                ...(preferences || {}),
              });
              setEventPreferencesReady(true);
            })
            .catch(() => {
              if (!active) return;
              setErrorMessage(restoredPreferencesError);
            });
        }
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [restoredPreferencesError, user?.id]);

  useEffect(() => {
    captureEvent(GROWTH_GUIDANCE_EVENTS.STEP_VIEWED, { step });
  }, [step]);

  const updateAnswer = useCallback(
    <K extends keyof GrowthIntakeAnswers>(key: K, value: GrowthIntakeAnswers[K]) => {
      setAnswers((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const updateEventPreference = useCallback(
    <K extends keyof GrowthEventPreferences>(key: K, value: GrowthEventPreferences[K]) => {
      setEventPreferences((current) => ({ ...current, [key]: value }));
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
      setErrorMessage(t("We couldn't build your direction. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const finishIntake = async () => {
    if (!intakeId || !user?.id || saving || !eventPreferencesReady) return;
    setSaving(true);
    setErrorMessage("");
    try {
      await growthGuidanceService.saveIntake(intakeId, answers);
      await growthGuidanceService.saveEventPreferences(user.id, intakeId, eventPreferences);
    } catch {
      setErrorMessage(t("We couldn't save that answer. Please try again."));
      setSaving(false);
      return;
    }
    setSaving(false);
    await runGeneration();
  };

  const retryEventPreferences = async () => {
    if (!intakeId || !user?.id || saving) return;
    setSaving(true);
    setErrorMessage("");
    try {
      const preferences = await growthGuidanceService.fetchEventPreferencesForIntake(
        user.id,
        intakeId
      );
      setEventPreferences({
        ...EMPTY_EVENT_PREFERENCES,
        ...(preferences || {}),
      });
      setEventPreferencesReady(true);
    } catch {
      setErrorMessage(restoredPreferencesError);
    } finally {
      setSaving(false);
    }
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
    if (intakeId && !plan) {
      growthGuidanceService.abandonIntake(intakeId).catch(() => undefined);
      captureEvent(GROWTH_GUIDANCE_EVENTS.INTAKE_ABANDONED, { step });
    }
    router.back();
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
            <Text style={styles.title}>{t("Turn where you feel stuck into one clear direction")}</Text>
            <Text style={styles.introBody}>
              {t(
                "Tell us what is happening in your own words. We'll propose a goal, a possible explanation, a short path, and one real-world experiment."
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
            <TouchableOpacity
              style={styles.eventToggle}
              onPress={() => updateEventPreference("enabled", !eventPreferences.enabled)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: eventPreferences.enabled }}
            >
              <View style={[styles.checkbox, eventPreferences.enabled && styles.checkboxActive]}>
                {eventPreferences.enabled && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.eventToggleText}>
                <Text style={styles.eventTitle}>{t("Nearby opportunities could be useful")}</Text>
                <Text style={styles.optionalHint}>
                  {t("Optional. Keep this off if local events are not relevant to your goal.")}
                </Text>
              </View>
            </TouchableOpacity>
            {eventPreferences.enabled && (
              <View style={styles.eventFields}>
                <Text style={styles.optionalHint}>
                  {t("Share only approximate details. Every field below is optional.")}
                </Text>
                <OptionalInput
                  label="Approximate location"
                  placeholder="City or neighbourhood"
                  value={eventPreferences.approximate_location}
                  onChangeText={(value) => updateEventPreference("approximate_location", value)}
                />
                <OptionalInput
                  label="Travel radius"
                  placeholder="For example: 5 km or 20 minutes"
                  value={eventPreferences.travel_radius}
                  onChangeText={(value) => updateEventPreference("travel_radius", value)}
                />
                <OptionalInput
                  label="Availability"
                  placeholder="For example: weekend afternoons"
                  value={eventPreferences.availability}
                  onChangeText={(value) => updateEventPreference("availability", value)}
                />
                <OptionalInput
                  label="Cost preference"
                  placeholder="For example: free events only"
                  value={eventPreferences.cost_preference}
                  onChangeText={(value) => updateEventPreference("cost_preference", value)}
                />
                <OptionalInput
                  label="Accessibility needs"
                  placeholder="Only what an opportunity must support"
                  value={eventPreferences.accessibility_needs}
                  onChangeText={(value) => updateEventPreference("accessibility_needs", value)}
                />
              </View>
            )}
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
            <Text style={styles.fitQuestion}>{t("Does this direction fit what you meant?")}</Text>
          </View>
        ) : null;
      case "correction":
        return (
          <View style={styles.questions}>
            <Text style={styles.title}>{t("What did we get wrong?")}</Text>
            <Text style={styles.introBody}>
              {t("Tell us what does not fit. We'll revise the direction, not just its wording.")}
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
        return plan ? (
          <View style={styles.planWrap}>
            <View style={styles.confirmedBanner}>
              <Text style={styles.confirmedTitle}>{t("Direction confirmed")}</Text>
              <Text style={styles.confirmedBody}>
                {t("Your first experiment is ready. Progress comes from what you try and learn, not from a perfect result.")}
              </Text>
            </View>
            <GrowthPlanCard plan={plan} />
          </View>
        ) : null;
    }
  };

  const renderFooter = () => {
    if (saving) {
      return (
        <View style={styles.savingFooter}>
          <ActivityIndicator color={colors.light.primary} />
          <Text style={styles.optionalHint}>
            {t(step === "boundaries" || step === "clarification" || step === "correction"
              ? "Building your direction..."
              : "Saving...")}
          </Text>
        </View>
      );
    }
    switch (step) {
      case "intro":
        return <FeatureActionButton title={t("Start the conversation")} onPress={start} variant="pill" />;
      case "situation":
        return <FeatureActionButton title={t("Next")} onPress={() => saveAndGo("direction")} disabled={!canContinue} variant="pill" />;
      case "direction":
        return <FeatureActionButton title={t("Next")} onPress={() => saveAndGo("attempts")} disabled={!canContinue} variant="pill" />;
      case "attempts":
        return <FeatureActionButton title={t("Next")} onPress={() => saveAndGo("barriers")} disabled={!canContinue} variant="pill" />;
      case "barriers":
        return <FeatureActionButton title={t("Next")} onPress={() => saveAndGo("preferences")} disabled={!canContinue} variant="pill" />;
      case "preferences":
        return <FeatureActionButton title={t("Next")} onPress={() => saveAndGo("boundaries")} disabled={!canContinue} variant="pill" />;
      case "boundaries":
        if (!eventPreferencesReady) {
          return <FeatureActionButton title={t("Retry loading preferences")} onPress={retryEventPreferences} variant="pill" />;
        }
        return <FeatureActionButton title={t("Build my direction")} onPress={finishIntake} disabled={!canContinue} variant="pill" />;
      case "clarification":
        return <FeatureActionButton title={t("Continue")} onPress={submitClarification} disabled={!clarificationCanContinue} variant="pill" />;
      case "proposal":
        return (
          <View style={styles.footerActions}>
            <FeatureActionButton title={t("This fits")} onPress={confirmPlan} variant="pill" />
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep("correction")}>
              <Text style={styles.secondaryButtonText}>{t("Not quite — let me explain")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "correction":
        return <FeatureActionButton title={t("Revise the direction")} onPress={submitCorrection} disabled={!correction.trim()} variant="pill" />;
      case "confirmed":
        return <FeatureActionButton title={t("Done")} onPress={close} variant="pill" />;
    }
  };

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
        </View>
        <ScrollView
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
  checkbox: {
    alignItems: "center",
    borderColor: colors.light.primary,
    borderRadius: 5,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkboxActive: { backgroundColor: colors.light.primary },
  checkmark: { color: colors.neutral.white, fontSize: 14, fontWeight: "800" },
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
  confirmedBanner: {
    backgroundColor: colors.light.easyGreen,
    borderRadius: 16,
    gap: 6,
    padding: 16,
  },
  confirmedBody: { color: colors.light.text, fontSize: 14, lineHeight: 20 },
  confirmedTitle: { color: colors.light.text, fontSize: 18, fontWeight: "800" },
  container: { backgroundColor: colors.light.background, flex: 1 },
  content: { flexGrow: 1, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 24 },
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
  eventFields: { gap: 16 },
  eventTitle: { color: colors.light.text, fontSize: 16, fontWeight: "700" },
  eventToggle: { alignItems: "flex-start", flexDirection: "row", gap: 12, paddingVertical: 6 },
  eventToggleText: { flex: 1, gap: 4 },
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
  optionalBlock: { gap: 6 },
  optionalHint: { color: colors.light.lightText, fontSize: 13, lineHeight: 18 },
  optionalInput: {
    borderBottomColor: colors.neutral.grey1,
    borderBottomWidth: 1,
    color: colors.light.text,
    fontSize: 15,
    paddingBottom: 8,
  },
  optionalLabel: { color: colors.light.text, fontSize: 14, fontWeight: "600" },
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
