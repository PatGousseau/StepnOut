import React from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { colors } from "../../constants/Colors";

/** Small, decorative editorial illustrations. No remote assets or loading state. */
export function CoachingArtwork({ variant = "step", size = 96 }: {
  variant?: "step" | "journal" | "goal"; size?: number;
}) {
  const ink = colors.light.primary;
  const accent = colors.light.accent2;
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none">
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {variant === "step" && <>
        <Circle cx="78" cy="32" r="20" fill={colors.neutral.white} />
        <Path d="M15 99H43V79H66V58H93V99" fill="none" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <Path d="M21 103H103M32 62C36 41 46 29 61 23" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        <Path d="M50 22L62 22L59 34" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="25" cy="76" r="3" fill={ink} />
      </>}
      {variant === "journal" && <>
        <Ellipse cx="62" cy="103" rx="42" ry="5" fill={accent} />
        <Rect x="26" y="19" width="60" height="78" rx="7" fill={accent} />
        <Path d="M37 19H83Q89 19 89 25V96H37Q27 96 27 87V28Q27 19 37 19Z" fill={colors.neutral.white} stroke={ink} strokeWidth="2" />
        <Path d="M38 20V95M49 40H74M49 51H70M49 62H63M28 87Q28 82 38 82H88" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        <Path d="M76 74L95 37L101 40L82 77L75 82Z" fill={accent} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        <Path d="M97 27V18M93 22H102" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      </>}
      {variant === "goal" && <>
        <Circle cx="62" cy="57" r="42" fill={colors.neutral.white} opacity="0.7" />
        <Path d="M15 103C31 103 27 86 45 86C63 86 58 68 77 68H105" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        <Path d="M77 68V21M78 23C87 14 93 32 106 23V46C94 55 87 37 78 46" fill={accent} stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="39" cy="42" r="5" fill={colors.light.primarySoft} />
        <Path d="M27 63H35M31 59V67" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      </>}
    </Svg>
  </View>;
}
