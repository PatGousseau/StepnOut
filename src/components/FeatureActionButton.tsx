import React, { ReactNode } from "react";
import {
  AccessibilityState,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";

type FeatureActionButtonTone = "coral" | "indigo" | "sage";
type FeatureActionButtonVariant = "card" | "pill";

type FeatureActionButtonProps = {
  completed?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  onPress: () => void;
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  title: string;
  tone?: FeatureActionButtonTone;
  variant?: FeatureActionButtonVariant;
};

const toneStyles: Record<
  FeatureActionButtonTone,
  {
    backgroundColor: string;
    borderColor: string;
    glowColor: string;
    orbitColor: string;
    subtitleColor: string;
    textColor: string;
  }
> = {
  coral: {
    backgroundColor: colors.sideQuest.base,
    borderColor: colors.sideQuest.text,
    glowColor: "rgba(255,255,255,0.18)",
    orbitColor: "rgba(255,255,255,0.2)",
    subtitleColor: "rgba(255,255,255,0.82)",
    textColor: colors.neutral.white,
  },
  indigo: {
    backgroundColor: colors.light.primarySoft,
    borderColor: colors.light.primary,
    glowColor: "rgba(229, 231, 245, 0.22)",
    orbitColor: "rgba(229, 231, 245, 0.26)",
    subtitleColor: "rgba(255,255,255,0.82)",
    textColor: colors.neutral.white,
  },
  sage: {
    backgroundColor: "#719A84",
    borderColor: "#4E735F",
    glowColor: "rgba(235, 244, 238, 0.22)",
    orbitColor: "rgba(235, 244, 238, 0.28)",
    subtitleColor: "rgba(255,255,255,0.84)",
    textColor: colors.neutral.white,
  },
};

const completedState = {
  backgroundColor: colors.light.easyGreen,
  borderColor: "rgba(45, 80, 22, 0.18)",
  iconColor: "#2D5016",
  textColor: "#2D5016",
};

export function FeatureActionButton({
  completed = false,
  disabled = false,
  fullWidth = true,
  icon,
  iconPosition = "end",
  accessibilityLabel,
  accessibilityState,
  onPress,
  showIcon = true,
  style,
  subtitle,
  title,
  tone = "indigo",
  variant = "card",
}: FeatureActionButtonProps) {
  const palette = toneStyles[tone];
  const isPill = variant === "pill";
  const hasSubtitle = !!subtitle && !completed;
  const resolvedIcon = icon ?? (
    <MaterialCommunityIcons
      name={completed ? "check" : "arrow-right"}
      size={22}
      color={completed ? completedState.iconColor : colors.neutral.white}
    />
  );
  const shouldShowIcon = showIcon && !!resolvedIcon;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPill && styles.pillButton,
        !isPill && !hasSubtitle && styles.compactCardButton,
        fullWidth ? styles.fullWidthButton : styles.autoWidthButton,
        {
          backgroundColor: completed ? completedState.backgroundColor : palette.backgroundColor,
          borderColor: completed ? completedState.borderColor : palette.borderColor,
        },
        style,
        disabled && styles.disabledButton,
      ]}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled, ...accessibilityState }}
      onPress={onPress}
      disabled={disabled}
    >
      {!isPill && hasSubtitle && (
        <>
          <View
            style={[
              styles.glow,
              { backgroundColor: completed ? "rgba(255,255,255,0.14)" : palette.glowColor },
            ]}
          />
          <View
            style={[
              styles.orbit,
              { borderColor: completed ? "rgba(255,255,255,0.16)" : palette.orbitColor },
            ]}
          />
        </>
      )}

      <View
        style={[
          styles.content,
          isPill && styles.pillContent,
          !isPill && !hasSubtitle && styles.compactCardContent,
          fullWidth ? styles.fullWidthContent : styles.autoWidthContent,
        ]}
      >
        {shouldShowIcon && iconPosition === "start" && (
          <View style={[styles.iconWrap, styles.leadingIconWrap, isPill && styles.pillLeadingIconWrap]}>
            {resolvedIcon}
          </View>
        )}

        <View
          style={[
            styles.textWrap,
            isPill && styles.pillTextWrap,
            !hasSubtitle && styles.textWrapNoSubtitle,
            !fullWidth && styles.autoWidthTextWrap,
            !showIcon && styles.textWrapNoIcon,
          ]}
        >
          <Text
            style={[
              styles.title,
              !isPill && styles.cardTitle,
              isPill && styles.pillTitle,
              !isPill && !hasSubtitle && styles.compactCardTitle,
              !showIcon && styles.centerText,
              { color: completed ? completedState.textColor : palette.textColor },
            ]}
          >
            {title}
          </Text>
          {hasSubtitle && (
            <Text
              style={[
                styles.subtitle,
                !isPill && styles.cardSubtitle,
                isPill && styles.pillSubtitle,
                !showIcon && styles.centerText,
                { color: palette.subtitleColor },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {shouldShowIcon && iconPosition === "end" && (
          <View style={[styles.iconWrap, isPill && styles.pillIconWrap]}>
            {resolvedIcon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 72,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: "relative",
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  fullWidthButton: {
    width: "100%",
  },
  autoWidthButton: {
    alignSelf: "flex-start",
    width: "auto",
  },
  cardSubtitle: {
    textAlign: "center",
  },
  cardTitle: {
    textAlign: "center",
  },
  compactCardButton: {
    justifyContent: "center",
    minHeight: 54,
    paddingVertical: 8,
  },
  compactCardContent: {
    minHeight: 28,
  },
  compactCardTitle: {
    includeFontPadding: false,
    lineHeight: 18,
    paddingTop: 2,
  },
  centerText: {
    textAlign: "center",
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 1,
  },
  fullWidthContent: {
    width: "100%",
  },
  autoWidthContent: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
    width: "auto",
  },
  disabledButton: {
    opacity: 0.7,
  },
  glow: {
    borderRadius: 999,
    height: 82,
    position: "absolute",
    right: -8,
    top: -22,
    width: 82,
  },
  iconWrap: {
    justifyContent: "center",
    marginRight: 4,
  },
  leadingIconWrap: {
    marginLeft: 2,
    marginRight: 10,
  },
  orbit: {
    borderRadius: 999,
    borderWidth: 1,
    height: 54,
    position: "absolute",
    right: 10,
    top: 10,
    transform: [{ rotate: "-14deg" }],
    width: 54,
  },
  pillButton: {
    borderRadius: 48,
    minHeight: 0,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  pillContent: {
    justifyContent: "center",
  },
  pillIconWrap: {
    marginLeft: 10,
    marginRight: 0,
  },
  pillLeadingIconWrap: {
    marginLeft: 0,
    marginRight: 8,
  },
  pillSubtitle: {
    marginTop: 1,
  },
  pillTextWrap: {
    justifyContent: "center",
    paddingRight: 0,
  },
  autoWidthTextWrap: {
    flex: 0,
    paddingRight: 0,
  },
  pillTitle: {
    fontSize: 15,
    lineHeight: 16,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
    paddingRight: 12,
  },
  textWrapNoSubtitle: {
    justifyContent: "center",
    minHeight: 22,
  },
  textWrapNoIcon: {
    paddingRight: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 20,
  },
});
