import React, { useEffect, useRef } from "react";
import { View, Animated, ViewStyle, Dimensions, DimensionValue } from "react-native";
import { colors } from "../constants/Colors";

interface SkeletonProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.neutral.grey2,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton for a single comment
export const CommentSkeleton: React.FC = () => {
  return (
    <View style={commentSkeletonContainer}>
      <Skeleton width={30} height={30} borderRadius={15} />
      <View style={commentSkeletonContent}>
        <View style={commentSkeletonHeader}>
          <Skeleton width={80} height={12} />
          <Skeleton width={60} height={10} style={{ marginLeft: 8 }} />
        </View>
        <Skeleton width="90%" height={14} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

// Skeleton for the comments list loading state
export const CommentsListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={commentsListSkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </View>
  );
};

// Skeleton for a single post
export const PostSkeleton: React.FC = () => {
  return (
    <View style={postSkeletonContainer}>
      {/* Header */}
      <View style={postSkeletonHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={postSkeletonHeaderContent}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={10} style={{ marginTop: 4 }} />
        </View>
      </View>
      
      {/* Content/Image area */}
      <Skeleton 
        width="100%" 
        height={Dimensions.get("window").width - 32} 
        borderRadius={8} 
        style={{ marginTop: 8 }} 
      />
      
      {/* Action buttons */}
      <View style={postSkeletonActions}>
        <Skeleton width={50} height={20} />
        <Skeleton width={50} height={20} style={{ marginLeft: 24 }} />
        <Skeleton width={50} height={20} style={{ marginLeft: 24 }} />
      </View>
    </View>
  );
};

// Skeleton for the posts list loading state
export const PostsListSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </View>
  );
};

const commentSkeletonContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 16,
  paddingHorizontal: 4,
};

const commentSkeletonContent: ViewStyle = {
  flex: 1,
  marginLeft: 10,
};

const commentSkeletonHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const commentsListSkeletonContainer: ViewStyle = {
  paddingVertical: 8,
};

const postSkeletonContainer: ViewStyle = {
  backgroundColor: colors.light.background,
  padding: 16,
  marginBottom: 8,
};

const postSkeletonHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const postSkeletonHeaderContent: ViewStyle = {
  marginLeft: 10,
  flex: 1,
};

const postSkeletonActions: ViewStyle = {
  flexDirection: "row",
  marginTop: 12,
};
