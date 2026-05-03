import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/Colors';

type ProgressSegmentsProps = {
  total: number;
  activeIndex: number;
};

export const ProgressSegments: React.FC<ProgressSegmentsProps> = ({
  total,
  activeIndex,
}) => {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.progressSegment,
            index <= activeIndex && styles.progressSegmentActive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.light.text,
    opacity: 0.15,
  },
  progressSegmentActive: {
    backgroundColor: colors.light.primary,
    opacity: 1,
  },
});
