import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { colors } from '../../constants/Colors';
import { esploraSpacing } from '../../constants/EsploraStyles';

interface Props {
  totalCards: number;
  activeIndex: number;
  onPageSelected: (index: number) => void;
  children: React.ReactNode;
}

export const CARD_STACK_OUTER_MARGIN = esploraSpacing.md;
export const CARD_STACK_RADIUS = 28;
const STACK_PEEK = 8;

export const CardPager: React.FC<Props> = ({
  totalCards,
  activeIndex,
  onPageSelected,
  children,
}) => {
  const pagerRef = useRef<PagerView>(null);

  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    onPageSelected(e.nativeEvent.position);
  };

  const goTo = (next: number) => {
    if (next < 0 || next >= totalCards) return;
    pagerRef.current?.setPage(next);
  };

  const remaining = totalCards - activeIndex - 1;
  const showStackOne = remaining >= 1;
  const showStackTwo = remaining >= 2;

  const isFirst = activeIndex === 0;
  const isLast = activeIndex >= totalCards - 1;

  return (
    <View style={styles.container}>
      <View style={styles.cardArea}>
        {showStackTwo && (
          <View pointerEvents="none" style={[styles.ghost, styles.ghostBack]} />
        )}
        {showStackOne && (
          <View pointerEvents="none" style={[styles.ghost, styles.ghostMid]} />
        )}
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {children}
        </PagerView>
      </View>

      <View style={styles.navRow}>
        <Pressable
          onPress={() => goTo(activeIndex - 1)}
          disabled={isFirst}
          hitSlop={16}
          style={({ pressed }) => [
            styles.navBtn,
            isFirst && styles.navBtnDisabled,
            pressed && !isFirst && styles.navBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Previous card"
        >
          <Ionicons name="chevron-back" size={28} color={colors.light.text} />
        </Pressable>
        <Pressable
          onPress={() => goTo(activeIndex + 1)}
          disabled={isLast}
          hitSlop={16}
          style={({ pressed }) => [
            styles.navBtn,
            isLast && styles.navBtnDisabled,
            pressed && !isLast && styles.navBtnPressed,
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
  pager: {
    flex: 1,
    marginBottom: STACK_PEEK * 2,
    backgroundColor: colors.light.background,
  },
  ghost: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_STACK_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  ghostMid: {
    top: STACK_PEEK,
    left: 8,
    right: 8,
    bottom: STACK_PEEK,
  },
  ghostBack: {
    top: STACK_PEEK * 2,
    left: 18,
    right: 18,
    bottom: 0,
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
