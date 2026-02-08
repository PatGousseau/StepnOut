import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import Icon from "react-native-vector-icons/FontAwesome";
import { colors } from "../constants/Colors";

interface VoiceMemoPlayerProps {
  uri: string;
  compact?: boolean;
}

export const VoiceMemoPlayer: React.FC<VoiceMemoPlayerProps> = ({ uri, compact }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    }).catch(() => {
    });

    return () => {
      soundRef.current?.unloadAsync().catch(() => {
      });
      soundRef.current = null;
    };
  }, [uri]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const loadIfNeeded = async () => {
    if (soundRef.current) return;

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      (status) => {
        if (!status.isLoaded) {
          setIsLoaded(false);
          setIsPlaying(false);
          return;
        }
        setIsLoaded(true);
        setIsPlaying(status.isPlaying);
        setPositionMs(status.positionMillis ?? 0);
        setDurationMs(status.durationMillis ?? null);
      }
    );

    soundRef.current = sound;
  };

  const toggle = async () => {
    await loadIfNeeded();

    const sound = soundRef.current;
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const pct = durationMs ? Math.min(positionMs / durationMs, 1) : 0;

  return (
    <View style={[styles.container, compact ? styles.compact : null]}>
      <TouchableOpacity onPress={toggle} style={styles.playButton} activeOpacity={0.8}>
        <Icon name={isPlaying ? "pause" : "play"} size={compact ? 14 : 16} color={"white"} />
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
        </View>
        <Text style={styles.time}>
          {formatTime(positionMs)}{durationMs ? ` / ${formatTime(durationMs)}` : isLoaded ? "" : ""}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.neutral.grey3,
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light.accent,
  },
  body: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.grey3,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.light.accent,
  },
  time: {
    marginTop: 6,
    fontSize: 12,
    color: colors.neutral.grey1,
  },
});
