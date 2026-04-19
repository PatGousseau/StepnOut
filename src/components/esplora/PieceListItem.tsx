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
  source: 'recent' | 'category' | 'saved';
}

export const PieceListItem: React.FC<Props> = ({ piece, source }) => {
  const { t } = useLanguage();

  const handlePress = () => {
    captureEvent(ESPLORA_EVENTS.PIECE_OPENED, {
      piece_id: piece.id,
      category: piece.category,
      source,
    });
    router.push(`/esplora/piece/${piece.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="button"
    >
      <Text style={styles.title}>{piece.title}</Text>
      <Text style={styles.preview} numberOfLines={2}>
        {piece.hook}
      </Text>
      <Text style={styles.category}>
        {t(CATEGORY_LABEL_KEYS[piece.category])}
      </Text>
      <View style={styles.divider} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingVertical: esploraSpacing.lg,
  },
  title: {
    ...esploraType.title,
    color: colors.light.text,
    marginBottom: esploraSpacing.sm,
  },
  preview: {
    ...esploraType.preview,
    color: colors.light.lightText,
    marginBottom: esploraSpacing.md,
  },
  category: {
    ...esploraType.categoryLabel,
    color: colors.light.lightText,
  },
  divider: {
    marginTop: esploraSpacing.lg,
    height: 1,
    backgroundColor: colors.neutral.grey2,
  },
});
