import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import {
  esploraCard,
  esploraSpacing,
  esploraType,
} from '../../constants/EsploraStyles';
import { useBookmarkedPieces } from '../../hooks/useBookmarkedPieces';
import { useBookmarks } from '../../contexts/BookmarksContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LargePieceCard } from '../../components/esplora/LargePieceCard';

export default function SavedScreen() {
  const { t } = useLanguage();
  const { data, isLoading } = useBookmarkedPieces();
  const { initializeBookmarks } = useBookmarks();

  useEffect(() => {
    if (data && data.length > 0) initializeBookmarks(data);
  }, [data, initializeBookmarks]);

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
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <LargePieceCard piece={item} source="saved" style={styles.gridCard} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.heading}>{t('Saved')}</Text>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.light.lightText} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>
                {t('No saved pieces yet')}
              </Text>
              <Text style={styles.emptyBody}>
                {t('Save a piece to find it here later.')}
              </Text>
            </View>
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
  list: {
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingBottom: esploraSpacing.xxxl,
  },
  columnWrapper: {
    gap: esploraCard.gap,
    marginBottom: esploraCard.gap,
  },
  gridCard: {
    width: esploraCard.gridWidth,
    height: esploraCard.gridHeight,
  },
  heading: {
    ...esploraType.display,
    color: colors.light.text,
    paddingTop: esploraSpacing.md,
    paddingBottom: esploraSpacing.lg,
  },
  loader: {
    paddingVertical: esploraSpacing.xxl,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: esploraSpacing.xxl,
  },
  emptyTitle: {
    ...esploraType.title,
    color: colors.light.text,
    marginBottom: esploraSpacing.sm,
  },
  emptyBody: {
    ...esploraType.body,
    color: colors.light.lightText,
  },
});
