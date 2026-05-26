import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';

const BURST_SIZE = 220;
const RAY_COUNT = 18;
const SPARKLE_COUNT = 14;
const SWIRL_DURATION = 3400;
const TROPHY_ROTATIONS = 4;
const SPIRAL_REVOLUTIONS = 3.25;
const SPIRAL_SAMPLES = 144;
const TRAIL_DOT_COUNT = 110;
const TRAIL_DOT_MIN = 4;
const TRAIL_DOT_MAX = 56;

type CompletionBurstVariant = 'challenge' | 'quest';

type TrailDot = {
  x: number;
  y: number;
  size: number;
  threshold: number;
};

type SwirlPath = {
  input: number[];
  xs: number[];
  ys: number[];
  dots: TrailDot[];
};

const buildSwirlPath = (): SwirlPath => {
  const { width, height } = Dimensions.get('window');
  const maxRadiusX = Math.min(width * 0.46, 220);
  const maxRadiusY = Math.min(height * 0.36, 320);
  const input: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= SPIRAL_SAMPLES; i++) {
    const p = i / SPIRAL_SAMPLES;
    const radiusFactor = Math.pow(1 - p, 1.6);
    const angle = p * SPIRAL_REVOLUTIONS * Math.PI * 2 - Math.PI / 2;
    input.push(p);
    xs.push(Math.cos(angle) * maxRadiusX * radiusFactor);
    ys.push(Math.sin(angle) * maxRadiusY * radiusFactor);
  }
  xs[xs.length - 1] = 0;
  ys[ys.length - 1] = 0;

  const cumLen: number[] = [0];
  for (let i = 1; i < xs.length; i++) {
    cumLen.push(cumLen[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
  }
  const totalLen = cumLen[cumLen.length - 1];

  const dots: TrailDot[] = [];
  let j = 0;
  for (let i = 0; i < TRAIL_DOT_COUNT; i++) {
    const targetLen = (i / (TRAIL_DOT_COUNT - 1)) * totalLen;
    while (j < cumLen.length - 2 && cumLen[j + 1] < targetLen) j++;
    const segLen = cumLen[j + 1] - cumLen[j] || 1;
    const t = (targetLen - cumLen[j]) / segLen;
    const x = xs[j] + (xs[j + 1] - xs[j]) * t;
    const y = ys[j] + (ys[j + 1] - ys[j]) * t;
    const p = input[j] + (input[j + 1] - input[j]) * t;
    dots.push({
      x,
      y,
      size: TRAIL_DOT_MIN + (TRAIL_DOT_MAX - TRAIL_DOT_MIN) * p,
      threshold: p,
    });
  }

  return { input, xs, ys, dots };
};

interface CompletionBurstProps {
  title: string;
  variant?: CompletionBurstVariant;
}

type BurstTheme = {
  rayPrimary: string;
  raySecondary: string;
  glowInner: string;
  glowMid: string;
  glowOuter: string;
  ring: string;
  trail: string;
  sparklePrimary: string;
  sparkleSecondary: string;
  heroShadow: string;
  titleColor: string;
};

const BURST_THEMES: Record<CompletionBurstVariant, BurstTheme> = {
  challenge: {
    rayPrimary: '#FFE27A',
    raySecondary: '#FF9A4D',
    glowInner: '#FFE27A',
    glowMid: '#FFB347',
    glowOuter: '#FF6B3D',
    ring: '#FFE27A',
    trail: '#FFE27A',
    sparklePrimary: '#FFFFFF',
    sparkleSecondary: '#FFE27A',
    heroShadow: '#FF9A4D',
    titleColor: colors.light.text,
  },
  quest: {
    rayPrimary: '#FFD7C8',
    raySecondary: colors.sideQuest.highlightAlt,
    glowInner: '#FFF1EC',
    glowMid: '#F6B099',
    glowOuter: colors.sideQuest.base,
    ring: '#F09A81',
    trail: '#FFC1AD',
    sparklePrimary: '#FFF8F5',
    sparkleSecondary: '#F09A81',
    heroShadow: colors.sideQuest.base,
    titleColor: colors.sideQuest.textStrong,
  },
};

const Rays: React.FC<{ theme: BurstTheme }> = ({ theme }) => {
  const paths = useMemo(() => {
    const items: { d: string; fill: string }[] = [];
    const cx = BURST_SIZE / 2;
    const cy = BURST_SIZE / 2;
    const inner = 42;
    const outer = BURST_SIZE / 2;
    const halfAngle = (Math.PI * 2) / RAY_COUNT / 4;
    for (let i = 0; i < RAY_COUNT; i++) {
      const a = (i / RAY_COUNT) * Math.PI * 2;
      const x1 = cx + Math.cos(a - halfAngle) * inner;
      const y1 = cy + Math.sin(a - halfAngle) * inner;
      const x2 = cx + Math.cos(a) * outer;
      const y2 = cy + Math.sin(a) * outer;
      const x3 = cx + Math.cos(a + halfAngle) * inner;
      const y3 = cy + Math.sin(a + halfAngle) * inner;
      items.push({
        d: `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`,
        fill: i % 2 === 0 ? 'url(#rayGold)' : 'url(#rayAmber)',
      });
    }
    return items;
  }, []);

  return (
    <Svg width={BURST_SIZE} height={BURST_SIZE} viewBox={`0 0 ${BURST_SIZE} ${BURST_SIZE}`}>
      <Defs>
        <LinearGradient id="rayGold" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor={theme.rayPrimary} stopOpacity="1" />
          <Stop offset="1" stopColor={theme.rayPrimary} stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="rayAmber" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor={theme.raySecondary} stopOpacity="0.95" />
          <Stop offset="1" stopColor={theme.raySecondary} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {paths.map((p, i) => (
        <Path key={i} d={p.d} fill={p.fill} />
      ))}
    </Svg>
  );
};

const Glow: React.FC<{ theme: BurstTheme }> = ({ theme }) => (
  <Svg width={BURST_SIZE} height={BURST_SIZE} viewBox={`0 0 ${BURST_SIZE} ${BURST_SIZE}`}>
    <Defs>
      <RadialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor={theme.glowInner} stopOpacity="0.85" />
        <Stop offset="0.45" stopColor={theme.glowMid} stopOpacity="0.28" />
        <Stop offset="1" stopColor={theme.glowOuter} stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Rect x="0" y="0" width={BURST_SIZE} height={BURST_SIZE} fill="url(#glow)" />
  </Svg>
);

const ShockRing: React.FC<{ theme: BurstTheme }> = ({ theme }) => (
  <Svg width={BURST_SIZE} height={BURST_SIZE} viewBox={`0 0 ${BURST_SIZE} ${BURST_SIZE}`}>
    <Circle
      cx={BURST_SIZE / 2}
      cy={BURST_SIZE / 2}
      r={56}
      fill="none"
      stroke={theme.ring}
      strokeWidth={3}
    />
  </Svg>
);

const Sparkle: React.FC<{ index: number; theme: BurstTheme; trigger: number }> = ({
  index,
  theme,
  trigger,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const angle = (index / SPARKLE_COUNT) * Math.PI * 2;
  const distance = 95 + (index % 4) * 18;
  const delay = index * 10;

  useEffect(() => {
    if (trigger === 0) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 1050,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [trigger, progress, delay]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(angle) * distance],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(angle) * distance],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.12, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.3, 1.2, 0.4],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.sparkle,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate: `${index * 32}deg` },
          ],
        },
      ]}
    >
      <MaterialCommunityIcons
        name={index % 2 === 0 ? 'star-four-points' : 'star'}
        size={16}
        color={index % 3 === 0 ? theme.sparklePrimary : theme.sparkleSecondary}
      />
    </Animated.View>
  );
};

const TrailDot: React.FC<{
  dot: TrailDot;
  theme: BurstTheme;
  trophyProgress: Animated.Value;
  tailOpacity: Animated.Value;
}> = ({ dot, theme, trophyProgress, tailOpacity }) => {
  const ramp = 0.03;
  const fade = 0.22;
  const peakIn = dot.threshold;
  const peakOut = Math.min(1, peakIn + fade);
  const inputRange: number[] = [];
  const outputRange: number[] = [];
  if (peakIn > 0) {
    const start = Math.max(0, peakIn - ramp);
    if (start < peakIn) {
      inputRange.push(start);
      outputRange.push(0);
    }
  }
  inputRange.push(peakIn);
  outputRange.push(1);
  if (peakOut > peakIn) {
    inputRange.push(peakOut);
    outputRange.push(0);
  }
  if (peakOut < 1) {
    inputRange.push(1);
    outputRange.push(0);
  }
  const reveal = trophyProgress.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
  const opacity = Animated.multiply(reveal, tailOpacity);
  const half = dot.size / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: BURST_SIZE / 2 + dot.x - half,
        top: BURST_SIZE / 2 + dot.y - half,
        width: dot.size,
        height: dot.size,
        borderRadius: half,
        backgroundColor: theme.trail,
        opacity,
      }}
    />
  );
};

const Trophy: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="trGoldMain" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFF2A8" />
        <Stop offset="0.35" stopColor="#F5C543" />
        <Stop offset="1" stopColor="#8E5A14" />
      </LinearGradient>
      <LinearGradient id="trGoldHi" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFFBE0" />
        <Stop offset="1" stopColor="#FFD970" />
      </LinearGradient>
      <LinearGradient id="trGoldSide" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#7A4A0E" stopOpacity="0.55" />
        <Stop offset="0.5" stopColor="#F5C543" stopOpacity="0" />
        <Stop offset="1" stopColor="#7A4A0E" stopOpacity="0.55" />
      </LinearGradient>
      <LinearGradient id="trBaseGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F5C543" />
        <Stop offset="1" stopColor="#7A4A0E" />
      </LinearGradient>
    </Defs>

    <Path
      d="M 28 30 C 8 30, 8 62, 30 60 L 30 54 C 18 55, 18 37, 28 35 Z"
      fill="url(#trGoldMain)"
      stroke="#5C3A0A"
      strokeWidth="0.6"
    />
    <Path
      d="M 72 30 C 92 30, 92 62, 70 60 L 70 54 C 82 55, 82 37, 72 35 Z"
      fill="url(#trGoldMain)"
      stroke="#5C3A0A"
      strokeWidth="0.6"
    />

    <Path
      d="M 22 22 L 78 22 L 74 56 C 72 64, 60 70, 50 70 C 40 70, 28 64, 26 56 Z"
      fill="url(#trGoldMain)"
      stroke="#5C3A0A"
      strokeWidth="0.7"
    />
    <Path
      d="M 22 22 L 78 22 L 74 56 C 72 64, 60 70, 50 70 C 40 70, 28 64, 26 56 Z"
      fill="url(#trGoldSide)"
    />

    <Path
      d="M 20 19 L 80 19 L 78 27 L 22 27 Z"
      fill="url(#trGoldHi)"
      stroke="#5C3A0A"
      strokeWidth="0.6"
    />
    <Ellipse cx="50" cy="22" rx="27" ry="3.2" fill="#3D2806" opacity="0.6" />
    <Ellipse cx="50" cy="22" rx="22" ry="1.6" fill="#FFFBE0" opacity="0.4" />

    <Path d="M 33 30 L 32 58 L 37 58 L 38.5 30 Z" fill="#FFFBE0" opacity="0.5" />
    <Path d="M 60 30 L 60 55 L 62 55 L 62.5 30 Z" fill="#7A4A0E" opacity="0.35" />

    <Path
      d="M 44 70 L 56 70 L 55 78 L 45 78 Z"
      fill="url(#trGoldMain)"
      stroke="#5C3A0A"
      strokeWidth="0.5"
    />
    <Path d="M 46 71 L 47 77 L 48 77 L 48 71 Z" fill="#FFFBE0" opacity="0.55" />

    <Ellipse
      cx="50"
      cy="78"
      rx="11"
      ry="2.6"
      fill="url(#trGoldHi)"
      stroke="#5C3A0A"
      strokeWidth="0.5"
    />

    <Path
      d="M 26 81 L 74 81 L 70 93 L 30 93 Z"
      fill="url(#trBaseGrad)"
      stroke="#5C3A0A"
      strokeWidth="0.7"
    />
    <Path d="M 28 81 L 72 81 L 70.5 84.5 L 29.5 84.5 Z" fill="url(#trGoldHi)" />
    <Path
      d="M 26 81 L 74 81 L 70 93 L 30 93 Z"
      fill="url(#trGoldSide)"
    />
  </Svg>
);

const QuestBadge: React.FC<{ size: number }> = ({ size }) => (
  <View
    style={{
      alignItems: 'center',
      backgroundColor: colors.sideQuest.highlightSoft,
      borderColor: colors.sideQuest.bgBorder,
      borderRadius: size / 2,
      borderWidth: 3,
      height: size,
      justifyContent: 'center',
      width: size,
    }}
  >
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.sideQuest.bgAlt,
        borderRadius: (size - 16) / 2,
        height: size - 16,
        justifyContent: 'center',
        width: size - 16,
      }}
    >
      <MaterialCommunityIcons
        name="compass-rose"
        size={size * 0.42}
        color={colors.sideQuest.text}
      />
    </View>
  </View>
);

const CompletionBurst: React.FC<CompletionBurstProps> = ({ title, variant = 'challenge' }) => {
  const theme = BURST_THEMES[variant];
  const swirlPath = useMemo(buildSwirlPath, []);
  const trophyProgress = useRef(new Animated.Value(0)).current;
  const trophyScale = useRef(new Animated.Value(0.2)).current;
  const bob = useRef(new Animated.Value(0)).current;

  const raysScale = useRef(new Animated.Value(0)).current;
  const raysOpacity = useRef(new Animated.Value(0)).current;
  const raysRotate = useRef(new Animated.Value(0)).current;

  const ringScale = useRef(new Animated.Value(0.4)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale2 = useRef(new Animated.Value(0.4)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;

  const glowPulse = useRef(new Animated.Value(0)).current;
  const titleProgress = useRef(new Animated.Value(0)).current;
  const tailOpacity = useRef(new Animated.Value(1)).current;
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];

    Animated.parallel([
      Animated.timing(trophyProgress, {
        toValue: 1,
        duration: SWIRL_DURATION,
        easing: Easing.bezier(0.32, 0, 0.32, 1),
        useNativeDriver: true,
      }),
      Animated.timing(trophyScale, {
        toValue: 0.88,
        duration: SWIRL_DURATION - 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(trophyScale, {
        toValue: 1,
        friction: 3.5,
        tension: 150,
        useNativeDriver: true,
      }).start();

      Animated.timing(tailOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      ringOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 2.4,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 720,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.delay(90),
        Animated.parallel([
          Animated.timing(ringScale2, {
            toValue: 2.0,
            duration: 620,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ringOpacity2, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity2, {
              toValue: 0,
              duration: 620,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();

      Animated.parallel([
        Animated.spring(raysScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(raysOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();

      const rayLoop = Animated.loop(
        Animated.timing(raysRotate, {
          toValue: 1,
          duration: 16000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rayLoop.start();
      loops.push(rayLoop);

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0,
            duration: 1300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      loops.push(pulseLoop);

      const bobLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bob, {
            toValue: 1,
            duration: 1700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bob, {
            toValue: 0,
            duration: 1700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      bobLoop.start();
      loops.push(bobLoop);

      setBurstKey(k => k + 1);

      Animated.spring(titleProgress, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      loops.forEach(l => l.stop());
    };
  }, [trophyProgress, trophyScale, bob, raysScale, raysOpacity, raysRotate, ringScale, ringOpacity, ringScale2, ringOpacity2, glowPulse, titleProgress, tailOpacity]);

  const tx = trophyProgress.interpolate({ inputRange: swirlPath.input, outputRange: swirlPath.xs });
  const ty = trophyProgress.interpolate({ inputRange: swirlPath.input, outputRange: swirlPath.ys });
  const trophyRotate = trophyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30deg', `${TROPHY_ROTATIONS * 360}deg`],
  });
  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const combinedY = Animated.add(ty, bobY);

  const rotateInterp = raysRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.1] });
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const glowFinal = Animated.multiply(raysOpacity, glowOpacity);

  const titleTranslate = titleProgress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.burst}>
        <Animated.View
          style={[
            styles.layer,
            { opacity: raysOpacity, transform: [{ rotate: rotateInterp }, { scale: raysScale }] },
          ]}
        >
          <Rays theme={theme} />
        </Animated.View>

        <Animated.View
          style={[
            styles.layer,
            { opacity: glowFinal, transform: [{ scale: glowScale }] },
          ]}
        >
          <Glow theme={theme} />
        </Animated.View>

        <Animated.View
          style={[
            styles.layer,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        >
          <ShockRing theme={theme} />
        </Animated.View>
        <Animated.View
          style={[
            styles.layer,
            { opacity: ringOpacity2, transform: [{ scale: ringScale2 }] },
          ]}
        >
          <ShockRing theme={theme} />
        </Animated.View>

        {swirlPath.dots.map((dot, i) => (
          <TrailDot
            key={`trail-${i}`}
            dot={dot}
            theme={theme}
            trophyProgress={trophyProgress}
            tailOpacity={tailOpacity}
          />
        ))}

        <Animated.View
          style={[
            styles.hero,
            { shadowColor: theme.heroShadow },
            {
              transform: [
                { translateX: tx },
                { translateY: combinedY },
                { rotate: trophyRotate },
                { scale: trophyScale },
              ],
            },
          ]}
        >
          <View style={styles.heroInner}>
            {variant === 'challenge' ? <Trophy size={88} /> : <QuestBadge size={88} />}
          </View>
        </Animated.View>

        {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
          <Sparkle key={`sparkle-${burstKey}-${i}`} index={i} theme={theme} trigger={burstKey} />
        ))}
      </View>

      <Animated.View
        style={{
          opacity: titleProgress,
          transform: [{ translateY: titleTranslate }, { scale: titleProgress }],
        }}
      >
        <Text style={[styles.title, { color: theme.titleColor }]}>{title}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  burst: {
    alignItems: 'center',
    height: BURST_SIZE,
    justifyContent: 'center',
    overflow: 'visible',
    width: BURST_SIZE,
  },
  container: {
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
  },
  heroInner: {
    alignItems: 'center',
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  layer: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CompletionBurst;
