import React, { forwardRef } from "react";
import { View, ViewStyle, TextStyle, ImageStyle, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useLanguage } from "../contexts/LanguageContext";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const SCALE = Dimensions.get("window").width / STORY_WIDTH;
const S = (v: number) => v * SCALE;

interface InstagramStoryCardProps {
  username: string;
  challengeTitle?: string;
  mediaUrl?: string;
  postText?: string;
  completionCount?: number;
  onImageLoad?: () => void;
}

const InstagramStoryCard = forwardRef<View, InstagramStoryCardProps>(
  ({ username, challengeTitle, mediaUrl, postText, completionCount = 0, onImageLoad }, ref) => {
    const { t } = useLanguage();
    const isChallenge = !!challengeTitle;

    return (
      <View
        ref={ref}
        style={containerStyle}
        collapsable={false}
      >
        {/* Top section - Logo + challenge info */}
        <View style={topSectionStyle}>
          <Image
            source={require("../assets/images/header-logo.png")}
            style={logoStyle}
            contentFit="contain"
          />

          {isChallenge && (
            <>
              <Text style={challengeLabelStyle}>{t("THIS WEEK'S CHALLENGE")}</Text>
              <Text style={challengeNameStyle} numberOfLines={2}>
                {challengeTitle}
              </Text>
            </>
          )}

          <View style={dividerStyle} />
        </View>

        {/* Middle section - Media/text content */}
        <View style={middleSectionStyle}>
          {postText ? (
            <View style={contentContainerStyle}>
              <View style={textContainerStyle}>
                <Text style={postTextStyle} numberOfLines={8}>
                  {`"${postText}"`}
                </Text>
              </View>
            </View>
          ) : null}


        </View>

        {/* Bottom section - CTA */}
        <View style={bottomSectionStyle}>
          <View style={dividerStyle} />
          {isChallenge && completionCount > 1 ? (
            <Text style={ctaStyle}>
              {t("Join me and")} {completionCount - 1} {t("others who completed this week's challenge on StepnOut")}
            </Text>
          ) : (
            <Text style={ctaStyle}>
              {t("Join me on StepnOut")}
            </Text>
          )}
          <Text style={downloadStyle}>
            {t("Download free on iOS & Android")}
          </Text>
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
  backgroundColor: colors.light.background,
  paddingHorizontal: S(80),
  paddingTop: S(160),
  paddingBottom: S(120),
  justifyContent: "space-between",
};

const topSectionStyle: ViewStyle = {
  alignItems: "center",
};

const logoStyle: ImageStyle = {
  width: S(360),
  height: S(100),
  marginBottom: S(40),
};

const challengeLabelStyle: TextStyle = {
  fontSize: S(28),
  color: colors.neutral.darkGrey,
  letterSpacing: S(4),
  marginBottom: S(12),
};

const challengeNameStyle: TextStyle = {
  fontSize: S(44),
  fontWeight: "700",
  color: colors.light.primary,
  textAlign: "center",
  marginBottom: S(32),
};

const dividerStyle: ViewStyle = {
  width: S(120),
  height: S(4),
  backgroundColor: colors.light.primary,
  borderRadius: S(2),
};

const headingStyle: TextStyle = {
  fontSize: S(38),
  fontWeight: "800",
  color: colors.light.primary,
  letterSpacing: S(5),
  marginTop: S(32),
};

const middleSectionStyle: ViewStyle = {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  paddingVertical: S(40),
};

const contentContainerStyle: ViewStyle = {
  width: "100%",
  aspectRatio: 4 / 5,
  borderRadius: S(32),
  overflow: "hidden",
  backgroundColor: colors.neutral.white,
};

const mediaStyle: ImageStyle = {
  width: "100%",
  height: "100%",
};

const textContainerStyle: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: S(60),
  backgroundColor: colors.light.accent2,
};

const postTextStyle: TextStyle = {
  fontSize: S(44),
  color: colors.light.text,
  textAlign: "center",
  lineHeight: S(64),
  fontStyle: "italic",
};

const usernameStyle: TextStyle = {
  fontSize: S(36),
  color: colors.neutral.darkGrey,
  fontWeight: "600",
  marginTop: S(48),
};

const bottomSectionStyle: ViewStyle = {
  alignItems: "center",
};

const ctaStyle: TextStyle = {
  fontSize: S(38),
  fontWeight: "600",
  color: colors.light.primary,
  textAlign: "center",
  marginTop: S(40),
  marginBottom: S(16),
};

const downloadStyle: TextStyle = {
  fontSize: S(34),
  fontWeight: "600",
  color: colors.neutral.darkGrey,
};

export default InstagramStoryCard;
