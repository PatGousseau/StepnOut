import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { DecorativeCardBackground } from './DecorativeCardBackground';

interface Props {
  piece: ContentPiece;
}

const FEATURED_HEIGHT = Math.round(Dimensions.get('window').width * 0.9);

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
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{t('This week')}</Text>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.card}
        accessibilityRole="button"
      >
        <DecorativeCardBackground category={piece.category} variant="featured" seed={piece.id} />
        <View style={styles.content}>
          <Text style={styles.category}>
            {t(CATEGORY_LABEL_KEYS[piece.category])}
          </Text>
          <Text style={styles.hook} numberOfLines={4}>
            {piece.hook}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingTop: esploraSpacing.sm,
    paddingBottom: esploraSpacing.md,
  },
  eyebrow: {
    ...esploraType.categoryLabel,
    color: colors.light.lightText,
    marginBottom: esploraSpacing.sm,
  },
  card: {
    height: FEATURED_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.neutral.grey2,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: esploraSpacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  category: {
    ...esploraType.categoryLabel,
    color: colors.neutral.white,
    marginBottom: esploraSpacing.sm,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  hook: {
    ...esploraType.hookLarge,
    color: colors.neutral.white,
    fontSize: 26,
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.24)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
