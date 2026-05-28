import React, { useState } from "react";
import { Pressable, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, ImageLoadEventData } from "expo-image";
import { ResizeMode, Video } from "expo-av";
import { colors } from "../constants/Colors";

const TILE_GAP = 3;

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
  style?: StyleProp<ViewStyle>;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  onPress,
  onRemove,
  height = 260,
  style,
}) => {
  const visibleItems = items.slice(0, 4);
  const [containerWidth, setContainerWidth] = useState(0);
  const [singleImageRatio, setSingleImageRatio] = useState<number | null>(null);
  if (visibleItems.length === 0) return null;

  const singleItem = visibleItems.length === 1 ? visibleItems[0] : null;
  const singleImageHeight =
    singleItem && !singleItem.isVideo && singleImageRatio && containerWidth > 0
      ? Math.min(height, containerWidth / singleImageRatio)
      : height;
  const sizeStyle: ViewStyle = {
    aspectRatio: undefined,
    height: singleImageHeight,
    width: "100%",
  };
  const fixedGridSizeStyle: ViewStyle = {
    aspectRatio: undefined,
    height,
    width: "100%",
  };

  const handleSingleImageLoad = (event: ImageLoadEventData) => {
    const { width, height: imageHeight } = event.source;
    if (width > 0 && imageHeight > 0) {
      setSingleImageRatio(width / imageHeight);
    }
  };

  const renderTile = (item: MediaGridItem, index: number, tileStyle: StyleProp<ViewStyle>) => (
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
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          onLoad={visibleItems.length === 1 && !item.isVideo ? handleSingleImageLoad : undefined}
        />
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
      <View
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        style={[styles.container, style, sizeStyle]}
      >
        {renderTile(visibleItems[0], 0, styles.fullTile)}
      </View>
    );
  }

  if (visibleItems.length === 2) {
    return (
      <View style={[styles.container, style, styles.row, fixedGridSizeStyle]}>
        {visibleItems.map((item, index) =>
          renderTile(item, index, [styles.halfTile, index === 0 ? styles.rightGap : null])
        )}
      </View>
    );
  }

  if (visibleItems.length === 3) {
    return (
      <View style={[styles.container, style, styles.row, fixedGridSizeStyle]}>
        {renderTile(visibleItems[0], 0, [styles.halfTile, styles.rightGap])}
        <View style={styles.column}>
          {visibleItems.slice(1).map((item, offset) =>
            renderTile(item, offset + 1, [
              styles.stackedTile,
              offset === 0 ? styles.bottomGap : null,
            ])
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style, fixedGridSizeStyle]}>
      <View style={[styles.gridRow, styles.bottomGap]}>
        {visibleItems.slice(0, 2).map((item, index) =>
          renderTile(item, index, [styles.gridTile, index === 0 ? styles.rightGap : null])
        )}
      </View>
      <View style={styles.gridRow}>
        {visibleItems.slice(2, 4).map((item, index) =>
          renderTile(item, index + 2, [styles.gridTile, index === 0 ? styles.rightGap : null])
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    flex: 1,
  },
  container: {
    borderRadius: 8,
    width: "100%",
  },
  bottomGap: {
    marginBottom: TILE_GAP,
  },
  fullTile: {
    flex: 1,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
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
  rightGap: {
    marginRight: TILE_GAP,
  },
  row: {
    flexDirection: "row",
  },
  stackedTile: {
    flex: 1,
  },
  tile: {
    backgroundColor: colors.neutral.grey2,
    borderColor: colors.neutral.grey2,
    borderRadius: 8,
    borderWidth: 1,
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
