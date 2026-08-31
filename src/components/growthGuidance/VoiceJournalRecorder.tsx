import React, { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { randomUUID } from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GROWTH_GUIDANCE_EVENTS } from "../../constants/analyticsEvents";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { captureEvent } from "../../lib/posthog";
import { growthGuidanceService } from "../../services/growthGuidanceService";
import {
  GrowthAdaptiveResponse,
  GrowthInteraction,
} from "../../types/growthGuidance";
import {
  formatVoiceJournalDuration,
  getVoiceJournalDraftRecovery,
  MAX_VOICE_JOURNAL_DURATION_MS,
  normalizeVoiceJournalDuration,
} from "../../utils/voiceJournal";
import { FeatureActionButton } from "../FeatureActionButton";
import { Text } from "../StyledText";

type VoicePhase =
  | "intro"
  | "recording"
  | "recorded"
  | "processing"
  | "review"
  | "failed";

type SubmissionResult = {
  interaction: GrowthInteraction;
  response: GrowthAdaptiveResponse | null;
};

export function VoiceJournalRecorder({
  planId,
  stepId,
  locale,
  onSubmitted,
  onUseText,
}: {
  planId: string;
  stepId?: string;
  locale: string;
  onSubmitted: (result: SubmissionResult) => Promise<void>;
  onUseText: () => void;
}) {
  const { t } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const stoppingRef = useRef(false);
  const mountedRef = useRef(true);
  const recoveryRequestRef = useRef(0);
  const interactionIdRef = useRef(randomUUID());
  const startGenerationRef = useRef(0);
  const startingRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const [phase, setPhase] = useState<VoicePhase>("processing");
  const [durationMs, setDurationMs] = useState(0);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [audioUploaded, setAudioUploaded] = useState(false);
  const [voiceJournalId, setVoiceJournalId] = useState<string | null>(null);
  const [machineTranscript, setMachineTranscript] = useState("");
  const [reviewedTranscript, setReviewedTranscript] = useState("");
  const [message, setMessage] = useState("");

  const removeLocalFile = useCallback(async (uri: string | null) => {
    if (!uri) return;
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // The OS can remove temporary recorder files before cleanup.
    }
  }, []);

  const resetAudioMode = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch {
      // A recorder teardown should still complete if the audio session reset fails.
    }
  }, []);

  const finishRecording = useCallback(async (interrupted = false) => {
    const recording = recordingRef.current;
    if (!recording || stoppingRef.current) return;
    stoppingRef.current = true;
    recordingRef.current = null;
    try {
      const status = await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri || status.durationMillis < 500) {
        await removeLocalFile(uri);
        throw new Error("recording_too_short");
      }
      if (mountedRef.current) {
        setDurationMs(normalizeVoiceJournalDuration(status.durationMillis));
        setLocalUri(uri);
        setAudioUploaded(false);
        setPhase("recorded");
        setMessage(interrupted
          ? tRef.current("Recording stopped when the app was interrupted. You can continue from here.")
          : "");
      }
    } catch {
      if (mountedRef.current) {
        setPhase("failed");
        setMessage(tRef.current("We couldn't keep that recording. You can try again or write instead."));
      }
    } finally {
      await resetAudioMode();
      stoppingRef.current = false;
    }
  }, [removeLocalFile, resetAudioMode]);

  useEffect(() => {
    mountedRef.current = true;
    const subscription = AppState.addEventListener("change", (state) => {
      appStateRef.current = state;
      if (state !== "active") {
        startGenerationRef.current += 1;
        startingRef.current = false;
        if (recordingRef.current) void finishRecording(true);
      }
    });
    return () => {
      mountedRef.current = false;
      startGenerationRef.current += 1;
      subscription.remove();
      const recording = recordingRef.current;
      recordingRef.current = null;
      if (recording) {
        void recording.stopAndUnloadAsync().then(() =>
          removeLocalFile(recording.getURI())
        ).catch(() => undefined).finally(() => resetAudioMode());
      }
    };
  }, [finishRecording, removeLocalFile, resetAudioMode]);

  useEffect(() => {
    return () => {
      void removeLocalFile(localUri);
    };
  }, [localUri, removeLocalFile]);

  useEffect(() => {
    if (phase === "recording" && durationMs >= MAX_VOICE_JOURNAL_DURATION_MS) {
      void finishRecording();
    }
  }, [durationMs, finishRecording, phase]);

  useEffect(() => {
    let active = true;
    const request = ++recoveryRequestRef.current;
    void growthGuidanceService.fetchVoiceJournalDraft().then((draft) => {
      if (!active || request !== recoveryRequestRef.current) return;
      if (!draft) {
        setPhase("intro");
        return;
      }
      const recovery = getVoiceJournalDraftRecovery(draft, planId);
      if (recovery === "discard_stale") {
        void growthGuidanceService.deleteJournal({ voiceJournalId: draft.id }).then(() => {
          if (active && request === recoveryRequestRef.current) setPhase("intro");
        }).catch(() => {
          if (!active || request !== recoveryRequestRef.current) return;
          setVoiceJournalId(draft.id);
          setAudioUploaded(true);
          setPhase("failed");
          setMessage(tRef.current("We couldn't discard the saved recording. Please try again."));
        });
        return;
      }
      setVoiceJournalId(draft.id);
      setDurationMs(draft.duration_ms);
      setAudioUploaded(true);
      if (recovery === "review" && draft.machine_transcript) {
        setMachineTranscript(draft.machine_transcript);
        setReviewedTranscript(draft.machine_transcript);
        setPhase("review");
        setMessage(tRef.current("Review this transcript before it becomes journal evidence."));
      } else {
        setPhase("failed");
        setMessage(tRef.current("Your recording is saved privately. Retry transcription or discard it."));
      }
    }).catch(() => {
      if (active && request === recoveryRequestRef.current) setPhase("intro");
    });
    return () => {
      active = false;
    };
  }, [planId]);

  const startRecording = async () => {
    if (startingRef.current || recordingRef.current) return;
    recoveryRequestRef.current += 1;
    const generation = ++startGenerationRef.current;
    startingRef.current = true;
    let recording: Audio.Recording | null = null;
    const startupIsActive = () =>
      mountedRef.current && appStateRef.current === "active" &&
      generation === startGenerationRef.current;
    setMessage("");
    try {
      const currentPermission = await Audio.getPermissionsAsync();
      if (!startupIsActive()) return;
      const permission = currentPermission.granted
        ? currentPermission
        : await Audio.requestPermissionsAsync();
      if (!startupIsActive()) return;
      if (!permission.granted) {
        captureEvent(GROWTH_GUIDANCE_EVENTS.VOICE_PERMISSION_DENIED);
        setMessage(t("Microphone access was declined. You can keep journaling by typing."));
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      if (!startupIsActive()) throw new Error("recording_start_cancelled");
      recording = new Audio.Recording();
      recording.setProgressUpdateInterval(250);
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.canRecord && mountedRef.current) {
          setDurationMs(status.durationMillis);
        }
      });
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      if (!startupIsActive()) throw new Error("recording_start_cancelled");
      recordingRef.current = recording;
      await recording.startAsync();
      if (!startupIsActive()) throw new Error("recording_start_cancelled");
      setDurationMs(0);
      setPhase("recording");
      captureEvent(GROWTH_GUIDANCE_EVENTS.VOICE_RECORDING_STARTED);
    } catch {
      if (recordingRef.current === recording) recordingRef.current = null;
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
          await removeLocalFile(recording.getURI());
        } catch {
          // A cancelled startup may already have been unloaded by component cleanup.
        }
      }
      await resetAudioMode();
      if (startupIsActive()) {
        setPhase("failed");
        setMessage(t("Recording isn't available right now. You can try again or write instead."));
      }
    } finally {
      if (generation === startGenerationRef.current) startingRef.current = false;
    }
  };

  const cancelRecording = async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;
    stoppingRef.current = true;
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        await removeLocalFile(recording.getURI());
      }
    } catch {
      // Cancellation intentionally discards any partial file.
    } finally {
      stoppingRef.current = false;
      await resetAudioMode();
      setDurationMs(0);
      setPhase("intro");
      setMessage("");
      captureEvent(GROWTH_GUIDANCE_EVENTS.VOICE_RECORDING_CANCELLED);
    }
  };

  const processRecording = async () => {
    if ((!localUri && !audioUploaded) || durationMs < 500) return;
    setPhase("processing");
    setMessage("");
    const draftId = voiceJournalId || randomUUID();
    setVoiceJournalId(draftId);
    try {
      const draft = await growthGuidanceService.beginVoiceJournal({
        voiceJournalId: draftId,
        planId,
        stepId,
        durationMs,
      });
      if (!audioUploaded) {
        if (!localUri) throw new Error("voice_recording_unavailable");
        await growthGuidanceService.uploadVoiceJournalAudio(draft, localUri);
        setAudioUploaded(true);
        await removeLocalFile(localUri);
        setLocalUri(null);
      }
      const result = await growthGuidanceService.transcribeVoiceJournal(
        draftId,
        locale
      );
      setMachineTranscript(result.transcript);
      setReviewedTranscript(result.transcript);
      setPhase("review");
      setMessage(t("Review this transcript before it becomes journal evidence."));
      captureEvent(GROWTH_GUIDANCE_EVENTS.VOICE_TRANSCRIBED);
    } catch {
      setPhase("failed");
      setMessage(t("We couldn't transcribe that recording. Your audio is private and you can retry, discard it, or write instead."));
    }
  };

  const discard = async () => {
    setPhase("processing");
    setMessage("");
    try {
      if (voiceJournalId) {
        await growthGuidanceService.deleteJournal({ voiceJournalId });
      }
      await removeLocalFile(localUri);
      setLocalUri(null);
      setVoiceJournalId(null);
      interactionIdRef.current = randomUUID();
      setMachineTranscript("");
      setReviewedTranscript("");
      setAudioUploaded(false);
      setDurationMs(0);
      setPhase("intro");
      captureEvent(GROWTH_GUIDANCE_EVENTS.VOICE_DISCARDED);
    } catch {
      setPhase("failed");
      setMessage(t("We couldn't discard the saved recording. Please try again."));
    }
  };

  const submit = async () => {
    if (!voiceJournalId || !reviewedTranscript.trim()) return;
    setPhase("processing");
    setMessage("");
    try {
      const result = await growthGuidanceService.submitVoiceJournal({
        voiceJournalId,
        interactionId: interactionIdRef.current,
        reviewedTranscript,
        locale,
      });
      captureEvent(GROWTH_GUIDANCE_EVENTS.VOICE_JOURNAL_SUBMITTED, {
        transcript_edited: reviewedTranscript.trim() !== machineTranscript.trim(),
      });
      await onSubmitted(result);
    } catch {
      setPhase("review");
      setMessage(t("We couldn't submit that transcript. Your reviewed text is still here."));
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("Voice journal")}</Text>
      {phase === "intro" && (
        <>
          <Text style={styles.body}>
            {t("With your permission, StepnOut records audio on this device, uploads it to private storage, and sends it for transcription. Your audio and reviewed transcript are stored until you delete the journal.")}
          </Text>
          <Text style={styles.body}>
            {t("The transcript becomes evidence only after you review and submit it. You can edit or discard it, and voice journaling never collects your location.")}
          </Text>
          <FeatureActionButton
            title={t("Start recording")}
            onPress={startRecording}
            variant="pill"
          />
        </>
      )}

      {phase === "recording" && (
        <>
          <Text style={styles.timer}>{formatVoiceJournalDuration(durationMs)} / 3:00</Text>
          <Text style={styles.recordingLabel}>{t("Recording…")}</Text>
          <FeatureActionButton
            title={t("Finish recording")}
            onPress={() => finishRecording()}
            variant="pill"
          />
          <TouchableOpacity onPress={cancelRecording} style={styles.textButton}>
            <Text style={styles.textButtonLabel}>{t("Cancel and discard")}</Text>
          </TouchableOpacity>
        </>
      )}

      {phase === "recorded" && (
        <>
          <Text style={styles.body}>
            {t("Recording ready")} · {formatVoiceJournalDuration(durationMs)}
          </Text>
          <FeatureActionButton
            title={t("Upload and transcribe")}
            onPress={processRecording}
            variant="pill"
          />
          <TouchableOpacity onPress={discard} style={styles.textButton}>
            <Text style={styles.textButtonLabel}>{t("Discard recording")}</Text>
          </TouchableOpacity>
        </>
      )}

      {phase === "review" && (
        <>
          <Text style={styles.body}>
            {t("Correct anything that was transcribed inaccurately. Only this reviewed text will become evidence.")}
          </Text>
          <TextInput
            style={styles.input}
            value={reviewedTranscript}
            onChangeText={setReviewedTranscript}
            multiline
            maxLength={4000}
            textAlignVertical="top"
            placeholder={t("Review your transcript")}
            placeholderTextColor={colors.light.lightText}
          />
          <FeatureActionButton
            title={t("Submit reviewed transcript")}
            onPress={submit}
            disabled={!reviewedTranscript.trim()}
            variant="pill"
          />
          <TouchableOpacity onPress={discard} style={styles.textButton}>
            <Text style={styles.textButtonLabel}>{t("Discard audio and transcript")}</Text>
          </TouchableOpacity>
        </>
      )}

      {phase === "failed" && (
        <>
          {(audioUploaded || !!localUri) && (
            <FeatureActionButton
              title={t(audioUploaded ? "Retry transcription" : "Retry upload and transcription")}
              onPress={processRecording}
              variant="pill"
            />
          )}
          {!voiceJournalId && (
            <FeatureActionButton
              title={t("Try recording again")}
              onPress={startRecording}
              variant="pill"
            />
          )}
          {(voiceJournalId || localUri) && (
            <TouchableOpacity onPress={discard} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>{t("Discard recording")}</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {phase === "processing" && (
        <ActivityIndicator color={colors.light.primary} />
      )}
      {!!message && <Text style={styles.message}>{message}</Text>}
      {phase !== "recording" && phase !== "processing" && (
        <TouchableOpacity onPress={onUseText} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>{t("Write instead")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.light.text, fontSize: 14, lineHeight: 21 },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    gap: 14,
    padding: 16,
  },
  input: {
    backgroundColor: colors.light.background,
    borderColor: colors.neutral.grey2,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.light.text,
    fontSize: 15,
    minHeight: 180,
    padding: 12,
  },
  message: { color: colors.light.primary, fontSize: 13, lineHeight: 19 },
  recordingLabel: {
    color: colors.light.alertRed,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  textButton: { alignItems: "center", padding: 8 },
  textButtonLabel: { color: colors.light.primary, fontSize: 14, fontWeight: "700" },
  timer: { color: colors.light.text, fontSize: 28, fontWeight: "800", textAlign: "center" },
  title: { color: colors.light.text, fontSize: 20, fontWeight: "800" },
});
