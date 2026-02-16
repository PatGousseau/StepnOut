import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { colors } from "../constants/Colors";

type CommentPreviewRowProps = {
  username: string;
  text: string;
  replyToUsername?: string;
  isLast?: boolean;
  bodyColor?: string;
};

const CommentPreviewRow: React.FC<CommentPreviewRowProps> = ({
  username,
  text,
  replyToUsername,
  isLast = true,
  bodyColor = colors.neutral.darkGrey,
}) => {
  return (
    <View style={rowStyle}>
      <View style={[trunkStyle, isLast && trunkLastStyle]} />
      <View style={connectorStyle} />
      <Text style={[textStyle, { flex: 1 }]} numberOfLines={2}>
        <Text style={usernameStyle}>@{username}:</Text>
        {"  "}
        {replyToUsername && (
          <Text style={{ color: bodyColor }}>@{replyToUsername} </Text>
        )}
        <Text style={{ color: bodyColor }}>{text}</Text>
      </Text>
    </View>
  );
};

const rowStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  minHeight: 18,
};

const trunkStyle: ViewStyle = {
  width: 2,
  backgroundColor: colors.neutral.grey2,
  alignSelf: "stretch",
  marginBottom: -4,
};

const trunkLastStyle: ViewStyle = {
  height: "50%",
  alignSelf: "flex-start",
  marginBottom: 0,
};

const connectorStyle: ViewStyle = {
  width: 10,
  height: 2,
  backgroundColor: colors.neutral.grey2,
  marginRight: 8,
};

const textStyle: TextStyle = {
  color: colors.light.lightText,
  fontSize: 12,
  lineHeight: 16,
};

const usernameStyle: TextStyle = {
  fontWeight: "600",
  color: colors.light.text,
};

export default CommentPreviewRow;
