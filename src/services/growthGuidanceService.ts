import { supabase } from "../lib/supabase";
import {
  GrowthEventPreferences,
  GrowthGenerationResult,
  GrowthIntake,
  GrowthIntakeAnswers,
  GrowthPlanProposal,
} from "../types/growthGuidance";

const INTAKE_FIELDS = "id, user_id, answers, status, created_at, updated_at, completed_at";
const PLAN_FIELDS =
  "id, intake_id, user_id, version, status, goal, formulation, milestones, current_focus, first_step, created_at, confirmed_at";

export const growthGuidanceService = {
  async createIntake(userId: string, answers: GrowthIntakeAnswers): Promise<GrowthIntake> {
    const { data, error } = await supabase
      .from("growth_intakes")
      .insert({ user_id: userId, answers })
      .select(INTAKE_FIELDS)
      .single();

    if (error) throw error;
    return data as GrowthIntake;
  },

  async saveIntake(intakeId: string, answers: GrowthIntakeAnswers): Promise<void> {
    const { error } = await supabase
      .from("growth_intakes")
      .update({ answers, updated_at: new Date().toISOString() })
      .eq("id", intakeId)
      .eq("status", "in_progress");

    if (error) throw error;
  },

  async fetchLatestInProgressIntake(userId: string): Promise<GrowthIntake | null> {
    const { data, error } = await supabase
      .from("growth_intakes")
      .select(INTAKE_FIELDS)
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as GrowthIntake | null) || null;
  },

  async abandonIntake(intakeId: string): Promise<void> {
    const { error } = await supabase
      .from("growth_intakes")
      .update({ status: "abandoned", updated_at: new Date().toISOString() })
      .eq("id", intakeId)
      .eq("status", "in_progress");

    if (error) throw error;
  },

  async saveEventPreferences(
    userId: string,
    intakeId: string,
    preferences: GrowthEventPreferences
  ): Promise<void> {
    const { error } = await supabase.from("growth_event_preferences").upsert(
      {
        user_id: userId,
        intake_id: intakeId,
        ...preferences,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
  },

  async fetchEventPreferencesForIntake(
    userId: string,
    intakeId: string
  ): Promise<GrowthEventPreferences | null> {
    const { data, error } = await supabase
      .from("growth_event_preferences")
      .select(
        "enabled, approximate_location, travel_radius, availability, cost_preference, accessibility_needs"
      )
      .eq("user_id", userId)
      .eq("intake_id", intakeId)
      .maybeSingle();

    if (error) throw error;
    return (data as GrowthEventPreferences | null) || null;
  },

  async generateProposal(params: {
    intakeId: string;
    locale: string;
    correction?: string;
    planId?: string;
  }): Promise<GrowthGenerationResult> {
    const { data, error } = await supabase.functions.invoke("generate-growth-plan", {
      body: {
        intake_id: params.intakeId,
        locale: params.locale,
        correction: params.correction?.trim() || null,
        plan_id: params.planId || null,
      },
    });

    if (error) throw error;
    if (!data || (data as { error?: string }).error) {
      throw new Error((data as { error?: string })?.error || "growth_plan_generation_failed");
    }
    return data as GrowthGenerationResult;
  },

  async confirmPlan(planId: string): Promise<GrowthPlanProposal> {
    const { data, error } = await supabase.rpc("confirm_growth_plan", {
      p_plan_id: planId,
    });

    if (error) throw error;
    return data as GrowthPlanProposal;
  },

  async fetchCurrentPlan(userId: string): Promise<GrowthPlanProposal | null> {
    const { data, error } = await supabase
      .from("growth_plans")
      .select(PLAN_FIELDS)
      .eq("user_id", userId)
      .in("status", ["active", "proposed"])
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as GrowthPlanProposal | null) || null;
  },
};
