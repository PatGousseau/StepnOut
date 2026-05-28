import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { ResizeMode, Video } from "expo-av";
import { colors } from "../constants/Colors";

export interface MediaGridItem {
  uri: string;
  isVideo?: boolean;
  useImageForVideo?: boolean;
}

interface MediaGridProps {
  items: MediaGridItem[];
  onPress?: (index: number) => void;
  onRemove?: (index: number) => void;
  height?: number;
  style?: ViewStyle;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  onPress,
  onRemove,
  height = 260,
  style,
}) => {
  const visibleItems = items.slice(0, 4);
  if (visibleItems.length === 0) return null;

  const renderTile = (item: MediaGridItem, index: number, tileStyle: ViewStyle) => (
    <Pressable
      key={`${item.uri}-${index}`}
      onPress={() => onPress?.(index)}
      style={[styles.tile, tileStyle]}
    >
      {item.isVideo && !item.useImageForVideo ? (
        <Video
          source={{ uri: item.uri }}
          style={styles.image}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isMuted
          useNativeControls={false}
        />
      ) : (
        <Image source={{ uri: item.uri }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
      )}
      {item.isVideo && (
        <View style={styles.videoOverlay}>
          <MaterialIcons name="play-circle-filled" size={30} color="white" />
        </View>
      )}
      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(index)}>
          <MaterialIcons name="close" size={14} color="white" />
        </TouchableOpacity>
      )}
    </Pressable>
  );

  if (visibleItems.length === 1) {
    return (
      <View style={[styles.container, { height }, style]}>
        {renderTile(visibleItems[0], 0, styles.fullTile)}
      </View>
    );
  }

  if (visibleItems.length === 2) {
    return (
      <View style={[styles.container, styles.row, { height }, style]}>
        {visibleItems.map((item, index) => renderTile(item, index, styles.halfTile))}
      </View>
    );
  }

  if (visibleItems.length === 3) {
    return (
      <View style={[styles.container, styles.row, { height }, style]}>
        {renderTile(visibleItems[0], 0, styles.halfTile)}
        <View style={styles.column}>
          {visibleItems.slice(1).map((item, offset) =>
            renderTile(item, offset + 1, styles.stackedTile)
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <View style={styles.gridRow}>
        {visibleItems.slice(0, 2).map((item, index) => renderTile(item, index, styles.gridTile))}
      </View>
      <View style={styles.gridRow}>
        {visibleItems.slice(2, 4).map((item, index) =>
          renderTile(item, index + 2, styles.gridTile)
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    flex: 1,
    gap: 2,
  },
  container: {
    borderRadius: 8,
    gap: 2,
    overflow: "hidden",
    width: "100%",
  },
  fullTile: {
    flex: 1,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
    gap: 2,
  },
  gridTile: {
    flex: 1,
  },
  halfTile: {
    flex: 1,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  removeButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: 6,
    top: 6,
    width: 22,
  },
  row: {
    flexDirection: "row",
  },
  stackedTile: {
    flex: 1,
  },
  tile: {
    backgroundColor: colors.neutral.grey2,
    overflow: "hidden",
    position: "relative",
  },
  videoOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
