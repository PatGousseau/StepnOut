import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { randomUUID } from "expo-crypto";
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { Text } from "../StyledText";
import { GrowthPlanCard, MILESTONE_LABELS } from "./GrowthPlanCard";
import { VoiceJournalRecorder } from "./VoiceJournalRecorder";
import { GrowthEventOpportunities } from "./GrowthEventOpportunities";
import { GrowthButton, GrowthHeading, GrowthRow, GrowthStepCard, ui, useGrowthConfirm } from "./GrowthUI";

type Screen = "home" | "history" | "direction" | "report" | "journal" | "voice" | "request" | "options" | "events" | "response" | "entry";
const TABS = [
  { screen: "home", label: "Today", icon: "white-balance-sunny" },
  { screen: "history", label: "Journal", icon: "notebook-outline" },
  { screen: "direction", label: "My direction", icon: "compass-outline" },
] as const;

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
  const { confirm, confirmation } = useGrowthConfirm();
  const [experience, setExperience] = useState<GrowthPlanExperienceData | null>(null);
  const [journalEntries, setJournalEntries] = useState<GrowthInteraction[]>([]);
  const [hasOlderJournals, setHasOlderJournals] = useState(false);
  const [loadingOlderJournals, setLoadingOlderJournals] = useState(false);
  const [mode, setMode] = useState<Screen>("home");
  const [selectedEntry, setSelectedEntry] = useState<GrowthInteraction | null>(null);
  const [reportStage, setReportStage] = useState(0);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const eventBackRef = useRef<(() => boolean) | null>(null);
  const setEventBackHandler = useCallback((handler: (() => boolean) | null) => { eventBackRef.current = handler; }, []);
  const [requestKind, setRequestKind] = useState<GrowthRequestKind>("change");
  const [requestOrigin, setRequestOrigin] = useState<Screen>("home");
  const [outcome, setOutcome] = useState<GrowthAttemptOutcome | null>(null);
  const [followUp, setFollowUp] = useState<GrowthAttemptFollowUp | null>(null);
  const [journalText, setJournalText] = useState("");
  const [pendingInteractionId, setPendingInteractionId] = useState<string | null>(null);
  const [draftInteractionId, setDraftInteractionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [mode, reportStage]);

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
    setReportStage(0);
  };

  const goBack = () => {
    if (saving || voiceBusy) return;
    if (mode === "events" && eventBackRef.current?.()) return;
    if (mode === "report" && reportStage > 0) { setReportStage(reportStage - 1); return; }
    const leave = () => {
      resetForm();
      if (["journal", "voice", "entry"].includes(mode)) setMode("history");
      if (mode === "request") setMode(requestOrigin);
    };
    if (mode === "voice") {
      confirm(t("Leave voice journal?"), t("Unuploaded audio and unsaved transcript edits will be lost. Uploaded recordings can be resumed here."), [
        { text: t("Stay here"), style: "cancel" }, { text: t("Leave"), onPress: leave },
      ]);
    } else if (journalText.trim() && ["journal", "request", "report"].includes(mode)) {
      confirm(t("Leave this draft?"), t("Your unsent text will be discarded."), [
        { text: t("Keep writing"), style: "cancel" },
        { text: t("Discard draft"), style: "destructive", onPress: leave },
      ]);
    } else if (TABS.some((tab) => tab.screen === mode)) router.back();
    else leave();
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { goBack(); return true; });
    return () => subscription.remove();
  });

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
      setMode("response");
      await refreshAfterMutation();
    } catch {
      try {
        const refreshed = await load();
        const persisted = refreshed?.interactions.find((item) =>
          item.id === interactionId
        );
        if (persisted) {
          resetForm();
          setMode("response");
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
    setMode("response");
    await refreshAfterMutation();
  };

  const deleteJournal = (interactionId: string) => {
    confirm(
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
                setSelectedEntry(null);
                setMode("history");
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

  if (loading) return <SafeAreaView style={styles.screen}><View style={styles.loading}><ActivityIndicator color={colors.light.primary} /><Text style={ui.caption}>{t("Loading your space…")}</Text></View></SafeAreaView>;

  if (loadFailed && !experience) {
    return (
      <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.error}>{error}</Text>
        <GrowthPlanCard plan={initialPlan} showStep={false} />
        <GrowthButton
          title={t("Retry loading activity")}
          onPress={retryLoad}
        />
        <GrowthButton title={t("Close")} secondary onPress={() => router.back()} />
      </ScrollView></SafeAreaView>
    );
  }

  const response = experience?.latestResponse;
  const blocked = saving || !!pendingInteractionId || response?.confirmation_status === "pending";
  const isTab = TABS.some((tab) => tab.screen === mode);
  const openRequest = (kind: GrowthRequestKind) => { setRequestOrigin(mode); setRequestKind(kind); setJournalText(""); setDraftInteractionId(null); setMode("request"); };
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
    {confirmation}
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.navigation}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t(isTab ? "Close" : "Back")} disabled={saving || voiceBusy} onPress={goBack} style={styles.navButton}>
          <MaterialCommunityIcons name={isTab ? "close" : "arrow-left"} size={24} color={colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.brand}>{t("YOUR GROWTH SPACE")}</Text>
        <View style={styles.navSpacer} />
      </View>
    <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
    <View style={styles.container}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {mode === "direction" && <>
      <GrowthHeading title={t("The bigger picture")} subtitle={t("A working direction. You can change it as you learn.")} />
      <GrowthPlanCard
        plan={visiblePlan}
        active={true}
        showStep={false}
      />
      <GrowthRow icon="compass-outline" title={t("Review my direction")} subtitle={t("Something changed? Let's revisit what fits.")} disabled={blocked} onPress={() => openRequest("review")} />
      </>}

      {mode === "home" && <>
        <GrowthHeading eyebrow={t("AT YOUR OWN PACE")} title={t("A little forward.")} subtitle={t("One thing to try. Something to learn.")} />
        {(!!pendingInteractionId || !!response) && <GrowthRow icon="message-text-outline"
          title={t(pendingInteractionId ? "Your check-in is saved" : response?.confirmation_status === "pending" ? "A change for you to review" : "Your latest reflection")}
          subtitle={t(pendingInteractionId ? "Your response needs another try." : response?.confirmation_status === "pending" ? "Nothing changes until you choose." : "Read your response from StepnOut.")}
          onPress={() => setMode("response")} />}
        {experience?.activeStep ? <GrowthStepCard step={experience.activeStep} accepted={!!experience.activeStep.accepted_at}>
          {!blocked && <>
            {!experience.activeStep.accepted_at && <GrowthButton title={t("I'll try this")} onPress={() => chooseStep("accept")} />}
            <GrowthButton title={t("Check in on this step")} secondary={!experience.activeStep.accepted_at} onPress={() => setMode("report")} />
            <TouchableOpacity accessibilityRole="button" style={styles.textButton} onPress={() => setMode("options")}><Text style={ui.link}>{t("Adjust this step")}</Text></TouchableOpacity>
          </>}
        </GrowthStepCard> : <View style={styles.formCard}>
          <GrowthHeading title={t("Room for a fresh step")} subtitle={t("Your direction is still here. Choose a next step when you're ready.")} />
          {!blocked && <GrowthButton title={t("Find my next step")} onPress={() => openRequest("period")} />}
        </View>}
        {!!experience?.activeStep && Date.now() - Math.max(new Date(experience.activeStep.created_at).getTime(), new Date(experience.activeStep.accepted_at || 0).getTime(), ...experience.interactions.map((item) => new Date(item.created_at).getTime())) > 14 * 86400000 && <Text style={ui.caption}>{t("Welcome back. Does this step still fit? You can keep it, change it, or set it aside.")}</Text>}
        <View style={styles.actions}>
          <GrowthRow icon="lightning-bolt-outline" title={t("An opportunity right now")} subtitle={t("Get a small step for the moment you're in.")} disabled={blocked} onPress={() => openRequest("immediate")} />
          <GrowthRow icon="map-marker-outline" title={t("Explore nearby")} subtitle={t("Optional places and events to practise.")} onPress={() => setMode("events")} />
        </View>
      </>}

      {mode === "options" && <>
        <GrowthHeading title={t("Make it fit you")} subtitle={t("Your current step stays until you approve a change.")} />
        {(["easier", "change", "period", "review"] as GrowthRequestKind[]).filter((kind) => !!experience?.activeStep || !["easier", "change"].includes(kind)).map((kind) =>
          <GrowthRow key={kind} icon={kind === "easier" ? "feather" : kind === "period" ? "calendar-outline" : "compass-outline"} title={t(REQUEST_LABELS[kind])} disabled={blocked} onPress={() => openRequest(kind)} />)}
        {!!experience?.activeStep && <GrowthButton title={t("Set this step aside")} secondary disabled={blocked} onPress={() => confirm(t("Set this step aside?"), t("Your plan stays available. You can ask for another step whenever it fits."), [{ text: t("Cancel"), style: "cancel" }, { text: t("Set aside"), onPress: () => { void chooseStep("dismiss").then(() => setMode("home")); } }])} />}
      </>}

      {mode === "response" && <GrowthHeading title={t("A moment to reflect")} subtitle={t("Take what helps. You have the final say.")} />}
      {mode === "response" && !!response && !pendingInteractionId && (
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
              {!!response.next_step && <GrowthStepCard step={response.next_step} />}
              <Text style={styles.hint}>
                {t(response.proposed_plan_update
                  ? "This would revise your working plan. Nothing changes until you confirm."
                  : response.proposed_step_completion
                    ? "Should this count as your step report?"
                    : "Use this as your active step?")}
              </Text>
              <GrowthButton
                title={t("Confirm change")}
                disabled={saving}
                onPress={() => confirmResponse(true)}
              />
              <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={() => confirmResponse(false)} style={styles.textButton}>
                <Text style={styles.textButtonLabel}>{t("Keep my plan as it is")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {mode === "response" && pendingInteractionId && (
        <GrowthButton title={t("Retry response")} onPress={retryResponse} />
      )}
      {mode === "response" && !pendingInteractionId && response?.confirmation_status !== "pending" && <>
        {!!response?.clarification_question && <GrowthButton title={t("Write a reply")} onPress={() => setMode("journal")} />}
        <GrowthButton title={t("Back to today")} secondary onPress={() => setMode("home")} />
      </>}

      {mode === "history" && <>
        <GrowthHeading title={t("Your journal")} subtitle={t("A little space to notice what happens.")} />
        <GrowthRow icon="pencil-outline" title={t("Write an entry")} subtitle={t("A thought, a small win, or something that felt hard.")} disabled={blocked} onPress={() => setMode("journal")} />
        {Platform.OS !== "web" ? <GrowthRow icon="microphone-outline" title={t("Talk it through")} subtitle={t("Record, review the transcript, then share it.")} disabled={blocked} onPress={() => setMode("voice")} /> : <Text style={ui.caption}>{t("Voice journaling is available in the mobile app.")}</Text>}
        {blocked && <GrowthRow icon="message-text-outline" title={t("Review your pending response")} subtitle={t("Finish this check-in before adding another.")} onPress={() => setMode("response")} />}
        {!visibleInteractions.length && <View style={styles.emptyCard}><MaterialCommunityIcons name="notebook-outline" size={36} color={colors.light.primary} /><Text style={ui.rowTitle}>{t("Your story starts here")}</Text><Text style={ui.caption}>{t("Your entries and step check-ins will collect here. No daily streak to keep up with.")}</Text></View>}
      </>}
      {mode === "history" && !!visibleInteractions.length && (
        <View style={styles.history}>
          <Text style={styles.responseLabel}>{t("RECENT CHECK-INS")}</Text>
          {visibleInteractions.map((interaction) => (
            <TouchableOpacity accessibilityRole="button" key={interaction.id} style={styles.historyItem} onPress={() => { setSelectedEntry(interaction); setMode("entry"); }}>
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
                <Text numberOfLines={2} style={styles.historyText}>{interaction.journal_text}</Text>
              )}
              <Text style={ui.link}>{t("Read entry")}</Text>
            </TouchableOpacity>
          ))}
          {hasOlderJournals && (
            <GrowthButton
              title={t("Load older journals")}
              onPress={loadOlderJournals}
              disabled={loadingOlderJournals}
            />
          )}
        </View>
      )}
      {mode === "entry" && selectedEntry && <>
        <GrowthHeading eyebrow={new Date(selectedEntry.created_at).toLocaleDateString(language === "it" ? "it-IT" : "en-CA", { day: "numeric", month: "long", year: "numeric" })} title={t(selectedEntry.request_kind ? REQUEST_LABELS[selectedEntry.request_kind] : selectedEntry.kind === "report" ? "Step report" : selectedEntry.voice_journal_id ? "Voice journal" : "Journal")} />
        {!!selectedEntry.step_snapshot && <Text style={ui.caption}>{selectedEntry.step_snapshot.title}</Text>}
        {!!selectedEntry.report_outcome && <Text style={ui.rowTitle}>{t(OUTCOME_LABELS[selectedEntry.report_outcome])}{selectedEntry.follow_up ? ` · ${t(FOLLOW_UP_LABELS[selectedEntry.follow_up])}` : ""}</Text>}
        {!!selectedEntry.journal_text && <View style={styles.formCard}><Text style={ui.body}>{selectedEntry.journal_text}</Text></View>}
        {selectedEntry.kind === "journal" && <TouchableOpacity accessibilityRole="button" onPress={() => deleteJournal(selectedEntry.id)} style={styles.textButton} disabled={saving}><Text style={styles.historyDeleteLabel}>{t("Delete journal")}</Text></TouchableOpacity>}
      </>}


      {mode === "report" && (
        <View style={styles.formCard}>
          <Text style={ui.eyebrow}>{t("CHECK-IN (number) OF 3", { number: reportStage + 1 })}</Text>
          <Text style={ui.caption}>{experience?.activeStep?.title}</Text>
          {reportStage === 0 && <>
          <Text style={styles.formTitle}>{t("Did you try it?")}</Text>
          <View style={styles.chips}>
            {OUTCOMES.map(([value, label]) => (
              <ChoiceChip key={value} label={label} selected={outcome === value} onPress={() => {
                setOutcome(value);
                setFollowUp(null);
              }} />
            ))}
          </View>
          <GrowthButton title={t("Continue")} disabled={!outcome} onPress={() => setReportStage(1)} />
          </>}
          {reportStage === 1 && !!outcome && (
            <>
              <Text style={styles.formTitle}>
                {t(outcome === "didnt_do_it" ? "What got in the way?" : "How did it compare with what you expected?")}
              </Text>
              <View style={styles.chips}>
                {followUps.map(([value, label]) => (
                  <ChoiceChip key={value} label={label} selected={followUp === value} onPress={() => setFollowUp(value)} />
                ))}
              </View>
              <GrowthButton title={t("Continue")} disabled={!followUp} onPress={() => setReportStage(2)} />
            </>
          )}
          {reportStage === 2 && <>
          <GrowthHeading title={t("Anything to add?")} subtitle={t("A few words can help. Skipping is fine too.")} />
          <TextInput
            style={styles.input}
            value={journalText}
            onChangeText={setJournalText}
            placeholder={t("Optional: add what happened")}
            placeholderTextColor={colors.light.lightText}
            multiline
            accessibilityLabel={t("Optional: add what happened")}
            editable={!saving}
            maxLength={4000}
          />
          <GrowthButton title={t("Submit report")} onPress={submit} busy={saving} disabled={!outcome || !followUp} />
          </>}
        </View>
      )}

      {(mode === "journal" || mode === "request") && (
        <View style={styles.formCard}>
          <GrowthHeading title={t(mode === "request" ? REQUEST_LABELS[requestKind] : "What's on your mind?")} />
          <Text style={styles.hint}>
            {t(mode === "request" ? "Tell us what would help and the time you have. You'll review any change before it happens." : "Write freely. We'll reflect with you and ask before changing your plan.")}
          </Text>
          <TextInput
            style={[styles.input, styles.journalInput]}
            value={journalText}
            onChangeText={setJournalText}
            placeholder={t("Write a reflection, update, or correction")}
            placeholderTextColor={colors.light.lightText}
            multiline
            maxLength={4000}
            accessibilityLabel={t(mode === "request" ? "What would help?" : "Your journal entry")}
            editable={!saving}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{journalText.length}/4000</Text>
          <GrowthButton title={t(mode === "request" ? "Ask for guidance" : "Save & reflect")} onPress={submit} busy={saving} disabled={!journalText.trim()} />
        </View>
      )}

      {mode === "voice" && experience && (
        <VoiceJournalRecorder
          planId={experience.plan.id}
          stepId={experience.activeStep?.id}
          locale={language}
          onSubmitted={handleVoiceSubmitted}
          onUseText={() => setMode("journal")}
          onBusyChange={setVoiceBusy}
        />
      )}

      {user?.id && mode === "events" && <GrowthEventOpportunities userId={user.id} intakeId={activePlan.intake_id}
        onBusyChange={setVoiceBusy}
        onBackHandlerChange={setEventBackHandler}
        onChanged={refreshAfterMutation} blocked={saving || !!pendingInteractionId || response?.confirmation_status === "pending"} />}
      {saving && <ActivityIndicator color={colors.light.primary} />}
    </View>
    </ScrollView>
    {isTab && <View style={styles.tabs}>{TABS.map((tab) => <TouchableOpacity key={tab.screen} accessibilityRole="tab" accessibilityState={{ selected: mode === tab.screen }} onPress={() => setMode(tab.screen)} style={[styles.tab, mode === tab.screen && styles.activeTab]}>
      <MaterialCommunityIcons name={tab.icon} size={23} color={colors.light.primary} /><Text style={[styles.tabLabel, mode === tab.screen && styles.activeTabLabel]}>{t(tab.label)}</Text>
    </TouchableOpacity>)}</View>}
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeTab: { backgroundColor: colors.light.accent2 },
  activeTabLabel: { fontWeight: "800" },
  brand: { color: colors.light.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.6, flex: 1, textAlign: "center" },
  characterCount: { color: colors.neutral.grey3, fontSize: 12, textAlign: "right" },
  content: { padding: 20, paddingBottom: 32, width: "100%", maxWidth: 680, alignSelf: "center", flexGrow: 1 },
  emptyCard: { alignItems: "center", gap: 12, padding: 28, backgroundColor: colors.light.accent3, borderRadius: 22 },
  flex: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", gap: 14 },
  navigation: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 4 },
  navButton: { height: 48, width: 48, alignItems: "center", justifyContent: "center" },
  navSpacer: { width: 48 },
  screen: { flex: 1, backgroundColor: colors.light.background },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 4, gap: 5, borderRadius: 18, minHeight: 64 },
  tabLabel: { color: colors.light.primary, fontSize: 12, textAlign: "center" },
  tabs: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8, gap: 5, backgroundColor: colors.light.background, borderTopWidth: 1, borderTopColor: colors.neutral.grey2 },
  actions: { gap: 10 },
  chip: {
    minHeight: 44,
    justifyContent: "center",
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
  formCard: { backgroundColor: colors.neutral.white, borderRadius: 24, gap: 20, padding: 22 },
  formTitle: { color: colors.light.text, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.neutral.grey3, fontSize: 14, lineHeight: 21 },
  history: { gap: 10 },
  historyItem: { backgroundColor: colors.neutral.white, borderRadius: 18, padding: 18, gap: 10 },
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
  journalInput: { minHeight: 220, lineHeight: 24, padding: 16 },
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
  textButton: { alignItems: "center", justifyContent: "center", padding: 10, minHeight: 44 },
  textButtonLabel: { color: colors.light.primary, fontSize: 14, fontWeight: "700" },
});
