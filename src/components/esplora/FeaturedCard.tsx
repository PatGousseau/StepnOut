import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import {
  CATEGORY_LABEL_KEYS,
  esploraSpacing,
  esploraType,
} from '../../constants/EsploraStyles';
import { ContentPiece } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

interface Props {
  piece: ContentPiece;
}

export const FeaturedCard: React.FC<Props> = ({ piece }) => {
  const { t } = useLanguage();

  const handlePress = () => {
    captureEvent(ESPLORA_EVENTS.PIECE_OPENED, {
      piece_id: piece.id,
      category: piece.category,
      source: 'featured',
    });
    router.push(`/esplora/piece/${piece.id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('This week')}</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        accessibilityRole="button"
      >
        <Text style={styles.hook}>{piece.hook}</Text>
        <View style={styles.rule} />
        <Text style={styles.categoryLabel}>
          {t(CATEGORY_LABEL_KEYS[piece.category])}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingVertical: esploraSpacing.lg,
  },
  sectionLabel: {
    ...esploraType.sectionLabel,
    color: colors.light.lightText,
    marginBottom: esploraSpacing.md,
  },
  hook: {
    ...esploraType.hookLarge,
    color: colors.light.text,
  },
  rule: {
    height: 1,
    backgroundColor: colors.neutral.grey2,
    marginTop: esploraSpacing.lg,
    marginBottom: esploraSpacing.md,
    width: 40,
  },
  categoryLabel: {
    ...esploraType.categoryLabel,
    color: colors.light.lightText,
  },
});
