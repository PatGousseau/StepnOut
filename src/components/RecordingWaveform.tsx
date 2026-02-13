import React, { useEffect, useRef, useState } from "react";
import { View, ViewStyle, TextStyle } from "react-native";
import { Audio } from "expo-av";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";

interface RecordingWaveformProps {
  recording: Audio.Recording;
  isRecording: boolean;
  compact?: boolean;
}

const BAR_COUNT = 20;
const POLL_MS = 120;
const MIN_HEIGHT = 0.08;
const MAX_HEIGHT = 1.0;

const dbToNormalized = (db: number | undefined): number => {
  if (db === undefined || db === null) {
    return MIN_HEIGHT + Math.random() * 0.15;
  }
  // metering dB typically ranges from -160 (silence) to 0 (max)
  const clamped = Math.max(-60, Math.min(0, db));
  return MIN_HEIGHT + ((clamped + 60) / 60) * (MAX_HEIGHT - MIN_HEIGHT);
};

const formatElapsed = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

export const RecordingWaveform: React.FC<RecordingWaveformProps> = ({
  recording,
  isRecording,
  compact = false,
}) => {
  const [levels, setLevels] = useState<number[]>(() =>
    Array(BAR_COUNT).fill(MIN_HEIGHT)
  );
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const status = await recording.getStatusAsync();
        if (!status.isRecording) return;

        const metering = (status as any).metering;
        const norm = dbToNormalized(metering);

        setLevels((prev) => {
          const next = [...prev.slice(1), norm];
          return next;
        });
        setElapsed(status.durationMillis || 0);
      } catch {
        // recording may have been stopped
      }
    }, POLL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [recording, isRecording]);

  const barHeight = compact ? 16 : 24;
  const barWidth = compact ? 2 : 3;
  const gap = compact ? 1.5 : 2;

  return (
    <View style={[containerStyle, compact && compactContainerStyle]}>
      <View style={[barsContainerStyle, { height: barHeight }]}>
        {levels.map((level, i) => (
          <View
            key={i}
            style={{
              width: barWidth,
              height: Math.max(2, level * barHeight),
              backgroundColor: colors.light.accent,
              borderRadius: barWidth / 2,
              marginHorizontal: gap / 2,
            }}
          />
        ))}
      </View>
      <Text style={[timeStyle, compact && compactTimeStyle]}>
        {formatElapsed(elapsed)}
      </Text>
    </View>
  );
};

const containerStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingVertical: 4,
  paddingHorizontal: 6,
};

const compactContainerStyle: ViewStyle = {
  gap: 6,
  paddingVertical: 2,
  paddingHorizontal: 4,
};

const barsContainerStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const timeStyle: TextStyle = {
  fontSize: 13,
  color: colors.light.accent,
  fontVariant: ["tabular-nums"],
  minWidth: 32,
};

const compactTimeStyle: TextStyle = {
  fontSize: 11,
};
