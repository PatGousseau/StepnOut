import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import {
  CATEGORY_LABEL_KEYS,
  CATEGORY_ORDER,
  esploraSpacing,
  esploraType,
} from '../../constants/EsploraStyles';
import { ContentCategory } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

export const CategoryRow: React.FC = () => {
  const { t } = useLanguage();

  const handlePress = (category: ContentCategory) => {
    captureEvent(ESPLORA_EVENTS.CATEGORY_OPENED, { category });
    router.push(`/esplora/category/${category}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('Categories')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {CATEGORY_ORDER.map((category) => (
          <TouchableOpacity
            key={category}
            activeOpacity={0.6}
            onPress={() => handlePress(category)}
            style={styles.tile}
            accessibilityRole="button"
          >
            <Text style={styles.tileText}>
              {t(CATEGORY_LABEL_KEYS[category])}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: esploraSpacing.lg,
  },
  sectionLabel: {
    ...esploraType.sectionLabel,
    color: colors.light.lightText,
    paddingHorizontal: esploraSpacing.horizontalPadding,
    marginBottom: esploraSpacing.md,
  },
  row: {
    paddingHorizontal: esploraSpacing.horizontalPadding,
    gap: esploraSpacing.lg,
  },
  tile: {
    paddingBottom: esploraSpacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grey2,
  },
  tileText: {
    ...esploraType.categoryTile,
    color: colors.light.text,
  },
});
