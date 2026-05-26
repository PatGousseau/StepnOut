import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/Colors';
import { useBookmarks } from '../../contexts/BookmarksContext';

interface Props {
  pieceId: number;
  size?: number;
}

export const BookmarkButton: React.FC<Props> = ({ pieceId, size = 22 }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const active = isBookmarked(pieceId);

  return (
    <TouchableOpacity
      onPress={() => toggleBookmark(pieceId)}
      hitSlop={12}
      style={styles.container}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Ionicons
        name={active ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={colors.light.text}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});
