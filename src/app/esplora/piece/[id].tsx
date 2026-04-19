import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
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
import { usePiece } from '../../../hooks/usePiece';
import { useBookmarks } from '../../../contexts/BookmarksContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { BookmarkButton } from '../../../components/esplora/BookmarkButton';
import { CardPager } from '../../../components/esplora/CardPager';
import { PieceCard } from '../../../components/esplora/PieceCard';
import { captureEvent } from '../../../lib/posthog';
import { ESPLORA_EVENTS } from '../../../constants/analyticsEvents';

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

  const cards = useMemo(() => {
    if (!piece) return [] as Array<
      | { kind: 'hook'; text: string }
      | { kind: 'body'; text: string }
      | {
          kind: 'closing';
          text: string;
          closingKind: 'prompt' | 'cta';
          challengeId: number | null;
        }
    >;
    return [
      { kind: 'hook' as const, text: piece.hook },
      ...piece.cards.map((text) => ({ kind: 'body' as const, text })),
      {
        kind: 'closing' as const,
        text: piece.closing_text,
        closingKind: piece.closing_kind,
        challengeId: piece.closing_challenge_id,
      },
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
    if (index === cards.length - 1 && !finishedRef.current) {
      finishedRef.current = true;
      captureEvent(ESPLORA_EVENTS.PIECE_FINISHED, { piece_id: piece.id });
    }
  };

  const handleExternalLink = () => {
    if (!piece?.external_link_url) return;
    captureEvent(ESPLORA_EVENTS.EXTERNAL_LINK_TAPPED, { piece_id: piece.id });
    Linking.openURL(piece.external_link_url);
  };

  if (isLoading || !piece) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.light.lightText} />
      </View>
    );
  }

  const isLastCard = activeIndex === cards.length - 1;

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
        totalCards={cards.length}
        activeIndex={activeIndex}
        onPageSelected={handlePageSelected}
      >
        {cards.map((card, idx) => (
          <View key={idx} collapsable={false} style={styles.page}>
            {card.kind === 'hook' ? (
              <PieceCard kind="hook" text={card.text} />
            ) : card.kind === 'body' ? (
              <PieceCard kind="body" text={card.text} />
            ) : (
              <PieceCard
                kind="closing"
                text={card.text}
                closingKind={card.closingKind}
                challengeId={card.challengeId}
              />
            )}
          </View>
        ))}
      </CardPager>

      {isLastCard && piece.external_link_url ? (
        <View style={styles.externalLinkWrap}>
          <TouchableOpacity
            onPress={handleExternalLink}
            accessibilityRole="link"
          >
            <Text style={styles.externalLinkText}>
              {piece.external_link_label ?? t('Read more')} →
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  externalLinkWrap: {
    paddingHorizontal: esploraSpacing.readerHorizontalPadding,
    paddingBottom: esploraSpacing.lg,
    alignItems: 'flex-start',
  },
  externalLinkText: {
    ...esploraType.body,
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
