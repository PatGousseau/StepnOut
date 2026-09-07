import React, { ReactNode, useCallback, useState } from "react";
import { ActivityIndicator, AlertButton, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { GrowthFirstStep } from "../../types/growthGuidance";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Native reading type, restrained surfaces, and platform-sized touch targets.
export const coaching = {
  touch: Platform.OS === "android" ? 48 : 44,
  border: "#D6D5DC",
  muted: "#62636E",
  ink: "#292B39",
  surface: colors.neutral.white,
};

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

export function GrowthButton({ title, onPress, disabled, busy, secondary = false, quiet = false, icon }: {
  title: string; onPress: () => void; disabled?: boolean; busy?: boolean; secondary?: boolean; quiet?: boolean; icon?: IconName;
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const foreground = secondary || quiet ? colors.light.primary : colors.neutral.white;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }}
    disabled={disabled || busy} onPress={onPress}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
    style={({ pressed }) => [ui.button, secondary && ui.secondaryButton, quiet && ui.quietButton, hovered && (secondary || quiet ? ui.hoveredQuiet : ui.hovered), focused && ui.focused, pressed && ui.pressed, (disabled || busy) && ui.disabled]}>
    {busy && <ActivityIndicator color={foreground} />}
    {!!icon && !busy && <MaterialCommunityIcons name={icon} size={18} color={foreground} />}
    <Text style={[ui.buttonLabel, (secondary || quiet) && ui.secondaryLabel]}>{title}</Text>
  </Pressable>;
}

export function GrowthRow({ title, subtitle, icon, onPress, disabled = false }: {
  title: string; subtitle?: string; icon: IconName; onPress: () => void; disabled?: boolean;
}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={[ui.row, disabled && ui.disabled]}>
    <MaterialCommunityIcons name={icon} size={21} color={colors.light.primary} />
    <View style={ui.rowCopy}><Text style={ui.rowTitle}>{title}</Text>{!!subtitle && <Text style={ui.caption}>{subtitle}</Text>}</View>
    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.light.primary} />
  </TouchableOpacity>;
}

export function GrowthHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return <View style={ui.heading}>
    <Text accessibilityRole="header" style={ui.title}>{title}</Text>{!!eyebrow && <Text style={ui.caption}>{eyebrow}</Text>}{!!subtitle && <Text style={ui.body}>{subtitle}</Text>}
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
    <Text accessibilityRole="header" style={ui.stepTitle}>{step.title}</Text>
    {!!accepted && <View style={ui.stepTop}><MaterialCommunityIcons name="check" size={18} color={colors.light.primary} /><Text style={ui.caption}>{t("YOUR CHOSEN STEP")}</Text></View>}
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
  body: { color: coaching.ink, fontSize: 17, lineHeight: 25 },
  button: { minHeight: coaching.touch, borderRadius: 10, backgroundColor: colors.light.primary, borderWidth: 2, borderColor: "transparent", paddingVertical: 8, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  buttonLabel: { color: colors.neutral.white, fontSize: 15, fontWeight: "600", textAlign: "center", flexShrink: 1 },
  caption: { color: coaching.muted, fontSize: 15, lineHeight: 22 },
  criterion: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.light.accent2 },
  criterionLabel: { color: colors.light.primary, fontSize: 13, fontWeight: "700", marginBottom: 4 },
  disabled: { opacity: 0.5 },
  disclosure: { gap: 4 },
  disclosureContent: { gap: 10, paddingBottom: 10 },
  disclosureToggle: { minHeight: coaching.touch, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  heading: { gap: 8 },
  link: { color: colors.light.primary, fontSize: 15, fontWeight: "600", flexShrink: 1 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(25, 27, 46, 0.45)", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 440, maxHeight: "90%", flexGrow: 0, alignSelf: "center", backgroundColor: colors.light.background, borderRadius: 24 },
  modalContent: { padding: 24, gap: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, minHeight: coaching.touch },
  rowCopy: { flex: 1, gap: 3 },
  rowTitle: { color: coaching.ink, fontSize: 17, fontWeight: "600", lineHeight: 23 },
  secondaryButton: { backgroundColor: coaching.surface, borderColor: coaching.border, borderWidth: 1 },
  secondaryLabel: { color: colors.light.primary },
  quietButton: { backgroundColor: "transparent" },
  focused: { outlineColor: colors.light.primary, outlineWidth: 2, outlineOffset: 3, outlineStyle: "solid" },
  hovered: { backgroundColor: colors.light.primarySoft },
  hoveredQuiet: { backgroundColor: colors.light.accent2 },
  pressed: { opacity: 0.7 },
  stepCard: { borderTopColor: coaching.border, borderTopWidth: 1, paddingVertical: 16, gap: 12 },
  stepTitle: { color: colors.light.primary, fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.5 },
  stepTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { color: coaching.ink, fontSize: 26, lineHeight: 32, fontWeight: "700", letterSpacing: -0.5 },
});
