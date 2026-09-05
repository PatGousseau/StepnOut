import { supabase } from "../lib/supabase";
import {
  GrowthEventPreferences,
  GrowthFirstStep,
} from "../types/growthGuidance";

export type EventPreferences = GrowthEventPreferences & {
  latitude: number | null;
  longitude: number | null;
  max_cost_eur: number | null;
  wheelchair_required: boolean;
  event_types: string;
};
export type EventArea = {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
};
export type EventOpportunity = {
  id: string;
  title: string;
  description: string;
  source_url: string;
  location: string;
  starts_at: string | null;
  timezone: string;
  availability: string | null;
  cost_eur: number | null;
  accessibility: string | null;
  wheelchair_accessible: boolean | null;
  verified_at: string;
  provenance: Array<{ source_id: string; source_url: string }>;
};
export type EventSelection = {
  id: string;
  event_id: string | null;
  status: string;
  explanation: string | null;
  proposed_step: GrowthFirstStep | null;
  event_snapshot: EventOpportunity | null;
};

export const growthEventService = {
  async load(userId: string) {
    const [prefs, areas, selection] = await Promise.all([
      supabase.from("growth_event_preferences").select("*").eq(
        "user_id",
        userId,
      ).maybeSingle(),
      supabase.from("growth_event_sources").select(
        "id,name,area,latitude,longitude",
      ).order("area"),
      supabase.from("growth_event_selections").select(
        "id,event_id,status,explanation,proposed_step,event_snapshot",
      ).eq("user_id", userId).in("status", ["proposed", "no_match"]).order(
        "created_at",
        { ascending: false },
      ).limit(1).maybeSingle(),
    ]);
    for (const result of [prefs, areas, selection]) {
      if (result.error) throw result.error;
    }
    return {
      preferences: prefs.data as EventPreferences | null,
      areas: (areas.data || []) as EventArea[],
      selection: selection.data as EventSelection | null,
    };
  },
  async save(userId: string, intakeId: string, preferences: EventPreferences) {
    const { error } = await supabase.from("growth_event_preferences").upsert({
      user_id: userId,
      intake_id: intakeId,
      ...preferences,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw error;
  },
  async remove(userId: string) {
    const { error } = await supabase.from("growth_event_preferences").delete()
      .eq("user_id", userId);
    if (error) throw error;
  },
  async find(selectionId: string, locale: string): Promise<EventSelection> {
    const { data, error } = await supabase.functions.invoke(
      "find-growth-event",
      { body: { selection_id: selectionId, locale } },
    );
    if (error || data?.error) throw error || new Error(data.error);
    return data.selection as EventSelection;
  },
  async event(id: string): Promise<EventOpportunity | null> {
    const { data, error } = await supabase.rpc("growth_event_detail", {
      p_selection_id: id,
    }).maybeSingle();
    if (error) throw error;
    return data as EventOpportunity | null;
  },
  async choose(id: string, reason: string | null) {
    const { error } = await supabase.rpc("choose_growth_event", {
      p_selection_id: id,
      p_reason: reason,
    });
    if (error) throw error;
  },
};
