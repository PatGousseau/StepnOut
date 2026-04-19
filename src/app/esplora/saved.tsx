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
import { esploraSpacing, esploraType } from '../../constants/EsploraStyles';
import { useBookmarkedPieces } from '../../hooks/useBookmarkedPieces';
import { useBookmarks } from '../../contexts/BookmarksContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { PieceListItem } from '../../components/esplora/PieceListItem';

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
          <PieceListItem piece={item} source="saved" />
        )}
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
  emptyWrap: {
    paddingHorizontal: esploraSpacing.horizontalPadding,
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
