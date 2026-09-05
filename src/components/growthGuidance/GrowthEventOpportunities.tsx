import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { randomUUID } from "expo-crypto";
import { useLanguage } from "../../contexts/LanguageContext";
import { colors } from "../../constants/Colors";
import { captureEvent } from "../../lib/posthog";
import {
  EventArea,
  EventOpportunity,
  EventPreferences,
  EventSelection,
  growthEventService,
} from "../../services/growthEventService";
import { EMPTY_EVENT_PREFERENCES } from "../../types/growthGuidance";
import { Text } from "../StyledText";
import { GrowthButton, GrowthDisclosure, GrowthHeading, GrowthStepCard, ui, useGrowthConfirm } from "./GrowthUI";

const EMPTY: EventPreferences = {
  ...EMPTY_EVENT_PREFERENCES,
  latitude: null,
  longitude: null,
  max_cost_eur: null,
  wheelchair_required: false,
  event_types: "",
};
const REASONS = {
  too_much: "Too much right now",
  not_relevant: "Not relevant",
  too_far: "Too far",
  bad_timing: "Bad timing",
  wrong_type: "Wrong type of event",
  stale: "This event is stale or incorrect",
};

export function GrowthEventOpportunities(
  { userId, intakeId, onChanged, blocked, onBusyChange, onBackHandlerChange }: {
    userId: string;
    intakeId: string;
    onChanged: () => Promise<void>;
    blocked: boolean;
    onBusyChange?: (busy: boolean) => void;
    onBackHandlerChange?: (handler: (() => boolean) | null) => void;
  },
) {
  const { t, language } = useLanguage();
  const { confirm, confirmation } = useGrowthConfirm();
  const [preferences, setPreferences] = useState<EventPreferences>(EMPTY);
  const [savedPreferences, setSavedPreferences] = useState<EventPreferences>(EMPTY);
  const [areas, setAreas] = useState<EventArea[]>([]);
  const [selection, setSelection] = useState<EventSelection | null>(null);
  const [event, setEvent] = useState<EventOpportunity | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cost, setCost] = useState("");
  const [rejecting, setRejecting] = useState(false);
  useEffect(() => { onBusyChange?.(busy); return () => onBusyChange?.(false); }, [busy, onBusyChange]);
  const cancelEditing = useCallback(() => {
    if (!editing) return false;
    const savedCost = savedPreferences.max_cost_eur === null ? "" : String(savedPreferences.max_cost_eur);
    const discard = () => { setPreferences(savedPreferences); setCost(savedCost); setEditing(false); };
    if (JSON.stringify(preferences) !== JSON.stringify(savedPreferences) || cost !== savedCost) {
      confirm(t("Discard preference changes?"), t("Your saved preferences will stay as they are."), [
        { text: t("Keep editing"), style: "cancel" }, { text: t("Discard changes"), style: "destructive", onPress: discard },
      ]);
    } else discard();
    return true;
  }, [editing, savedPreferences, preferences, cost, confirm, t]);
  useEffect(() => {
    onBackHandlerChange?.(cancelEditing);
    return () => onBackHandlerChange?.(null);
  }, [cancelEditing, onBackHandlerChange]);
  const display = async (item: EventSelection | null) => {
    setRejecting(false);
    const detail = item?.event_id
      ? await growthEventService.event(item.id)
      : null;
    setSelection(item);
    setEvent(
      detail && item?.event_snapshot &&
        Object.keys(detail).every((key) =>
          JSON.stringify(detail[key as keyof EventOpportunity]) ===
            JSON.stringify(item.event_snapshot?.[key as keyof EventOpportunity])
        )
        ? detail
        : null,
    );
  };
  useEffect(() => {
    let active = true;
    setLoading(true);
    growthEventService.load(userId).then(async (data) => {
      const detail = data.selection?.event_id
        ? await growthEventService.event(data.selection.id)
        : null;
      if (!active) return;
      const prefs = data.preferences || EMPTY;
      setPreferences(prefs);
      setSavedPreferences(prefs);
      setCost(prefs.max_cost_eur === null ? "" : String(prefs.max_cost_eur));
      setAreas(data.areas);
      setSelection(data.selection);
      setEvent(
        detail && data.selection?.event_snapshot &&
          Object.keys(detail).every((key) =>
            JSON.stringify(detail[key as keyof EventOpportunity]) ===
              JSON.stringify(
                data.selection?.event_snapshot?.[key as keyof EventOpportunity],
              )
          )
          ? detail
          : null,
      );
    }).catch(() => {
      if (active) {
        setError(t("We couldn't load nearby opportunities. Please try again."));
      }
    })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, t]);
  const act = async (work: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch {
      setError(
        t("That opportunity may have changed. Please save your preferences or find a new match."),
      );
    } finally {
      setBusy(false);
    }
  };
  const save = () =>
    act(async () => {
      if (
        preferences.enabled &&
        (preferences.latitude === null || preferences.longitude === null ||
          !/^\d+(\.\d+)?$/.test(preferences.travel_radius) ||
          Number(preferences.travel_radius) < 1 ||
          Number(preferences.travel_radius) > 100 ||
          (cost !== "" && (!Number.isFinite(Number(cost)) || Number(cost) < 0)))
      ) {
        setError(
          t("Choose an area, a radius from 1 to 100 km, and a valid budget."),
        );
        return;
      }
      const next = {
        ...preferences,
        max_cost_eur: cost.trim() === "" ? null : Number(cost),
      };
      await growthEventService.save(userId, intakeId, next);
      setPreferences(next);
      setSavedPreferences(next);
      setSelection(null);
      setEvent(null);
      setRejecting(false);
      setEditing(false);
    });
  const choose = (reason: string | null) =>
    act(async () => {
      if (!selection) return;
      await growthEventService.choose(selection.id, reason);
      captureEvent("growth_event_choice", { reason: reason || "accepted" });
      setRejecting(false);
      setSelection(null);
      setEvent(null);
      await onChanged();
    });
  if (loading) return <ActivityIndicator />;
  return (
    <View style={styles.container}>
      {confirmation}
      <GrowthHeading eyebrow={t("OUT IN THE WORLD")} title={t(editing ? "Your preferences" : "Explore nearby")} subtitle={t(editing ? "Choose what feels practical for you." : "A place to try your step, when it helps. Everyday opportunities count too.")} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!editing && !preferences.enabled && <View style={styles.form}><Text style={ui.rowTitle}>{t("A little more possibility")}</Text><Text style={ui.body}>{t("Choose an approximate area and what works for you. You never need to share your precise location.")}</Text></View>}
      <GrowthButton
        title={t(editing ? "Back to opportunities" : preferences.enabled ? "Edit preferences" : "Set up nearby opportunities")}
        onPress={() => {
          if (editing) cancelEditing();
          else setEditing(true);
        }}
        disabled={busy}
        secondary={preferences.enabled || editing}
      />
      {editing && (
        <View style={styles.form} pointerEvents={busy ? "none" : "auto"}>
          <Text>{t("Enable nearby opportunities")}</Text>
          <Switch
            accessibilityLabel={t("Enable nearby opportunities")}
            value={preferences.enabled}
            onValueChange={(enabled) =>
              setPreferences({ ...preferences, enabled })}
          />
          <Text>
            {t(
              "Choose an approximate area. Your precise location is never requested.",
            )}
          </Text>
          {!areas.length && (
            <Text>
              {t(
                "No approved event sources are available yet. You can continue with everyday guidance.",
              )}
            </Text>
          )}
          {areas.map((area) => (
            <GrowthButton
              key={area.id}
              title={area.area}
              onPress={() =>
                setPreferences({
                  ...preferences,
                  approximate_location: area.area,
                  latitude: Number(Number(area.latitude).toFixed(2)),
                  longitude: Number(Number(area.longitude).toFixed(2)),
                })}
            />
          ))}
          {!!preferences.approximate_location && (
            <Text>{preferences.approximate_location}</Text>
          )}
          {([
            ["travel_radius", "Travel radius (km)"],
            ["availability", "Available days and times"],
            ["accessibility_needs", "Accessibility requirements"],
            ["event_types", "Event types you like or want to avoid"],
          ] as const).map(([field, label]) => (
            <View key={field}>
              <Text>{t(label)}</Text>
              <TextInput
                style={styles.input}
                value={preferences[field]}
                onChangeText={(value) =>
                  setPreferences({ ...preferences, [field]: value })}
                maxLength={500}
                accessibilityLabel={t(label)}
              />
            </View>
          ))}
          <Text>{t("Maximum cost in EUR (blank means no limit)")}</Text>
          <TextInput
            style={styles.input}
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
            accessibilityLabel={t("Maximum cost in EUR (blank means no limit)")}
          />
          <Text>{t("Wheelchair access must be confirmed")}</Text>
          <Switch
            accessibilityLabel={t("Wheelchair access must be confirmed")}
            value={preferences.wheelchair_required}
            onValueChange={(wheelchair_required) =>
              setPreferences({ ...preferences, wheelchair_required })}
          />
          <GrowthButton
            title={t("Save event preferences")}
            onPress={save}
            disabled={busy}
          />
          <GrowthButton
            title={t("Delete event preferences")}
            disabled={busy}
            onPress={() =>
              confirm(
                t("Delete event preferences?"),
                t("This removes your event location, preferences, and suggestion history."),
                [
                  { text: t("Cancel"), style: "cancel" },
                  {
                    text: t("Delete"),
                    style: "destructive",
                    onPress: () => {
                      void act(async () => {
                        await growthEventService.remove(userId);
                        setPreferences(EMPTY);
                        setSavedPreferences(EMPTY);
                        setCost("");
                        setSelection(null);
                        setEvent(null);
                        setEditing(false);
                      });
                    },
                  },
                ],
              )}
          />
        </View>
      )}
      {blocked && !editing && <Text style={ui.caption}>{t("Review your pending response before choosing an event step.")}</Text>}
      {preferences.enabled && !editing && (
        <GrowthButton
          title={t("Find a suitable opportunity")}
          disabled={busy || blocked}
          busy={busy}
          onPress={() =>
            act(async () => {
              await display(
                await growthEventService.find(randomUUID(), language),
              );
              captureEvent("growth_event_search_completed");
            })}
        />
      )}
      {preferences.enabled && !editing && selection && (
        <View style={styles.form}>
          {(!selection.event_id || event) && <Text>{selection.explanation}</Text>}
          {event && (
            <>
              <Text style={styles.heading}>{event.title}</Text>
              <Text>{event.location}</Text>
              <Text>
                {event.starts_at
                  ? new Date(event.starts_at).toLocaleString(
                    language === "it" ? "it-IT" : "en-CA",
                    { timeZone: event.timezone },
                  )
                  : event.availability} {event.starts_at ? event.timezone : ""}
              </Text>
              <Text>
                {event.cost_eur === null
                  ? t("Cost unknown")
                  : `€${event.cost_eur}`}
              </Text>
              <GrowthDisclosure title={t("Access & source details")}>
              <Text>
                {event.accessibility || t("Accessibility details unknown")}
              </Text>
              {event.wheelchair_accessible !== null && (
                <Text>
                  {t(
                    event.wheelchair_accessible
                      ? "Wheelchair access confirmed"
                      : "No wheelchair access",
                  )}
                </Text>
              )}
              <Text>
                {t("Last verified")}:{" "}
                {new Date(event.verified_at).toLocaleString()}
              </Text>
              <GrowthButton
                title={t("Confirm details at the source")}
                onPress={() =>
                  act(async () => {
                    await Linking.openURL(event.source_url);
                  })}
              />
              {event.provenance.map((source, index) => (
                <Text key={`${source.source_id}-${index}`}>
                  {source.source_id}: {source.source_url}
                </Text>
              ))}
              </GrowthDisclosure>
              {!!selection.proposed_step && (
                <GrowthStepCard step={selection.proposed_step}>
                  <GrowthButton
                    title={t("Use this as my next step")}
                    disabled={busy || blocked}
                    onPress={() =>
                      confirm(
                        t("Use this as my next step"),
                        t("This replaces your current step after confirmation. Your goal stays the same."),
                        [
                          { text: t("Cancel"), style: "cancel" },
                          {
                            text: t("Confirm change"),
                            onPress: () => {
                              void choose(null);
                            },
                          },
                        ],
                      )}
                  />
                </GrowthStepCard>
              )}
              <GrowthButton title={t(rejecting ? "Cancel" : "Not for me")} secondary onPress={() => setRejecting(!rejecting)} disabled={busy} />
              {rejecting && <Text style={ui.rowTitle}>{t("What doesn't fit?")}</Text>}
              {rejecting && Object.entries(REASONS).map(([reason, label]) => (
                <TouchableOpacity accessibilityRole="button" style={styles.reason}
                  key={reason}
                  disabled={busy}
                  onPress={() => choose(reason)}
                ><Text style={ui.link}>{t(label)}</Text></TouchableOpacity>
              ))}
            </>
          )}
          {selection.event_id && !event && (
            <Text>
              {t("This opportunity is no longer available. Find a new match.")}
            </Text>
          )}
        </View>
      )}
      {busy && <ActivityIndicator />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 20 },
  form: {
    gap: 16,
    padding: 20,
    backgroundColor: colors.neutral.white,
    borderRadius: 24,
  },
  heading: { fontSize: 18, fontWeight: "700" },
  error: { color: colors.light.alertRed },
  reason: { minHeight: 48, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: colors.light.accent2, padding: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.grey2,
    borderRadius: 8,
    padding: 10,
  },
});
