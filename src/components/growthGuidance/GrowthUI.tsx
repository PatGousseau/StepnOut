import React, { ReactNode, useCallback, useState } from "react";
import { ActivityIndicator, AlertButton, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { GrowthFirstStep } from "../../types/growthGuidance";
import { Text } from "../StyledText";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// A native Modal also works on web, where React Native's Alert is a no-op.
export function useGrowthConfirm() {
  const [dialog, setDialog] = useState<{ title: string; message: string; buttons: AlertButton[] } | null>(null);
  const confirm = useCallback((title: string, message: string, buttons: AlertButton[]) => setDialog({ title, message, buttons }), []);
  const confirmation = <Modal visible={!!dialog} transparent animationType="none" onRequestClose={() => setDialog(null)}>
    <View style={ui.modalBackdrop}><ScrollView accessibilityViewIsModal style={ui.modalCard} contentContainerStyle={ui.modalContent}>
      <Text accessibilityRole="header" style={ui.rowTitle}>{dialog?.title}</Text>
      <Text style={ui.body}>{dialog?.message}</Text>
      {dialog?.buttons.map((button, index) => <GrowthButton key={index} title={button.text || ""} secondary={button.style === "cancel"} onPress={() => { setDialog(null); button.onPress?.(); }} />)}
    </ScrollView></View>
  </Modal>;
  return { confirm, confirmation };
}

export function GrowthButton({ title, onPress, disabled, busy, secondary = false, icon }: {
  title: string; onPress: () => void; disabled?: boolean; busy?: boolean; secondary?: boolean; icon?: IconName;
}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }}
    disabled={disabled || busy} onPress={onPress}
    activeOpacity={0.75} style={[ui.button, secondary && ui.secondaryButton, (disabled || busy) && ui.disabled]}>
    {busy && <ActivityIndicator color={secondary ? colors.light.primary : colors.neutral.white} />}
    {!!icon && !busy && <MaterialCommunityIcons name={icon} size={18} color={secondary ? colors.light.primary : colors.neutral.white} />}
    <Text style={[ui.buttonLabel, secondary && ui.secondaryLabel]}>{title}</Text>
  </TouchableOpacity>;
}

export function GrowthRow({ title, subtitle, icon, onPress, disabled = false }: {
  title: string; subtitle?: string; icon: IconName; onPress: () => void; disabled?: boolean;
}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={[ui.row, disabled && ui.disabled]}>
    <View style={ui.rowIcon}><MaterialCommunityIcons name={icon} size={21} color={colors.light.primary} /></View>
    <View style={ui.rowCopy}><Text style={ui.rowTitle}>{title}</Text>{!!subtitle && <Text style={ui.caption}>{subtitle}</Text>}</View>
    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.light.primary} />
  </TouchableOpacity>;
}

export function GrowthHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return <View style={ui.heading}>{!!eyebrow && <Text style={ui.eyebrow}>{eyebrow}</Text>}
    <Text accessibilityRole="header" style={ui.title}>{title}</Text>{!!subtitle && <Text style={ui.body}>{subtitle}</Text>}
  </View>;
}

export function GrowthDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <View style={ui.disclosure}>
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={ui.disclosureToggle}>
      <Text style={ui.link}>{title}</Text><MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.light.primary} />
    </TouchableOpacity>
    {open && <View style={ui.disclosureContent}>{children}</View>}
  </View>;
}

export function GrowthStepCard({ step, accepted, children }: { step: GrowthFirstStep; accepted?: boolean; children?: ReactNode }) {
  const { t } = useLanguage();
  return <View style={ui.stepCard}>
    <View style={ui.stepTop}><View style={ui.stepIcon}><MaterialCommunityIcons name={accepted ? "check" : "foot-print"} size={24} color={colors.light.primary} /></View>
      <Text style={ui.stepEyebrow}>{t(accepted ? "YOUR CHOSEN STEP" : "ONE SMALL STEP")}</Text></View>
    <Text accessibilityRole="header" style={ui.stepTitle}>{step.title}</Text>
    <Text style={ui.body}>{step.action}</Text>
    <View style={ui.criterion}><MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.light.primary} />
      <View style={ui.rowCopy}><Text style={ui.criterionLabel}>{t("What counts as trying it")}</Text><Text style={ui.body}>{step.completion_criterion}</Text></View>
    </View>
    {children}
    <GrowthDisclosure title={t("Why this step & a helpful cue")}>
      <Text style={ui.body}>{step.rationale}</Text>
      {!!step.if_then_plan && <Text style={ui.body}>{step.if_then_plan}</Text>}
    </GrowthDisclosure>
  </View>;
}

export const ui = StyleSheet.create({
  body: { color: colors.light.text, fontSize: 15, lineHeight: 22 },
  button: { minHeight: 44, borderRadius: 12, backgroundColor: colors.light.primary, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  buttonLabel: { color: colors.neutral.white, fontSize: 14, fontWeight: "700", textAlign: "center", flexShrink: 1 },
  caption: { color: colors.neutral.grey3, fontSize: 14, lineHeight: 20 },
  criterion: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.light.accent2 },
  criterionLabel: { color: colors.light.primary, fontSize: 13, fontWeight: "700", marginBottom: 4 },
  disabled: { opacity: 0.5 },
  disclosure: { gap: 4 },
  disclosureContent: { gap: 10, paddingBottom: 10 },
  disclosureToggle: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  eyebrow: { color: colors.light.primary, fontSize: 12, letterSpacing: 1.5, fontWeight: "800" },
  heading: { gap: 8 },
  link: { color: colors.light.primary, fontSize: 14, fontWeight: "700", flexShrink: 1 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(25, 27, 46, 0.45)", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 440, maxHeight: "90%", flexGrow: 0, alignSelf: "center", backgroundColor: colors.light.background, borderRadius: 24 },
  modalContent: { padding: 24, gap: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, minHeight: 48 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.light.accent2 },
  rowCopy: { flex: 1, gap: 3 },
  rowTitle: { color: colors.light.text, fontSize: 16, fontWeight: "700", lineHeight: 22 },
  secondaryButton: { backgroundColor: colors.light.accent3, borderColor: colors.light.accent2, borderWidth: 1 },
  secondaryLabel: { color: colors.light.primary },
  stepCard: { backgroundColor: colors.neutral.white, borderColor: colors.light.accent2, borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  stepEyebrow: { color: colors.light.primary, fontSize: 11, letterSpacing: 1.2, fontWeight: "800", flex: 1 },
  stepIcon: { height: 34, width: 34, borderRadius: 11, backgroundColor: colors.light.accent2, alignItems: "center", justifyContent: "center" },
  stepTitle: { color: colors.light.primary, fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.5 },
  stepTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { color: colors.light.primary, fontSize: 26, lineHeight: 33, fontWeight: "700", letterSpacing: -0.6 },
});
