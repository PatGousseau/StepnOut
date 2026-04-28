import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../constants/Colors';
import { esploraSpacing } from '../../constants/EsploraStyles';
import {
  useCategorySections,
  useFeaturedPiece,
} from '../../hooks/useEsploraHome';
import { useBookmarks } from '../../contexts/BookmarksContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { EsploraHeader } from '../../components/esplora/EsploraHeader';
import { FeaturedCard } from '../../components/esplora/FeaturedCard';
import { CategorySection } from '../../components/esplora/CategorySection';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

export default function EsploraScreen() {
  const { t } = useLanguage();
  const featuredQuery = useFeaturedPiece();
  const { sections, isLoading, pieces } = useCategorySections();
  const { initializeBookmarks } = useBookmarks();

  const allPieces = useMemo(() => {
    return [
      ...(featuredQuery.data ? [featuredQuery.data] : []),
      ...pieces,
    ];
  }, [featuredQuery.data, pieces]);

  useEffect(() => {
    captureEvent(ESPLORA_EVENTS.OPENED);
  }, []);

  useEffect(() => {
    if (allPieces.length > 0) initializeBookmarks(allPieces);
  }, [allPieces, initializeBookmarks]);

  const loading = featuredQuery.isLoading || isLoading;

  return (
    <View style={styles.container}>
      <EsploraHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.light.lightText} />
          </View>
        ) : (
          <>
            {featuredQuery.data && <FeaturedCard piece={featuredQuery.data} />}
            {sections.map((section) => (
              <CategorySection
                key={section.category}
                category={section.category}
                pieces={section.pieces}
              />
            ))}
            {sections.every((s) => s.pieces.length === 0) && (
              <Text style={styles.empty}>{t('No pieces yet')}</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
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
  empty: {
    fontSize: 14,
    color: colors.light.lightText,
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingVertical: esploraSpacing.lg,
  },
});
