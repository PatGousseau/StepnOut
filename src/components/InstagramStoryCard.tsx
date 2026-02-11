import React, { forwardRef } from "react";
import { View, ViewStyle, TextStyle, ImageStyle, Dimensions } from "react-native";
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
  profileImageUrl?: string;
  completionCount?: number;
  variant?: "challenge" | "post";
  onImageLoad?: () => void;
}

const InstagramStoryCard = forwardRef<View, InstagramStoryCardProps>(
  ({ username, challengeTitle, mediaUrl, postText, profileImageUrl, completionCount = 0, variant = "challenge", onImageLoad }, ref) => {
    const { t } = useLanguage();
    const isChallenge = !!challengeTitle;

    if (variant === "post") {
      return (
        <View
          ref={ref}
          style={containerStyle}
          collapsable={false}
        >
          {/* Post card centered */}
          <View style={middleSectionStyle}>
            <Image
              source={require("../assets/images/header-logo.png")}
              style={postVariantLogoStyle}
              contentFit="contain"
            />
            <View style={postCardStyle}>
              {/* Post header */}
              <View style={postHeaderStyle}>
                <Image
                  source={profileImageUrl ? { uri: profileImageUrl } : require("../assets/images/default-pfp.png")}
                  style={avatarStyle}
                  contentFit="cover"
                />
                <Text style={postUsernameStyle}>@{username}</Text>
              </View>

              {/* Challenge box */}
              {isChallenge && (
                <View style={postChallengeBoxStyle}>
                  <Text style={postChallengeTitleStyle} numberOfLines={1}>
                    <Text style={{ fontWeight: "bold" }}>{t("Challenge:")}</Text> {challengeTitle}
                  </Text>
                </View>
              )}

              {/* Post text */}
              {postText ? (
                <Text style={postBodyStyle} numberOfLines={20}>
                  {postText}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      );
    }

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

        {/* Middle section - Post card UI */}
        <View style={middleSectionStyle}>
          <View style={postCardStyle}>
            {/* Post header */}
            <View style={postHeaderStyle}>
              <Image
                source={profileImageUrl ? { uri: profileImageUrl } : require("../assets/images/default-pfp.png")}
                style={avatarStyle}
                contentFit="cover"
              />
              <Text style={postUsernameStyle}>@{username}</Text>
            </View>

            {/* Challenge box */}
            {isChallenge && (
              <View style={postChallengeBoxStyle}>
                <Text style={postChallengeTitleStyle} numberOfLines={1}>
                  <Text style={{ fontWeight: "bold" }}>{t("Challenge:")}</Text> {challengeTitle}
                </Text>
              </View>
            )}

            {/* Post text */}
            {postText ? (
              <Text style={postBodyStyle} numberOfLines={20}>
                {postText}
              </Text>
            ) : null}
          </View>
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
  fontSize: S(36),
  color: colors.neutral.darkGrey,
  letterSpacing: S(4),
  marginBottom: S(12),
};

const challengeNameStyle: TextStyle = {
  fontSize: S(54),
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

const middleSectionStyle: ViewStyle = {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  paddingVertical: S(40),
};

const postCardStyle: ViewStyle = {
  width: "100%",
  backgroundColor: colors.neutral.white,
  borderRadius: S(24),
  borderWidth: S(3),
  borderColor: "#e0e0e0",
  padding: S(32),
};

const postHeaderStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: S(20),
};

const avatarStyle: ImageStyle = {
  width: S(80),
  height: S(80),
  borderRadius: S(40),
  marginRight: S(20),
};

const postUsernameStyle: TextStyle = {
  fontSize: S(36),
  color: "#666",
  fontWeight: "600",
};

const postChallengeBoxStyle: ViewStyle = {
  backgroundColor: colors.light.accent2,
  borderColor: colors.light.primary,
  borderRadius: S(16),
  borderWidth: S(3),
  marginBottom: S(16),
  paddingHorizontal: S(32),
  paddingVertical: S(12),
};

const postChallengeTitleStyle: TextStyle = {
  color: colors.light.primary,
  fontSize: S(32),
};

const postBodyStyle: TextStyle = {
  fontSize: S(40),
  color: colors.light.text,
  lineHeight: S(58),
};

const postVariantLogoStyle: ImageStyle = {
  width: S(420),
  height: S(120),
  alignSelf: "flex-start",
  marginLeft: S(-40),
  marginBottom: S(20),
};

const bottomSectionStyle: ViewStyle = {
  alignItems: "center",
};

const ctaStyle: TextStyle = {
  fontSize: S(46),
  fontWeight: "600",
  color: colors.light.primary,
  textAlign: "center",
  marginTop: S(40),
  marginBottom: S(16),
};

const downloadStyle: TextStyle = {
  fontSize: S(42),
  fontWeight: "600",
  color: colors.neutral.darkGrey,
};

export default InstagramStoryCard;
