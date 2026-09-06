import React, { useEffect, useState } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { colors } from "../../constants/Colors";
import { EventArea, EventOpportunity, EventSelection, growthEventService } from "../../services/growthEventService";
import { Text } from "../StyledText";
import { GrowthButton, ui } from "./GrowthUI";

/** A contextual aid, not a finder. Quiet failures never block the ordinary step. */
export function StepEventSuggestion({ stepId, userId, eventId, onChanged }: {
  stepId: string; userId: string; eventId?: string | null; onChanged: () => Promise<void>;
}) {
  const { language, t } = useLanguage();
  const [selection, setSelection] = useState<EventSelection | null>(null);
  const [event, setEvent] = useState<EventOpportunity | null>(null);
  const [areas, setAreas] = useState<EventArea[]>([]);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dismissedCity, setDismissedCity] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    let poll: ReturnType<typeof setTimeout> | undefined;
    let release: (() => void) | undefined;
    setSelection(null); setEvent(null); setError(""); setLoaded(false);
    void (async () => {
      try {
        if (eventId) {
          const detail = await growthEventService.details(eventId);
          if (active) setEvent(detail);
          return;
        }
        let result = await growthEventService.automatic(stepId, language);
        for (let attempt = 0; active && result.status === "started" && attempt < 24; attempt++) {
          await new Promise<void>((resolve) => { release = resolve; poll = setTimeout(resolve, 5000); });
          if (!active) return;
          result = await growthEventService.automatic(stepId, language);
        }
        const detail = result.status === "proposed" ? await growthEventService.event(result.id) : null;
        const cities = result.model_name === "needs-city" ? (await growthEventService.load(userId)).areas : [];
        if (!active) return;
        setSelection(result); setEvent(detail);
        setAreas(cities.filter((city, index) => cities.findIndex((item) => item.area === city.area) === index));
      } catch { /* No match or temporary failure: leave the step unchanged. */ }
      finally { if (active) setLoaded(true); }
    })();
    return () => { active = false; clearTimeout(poll); release?.(); };
  }, [stepId, userId, eventId, language, revision]);

  const choose = async (reason: string | null) => {
    if (!selection || busy) return;
    setBusy(true); setError("");
    try {
      await growthEventService.choose(selection.id, reason);
      setEvent(null); setSelection(null);
      await onChanged();
    } catch { setError(t("This suggestion may have changed. Please try again.")); }
    finally { setBusy(false); }
  };
  if (selection?.model_name === "needs-city" && areas.length && !dismissedCity) return (
    <View style={styles.card}>
      <Text style={ui.rowTitle}>{t("Where will you try this?")}</Text>
      <Text style={ui.caption}>{t("Your city helps us suggest a local event for this step.")}</Text>
      {areas.map((area) => <GrowthButton key={area.id} title={area.area} secondary disabled={busy} onPress={async () => {
        setBusy(true); setError("");
        try { await growthEventService.setCity(area.id); setRevision((value) => value + 1); }
        catch { setError(t("We couldn't save your city. Please try again.")); }
        finally { setBusy(false); }
      }} />)}
      <GrowthButton title={t("Continue without an event")} secondary disabled={busy} onPress={() => setDismissedCity(true)} />
      {!!error && <Text style={ui.caption}>{error}</Text>}
    </View>
  );
  if (eventId && loaded && (!event || event.status !== "active" ||
    Date.now() - Date.parse(event.verified_at) > (event.kind === "place" ? 7 : 2) * 86400000 ||
    (!!event.starts_at && Date.parse(event.starts_at) <= Date.now()))) {
    return <Text style={ui.caption}>{t("This event is no longer confirmed. Check with the organiser before going.")}</Text>;
  }
  if (!event || (!eventId && !selection?.proposed_step)) return null;
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>{t(eventId ? "Event details" : "A place to try this")}</Text>
    <Text style={ui.rowTitle}>{event.title}</Text>
    <Text style={ui.caption}>{event.location}{event.starts_at ? " · " + new Date(event.starts_at).toLocaleString(language === "it" ? "it-IT" : "en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: event.timezone }) : ""}</Text>
    {!!event.availability && <Text style={ui.caption}>{event.availability}</Text>}
    {!eventId && !!selection?.proposed_step && <>
      <Text style={ui.body}>{selection.proposed_step.action}</Text>
      <Text style={ui.caption}>{selection.proposed_step.completion_criterion}</Text>
    </>}
    <Text style={ui.caption}>{event.cost_eur === null ? t("Cost not confirmed") : event.cost_eur === 0 ? t("Free") : "€" + event.cost_eur}</Text>
    <TouchableOpacity accessibilityRole="link" onPress={() => { void Linking.openURL(event.source_url).catch(() => setError(t("We couldn't open the event link."))); }}><Text style={ui.link}>{t("View event details")}</Text></TouchableOpacity>
    <Text style={ui.caption}>{t("Last verified")}{": "}{new Date(event.verified_at).toLocaleDateString(language === "it" ? "it-IT" : "en-CA")}</Text>
    {!eventId && <>
      <GrowthButton title={t("Use this for my step")} disabled={busy} onPress={() => choose(null)} />
      <GrowthButton title={t("Not for me")} secondary disabled={busy} onPress={() => choose("not_relevant")} />
    </>}
    {!!error && <Text style={ui.caption}>{error}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: 20, gap: 14, backgroundColor: colors.light.accent3, borderRadius: 20 },
  eyebrow: { color: colors.light.primary, fontSize: 13, fontWeight: "700" },
});
