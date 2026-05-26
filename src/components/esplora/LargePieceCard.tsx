import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import {
  esploraCard,
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
  source: 'recent' | 'category' | 'saved' | 'featured';
  style?: ViewStyle;
}

export const LargePieceCard: React.FC<Props> = ({ piece, source, style }) => {
  const { t } = useLanguage();

  const handlePress = () => {
    captureEvent(ESPLORA_EVENTS.PIECE_OPENED, {
      piece_id: piece.id,
      category: piece.category,
      source,
    });
    router.push(`/esplora/piece/${piece.id}`);
  };

  const cardCount = piece.cards.length;
  const cardCountLabel =
    cardCount === 1 ? t('1 card') : t('{n} cards').replace('{n}', String(cardCount));

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.card, style]}
      accessibilityRole="button"
    >
      <DecorativeCardBackground category={piece.category} variant="large" seed={piece.id} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={3}>
          {piece.title}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.meta}>{cardCountLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: esploraCard.width,
    height: esploraCard.height,
    borderRadius: esploraCard.radius,
    overflow: 'hidden',
    backgroundColor: colors.neutral.grey2,
  },
  content: {
    flex: 1,
    padding: esploraSpacing.md,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    ...esploraType.cardTitle,
    color: colors.neutral.white,
    textShadowColor: 'rgba(0,0,0,0.24)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  footer: {
    flexDirection: 'row',
  },
  meta: {
    ...esploraType.cardMeta,
    color: colors.neutral.white,
    textShadowColor: 'rgba(0,0,0,0.22)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});
