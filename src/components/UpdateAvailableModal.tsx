import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Ellipse,
} from 'react-native-svg';
import { colors } from '../constants/Colors';
import { Text } from './StyledText';
import { useLanguage } from '../contexts/LanguageContext';
import { useUpdateAvailable } from '../hooks/useUpdateAvailable';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Sparkle = ({
  cx,
  cy,
  r,
  delay,
}: {
  cx: number;
  cy: number;
  r: number;
  delay: number;
}) => {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 0.2, duration: 900, useNativeDriver: false }),
      ])
    );
    const startTimeout = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(startTimeout);
      loop.stop();
    };
  }, [opacity, delay]);

  return (
    <AnimatedCircle cx={cx} cy={cy} r={r} fill={colors.light.primary} opacity={opacity} />
  );
};

const UpgradeArtwork = () => {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={styles.artwork}>
      <Svg width={160} height={140} viewBox="0 0 160 140">
        <Defs>
          <RadialGradient id="updateGlow" cx="50%" cy="55%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.light.primary} stopOpacity={0.35} />
            <Stop offset="60%" stopColor={colors.light.primary} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={colors.light.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={80} cy={78} rx={70} ry={56} fill="url(#updateGlow)" />

        <Sparkle cx={18} cy={28} r={2.5} delay={0} />
        <Sparkle cx={62} cy={8} r={1.8} delay={400} />
        <Sparkle cx={148} cy={22} r={3} delay={900} />
        <Sparkle cx={108} cy={36} r={1.5} delay={1300} />
        <Sparkle cx={42} cy={48} r={2} delay={1700} />
        <Sparkle cx={132} cy={58} r={2.2} delay={500} />
        <Sparkle cx={8} cy={70} r={1.8} delay={200} />
        <Sparkle cx={28} cy={86} r={2.5} delay={1500} />
        <Sparkle cx={120} cy={102} r={1.8} delay={800} />
        <Sparkle cx={86} cy={132} r={2} delay={300} />
        <Sparkle cx={142} cy={126} r={1.5} delay={1800} />
        <Sparkle cx={14} cy={108} r={1.8} delay={650} />
      </Svg>

      <Animated.View style={[styles.phoneWrap, { transform: [{ translateY }] }]}>
        <Svg width={70} height={120} viewBox="0 0 70 120">
          <Defs>
            <SvgLinearGradient id="phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#5C6299" />
              <Stop offset="100%" stopColor="#3A3F66" />
            </SvgLinearGradient>
            <SvgLinearGradient id="phoneScreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor={colors.light.accent2} />
            </SvgLinearGradient>
            <SvgLinearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.light.primary} />
              <Stop offset="100%" stopColor="#7A82B8" />
            </SvgLinearGradient>
          </Defs>

          {/* phone body */}
          <Rect x={2} y={2} width={66} height={116} rx={14} fill="url(#phoneBody)" />
          {/* inner bezel highlight */}
          <Rect x={4} y={4} width={62} height={112} rx={12} fill="none" stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={1} />
          {/* screen */}
          <Rect x={6} y={9} width={58} height={102} rx={9} fill="url(#phoneScreen)" />
          {/* dynamic island */}
          <Rect x={26} y={13} width={18} height={5} rx={2.5} fill="#1A1D33" />
          {/* home indicator */}
          <Rect x={25} y={106} width={20} height={2.2} rx={1.1} fill="#2A2E4A" opacity={0.35} />
          {/* side buttons */}
          <Rect x={0.5} y={32} width={2} height={10} rx={1} fill="#2A2E4A" opacity={0.5} />
          <Rect x={0.5} y={48} width={2} height={16} rx={1} fill="#2A2E4A" opacity={0.5} />
          <Rect x={67.5} y={42} width={2} height={22} rx={1} fill="#2A2E4A" opacity={0.5} />

          {/* upward arrow inside screen (smaller) */}
          <Path
            d="M35 74 L35 50"
            stroke="url(#arrowGrad)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Path
            d="M27 58 L35 50 L43 58"
            stroke="url(#arrowGrad)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export const UpdateAvailableModal = () => {
  const { t } = useLanguage();
  const { updateAvailable, storeUrl } = useUpdateAvailable();
  const [dismissed, setDismissed] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  const visible = updateAvailable && !!storeUrl && !dismissed;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [visible, slideAnim]);

  const handleUpdatePress = useCallback(async () => {
    if (!storeUrl) return;
    const canOpen = await Linking.canOpenURL(storeUrl);
    if (!canOpen) return;
    await Linking.openURL(storeUrl);
  }, [storeUrl]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleDismiss}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
          onStartShouldSetResponder={() => true}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <UpgradeArtwork />
          <Text style={styles.title}>{t('Update available')}</Text>
          <Text style={styles.subtitle}>{t('Update to get the latest features.')}</Text>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress} activeOpacity={0.8}>
            <Text style={styles.updateButtonText}>{t('Update')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterButton} onPress={handleDismiss} hitSlop={10}>
            <Text style={styles.laterButtonText}>{t('Not now')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  artwork: {
    width: 160,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  phoneWrap: {
    position: 'absolute',
    top: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.light.lightText,
    textAlign: 'center',
    marginBottom: 20,
  },
  updateButton: {
    width: '100%',
    backgroundColor: colors.light.primary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  updateButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 12,
    marginTop: 4,
  },
  laterButtonText: {
    color: colors.light.lightText,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default UpdateAvailableModal;
