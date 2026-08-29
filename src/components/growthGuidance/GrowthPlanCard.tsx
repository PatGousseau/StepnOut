import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { GrowthPlanProposal } from "../../types/growthGuidance";
import { Text } from "../StyledText";

export function GrowthPlanCard({ plan }: { plan: GrowthPlanProposal }) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{t("YOUR DIRECTION")}</Text>
      <Text style={styles.goal}>{plan.goal}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("What may be getting in the way")}</Text>
        <Text style={styles.body}>{plan.formulation}</Text>
        <Text style={styles.tentative}>{t("This is a starting hypothesis, not a label.")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("A possible path")}</Text>
        {plan.milestones.map((milestone, index) => (
          <View key={`${index}-${milestone.title}`} style={styles.milestone}>
            <View style={styles.milestoneNumber}>
              <Text style={styles.milestoneNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.milestoneText}>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <Text style={styles.body}>{milestone.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.focusCard}>
        <Text style={styles.focusLabel}>{t("CURRENT FOCUS")}</Text>
        <Text style={styles.focus}>{plan.current_focus}</Text>
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepLabel}>{t("YOUR FIRST EXPERIMENT")}</Text>
        <Text style={styles.stepTitle}>{plan.first_step.title}</Text>
        <Text style={styles.body}>{plan.first_step.rationale}</Text>
        <Text style={styles.detailLabel}>{t("What to do")}</Text>
        <Text style={styles.body}>{plan.first_step.action}</Text>
        <Text style={styles.detailLabel}>{t("What counts as trying it")}</Text>
        <Text style={styles.body}>{plan.first_step.completion_criterion}</Text>
        {!!plan.first_step.if_then_plan && (
          <>
            <Text style={styles.detailLabel}>{t("If-then plan")}</Text>
            <Text style={styles.body}>{plan.first_step.if_then_plan}</Text>
          </>
        )}
      </View>
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
    gap: 24,
  },
  detailLabel: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
    textTransform: "uppercase",
  },
  eyebrow: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  focus: {
    color: colors.light.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25,
  },
  focusCard: {
    backgroundColor: colors.light.accent2,
    borderRadius: 16,
    gap: 8,
    padding: 18,
  },
  focusLabel: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  goal: {
    color: colors.light.text,
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 35,
  },
  milestone: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  milestoneNumber: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  milestoneNumberText: {
    color: colors.neutral.white,
    fontSize: 13,
    fontWeight: "800",
  },
  milestoneText: {
    flex: 1,
    gap: 3,
  },
  milestoneTitle: {
    color: colors.light.text,
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    gap: 13,
  },
  sectionTitle: {
    color: colors.light.text,
    fontSize: 19,
    fontWeight: "800",
  },
  stepCard: {
    backgroundColor: colors.sideQuest.highlightSoft,
    borderColor: colors.sideQuest.bgBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  stepLabel: {
    color: colors.sideQuest.text,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  stepTitle: {
    color: colors.sideQuest.textStrong,
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 27,
  },
  tentative: {
    color: colors.light.lightText,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 19,
  },
});
