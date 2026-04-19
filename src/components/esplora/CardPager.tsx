import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { colors } from '../../constants/Colors';
import { esploraSpacing } from '../../constants/EsploraStyles';

interface Props {
  totalCards: number;
  activeIndex: number;
  onPageSelected: (index: number) => void;
  children: React.ReactNode;
}

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

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {children}
      </PagerView>
      <View style={styles.dots}>
        {Array.from({ length: totalCards }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: esploraSpacing.lg,
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.light.text,
    opacity: 0.2,
  },
  dotActive: {
    opacity: 1,
  },
});
