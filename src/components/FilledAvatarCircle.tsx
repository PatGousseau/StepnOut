import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export type FilledAvatarCircleUser = {
  id: string;
  username?: string | null;
  profileImageUrl: string | null;
};

type Props = {
  users: FilledAvatarCircleUser[];
  intervalMs?: number;
};

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function computeAvatarSize(containerSize: number, n: number) {
  if (!containerSize || n <= 0) return 32;
  const k = 0.75;
  const s = (k * containerSize) / Math.sqrt(n);
  return Math.round(clamp(18, s, 44));
}

function computePositions(n: number, radius: number) {
  const positions = new Array(n);
  for (let i = 0; i < n; i++) {
    const theta = i * GOLDEN_ANGLE;
    const r = radius * Math.sqrt((i + 0.5) / n);
    positions[i] = {
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
    };
  }
  return positions as Array<{ x: number; y: number }>;
}

export function FilledAvatarCircle({ users, intervalMs = 2000 }: Props) {
  const [size, setSize] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const avatarSize = useMemo(() => computeAvatarSize(size, users.length), [size, users.length]);
  const padding = 6;
  const radius = useMemo(() => {
    if (!size) return 0;
    return size / 2 - avatarSize / 2 - padding;
  }, [size, avatarSize]);

  const positions = useMemo(() => computePositions(users.length, radius), [users.length, radius]);

  const scale = useRef(new Animated.Value(1)).current;
  const prevIndexRef = useRef(0);

  useEffect(() => {
    prevIndexRef.current = highlightedIndex;
    scale.setValue(1);
    Animated.spring(scale, {
      toValue: 1.85,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();
  }, [highlightedIndex, scale]);

  useEffect(() => {
    if (users.length <= 1) return;
    const t = setInterval(() => {
      setHighlightedIndex((i) => (i + 1) % users.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [users.length, intervalMs]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    const h = e.nativeEvent.layout.height;
    const next = Math.floor(Math.min(w, h));
    if (next && next !== size) setSize(next);
  };

  const center = size / 2;

  return (
    <View style={styles.container} onLayout={onLayout}>
      {size > 0 &&
        users.map((u, i) => {
          const p = positions[i];
          const left = center + p.x - avatarSize / 2;
          const top = center + p.y - avatarSize / 2;
          const isHighlighted = i === highlightedIndex;

          return (
            <View
              key={u.id}
              style={[
                styles.avatarContainer,
                {
                  width: avatarSize,
                  height: avatarSize,
                  left,
                  top,
                  zIndex: isHighlighted ? 10 : 1,
                },
              ]}
            >
              <Animated.View
                style={isHighlighted ? { transform: [{ scale }] } : undefined}
              >
                {u.profileImageUrl ? (
                  <Image
                    source={{ uri: u.profileImageUrl }}
                    style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View
                    style={{
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: avatarSize / 2,
                      backgroundColor: colors.neutral.grey2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: colors.neutral.grey1,
                    }}
                  >
                    <Ionicons name="person" size={Math.round(avatarSize * 0.5)} color={colors.neutral.grey2} />
                  </View>
                )}

                {isHighlighted && (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      borderRadius: avatarSize,
                      borderWidth: 2,
                      borderColor: colors.light.primary,
                      opacity: 0.95,
                    }}
                  />
                )}
              </Animated.View>
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
  },
  avatarContainer: {
    position: 'absolute',
  },
});
