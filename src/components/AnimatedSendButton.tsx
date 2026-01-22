import React, { useRef, useEffect } from "react";
import { TouchableOpacity, Animated, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "../constants/Colors";

interface AnimatedSendButtonProps {
  hasContent: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: "small" | "medium";
}

export const AnimatedSendButton = ({
  hasContent,
  onPress,
  disabled = false,
  size = "medium",
}: AnimatedSendButtonProps) => {
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(buttonAnimation, {
      toValue: hasContent ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [hasContent, buttonAnimation]);

  const animatedButtonStyle = {
    backgroundColor: buttonAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.neutral.grey2, colors.light.accent],
    }),
    transform: [
      {
        scale: buttonAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };

  const iconSize = size === "small" ? 12 : 16;
  const buttonStyle: ViewStyle = {
    borderRadius: size === "small" ? 10 : 14,
    padding: size === "small" ? 4 : 6,
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !hasContent}
      activeOpacity={0.8}
    >
      <Animated.View style={[buttonStyle, animatedButtonStyle]}>
        <MaterialIcons
          name="send"
          size={iconSize}
          color={hasContent ? "white" : colors.light.lightText}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};
