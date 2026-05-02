import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import {
  CATEGORY_GRADIENTS,
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
  source: 'challenge';
  eyebrowKey?: string;
}

export const RelatedPieceCard: React.FC<Props> = ({
  piece,
  source,
  eyebrowKey = 'Suggested reading',
}) => {
  const { t } = useLanguage();
  const gradient = CATEGORY_GRADIENTS[piece.category];
  const accentColor = gradient[0];
  const categoryLabel = t(CATEGORY_LABEL_KEYS[piece.category]).toUpperCase();

  const handlePress = () => {
    captureEvent(ESPLORA_EVENTS.PIECE_OPENED, {
      piece_id: piece.id,
      category: piece.category,
      source,
    });
    router.push(`/esplora/piece/${piece.id}`);
  };

  return (
    <View>
      <Text style={[styles.eyebrow, { color: colors.light.lightText }]}>
        {t(eyebrowKey)}
      </Text>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        style={styles.card}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentStrip}
        />
        <View style={styles.body}>
          <Text style={[styles.category, { color: accentColor }]}>
            {categoryLabel}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {piece.title}
          </Text>
          <Text style={styles.hook} numberOfLines={3}>
            {piece.hook}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.light.lightText}
          style={styles.chevron}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  eyebrow: {
    ...esploraType.categoryLabel,
    marginBottom: esploraSpacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  accentStrip: {
    width: 6,
  },
  body: {
    flex: 1,
    paddingVertical: esploraSpacing.md,
    paddingHorizontal: esploraSpacing.md,
  },
  category: {
    ...esploraType.categoryLabel,
    fontSize: 11,
    marginBottom: esploraSpacing.xs,
  },
  title: {
    ...esploraType.cardTitle,
    color: colors.light.text,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: esploraSpacing.xs,
  },
  hook: {
    ...esploraType.preview,
    color: colors.light.lightText,
    fontSize: 13,
    lineHeight: 19,
  },
  chevron: {
    alignSelf: 'center',
    paddingHorizontal: esploraSpacing.md,
  },
});
