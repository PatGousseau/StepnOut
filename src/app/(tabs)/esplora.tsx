import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../constants/Colors';
import { esploraSpacing, esploraType } from '../../constants/EsploraStyles';
import { useFeaturedPiece, useRecentPieces } from '../../hooks/useEsploraHome';
import { useBookmarks } from '../../contexts/BookmarksContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { EsploraHeader } from '../../components/esplora/EsploraHeader';
import { FeaturedCard } from '../../components/esplora/FeaturedCard';
import { CategoryRow } from '../../components/esplora/CategoryRow';
import { PieceListItem } from '../../components/esplora/PieceListItem';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

export default function EsploraScreen() {
  const { t } = useLanguage();
  const featuredQuery = useFeaturedPiece();
  const recentQuery = useRecentPieces();
  const { initializeBookmarks } = useBookmarks();

  const recentPieces = useMemo(
    () => recentQuery.data?.pages.flat() ?? [],
    [recentQuery.data]
  );

  useEffect(() => {
    captureEvent(ESPLORA_EVENTS.OPENED);
  }, []);

  useEffect(() => {
    const all = [
      ...(featuredQuery.data ? [featuredQuery.data] : []),
      ...recentPieces,
    ];
    if (all.length > 0) {
      initializeBookmarks(all);
    }
  }, [featuredQuery.data, recentPieces, initializeBookmarks]);

  const loading = featuredQuery.isLoading || recentQuery.isLoading;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onMomentumScrollEnd={(e) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const nearBottom =
          contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
        if (
          nearBottom &&
          recentQuery.hasNextPage &&
          !recentQuery.isFetchingNextPage
        ) {
          recentQuery.fetchNextPage();
        }
      }}
    >
      <EsploraHeader />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.light.lightText} />
        </View>
      ) : (
        <>
          {featuredQuery.data && <FeaturedCard piece={featuredQuery.data} />}
          <CategoryRow />
          <View style={styles.recentSection}>
            <Text style={styles.sectionLabel}>{t('Recent discoveries')}</Text>
            {recentPieces.length === 0 ? (
              <Text style={styles.empty}>{t('No pieces yet')}</Text>
            ) : (
              recentPieces.map((piece) => (
                <PieceListItem key={piece.id} piece={piece} source="recent" />
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    paddingBottom: esploraSpacing.xxxl,
  },
  loader: {
    paddingVertical: esploraSpacing.xxl,
    alignItems: 'center',
  },
  recentSection: {
    marginTop: esploraSpacing.lg,
  },
  sectionLabel: {
    ...esploraType.sectionLabel,
    color: colors.light.lightText,
    paddingHorizontal: esploraSpacing.horizontalPadding,
    marginBottom: esploraSpacing.sm,
  },
  empty: {
    ...esploraType.body,
    color: colors.light.lightText,
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingVertical: esploraSpacing.lg,
  },
});
