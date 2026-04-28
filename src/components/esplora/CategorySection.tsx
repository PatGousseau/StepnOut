import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/Colors';
import {
  CATEGORY_LABEL_KEYS,
  esploraCard,
  esploraSpacing,
  esploraType,
} from '../../constants/EsploraStyles';
import { ContentCategory, ContentPiece } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { LargePieceCard } from './LargePieceCard';

interface Props {
  category: ContentCategory;
  pieces: ContentPiece[];
}

export const CategorySection: React.FC<Props> = ({ category, pieces }) => {
  const { t } = useLanguage();

  if (pieces.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t(CATEGORY_LABEL_KEYS[category])}</Text>
      <FlatList
        data={pieces}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <LargePieceCard piece={item} source="recent" />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: esploraSpacing.lg,
    marginBottom: esploraSpacing.md,
  },
  label: {
    ...esploraType.sectionLabel,
    color: colors.light.text,
    paddingHorizontal: esploraSpacing.horizontalPadding,
    marginBottom: esploraSpacing.md,
  },
  row: {
    paddingHorizontal: esploraSpacing.horizontalPadding,
  },
  separator: {
    width: esploraCard.gap,
  },
});
