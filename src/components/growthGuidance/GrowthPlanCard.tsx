import React from "react";
import { StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { GrowthPlanProposal } from "../../types/growthGuidance";
import { Text } from "../StyledText";
import { GrowthStepCard } from "./GrowthUI";
import { CoachingArtwork } from "./CoachingArtwork";

export const MILESTONE_LABELS = {
  later: "Later", current: "Current focus", evidence: "Evidence of progress",
  established: "Completed",
};

export function GrowthPlanCard({
  plan,
  active = false,
  showStep = true,
}: {
  plan: GrowthPlanProposal;
  active?: boolean;
  showStep?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.goalHero}>
        <View style={styles.goalTop}><Text style={styles.eyebrow}>{t("Your goal")}</Text><CoachingArtwork variant="goal" size={56} /></View>
        <Text accessibilityRole="header" style={styles.goal}>{plan.goal}</Text>
        <View style={styles.goalRule} />
        <Text style={styles.body}>{plan.formulation}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("Milestones")}</Text>
        {plan.milestones.map((milestone, index) => (
          <View key={`${index}-${milestone.title}`} style={styles.milestone}>
            <View style={styles.milestoneTrack}>
              <View style={[styles.milestoneNumber, milestone.status === "established" && styles.milestoneDone, (milestone.status === "current" || (!milestone.status && index === 0)) && styles.milestoneActive]}>
                {milestone.status === "established" ? <MaterialCommunityIcons name="check" size={17} color={colors.light.primary} /> : <Text style={[styles.milestoneNumberText, (milestone.status === "current" || (!milestone.status && index === 0)) && styles.milestoneActiveText]}>{index + 1}</Text>}
              </View>
              {index < plan.milestones.length - 1 && <View style={styles.milestoneLine} />}
            </View>
            <View style={styles.milestoneText}>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              {active && (
                <Text style={styles.milestoneState}>
                  {t(MILESTONE_LABELS[milestone.status || (index === 0 ? "current" : "later")])}
                </Text>
              )}
              <Text style={styles.body}>{milestone.description}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.tentative}>{t("We can adjust this as you learn what works.")}</Text>
      </View>

      <View style={styles.focusCard}><MaterialCommunityIcons name="flag-outline" size={23} color={colors.light.primary} /><View style={styles.focusCopy}>
        <Text style={styles.focusLabel}>{t("CURRENT FOCUS")}</Text>
        <Text style={styles.focus}>{plan.current_focus}</Text>
      </View></View>

      {showStep && <GrowthStepCard step={plan.first_step} />}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 22,
  },
  container: {
    gap: 20,
  },
  eyebrow: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.1,
    flex: 1,
  },
  focus: {
    color: colors.light.text,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
  },
  focusCard: {
    backgroundColor: colors.light.accent2,
    borderRadius: 16,
    gap: 10,
    padding: 16,
    flexDirection: "row",
  },
  focusCopy: { flex: 1, gap: 8 },
  focusLabel: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  goal: {
    color: colors.light.primary,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  goalHero: { backgroundColor: colors.light.accent2, borderRadius: 20, padding: 18, gap: 12 },
  goalTop: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: -6, marginBottom: -6 },
  goalRule: { width: 40, height: 2, backgroundColor: colors.light.primary, opacity: 0.4 },
  milestone: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  milestoneNumber: {
    alignItems: "center",
    backgroundColor: colors.light.background,
    borderColor: colors.light.accent2,
    borderWidth: 1,
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  milestoneTrack: { alignItems: "center", alignSelf: "stretch", width: 30 },
  milestoneLine: { flex: 1, width: 1, backgroundColor: colors.light.accent2, marginTop: 6, marginBottom: 6, minHeight: 18 },
  milestoneActive: { backgroundColor: colors.light.primary, borderColor: colors.light.primary },
  milestoneDone: { backgroundColor: colors.light.accent2, borderColor: colors.light.accent2 },
  milestoneActiveText: { color: colors.neutral.white },
  milestoneNumberText: {
    color: colors.neutral.grey3,
    fontSize: 13,
    fontWeight: "800",
  },
  milestoneText: {
    flex: 1,
    gap: 4,
    paddingTop: 3,
    paddingBottom: 18,
  },
  milestoneTitle: {
    color: colors.light.text,
    fontSize: 16,
    fontWeight: "700",
  },
  milestoneState: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    gap: 0,
  },
  sectionTitle: {
    color: colors.light.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  tentative: {
    color: colors.neutral.grey3,
    fontSize: 13,
    lineHeight: 19,
  },
});
