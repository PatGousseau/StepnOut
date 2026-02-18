import { useState } from "react";
import { Alert } from "react-native";
import { Audio } from "expo-av";
import { useLanguage } from "../contexts/LanguageContext";
import { createVoiceMemoForPreview, MediaSelectionResult } from "../utils/handleMediaUpload";

export const useVoiceMemoRecorder = (options: {
  onCreated: (memo: MediaSelectionResult) => void;
}) => {
  const { t } = useLanguage();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const start = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("Microphone access required"),
        t("Please enable microphone permissions to record a voice memo.")
      );
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      console.error("Error starting voice recording:", e);
      Alert.alert(t("Recording error"), t("Couldn't start recording"));
    }
  };

  const stop = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) return;

      const memo = await createVoiceMemoForPreview({ uri });
      options.onCreated(memo);
    } catch (e) {
      console.error("Error stopping voice recording:", e);
      Alert.alert(t("Recording error"), t("Couldn't save recording"));
    }
  };

  const toggle = async () => {
    if (isRecording) return stop();
    return start();
  };

  return {
    recording,
    isRecording,
    toggle,
    start,
    stop,
  };
};
