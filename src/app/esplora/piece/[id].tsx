import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../../../constants/Colors';
import {
  CATEGORY_LABEL_KEYS,
  esploraSpacing,
  esploraType,
} from '../../../constants/EsploraStyles';
import { ContentCard } from '../../../types';
import { usePiece } from '../../../hooks/usePiece';
import { useBookmarks } from '../../../contexts/BookmarksContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { BookmarkButton } from '../../../components/esplora/BookmarkButton';
import { CardPager } from '../../../components/esplora/CardPager';
import { PieceCard } from '../../../components/esplora/PieceCard';
import { captureEvent } from '../../../lib/posthog';
import { ESPLORA_EVENTS } from '../../../constants/analyticsEvents';

type ReaderPage =
  | { kind: 'hook'; text: string }
  | { kind: 'body'; card: ContentCard };

export default function PieceReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pieceId = id ? Number(id) : null;
  const { t } = useLanguage();
  const { data: piece, isLoading } = usePiece(pieceId);
  const { initializeBookmarks } = useBookmarks();
  const [activeIndex, setActiveIndex] = useState(0);
  const finishedRef = useRef(false);
  const viewedCardsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (piece) {
      initializeBookmarks([piece]);
    }
  }, [piece, initializeBookmarks]);

  // Ensure the first card registers as viewed (onPageSelected does not fire for index 0).
  useEffect(() => {
    if (piece && !viewedCardsRef.current.has(0)) {
      viewedCardsRef.current.add(0);
      captureEvent(ESPLORA_EVENTS.CARD_VIEWED, {
        piece_id: piece.id,
        card_index: 0,
      });
    }
  }, [piece]);

  const pages = useMemo<ReaderPage[]>(() => {
    if (!piece) return [];
    return [
      { kind: 'hook', text: piece.hook },
      ...piece.cards.map((card) => ({ kind: 'body' as const, card })),
    ];
  }, [piece]);

  const handlePageSelected = (index: number) => {
    setActiveIndex(index);
    if (!piece) return;
    if (!viewedCardsRef.current.has(index)) {
      viewedCardsRef.current.add(index);
      captureEvent(ESPLORA_EVENTS.CARD_VIEWED, {
        piece_id: piece.id,
        card_index: index,
      });
    }
    if (index === pages.length - 1 && !finishedRef.current) {
      finishedRef.current = true;
      captureEvent(ESPLORA_EVENTS.PIECE_FINISHED, { piece_id: piece.id });
    }
  };

  if (isLoading || !piece) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.light.lightText} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={26} color={colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.topCategory}>
          {t(CATEGORY_LABEL_KEYS[piece.category])}
        </Text>
        <BookmarkButton pieceId={piece.id} />
      </View>

      <CardPager
        totalCards={pages.length}
        activeIndex={activeIndex}
        onPageSelected={handlePageSelected}
      >
        {pages.map((page, idx) => (
          <View key={idx} collapsable={false} style={styles.page}>
            {page.kind === 'hook' ? (
              <PieceCard kind="hook" text={page.text} />
            ) : (
              <PieceCard kind="body" card={page.card} pieceId={piece.id} />
            )}
          </View>
        ))}
      </CardPager>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingTop: esploraSpacing.md,
    paddingBottom: esploraSpacing.md,
  },
  topCategory: {
    ...esploraType.categoryLabel,
    color: colors.light.lightText,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: esploraSpacing.md,
  },
  page: {
    flex: 1,
  },
});
