import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { Text } from "./StyledText";
import { SideQuest } from "../types/sideQuests";

const SCENE_WIDTH = 280;
const SCENE_HEIGHT = 320;

const SPARKLE_ANGLES = [10, 50, 90, 130, 170, 200, 230, 270, 310, 340];

type Props = {
  // null while the API is in flight; set once the quest is known.
  quest: SideQuest | null;
  onComplete?: () => void;
  onAbort?: () => void;
};

export const QuestPullAnimation: React.FC<Props> = ({ quest, onComplete, onAbort }) => {
  const wobble = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(0)).current;
  const sparkles = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const stageOpacity = useRef(new Animated.Value(1)).current;

  // Track the latest quest value via a ref so the animation loop can poll for it
  // without re-running the effect.
  const questRef = useRef<SideQuest | null>(quest);
  questRef.current = quest;

  const [revealedQuest, setRevealedQuest] = useState<SideQuest | null>(quest);
  useEffect(() => {
    if (quest && !revealedQuest) setRevealedQuest(quest);
  }, [quest, revealedQuest]);

  useEffect(() => {
    let cancelled = false;
    const runAnim = (anim: Animated.CompositeAnimation): Promise<void> =>
      new Promise((resolve) => anim.start(() => resolve()));

    (async () => {
      // Phase 1: Anticipation — hat shakes harder and harder.
      // Plays immediately on mount, regardless of whether the quest data has arrived yet.
      await runAnim(
        Animated.timing(wobble, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        })
      );
      if (cancelled) return;

      // If the API hasn't returned yet, hold here until it does (cap at 8s).
      const waitStart = Date.now();
      while (!questRef.current && !cancelled && Date.now() - waitStart < 8000) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (cancelled) return;
      if (!questRef.current) {
        onAbort?.();
        return;
      }

      // Phase 2: Card rises out the brim, flash bursts, sparkles radiate
      await runAnim(
        Animated.parallel([
          Animated.timing(flash, {
            toValue: 1,
            duration: 1100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(sparkles, {
            toValue: 1,
            duration: 1300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(300),
            Animated.timing(card, {
              toValue: 1,
              duration: 950,
              easing: Easing.out(Easing.back(1.6)),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      if (cancelled) return;

      // Hold so the user can read the quest.
      await new Promise((resolve) => setTimeout(resolve, 3500));
      if (cancelled) return;

      // Fade the whole stage out
      await runAnim(
        Animated.timing(stageOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      );
      if (cancelled) return;

      onComplete?.();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    // ── Hat wobble (whole hat) ──────────────────────────────────────────────
    const hatRotate = wobble.interpolate({
      inputRange: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
      outputRange: ["0deg", "-10deg", "13deg", "-18deg", "16deg", "-12deg", "6deg", "0deg"],
    });
    const hatScale = wobble.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.1, 1],
      extrapolate: "clamp",
    });

    // ── Card rising out of the brim opening ─────────────────────────────────
    // Starts hidden inside the hat (positive Y = down), rises clearly above the brim.
    const cardTranslateY = card.interpolate({
      inputRange: [0, 1],
      outputRange: [70, -80],
    });
    const cardScale = card.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0.3, 1.08, 1],
    });
    const cardOpacity = card.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0, 1, 1],
    });
    const cardTextOpacity = card.interpolate({
      inputRange: [0, 0.55, 0.85],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    });
    const cardRotate = card.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ["-8deg", "5deg", "0deg"],
    });

    // ── Flash burst (radial light behind the hat at climax) ─────────────────
    const flashScale = flash.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 2.6],
    });
    const flashOpacity = flash.interpolate({
      inputRange: [0, 0.2, 0.6, 1],
      outputRange: [0, 0.95, 0.5, 0],
    });

    return (
      <Animated.View style={[styles.scene, { opacity: stageOpacity }]} pointerEvents="none">

        {/* Flash burst — only visible during the climax */}
        <Animated.View
          style={[
            styles.flashBurst,
            { opacity: flashOpacity, transform: [{ scale: flashScale }] },
          ]}
        />

        {/* Sparkle stars radiating from hat center */}
        <View style={styles.sparkleField}>
          <View style={styles.sparkleAnchor}>
            {SPARKLE_ANGLES.map((angle) => (
              <SparkleStar key={angle} angleDeg={angle} progress={sparkles} />
            ))}
          </View>
        </View>

        {/* Hat — held upside down, the whole thing wobbles. */}
        <Animated.View
          style={[
            styles.hatLayer,
            { transform: [{ rotate: hatRotate }, { scale: hatScale }] },
          ]}
        >
          <HatUpsideDownSvg />
        </Animated.View>

        {/* Card — rises out of the brim opening at the top of the hat. */}
        {revealedQuest && (
          <Animated.View
            style={[
              styles.cardLayer,
              {
                opacity: cardOpacity,
                transform: [
                  { translateY: cardTranslateY },
                  { rotate: cardRotate },
                  { scale: cardScale },
                ],
              },
            ]}
          >
            <View style={styles.questCard}>
              <View style={styles.questCardSheen} />
              <Animated.View style={{ opacity: cardTextOpacity, alignItems: "center" }}>
                <Text style={styles.questCardEyebrow}>YOUR QUEST</Text>
                <Text style={styles.questCardTitle} numberOfLines={3}>
                  {revealedQuest.title}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>
        )}

      </Animated.View>
    );
};

// ─── SVG pieces ────────────────────────────────────────────────────────────

// Upside-down fedora — brim at top showing the dark cavity opening,
// crown extending down as an inverted dome.
const HAT_W = 220;
const HAT_H = 200;
const BRIM_LINE = 56; // y of the brim line within the SVG viewBox

const HatUpsideDownSvg: React.FC = () => (
  <Svg width={HAT_W} height={HAT_H} viewBox={`0 0 ${HAT_W} ${HAT_H}`}>
    <Defs>
      <SvgLinearGradient id="invCrown" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#5A3413" />
        <Stop offset="0.5" stopColor="#7A4A1F" />
        <Stop offset="1" stopColor="#A87042" />
      </SvgLinearGradient>
      <SvgLinearGradient id="invBrim" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#9C6936" />
        <Stop offset="1" stopColor="#5A3413" />
      </SvgLinearGradient>
      <SvgLinearGradient id="invBand" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#B86A20" />
        <Stop offset="1" stopColor="#F4A65C" />
      </SvgLinearGradient>
    </Defs>

    {/* Inverted crown — extends downward from the brim into a rounded dome */}
    <Path
      d={`M 50 ${BRIM_LINE} C 50 ${HAT_H - 6}, ${HAT_W - 50} ${HAT_H - 6}, ${HAT_W - 50} ${BRIM_LINE} Z`}
      fill="url(#invCrown)"
    />

    {/* Subtle highlight on right side of inverted crown */}
    <Path
      d={`M ${HAT_W - 70} 70 C ${HAT_W - 60} 110, ${HAT_W - 60} 145, ${HAT_W - 80} 178`}
      stroke="rgba(255, 230, 195, 0.22)"
      strokeWidth={4}
      fill="none"
      strokeLinecap="round"
    />

    {/* Hatband — wraps just under the brim */}
    <Path
      d={`M 50 ${BRIM_LINE} C 50 ${BRIM_LINE + 10}, ${HAT_W - 50} ${BRIM_LINE + 10}, ${HAT_W - 50} ${BRIM_LINE} L ${HAT_W - 50} ${BRIM_LINE + 16} C ${HAT_W - 50} ${BRIM_LINE + 26}, 50 ${BRIM_LINE + 26}, 50 ${BRIM_LINE + 16} Z`}
      fill="url(#invBand)"
    />

    {/* Brim — wide oval at top */}
    <Path
      d={`M 5 ${BRIM_LINE} Q ${HAT_W / 2} 18, ${HAT_W - 5} ${BRIM_LINE} Q ${HAT_W / 2} ${BRIM_LINE + 26}, 5 ${BRIM_LINE} Z`}
      fill="url(#invBrim)"
    />

    {/* Inner cavity — dark oval (the opening of the upside-down hat) */}
    <Ellipse cx={HAT_W / 2} cy={BRIM_LINE} rx={52} ry={9} fill="#150B03" />
    <Ellipse cx={HAT_W / 2} cy={BRIM_LINE - 2} rx={48} ry={4} fill="rgba(0,0,0,0.55)" />

    {/* Brim top sheen */}
    <Path
      d={`M 30 ${BRIM_LINE - 4} Q ${HAT_W / 2} 22, ${HAT_W - 30} ${BRIM_LINE - 4}`}
      stroke="rgba(255, 220, 180, 0.3)"
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

// ─── Sparkle ───────────────────────────────────────────────────────────────

const SparkleStar: React.FC<{ angleDeg: number; progress: Animated.Value }> = ({
  angleDeg,
  progress,
}) => {
  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [12 * cosA, 150 * cosA],
    extrapolate: "clamp",
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [12 * sinA, 150 * sinA],
    extrapolate: "clamp",
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 0.7, 1],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.3, 1.5, 0.5],
    extrapolate: "clamp",
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "210deg"],
    extrapolate: "clamp",
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        opacity,
        transform: [{ translateX }, { translateY }, { scale }, { rotate }],
      }}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path d="M 12 0 L 14 10 L 24 12 L 14 14 L 12 24 L 10 14 L 0 12 L 10 10 Z" fill="#F4B36A" />
        <Path d="M 12 4 L 13 11 L 20 12 L 13 13 L 12 20 L 11 13 L 4 12 L 11 11 Z" fill="#FFE5C2" />
      </Svg>
    </Animated.View>
  );
};

// ─── Static (idle) hat — used when the user hasn't pulled yet ──────────────

export const QuestHatIdle: React.FC = () => (
  <View style={[styles.scene, styles.idleScene]} pointerEvents="none">
    <View style={styles.hatLayer}>
      <HatUpsideDownSvg />
    </View>
  </View>
);

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardLayer: {
    alignItems: "center",
    bottom: 110,
    left: 0,
    position: "absolute",
    right: 0,
  },
  flashBurst: {
    alignSelf: "center",
    backgroundColor: "#FFEBC7",
    borderRadius: 999,
    bottom: 110,
    height: 200,
    position: "absolute",
    shadowColor: "#FFA85C",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 60,
    width: 200,
  },
  hatLayer: {
    alignItems: "center",
    bottom: 10,
    left: 0,
    position: "absolute",
    right: 0,
  },
  questCard: {
    alignItems: "center",
    backgroundColor: "#E78945",
    borderRadius: 18,
    elevation: 12,
    justifyContent: "center",
    minHeight: 120,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#5A2D0A",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    width: 220,
  },
  questCardEyebrow: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  questCardSheen: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: 36,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  questCardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "center",
  },
  idleScene: {
    height: 240,
  },
  scene: {
    alignItems: "center",
    alignSelf: "center",
    height: SCENE_HEIGHT,
    justifyContent: "flex-end",
    width: SCENE_WIDTH,
  },
  sparkleAnchor: {
    height: 0,
    width: 0,
  },
  sparkleField: {
    alignItems: "center",
    bottom: 100,
    height: 200,
    justifyContent: "center",
    position: "absolute",
    width: "100%",
  },
});
