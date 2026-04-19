import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { usePiecesByCategory } from '../../../hooks/usePiecesByCategory';
import { useBookmarks } from '../../../contexts/BookmarksContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { PieceListItem } from '../../../components/esplora/PieceListItem';
import { ContentCategory } from '../../../types';

const VALID_CATEGORIES: ContentCategory[] = [
  'fear',
  'vulnerability',
  'connection',
  'stories',
  'science',
  'practice',
];

export default function CategoryScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { t } = useLanguage();
  const { initializeBookmarks } = useBookmarks();

  const category = (
    VALID_CATEGORIES.includes(key as ContentCategory) ? key : 'fear'
  ) as ContentCategory;

  const query = usePiecesByCategory(category);
  const pieces = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

  useEffect(() => {
    if (pieces.length > 0) initializeBookmarks(pieces);
  }, [pieces, initializeBookmarks]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={colors.light.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pieces}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PieceListItem piece={item} source="category" />
        )}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Text style={styles.heading}>
            {t(CATEGORY_LABEL_KEYS[category])}
          </Text>
        }
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.light.lightText} />
            </View>
          ) : (
            <Text style={styles.empty}>{t('No pieces yet')}</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  topBar: {
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingTop: esploraSpacing.md,
    paddingBottom: esploraSpacing.sm,
  },
  heading: {
    ...esploraType.display,
    color: colors.light.text,
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingTop: esploraSpacing.md,
    paddingBottom: esploraSpacing.lg,
  },
  loader: {
    paddingVertical: esploraSpacing.xxl,
    alignItems: 'center',
  },
  empty: {
    ...esploraType.body,
    color: colors.light.lightText,
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingVertical: esploraSpacing.lg,
  },
});
