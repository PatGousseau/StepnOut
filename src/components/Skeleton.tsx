import React, { useEffect, useRef } from "react";
import { View, Animated, ViewStyle, Dimensions, DimensionValue } from "react-native";
import { colors } from "../constants/Colors";

interface SkeletonProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
  backgroundColor?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
  backgroundColor = colors.neutral.grey2,
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
          backgroundColor,
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

// Skeleton for the challenge page
export const ChallengeSkeleton: React.FC = () => {
  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth - 72; // Account for margins and padding

  return (
    <View style={challengeSkeletonContainer}>
      <View style={challengeSkeletonContent}>
        {/* Title */}
        <View style={challengeSkeletonTitleContainer}>
          <Skeleton width={120} height={28} borderRadius={6} />
        </View>
        
        {/* Ends in subtitle */}
        <View style={challengeSkeletonSubtitleContainer}>
          <Skeleton width={100} height={14} borderRadius={4} />
        </View>
        
        {/* Challenge image */}
        <Skeleton 
          width={imageSize} 
          height={imageSize * 0.6} 
          borderRadius={12} 
          backgroundColor="#FFFFFF"
          style={{ alignSelf: "center", marginBottom: 16 }} 
        />
        
        {/* Challenge card */}
        <View style={challengeSkeletonCard}>
          {/* Challenge name */}
          <Skeleton width="80%" height={20} borderRadius={4} />
          <Skeleton width="60%" height={20} borderRadius={4} style={{ marginTop: 8 }} />
          
          {/* Description */}
          <Skeleton width="100%" height={14} borderRadius={4} style={{ marginTop: 16 }} />
          <Skeleton width="95%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
          <Skeleton width="70%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        
        {/* Share experience button */}
        <Skeleton 
          width="100%" 
          height={48} 
          borderRadius={24} 
          style={{ marginTop: 20 }} 
        />
      </View>
    </View>
  );
};

const challengeSkeletonContainer: ViewStyle = {
  backgroundColor: colors.light.background,
  flex: 1,
};

const challengeSkeletonContent: ViewStyle = {
  backgroundColor: colors.light.cardBg,
  borderRadius: 12,
  marginHorizontal: 16,
  marginVertical: 24,
  padding: 20,
};

const challengeSkeletonTitleContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: 8,
};

const challengeSkeletonSubtitleContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: 20,
};

const challengeSkeletonCard: ViewStyle = {
  marginBottom: 16,
};

// Skeleton for the profile page
export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={profileSkeletonContainer}>
      {/* Profile header */}
      <View style={profileSkeletonHeader}>
        <View style={profileSkeletonHeaderLeft}>
          {/* Avatar */}
          <Skeleton width={80} height={80} borderRadius={40} />
          
          {/* User info */}
          <View style={profileSkeletonUserInfo}>
            <Skeleton width={140} height={24} borderRadius={4} />
            <Skeleton width={100} height={16} borderRadius={4} style={{ marginTop: 6 }} />
            <Skeleton width={80} height={14} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
        </View>
        
        {/* Settings icon */}
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
      
      {/* Progress section */}
      <View style={profileSkeletonProgress}>
        <Skeleton width="100%" height={100} borderRadius={12} />
      </View>
      
      {/* Posts title */}
      <Skeleton width={120} height={20} borderRadius={4} style={{ marginVertical: 16 }} />
      
      {/* Posts */}
      <PostSkeleton />
      <PostSkeleton />
    </View>
  );
};

const profileSkeletonContainer: ViewStyle = {
  backgroundColor: colors.light.background,
  flex: 1,
  padding: 16,
};

const profileSkeletonHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
};

const profileSkeletonHeaderLeft: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const profileSkeletonUserInfo: ViewStyle = {
  marginLeft: 16,
};

const profileSkeletonProgress: ViewStyle = {
  marginBottom: 8,
};
