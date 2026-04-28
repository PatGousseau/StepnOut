import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import {
  CATEGORY_GRADIENTS,
  esploraCard,
  esploraSpacing,
  esploraType,
} from '../../constants/EsploraStyles';
import { ContentPiece } from '../../types';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

interface Props {
  piece: ContentPiece;
  source: 'recent' | 'category' | 'saved' | 'featured';
  style?: ViewStyle;
}

const useCoverImageUrl = (path: string | null) =>
  useMemo(() => {
    if (!path) return null;
    const { data } = supabase.storage
      .from('challenge-uploads')
      .getPublicUrl(path);
    return data?.publicUrl ?? null;
  }, [path]);

export const LargePieceCard: React.FC<Props> = ({ piece, source, style }) => {
  const { t } = useLanguage();
  const imageUrl = useCoverImageUrl(piece.cover_image_path);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = imageUrl && !imageFailed;
  const gradient = CATEGORY_GRADIENTS[piece.category];

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
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.45)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
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
  },
  title: {
    ...esploraType.cardTitle,
    color: colors.neutral.white,
  },
  footer: {
    flexDirection: 'row',
  },
  meta: {
    ...esploraType.cardMeta,
    color: colors.neutral.white,
    opacity: 0.85,
  },
});
