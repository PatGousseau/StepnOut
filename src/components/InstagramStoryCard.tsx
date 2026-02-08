import React, { forwardRef } from "react";
import { View, ViewStyle, TextStyle, ImageStyle, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useLanguage } from "../contexts/LanguageContext";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const SCALE = Dimensions.get("window").width / STORY_WIDTH;

interface InstagramStoryCardProps {
  username: string;
  challengeTitle?: string;
  mediaUrl?: string;
  postText?: string;
  onImageLoad?: () => void;
}

const InstagramStoryCard = forwardRef<View, InstagramStoryCardProps>(
  ({ username, challengeTitle, mediaUrl, postText, onImageLoad }, ref) => {
    const { t } = useLanguage();

    return (
      <View
        ref={ref}
        style={containerStyle}
        // Prevent Android from collapsing this off-screen view
        collapsable={false}
      >
        <View style={innerContainerStyle}>
          {/* Logo */}
          <View style={logoContainerStyle}>
            <Image
              source={require("../assets/images/header-logo.png")}
              style={logoStyle}
              contentFit="contain"
            />
          </View>

          {/* Content Area */}
          <View style={contentContainerStyle}>
            {mediaUrl ? (
              <Image
                source={{ uri: mediaUrl }}
                style={mediaStyle}
                contentFit="cover"
                cachePolicy="memory-disk"
                onLoad={onImageLoad}
              />
            ) : postText ? (
              <View style={textContainerStyle}>
                <Text style={postTextStyle} numberOfLines={10}>
                  {`"${postText}"`}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Username */}
          <Text style={usernameStyle}>@{username}</Text>

          {/* Challenge Title */}
          {challengeTitle && (
            <Text style={challengeTitleStyle} numberOfLines={2}>
              {challengeTitle}
            </Text>
          )}

          {/* CTA */}
          <Text style={ctaStyle}>{t("Join me on StepnOut!")}</Text>
        </View>
      </View>
    );
  }
);

InstagramStoryCard.displayName = "InstagramStoryCard";

const containerStyle: ViewStyle = {
  position: "absolute",
  left: -9999,
  top: -9999,
  width: STORY_WIDTH * SCALE,
  height: STORY_HEIGHT * SCALE,
  backgroundColor: colors.light.primary,
};

const innerContainerStyle: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 60 * SCALE,
  paddingVertical: 120 * SCALE,
};

const logoContainerStyle: ViewStyle = {
  marginBottom: 80 * SCALE,
};

const logoStyle: ImageStyle = {
  width: 400 * SCALE,
  height: 120 * SCALE,
};

const contentContainerStyle: ViewStyle = {
  width: "100%",
  aspectRatio: 1,
  borderRadius: 24 * SCALE,
  overflow: "hidden",
  backgroundColor: colors.neutral.white,
  marginBottom: 60 * SCALE,
};

const mediaStyle: ImageStyle = {
  width: "100%",
  height: "100%",
};

const textContainerStyle: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: 40 * SCALE,
  backgroundColor: colors.light.accent2,
};

const postTextStyle: TextStyle = {
  fontSize: 48 * SCALE,
  color: colors.light.text,
  textAlign: "center",
  lineHeight: 64 * SCALE,
  fontStyle: "italic",
};

const usernameStyle: TextStyle = {
  fontSize: 44 * SCALE,
  color: colors.neutral.white,
  fontWeight: "600",
  marginBottom: 16 * SCALE,
};

const challengeTitleStyle: TextStyle = {
  fontSize: 36 * SCALE,
  color: colors.light.accent2,
  textAlign: "center",
  marginBottom: 40 * SCALE,
};

const ctaStyle: TextStyle = {
  fontSize: 48 * SCALE,
  color: colors.neutral.white,
  fontWeight: "bold",
  marginTop: "auto",
};

export default InstagramStoryCard;
