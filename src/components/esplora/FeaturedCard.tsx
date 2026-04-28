import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import {
  CATEGORY_GRADIENTS,
  CATEGORY_LABEL_KEYS,
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
}

const FEATURED_HEIGHT = Math.round(Dimensions.get('window').width * 0.9);

export const FeaturedCard: React.FC<Props> = ({ piece }) => {
  const { t } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = useMemo(() => {
    if (!piece.cover_image_path) return null;
    const { data } = supabase.storage
      .from('challenge-uploads')
      .getPublicUrl(piece.cover_image_path);
    return data?.publicUrl ?? null;
  }, [piece.cover_image_path]);
  const showImage = imageUrl && !imageFailed;
  const gradient = CATEGORY_GRADIENTS[piece.category];

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
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.65)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
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
  },
  category: {
    ...esploraType.categoryLabel,
    color: colors.neutral.white,
    opacity: 0.85,
    marginBottom: esploraSpacing.sm,
  },
  hook: {
    ...esploraType.hookLarge,
    color: colors.neutral.white,
    fontSize: 26,
    lineHeight: 34,
  },
});
