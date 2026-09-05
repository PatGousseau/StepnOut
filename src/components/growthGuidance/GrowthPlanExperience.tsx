import React, { useCallback, useEffect, useMemo, useState } from "react";
import { randomUUID } from "expo-crypto";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GROWTH_GUIDANCE_EVENTS } from "../../constants/analyticsEvents";
import { colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { captureEvent } from "../../lib/posthog";
import { growthGuidanceService } from "../../services/growthGuidanceService";
import {
  GrowthAttemptFollowUp,
  GrowthAttemptOutcome,
  GrowthInteraction,
  GrowthPlanExperience as GrowthPlanExperienceData,
  GrowthPlanProposal,
  GrowthRequestKind,
} from "../../types/growthGuidance";
import {
  getGrowthAttemptFollowUps,
  GROWTH_ATTEMPT_FOLLOW_UPS,
} from "../../utils/growthGuidance";
import { FeatureActionButton } from "../FeatureActionButton";
import { Text } from "../StyledText";
import { GrowthPlanCard, MILESTONE_LABELS } from "./GrowthPlanCard";
import { VoiceJournalRecorder } from "./VoiceJournalRecorder";

const OUTCOMES: Array<[GrowthAttemptOutcome, string]> = [
  ["did_it", "Did it"],
  ["partly", "Partly"],
  ["didnt_do_it", "Didn't do it"],
];

const OUTCOME_LABELS = Object.fromEntries(OUTCOMES) as Record<GrowthAttemptOutcome, string>;
const FOLLOW_UP_LABELS = Object.fromEntries([
  ...GROWTH_ATTEMPT_FOLLOW_UPS.attempted,
  ...GROWTH_ATTEMPT_FOLLOW_UPS.not_attempted,
]) as Record<GrowthAttemptFollowUp, string>;
const JOURNAL_PAGE_SIZE = 20;
const REQUEST_LABELS: Record<GrowthRequestKind, string> = {
  easier: "Make it easier", change: "Change this", immediate: "I have an opportunity right now",
  period: "Find a step for a time period", review: "Review my direction",
};

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useLanguage();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t(label)}</Text>
    </TouchableOpacity>
  );
}

export function GrowthPlanExperience({ initialPlan }: { initialPlan: GrowthPlanProposal }) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [experience, setExperience] = useState<GrowthPlanExperienceData | null>(null);
  const [journalEntries, setJournalEntries] = useState<GrowthInteraction[]>([]);
  const [hasOlderJournals, setHasOlderJournals] = useState(false);
  const [loadingOlderJournals, setLoadingOlderJournals] = useState(false);
  const [mode, setMode] = useState<"home" | "report" | "journal" | "voice" | "request">("home");
  const [requestKind, setRequestKind] = useState<GrowthRequestKind>("change");
  const [outcome, setOutcome] = useState<GrowthAttemptOutcome | null>(null);
  const [followUp, setFollowUp] = useState<GrowthAttemptFollowUp | null>(null);
  const [journalText, setJournalText] = useState("");
  const [pendingInteractionId, setPendingInteractionId] = useState<string | null>(null);
  const [draftInteractionId, setDraftInteractionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return null;
    const [result, journals] = await Promise.all([
      growthGuidanceService.fetchPlanExperience(user.id),
      growthGuidanceService.fetchJournalHistory(user.id, 0, JOURNAL_PAGE_SIZE),
    ]);
    setExperience(result);
    setJournalEntries(journals);
    setHasOlderJournals(journals.length === JOURNAL_PAGE_SIZE);
    setPendingInteractionId(result?.pendingInteractionId || null);
    return result;
  }, [user?.id]);

  const retryLoad = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    setError("");
    try {
      await load();
    } catch {
      setLoadFailed(true);
      setError(t("We couldn't load your latest growth activity."));
    } finally {
      setLoading(false);
    }
  }, [load, t]);

  useEffect(() => {
    void retryLoad();
  }, [retryLoad]);

  const activePlan = experience?.plan || initialPlan;
  const visiblePlan = useMemo(() => {
    if (!experience?.activeStep) return activePlan;
    return { ...activePlan, first_step: experience.activeStep };
  }, [activePlan, experience?.activeStep]);
  const followUps = outcome ? getGrowthAttemptFollowUps(outcome) : [];
  const visibleInteractions = useMemo(() => {
    const items = new Map<string, GrowthInteraction>();
    experience?.interactions.forEach((interaction) => items.set(interaction.id, interaction));
    journalEntries.forEach((interaction) => items.set(interaction.id, interaction));
    return [...items.values()].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [experience?.interactions, journalEntries]);

  const loadOlderJournals = async () => {
    if (!user?.id || loadingOlderJournals) return;
    setLoadingOlderJournals(true);
    try {
      const older = await growthGuidanceService.fetchJournalHistory(
        user.id,
        journalEntries.length,
        JOURNAL_PAGE_SIZE
      );
      setJournalEntries((current) => [
        ...current,
        ...older.filter((entry) => !current.some((item) => item.id === entry.id)),
      ]);
      setHasOlderJournals(older.length === JOURNAL_PAGE_SIZE);
    } catch {
      setError(t("We couldn't load older journals. Please try again."));
    } finally {
      setLoadingOlderJournals(false);
    }
  };

  const resetForm = () => {
    setMode("home");
    setOutcome(null);
    setFollowUp(null);
    setJournalText("");
    setDraftInteractionId(null);
  };

  const refreshAfterMutation = async () => {
    try {
      await load();
    } catch {
      setError(t("Your change was saved, but we couldn't refresh the latest activity."));
    }
  };

  const submit = async () => {
    if (saving || !experience) return;
    const isReport = mode === "report";
    if (isReport && (!experience.activeStep || !outcome || !followUp)) return;
    if (!isReport && !journalText.trim()) return;
    setSaving(true);
    setError("");
    const interactionId = draftInteractionId || randomUUID();
    setDraftInteractionId(interactionId);
    try {
      const result = await growthGuidanceService.submitInteraction({
        interactionId,
        planId: experience.plan.id,
        stepId: experience.activeStep?.id,
        kind: isReport ? "report" : "journal",
        outcome: outcome || undefined,
        followUp: followUp || undefined,
        journalText,
        locale: language,
        requestKind: mode === "request" ? requestKind : undefined,
      });
      captureEvent(
        isReport ? GROWTH_GUIDANCE_EVENTS.REPORT_SUBMITTED : mode === "request" ? "growth_guidance_requested" : GROWTH_GUIDANCE_EVENTS.JOURNAL_SUBMITTED,
        isReport ? { outcome, follow_up: followUp } : mode === "request" ? { request_kind: requestKind } : {}
      );
      if (!result.response) {
        setPendingInteractionId(result.interaction.id);
        setError(t("Your entry was saved, but the response isn't ready yet."));
      } else {
        setPendingInteractionId(null);
      }
      setExperience((current) => current ? {
        ...current,
        activeStep: isReport ? null : current.activeStep,
        interactions: [
          result.interaction,
          ...current.interactions.filter((item) => item.id !== result.interaction.id),
        ],
        latestResponse: result.response,
        pendingInteractionId: result.response ? null : result.interaction.id,
      } : current);
      resetForm();
      await refreshAfterMutation();
    } catch {
      try {
        const refreshed = await load();
        const persisted = refreshed?.interactions.find((item) =>
          item.id === interactionId
        );
        if (persisted) {
          resetForm();
          setError(t("Your entry was saved, but the response isn't ready yet."));
        } else {
          setError(t("We couldn't save that check-in. Please try again."));
        }
      } catch {
        setError(t("We couldn't save that check-in. Please try again."));
      }
    } finally {
      setSaving(false);
    }
  };

  const retryResponse = async () => {
    if (!pendingInteractionId || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await growthGuidanceService.adaptInteraction(
        pendingInteractionId,
        language
      );
      setPendingInteractionId(null);
      setExperience((current) => current ? {
        ...current,
        latestResponse: response,
        pendingInteractionId: null,
      } : current);
      await refreshAfterMutation();
    } catch {
      setError(t("The response still isn't ready. Your entry is safely saved."));
    } finally {
      setSaving(false);
    }
  };

  const chooseStep = async (choice: "accept" | "dismiss") => {
    if (!experience?.activeStep || saving) return;
    setSaving(true);
    setError("");
    try {
      await growthGuidanceService.setStepChoice(experience.activeStep.id, choice);
      captureEvent("growth_step_choice", { choice });
      await refreshAfterMutation();
    } catch {
      setError(t("We couldn't save that choice. Please try again."));
    } finally { setSaving(false); }
  };

  const confirmResponse = async (accepted: boolean) => {
    const response = experience?.latestResponse;
    if (!response || saving) return;
    setSaving(true);
    setError("");
    try {
      const confirmed = await growthGuidanceService.confirmAdaptiveResponse(
        response.id,
        accepted
      );
      captureEvent(GROWTH_GUIDANCE_EVENTS.ADAPTATION_CONFIRMED, {
        accepted,
        response_type: response.response_type,
      });
      setExperience((current) => current ? {
        ...current,
        activeStep: accepted ? null : current.activeStep,
        latestResponse: confirmed,
      } : current);
      await refreshAfterMutation();
    } catch {
      try {
        const refreshed = await load();
        const durableResponse = refreshed?.latestResponse;
        if (
          durableResponse?.id !== response.id ||
          durableResponse.confirmation_status === "pending"
        ) {
          setError(t("We couldn't save that choice. Please try again."));
        }
      } catch {
        setError(t("We couldn't save that choice. Please try again."));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleVoiceSubmitted = async (result: {
    interaction: GrowthPlanExperienceData["interactions"][number];
    response: GrowthPlanExperienceData["latestResponse"];
  }) => {
    if (!result.response) {
      setPendingInteractionId(result.interaction.id);
      setError(t("Your entry was saved, but the response isn't ready yet."));
    } else {
      setPendingInteractionId(null);
    }
    setExperience((current) => current ? {
      ...current,
      interactions: [
        result.interaction,
        ...current.interactions.filter((item) => item.id !== result.interaction.id),
      ],
      latestResponse: result.response,
      pendingInteractionId: result.response ? null : result.interaction.id,
    } : current);
    resetForm();
    await refreshAfterMutation();
  };

  const deleteJournal = (interactionId: string) => {
    Alert.alert(
      t("Delete journal entry?"),
      t("The journal, transcript, audio, and its generated response will be permanently deleted. Plan or step changes you separately confirmed remain part of your active plan."),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Delete"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              setSaving(true);
              setError("");
              try {
                await growthGuidanceService.deleteJournal({ interactionId });
                captureEvent(GROWTH_GUIDANCE_EVENTS.JOURNAL_DELETED);
                setJournalEntries((current) =>
                  current.filter((item) => item.id !== interactionId)
                );
                setPendingInteractionId(null);
                setExperience((current) => current ? {
                  ...current,
                  interactions: current.interactions.filter(
                    (item) => item.id !== interactionId
                  ),
                  latestResponse: null,
                  pendingInteractionId: null,
                } : current);
                try {
                  await load();
                } catch {
                  setError(t("The journal was deleted, but your activity couldn't be refreshed."));
                }
              } catch {
                setError(t("We couldn't delete that journal entry. Please try again."));
              } finally {
                setSaving(false);
              }
            })();
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator color={colors.light.primary} />;

  if (loadFailed && !experience) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <GrowthPlanCard plan={initialPlan} showStep={false} />
        <FeatureActionButton
          title={t("Retry loading activity")}
          onPress={retryLoad}
          variant="pill"
        />
      </View>
    );
  }

  const response = experience?.latestResponse;
  return (
    <View style={styles.container}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <GrowthPlanCard
        plan={visiblePlan}
        active={true}
        showStep={!experience || !!experience.activeStep}
      />

      {!!response && (
        <View style={styles.responseCard}>
          <Text style={styles.responseLabel}>{t("STEPnOUT RESPONSE")}</Text>
          <Text style={styles.responseText}>{response.message}</Text>
          {!!response.clarification_question && (
            <Text style={styles.question}>{response.clarification_question}</Text>
          )}
          {response.confirmation_status === "pending" && (
            <View style={styles.confirmationBlock}>
              {!!response.proposed_plan_update && (
                <View style={styles.proposalPreview}>
                  <Text style={styles.responseLabel}>{t("PROPOSED PLAN")}</Text>
                  <Text style={styles.previewLabel}>{t("Goal")}</Text>
                  <Text style={styles.responseText}>
                    {response.proposed_plan_update.goal}
                  </Text>
                  <Text style={styles.previewLabel}>{t("Working idea")}</Text>
                  <Text style={styles.responseText}>
                    {response.proposed_plan_update.formulation}
                  </Text>
                  <Text style={styles.previewLabel}>{t("A possible path")}</Text>
                  {response.proposed_plan_update.milestones.map((milestone) => (
                    <View key={milestone.title} style={styles.previewItem}>
                      <Text style={styles.previewTitle}>{milestone.title}</Text>
                      {!!milestone.status && <Text style={styles.hint}>{t(MILESTONE_LABELS[milestone.status])}</Text>}
                      <Text style={styles.hint}>{milestone.description}</Text>
                    </View>
                  ))}
                  <Text style={styles.previewLabel}>{t("Current focus")}</Text>
                  <Text style={styles.responseText}>
                    {response.proposed_plan_update.current_focus}
                  </Text>
                </View>
              )}
              {!!response.next_step && (
                <View style={styles.proposalPreview}>
                  <Text style={styles.responseLabel}>
                    {t("PROPOSED ACTIVE EXPERIMENT")}
                  </Text>
                  <Text style={styles.previewTitle}>{response.next_step.title}</Text>
                  <Text style={styles.hint}>{response.next_step.rationale}</Text>
                  <Text style={styles.previewLabel}>{t("What to do")}</Text>
                  <Text style={styles.responseText}>{response.next_step.action}</Text>
                  <Text style={styles.previewLabel}>{t("What counts as trying it")}</Text>
                  <Text style={styles.responseText}>
                    {response.next_step.completion_criterion}
                  </Text>
                  {!!response.next_step.if_then_plan && (
                    <>
                      <Text style={styles.previewLabel}>{t("If-then plan")}</Text>
                      <Text style={styles.responseText}>
                        {response.next_step.if_then_plan}
                      </Text>
                    </>
                  )}
                </View>
              )}
              <Text style={styles.hint}>
                {t(response.proposed_plan_update
                  ? "This would revise your working plan. Nothing changes until you confirm."
                  : response.proposed_step_completion
                    ? "Should this count as your step report?"
                    : "Use this as your active step?")}
              </Text>
              <FeatureActionButton
                title={t("Confirm change")}
                onPress={() => confirmResponse(true)}
                variant="pill"
              />
              <TouchableOpacity onPress={() => confirmResponse(false)} style={styles.textButton}>
                <Text style={styles.textButtonLabel}>{t("Keep my plan as it is")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {pendingInteractionId && (
        <FeatureActionButton title={t("Retry response")} onPress={retryResponse} variant="pill" />
      )}

      {!!visibleInteractions.length && (
        <View style={styles.history}>
          <Text style={styles.responseLabel}>{t("RECENT CHECK-INS")}</Text>
          {visibleInteractions.map((interaction) => (
            <View key={interaction.id} style={styles.historyItem}>
              <Text style={styles.historyTitle}>
                {t(interaction.request_kind ? REQUEST_LABELS[interaction.request_kind] : interaction.kind === "report" ? "Step report" : "Journal")}
                {" · "}
                {new Date(interaction.created_at).toLocaleDateString(
                  language === "it" ? "it-IT" : "en-CA"
                )}
              </Text>
              {interaction.report_outcome && interaction.follow_up && (
                <Text style={styles.responseText}>
                  {t(OUTCOME_LABELS[interaction.report_outcome])}
                  {" · "}
                  {t(FOLLOW_UP_LABELS[interaction.follow_up])}
                </Text>
              )}
              {!!interaction.journal_text && (
                <Text style={styles.historyText}>{interaction.journal_text}</Text>
              )}
              {interaction.kind === "journal" && (
                <TouchableOpacity
                  onPress={() => deleteJournal(interaction.id)}
                  style={styles.historyDelete}
                  disabled={saving}
                >
                  <Text style={styles.historyDeleteLabel}>{t("Delete journal")}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {hasOlderJournals && (
            <FeatureActionButton
              title={t("Load older journals")}
              onPress={loadOlderJournals}
              disabled={loadingOlderJournals}
              variant="pill"
            />
          )}
        </View>
      )}

      {mode === "home" && !pendingInteractionId && response?.confirmation_status !== "pending" && (
        <View style={styles.actions}>
          {!!experience?.activeStep && !experience.activeStep.accepted_at && (
            <FeatureActionButton title={t("I'll try this")} onPress={() => chooseStep("accept")} disabled={saving} variant="pill" />
          )}
          {!!experience?.activeStep?.accepted_at && <Text style={styles.hint}>{t("You've chosen to try this step.")}</Text>}
          {!!experience?.activeStep && Date.now() - Math.max(
            new Date(experience.activeStep.created_at).getTime(),
            new Date(experience.activeStep.accepted_at || 0).getTime(),
            ...experience.interactions.map((item) => new Date(item.created_at).getTime())
          ) > 14 * 86400000 && (
            <Text style={styles.hint}>{t("Welcome back. Does this step still fit? You can keep it, change it, or set it aside.")}</Text>
          )}
          {(Object.keys(REQUEST_LABELS) as GrowthRequestKind[]).filter((kind) =>
            !!experience?.activeStep || !["easier", "change"].includes(kind)
          ).map((kind) => (
            <FeatureActionButton key={kind} title={t(REQUEST_LABELS[kind])} disabled={saving}
              onPress={() => { setRequestKind(kind); setMode("request"); setJournalText(""); setDraftInteractionId(null); }} variant="pill" />
          ))}
          {!!experience?.activeStep && (
            <TouchableOpacity disabled={saving} style={styles.textButton} onPress={() => Alert.alert(
              t("Set this step aside?"), t("Your plan stays available. You can ask for another step whenever it fits."),
              [{ text: t("Cancel"), style: "cancel" }, { text: t("Set aside"), onPress: () => { void chooseStep("dismiss"); } }]
            )}><Text style={styles.textButtonLabel}>{t("Set this step aside")}</Text></TouchableOpacity>
          )}
          {!!experience?.activeStep && (
            <FeatureActionButton
              title={t("Report on this step")}
              onPress={() => setMode("report")}
              variant="pill"
            />
          )}
          <TouchableOpacity style={styles.secondaryAction} onPress={() => setMode("journal")}>
            <Text style={styles.secondaryActionTitle}>{t("Add a journal entry")}</Text>
            <Text style={styles.hint}>{t("Write whenever something relevant happens.")}</Text>
          </TouchableOpacity>
          {Platform.OS !== "web" && (
            <TouchableOpacity style={styles.secondaryAction} onPress={() => setMode("voice")}>
              <Text style={styles.secondaryActionTitle}>{t("Record a voice journal")}</Text>
              <Text style={styles.hint}>{t("Review the transcript before submitting it.")}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {mode === "report" && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t("Did you try it?")}</Text>
          <View style={styles.chips}>
            {OUTCOMES.map(([value, label]) => (
              <ChoiceChip key={value} label={label} selected={outcome === value} onPress={() => {
                setOutcome(value);
                setFollowUp(null);
              }} />
            ))}
          </View>
          {!!outcome && (
            <>
              <Text style={styles.formTitle}>
                {t(outcome === "didnt_do_it" ? "What got in the way?" : "How did it compare with what you expected?")}
              </Text>
              <View style={styles.chips}>
                {followUps.map(([value, label]) => (
                  <ChoiceChip key={value} label={label} selected={followUp === value} onPress={() => setFollowUp(value)} />
                ))}
              </View>
            </>
          )}
          <TextInput
            style={styles.input}
            value={journalText}
            onChangeText={setJournalText}
            placeholder={t("Optional: add what happened")}
            placeholderTextColor={colors.light.lightText}
            multiline
            maxLength={4000}
          />
          <FeatureActionButton title={t("Submit report")} onPress={submit} disabled={!outcome || !followUp} variant="pill" />
          <TouchableOpacity onPress={resetForm} style={styles.textButton}>
            <Text style={styles.textButtonLabel}>{t("Cancel")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {(mode === "journal" || mode === "request") && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t(mode === "request" ? REQUEST_LABELS[requestKind] : "What's on your mind?")}</Text>
          <Text style={styles.hint}>
            {t(mode === "request" ? "Describe what should change, the situation, or the time you have. Your current step stays until you confirm a replacement." : "A journal entry is evidence from you. We'll ask before it changes your plan or completes a step.")}
          </Text>
          <TextInput
            style={[styles.input, styles.journalInput]}
            value={journalText}
            onChangeText={setJournalText}
            placeholder={t("Write a reflection, update, or correction")}
            placeholderTextColor={colors.light.lightText}
            multiline
            maxLength={4000}
            textAlignVertical="top"
          />
          <FeatureActionButton title={t(mode === "request" ? "Ask for guidance" : "Add a journal entry")} onPress={submit} disabled={saving || !journalText.trim()} variant="pill" />
          <TouchableOpacity onPress={resetForm} style={styles.textButton}>
            <Text style={styles.textButtonLabel}>{t("Cancel")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "voice" && experience && (
        <VoiceJournalRecorder
          planId={experience.plan.id}
          stepId={experience.activeStep?.id}
          locale={language}
          onSubmitted={handleVoiceSubmitted}
          onUseText={() => setMode("journal")}
        />
      )}

      {saving && <ActivityIndicator color={colors.light.primary} />}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10 },
  chip: {
    backgroundColor: colors.light.accent3,
    borderColor: colors.light.accent2,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: { backgroundColor: colors.light.primary, borderColor: colors.light.primary },
  chipText: { color: colors.light.primary, fontSize: 14, fontWeight: "700" },
  chipTextSelected: { color: colors.neutral.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  confirmationBlock: { gap: 8 },
  container: { gap: 22 },
  error: {
    backgroundColor: "#FCE8E8",
    borderRadius: 10,
    color: colors.light.alertRed,
    fontSize: 14,
    padding: 12,
  },
  formCard: { backgroundColor: colors.neutral.white, borderRadius: 16, gap: 15, padding: 16 },
  formTitle: { color: colors.light.text, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.light.lightText, fontSize: 13, lineHeight: 19 },
  history: { gap: 10 },
  historyItem: {
    borderBottomColor: colors.neutral.grey2,
    borderBottomWidth: 1,
    gap: 5,
    paddingBottom: 10,
  },
  historyDelete: { alignSelf: "flex-start", paddingVertical: 4 },
  historyDeleteLabel: { color: colors.light.alertRed, fontSize: 13, fontWeight: "700" },
  historyText: { color: colors.light.text, fontSize: 14, lineHeight: 20 },
  historyTitle: { color: colors.light.text, fontSize: 13, fontWeight: "800" },
  input: {
    backgroundColor: colors.light.background,
    borderColor: colors.neutral.grey2,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.light.text,
    fontSize: 15,
    minHeight: 52,
    padding: 12,
  },
  journalInput: { minHeight: 130 },
  previewItem: { gap: 2 },
  previewLabel: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
  },
  previewTitle: { color: colors.light.text, fontSize: 15, fontWeight: "800" },
  proposalPreview: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    gap: 7,
    padding: 12,
  },
  question: { color: colors.light.text, fontSize: 16, fontWeight: "700", lineHeight: 23 },
  responseCard: { backgroundColor: colors.light.accent2, borderRadius: 16, gap: 10, padding: 16 },
  responseLabel: { color: colors.light.primary, fontSize: 12, fontWeight: "800", letterSpacing: 0.8 },
  responseText: { color: colors.light.text, fontSize: 16, lineHeight: 23 },
  secondaryAction: {
    borderColor: colors.light.primary,
    borderRadius: 16,
    borderWidth: 1,
    gap: 3,
    padding: 15,
  },
  secondaryActionTitle: { color: colors.light.primary, fontSize: 16, fontWeight: "800" },
  textButton: { alignItems: "center", padding: 8 },
  textButtonLabel: { color: colors.light.primary, fontSize: 14, fontWeight: "700" },
});
