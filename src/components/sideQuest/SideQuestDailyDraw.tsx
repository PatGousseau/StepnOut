import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { SideQuest } from "../../types/sideQuests";
import { QuestHatIdle, QuestPullAnimation } from "../QuestPullAnimation";
import { Text } from "../StyledText";

type SideQuestDailyDrawProps = {
  isDrawingQuest: boolean;
  isRevealing: boolean;
  localDayLabel: string;
  onDrawQuest: () => void;
  onRevealAbort: () => void;
  onRevealComplete: () => void;
  revealedQuest: SideQuest | null;
  showDraw: boolean;
  showHeroSection: boolean;
};

export function SideQuestDailyDraw({
  isDrawingQuest,
  isRevealing,
  localDayLabel,
  onDrawQuest,
  onRevealAbort,
  onRevealComplete,
  revealedQuest,
  showDraw,
  showHeroSection,
}: SideQuestDailyDrawProps) {
  const { t } = useLanguage();

  if (!showHeroSection) return null;

  return (
    <View style={styles.heroSection}>
      <View style={styles.heroGlow} />
      <View style={styles.heroLineOne} />
      <View style={styles.heroLineTwo} />
      <View style={styles.heroLineThree} />
      <View style={styles.heroContent}>
        <View style={styles.eyebrowWrap}>
          <Text style={styles.eyebrow}>{t("Side Quests")}</Text>
          <Text style={styles.eyebrowSub}>{localDayLabel}</Text>
        </View>

        {(showDraw || isRevealing) && (
          <View style={styles.heroStage}>
            <View style={styles.heroVisualSlot}>
              <View style={[styles.heroVisualBase, isRevealing && styles.heroVisualBaseHidden]}>
                <QuestHatIdle />
              </View>
            </View>

            <Text style={[styles.heroBody, isRevealing && styles.heroBodyHidden]}>
              {t("Today's side quest is ready to be pulled. Pick from the hat and see where it leads!")}
            </Text>

            {isRevealing && (
              <View style={styles.heroAnimationOverlay}>
                <QuestPullAnimation
                  quest={revealedQuest}
                  onAbort={onRevealAbort}
                  onComplete={onRevealComplete}
                />
              </View>
            )}
          </View>
        )}

        {(showDraw || isRevealing) && (
          <View style={styles.ctaWrap}>
            <TouchableOpacity
              style={[styles.drawButton, (isDrawingQuest || isRevealing) && styles.disabledButton]}
              disabled={isDrawingQuest || isRevealing}
              onPress={onDrawQuest}
            >
              <Text style={styles.drawButtonText}>{t("Pick a quest")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaWrap: {
    alignSelf: "center",
    marginTop: 4,
    width: "80%",
  },
  disabledButton: {
    opacity: 0.5,
  },
  drawButton: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  drawButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: "700",
  },
  eyebrow: {
    color: colors.sideQuest.text,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  eyebrowSub: {
    color: colors.light.lightText,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  eyebrowWrap: {
    alignSelf: "center",
    marginBottom: 24,
    width: "80%",
  },
  heroAnimationOverlay: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "flex-start",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroBody: {
    alignSelf: "center",
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
    width: "84%",
  },
  heroBodyHidden: {
    opacity: 0,
  },
  heroContent: {
    minHeight: 410,
    position: "relative",
    zIndex: 1,
  },
  heroGlow: {
    backgroundColor: colors.sideQuest.tint,
    borderRadius: 999,
    height: 152,
    left: -40,
    position: "absolute",
    top: -52,
    width: 152,
  },
  heroLineOne: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 108,
    left: -10,
    position: "absolute",
    top: 20,
    transform: [{ rotate: "16deg" }],
    width: 108,
  },
  heroLineThree: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 74,
    left: 74,
    position: "absolute",
    top: 56,
    transform: [{ rotate: "-10deg" }],
    width: 74,
  },
  heroLineTwo: {
    backgroundColor: colors.sideQuest.fill,
    borderRadius: 999,
    height: 16,
    left: 92,
    position: "absolute",
    top: 10,
    transform: [{ rotate: "-18deg" }],
    width: 64,
  },
  heroSection: {
    backgroundColor: colors.sideQuest.bg,
    borderColor: colors.sideQuest.bgBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    overflow: "hidden",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 28,
    position: "relative",
  },
  heroStage: {
    position: "relative",
  },
  heroVisualBase: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  heroVisualBaseHidden: {
    opacity: 0,
  },
  heroVisualSlot: {
    alignItems: "center",
    height: 240,
    justifyContent: "flex-end",
    marginBottom: 4,
    position: "relative",
  },
});
