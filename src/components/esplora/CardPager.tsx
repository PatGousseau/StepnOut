import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { colors } from '../../constants/Colors';
import { esploraSpacing } from '../../constants/EsploraStyles';

interface Props {
  totalCards: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  renderCard: (index: number) => React.ReactNode;
}

export const CARD_STACK_OUTER_MARGIN = esploraSpacing.md;
export const CARD_STACK_RADIUS = 28;
const STACK_PEEK = 8;
const SWIPE_DISTANCE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 800;
const FLING_DURATION = 220;

export const CardPager: React.FC<Props> = ({
  totalCards,
  activeIndex,
  onIndexChange,
  renderCard,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isFlying, setIsFlying] = useState(false);
  const [behindIndex, setBehindIndex] = useState(activeIndex + 1);

  useEffect(() => {
    const target = activeIndex + 1;
    if (behindIndex === target) return;
    const raf = requestAnimationFrame(() => setBehindIndex(target));
    return () => cancelAnimationFrame(raf);
  }, [activeIndex, behindIndex]);

  const rotate = pan.x.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: true }
  );

  const flingOff = (
    direction: 'left' | 'right',
    onComplete: () => void
  ) => {
    setIsFlying(true);
    const screenWidth = Dimensions.get('window').width;
    const targetX = direction === 'left' ? -screenWidth * 1.4 : screenWidth * 1.4;
    Animated.timing(pan, {
      toValue: { x: targetX, y: 0 },
      duration: FLING_DURATION,
      useNativeDriver: true,
    }).start(() => {
      // Update the index first so React commits the new card content while the
      // front slot is still translated off-screen. Then snap the pan back on
      // the next frame — by that point the new content has rendered, so the
      // user never sees the previous card flash at center.
      onComplete();
      requestAnimationFrame(() => {
        pan.setValue({ x: 0, y: 0 });
        setIsFlying(false);
      });
    });
  };

  const springBack = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const handleHandlerStateChange = (
    event: PanGestureHandlerStateChangeEvent
  ) => {
    if (event.nativeEvent.state !== State.END) return;
    const { translationX, velocityX } = event.nativeEvent;

    const swipedFarEnough =
      Math.abs(translationX) > SWIPE_DISTANCE_THRESHOLD ||
      Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD;

    if (swipedFarEnough && activeIndex < totalCards - 1) {
      const direction = translationX < 0 ? 'left' : 'right';
      flingOff(direction, () => onIndexChange(activeIndex + 1));
    } else {
      springBack();
    }
  };

  const goTo = (next: number) => {
    if (isFlying) return;
    if (next < 0 || next >= totalCards) return;
    const direction = next > activeIndex ? 'left' : 'right';
    flingOff(direction, () => onIndexChange(next));
  };

  const remaining = totalCards - activeIndex - 1;
  const showStackOne = remaining >= 1;
  const showStackTwo = remaining >= 2;

  const isFirst = activeIndex === 0;
  const isLast = activeIndex >= totalCards - 1;

  const showBehind = behindIndex < totalCards;

  return (
    <View style={styles.container}>
      <View style={styles.cardArea}>
        {showStackTwo && (
          <View pointerEvents="none" style={[styles.ghost, styles.ghostBack]} />
        )}
        {showStackOne && (
          <View pointerEvents="none" style={[styles.ghost, styles.ghostMid]} />
        )}
        {showBehind && (
          <View pointerEvents="none" style={styles.cardSlot}>
            {renderCard(behindIndex)}
          </View>
        )}
        <PanGestureHandler
          enabled={!isFlying}
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.cardSlot,
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { rotate },
                ],
              },
            ]}
          >
            {renderCard(activeIndex)}
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={styles.navRow}>
        <Pressable
          onPress={() => goTo(activeIndex - 1)}
          disabled={isFirst || isFlying}
          hitSlop={16}
          style={({ pressed }) => [
            styles.navBtn,
            (isFirst || isFlying) && styles.navBtnDisabled,
            pressed && !isFirst && !isFlying && styles.navBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Previous card"
        >
          <Ionicons name="chevron-back" size={28} color={colors.light.text} />
        </Pressable>
        <Pressable
          onPress={() => goTo(activeIndex + 1)}
          disabled={isLast || isFlying}
          hitSlop={16}
          style={({ pressed }) => [
            styles.navBtn,
            (isLast || isFlying) && styles.navBtnDisabled,
            pressed && !isLast && !isFlying && styles.navBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Next card"
        >
          <Ionicons name="chevron-forward" size={28} color={colors.light.text} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardArea: {
    flex: 1,
    position: 'relative',
    marginHorizontal: CARD_STACK_OUTER_MARGIN,
    marginVertical: 12,
  },
  cardSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: STACK_PEEK * 2,
    bottom: 0,
  },
  ghost: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_STACK_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  ghostMid: {
    top: 8,
    bottom: 8,
    left: STACK_PEEK,
    right: STACK_PEEK,
  },
  ghostBack: {
    top: 18,
    bottom: 18,
    left: STACK_PEEK * 2,
    right: 0,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: esploraSpacing.lg,
    paddingTop: esploraSpacing.md,
    paddingBottom: esploraSpacing.lg,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.2,
  },
  navBtnPressed: {
    opacity: 0.5,
  },
});
