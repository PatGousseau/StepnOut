import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import { esploraSpacing, esploraType } from '../../constants/EsploraStyles';
import { useLanguage } from '../../contexts/LanguageContext';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

type EsploraHeaderProps = {
  scrollY: Animated.Value;
};

const HEADER_COLLAPSE_DISTANCE = 56;

export const EsploraHeader: React.FC<EsploraHeaderProps> = ({ scrollY }) => {
  const { t } = useLanguage();

  const handleSavedPress = () => {
    captureEvent(ESPLORA_EVENTS.SAVED_OPENED);
    router.push('/esplora/saved');
  };

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_DISTANCE],
    outputRange: [1, 0.78],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_DISTANCE],
    outputRange: [-2, 1],
    extrapolate: 'clamp',
  });

  const paddingTop = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_DISTANCE],
    outputRange: [esploraSpacing.md, esploraSpacing.sm],
    extrapolate: 'clamp',
  });

  const paddingBottom = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_DISTANCE],
    outputRange: [esploraSpacing.md, esploraSpacing.sm],
    extrapolate: 'clamp',
  });

  const paddingLeft = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_DISTANCE],
    outputRange: [esploraSpacing.horizontalPadding, esploraSpacing.md],
    extrapolate: 'clamp',
  });

  const borderBottomWidth = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_DISTANCE * 0.75, HEADER_COLLAPSE_DISTANCE],
    outputRange: [0, 0, StyleSheet.hairlineWidth],
    extrapolate: 'clamp',
  });

  const borderBottomColor = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_DISTANCE * 0.75, HEADER_COLLAPSE_DISTANCE],
    outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', '#d1d5db'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop,
          paddingBottom,
          paddingLeft,
          borderBottomWidth,
          borderBottomColor,
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.wordmark,
          {
            transform: [{ scale: titleScale }, { translateY: titleTranslateY }],
          },
        ]}
      >
        {t('Esplora')}
      </Animated.Text>
      <TouchableOpacity
        onPress={handleSavedPress}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('Saved')}
      >
        <Ionicons name="bookmark-outline" size={22} color={colors.light.text} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: esploraSpacing.horizontalPadding,
  },
  wordmark: {
    ...esploraType.wordmark,
    color: colors.light.text,
  },
});
