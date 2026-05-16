import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Mask, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
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
const TAIL_PADDING = 24;
const TAIL_WIDTH_MIN = 3;
const TAIL_WIDTH_MAX = 78;

type SwirlPath = {
  input: number[];
  xs: number[];
  ys: number[];
  d: string;
  polygonD: string;
  length: number;
  dashoffsetOutput: number[];
  maskStrokeWidth: number;
  svgWidth: number;
  svgHeight: number;
  svgLeft: number;
  svgTop: number;
};

const buildSwirlPath = (): SwirlPath => {
  const { width, height } = Dimensions.get('window');
  const maxRadiusX = Math.min(width * 0.46, 220);
  const maxRadiusY = Math.min(height * 0.36, 320);
  const input: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  const widths: number[] = [];
  for (let i = 0; i <= SPIRAL_SAMPLES; i++) {
    const p = i / SPIRAL_SAMPLES;
    const radiusFactor = Math.pow(1 - p, 1.6);
    const angle = p * SPIRAL_REVOLUTIONS * Math.PI * 2 - Math.PI / 2;
    input.push(p);
    xs.push(Math.cos(angle) * maxRadiusX * radiusFactor);
    ys.push(Math.sin(angle) * maxRadiusY * radiusFactor);
    widths.push(TAIL_WIDTH_MIN + (TAIL_WIDTH_MAX - TAIL_WIDTH_MIN) * p);
  }
  xs[xs.length - 1] = 0;
  ys[ys.length - 1] = 0;

  const svgWidth = maxRadiusX * 2 + TAIL_PADDING * 2 + TAIL_WIDTH_MAX;
  const svgHeight = maxRadiusY * 2 + TAIL_PADDING * 2 + TAIL_WIDTH_MAX;
  const offsetX = maxRadiusX + TAIL_PADDING + TAIL_WIDTH_MAX / 2;
  const offsetY = maxRadiusY + TAIL_PADDING + TAIL_WIDTH_MAX / 2;

  let d = `M ${xs[0] + offsetX} ${ys[0] + offsetY}`;
  const cumLengths: number[] = [0];
  for (let i = 1; i < xs.length; i++) {
    d += ` L ${xs[i] + offsetX} ${ys[i] + offsetY}`;
    cumLengths.push(
      cumLengths[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1])
    );
  }
  const length = cumLengths[cumLengths.length - 1];
  const dashoffsetOutput = cumLengths.map(c => length - c);

  const N = xs.length;
  const outerPts: [number, number][] = new Array(N);
  const innerPts: [number, number][] = new Array(N);
  for (let i = 0; i < N; i++) {
    let dx: number;
    let dy: number;
    if (i === 0) {
      dx = xs[1] - xs[0];
      dy = ys[1] - ys[0];
    } else if (i === N - 1) {
      dx = xs[i] - xs[i - 1];
      dy = ys[i] - ys[i - 1];
    } else {
      dx = xs[i + 1] - xs[i - 1];
      dy = ys[i + 1] - ys[i - 1];
    }
    const tLen = Math.hypot(dx, dy) || 1;
    const nx = -dy / tLen;
    const ny = dx / tLen;
    const hw = widths[i] / 2;
    outerPts[i] = [xs[i] + nx * hw + offsetX, ys[i] + ny * hw + offsetY];
    innerPts[i] = [xs[i] - nx * hw + offsetX, ys[i] - ny * hw + offsetY];
  }

  let polygonD = `M ${outerPts[0][0]} ${outerPts[0][1]}`;
  for (let i = 1; i < N; i++) {
    polygonD += ` L ${outerPts[i][0]} ${outerPts[i][1]}`;
  }
  for (let i = N - 1; i >= 0; i--) {
    polygonD += ` L ${innerPts[i][0]} ${innerPts[i][1]}`;
  }
  polygonD += ' Z';

  return {
    input,
    xs,
    ys,
    d,
    polygonD,
    length,
    dashoffsetOutput,
    maskStrokeWidth: TAIL_WIDTH_MAX + 6,
    svgWidth,
    svgHeight,
    svgLeft: (BURST_SIZE - svgWidth) / 2,
    svgTop: (BURST_SIZE - svgHeight) / 2,
  };
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CompletionBurstProps {
  title: string;
}

const Rays: React.FC = () => {
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
          <Stop offset="0" stopColor="#FFE27A" stopOpacity="1" />
          <Stop offset="1" stopColor="#FFB347" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="rayAmber" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FF9A4D" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#FF6B3D" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {paths.map((p, i) => (
        <Path key={i} d={p.d} fill={p.fill} />
      ))}
    </Svg>
  );
};

const Glow: React.FC = () => (
  <Svg width={BURST_SIZE} height={BURST_SIZE} viewBox={`0 0 ${BURST_SIZE} ${BURST_SIZE}`}>
    <Defs>
      <RadialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#FFE27A" stopOpacity="0.85" />
        <Stop offset="0.45" stopColor="#FFB347" stopOpacity="0.28" />
        <Stop offset="1" stopColor="#FF6B3D" stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Rect x="0" y="0" width={BURST_SIZE} height={BURST_SIZE} fill="url(#glow)" />
  </Svg>
);

const ShockRing: React.FC = () => (
  <Svg width={BURST_SIZE} height={BURST_SIZE} viewBox={`0 0 ${BURST_SIZE} ${BURST_SIZE}`}>
    <Circle
      cx={BURST_SIZE / 2}
      cy={BURST_SIZE / 2}
      r={56}
      fill="none"
      stroke="#FFE27A"
      strokeWidth={3}
    />
  </Svg>
);

const Sparkle: React.FC<{ index: number; trigger: number }> = ({ index, trigger }) => {
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
        color={index % 3 === 0 ? '#FFFFFF' : '#FFE27A'}
      />
    </Animated.View>
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

const CompletionBurst: React.FC<CompletionBurstProps> = ({ title }) => {
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
  const tailProgress = useRef(new Animated.Value(0)).current;
  const tailOpacity = useRef(new Animated.Value(1)).current;
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];

    Animated.timing(tailProgress, {
      toValue: 1,
      duration: SWIRL_DURATION,
      easing: Easing.bezier(0.32, 0, 0.32, 1),
      useNativeDriver: false,
    }).start();

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
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
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
  }, [trophyProgress, trophyScale, bob, raysScale, raysOpacity, raysRotate, ringScale, ringOpacity, ringScale2, ringOpacity2, glowPulse, titleProgress, tailProgress, tailOpacity]);

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

  const tailDashOffset = tailProgress.interpolate({
    inputRange: swirlPath.input,
    outputRange: swirlPath.dashoffsetOutput,
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.burst}>
        <Animated.View
          style={[
            styles.layer,
            { opacity: raysOpacity, transform: [{ rotate: rotateInterp }, { scale: raysScale }] },
          ]}
        >
          <Rays />
        </Animated.View>

        <Animated.View
          style={[
            styles.layer,
            { opacity: glowFinal, transform: [{ scale: glowScale }] },
          ]}
        >
          <Glow />
        </Animated.View>

        <Animated.View
          style={[
            styles.layer,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        >
          <ShockRing />
        </Animated.View>
        <Animated.View
          style={[
            styles.layer,
            { opacity: ringOpacity2, transform: [{ scale: ringScale2 }] },
          ]}
        >
          <ShockRing />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: swirlPath.svgLeft,
            top: swirlPath.svgTop,
            width: swirlPath.svgWidth,
            height: swirlPath.svgHeight,
            opacity: tailOpacity,
          }}
        >
          <Svg width={swirlPath.svgWidth} height={swirlPath.svgHeight}>
            <Defs>
              <Mask
                id="tailMask"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={swirlPath.svgWidth}
                height={swirlPath.svgHeight}
              >
                <Rect
                  x="0"
                  y="0"
                  width={swirlPath.svgWidth}
                  height={swirlPath.svgHeight}
                  fill="black"
                />
                <AnimatedPath
                  d={swirlPath.d}
                  stroke="white"
                  strokeWidth={swirlPath.maskStrokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={`${swirlPath.length}, ${swirlPath.length}`}
                  strokeDashoffset={tailDashOffset}
                />
              </Mask>
            </Defs>
            <Path d={swirlPath.polygonD} fill="#FFE27A" mask="url(#tailMask)" />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            styles.hero,
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
            <Trophy size={88} />
          </View>
        </Animated.View>

        {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
          <Sparkle key={`sparkle-${burstKey}-${i}`} index={i} trigger={burstKey} />
        ))}
      </View>

      <Animated.View
        style={{
          opacity: titleProgress,
          transform: [{ translateY: titleTranslate }, { scale: titleProgress }],
        }}
      >
        <Text style={styles.title}>{title}</Text>
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
    shadowColor: '#FF9A4D',
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
    color: colors.light.text,
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CompletionBurst;
