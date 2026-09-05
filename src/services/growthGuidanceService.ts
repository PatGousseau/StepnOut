import { supabase } from "../lib/supabase";
import {
  GrowthAdaptiveResponse,
  GrowthAttemptFollowUp,
  GrowthAttemptOutcome,
  GrowthEventPreferences,
  GrowthGenerationResult,
  GrowthIntake,
  GrowthIntakeAnswers,
  GrowthInteraction,
  GrowthPlanExperience,
  GrowthPlanProposal,
  GrowthRequestKind,
  GrowthStep,
  GrowthVoiceJournal,
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

  async fetchPlanExperience(userId: string): Promise<GrowthPlanExperience | null> {
    const plan = await this.fetchCurrentPlan(userId);
    if (!plan || plan.status !== "active") return plan ? {
      plan,
      activeStep: null,
      interactions: [],
      latestResponse: null,
      pendingInteractionId: null,
    } : null;

    const [{ data: activeStep, error: stepError }, { data: interactions, error: interactionError }] =
      await Promise.all([
        supabase
          .from("growth_steps")
          .select("id, plan_id, user_id, sequence, status, title, rationale, action, completion_criterion, if_then_plan, created_at, ended_at, accepted_at")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("sequence", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("growth_interactions")
          .select("id, plan_id, step_id, user_id, kind, report_outcome, follow_up, journal_text, voice_journal_id, request_kind, step_snapshot, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
    if (stepError) throw stepError;
    if (interactionError) throw interactionError;

    const interactionList = (interactions || []) as GrowthInteraction[];
    let latestResponse: GrowthAdaptiveResponse | null = null;
    const latestInteractionId = interactionList[0]?.id;
    if (latestInteractionId) {
      const { data, error } = await supabase
        .from("growth_adaptive_responses")
        .select("id, plan_id, interaction_id, user_id, response_type, message, clarification_question, next_step, proposed_plan_update, proposed_step_completion, confirmation_status, created_at")
        .eq("user_id", userId)
        .eq("interaction_id", latestInteractionId)
        .maybeSingle();
      if (error) throw error;
      latestResponse = (data as GrowthAdaptiveResponse | null) || null;
    }

    return {
      plan,
      activeStep: (activeStep as GrowthStep | null) || null,
      interactions: interactionList,
      latestResponse,
      pendingInteractionId: latestInteractionId && !latestResponse ? latestInteractionId : null,
    };
  },

  async fetchJournalHistory(
    userId: string,
    offset = 0,
    limit = 20
  ): Promise<GrowthInteraction[]> {
    const { data, error } = await supabase
      .from("growth_interactions")
      .select("id, plan_id, step_id, user_id, kind, report_outcome, follow_up, journal_text, voice_journal_id, request_kind, step_snapshot, created_at")
      .eq("user_id", userId)
      .eq("kind", "journal")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data || []) as GrowthInteraction[];
  },

  async submitInteraction(params: {
    interactionId: string;
    planId: string;
    stepId?: string;
    kind: "report" | "journal";
    outcome?: GrowthAttemptOutcome;
    followUp?: GrowthAttemptFollowUp;
    journalText?: string;
    locale: string;
    requestKind?: GrowthRequestKind;
  }): Promise<{ interaction: GrowthInteraction; response: GrowthAdaptiveResponse | null }> {
    const { data: interaction, error: submitError } = await supabase.rpc(
      params.requestKind ? "request_growth_guidance" : "submit_growth_interaction",
      params.requestKind ? {
        p_interaction_id: params.interactionId,
        p_plan_id: params.planId,
        p_step_id: params.stepId || null,
        p_request_kind: params.requestKind,
        p_context: params.journalText?.trim() || null,
      } : {
        p_interaction_id: params.interactionId,
        p_plan_id: params.planId,
        p_step_id: params.stepId || null,
        p_kind: params.kind,
        p_report_outcome: params.outcome || null,
        p_follow_up: params.followUp || null,
        p_journal_text: params.journalText?.trim() || null,
      }
    );
    if (submitError) throw submitError;

    try {
      const response = await this.adaptInteraction(
        (interaction as GrowthInteraction).id,
        params.locale
      );
      return { interaction: interaction as GrowthInteraction, response };
    } catch {
      return { interaction: interaction as GrowthInteraction, response: null };
    }
  },

  async adaptInteraction(
    interactionId: string,
    locale: string
  ): Promise<GrowthAdaptiveResponse> {
    const { data, error } = await supabase.functions.invoke("adapt-growth-plan", {
      body: { interaction_id: interactionId, locale },
    });
    if (error) throw error;
    if (!data || (data as { error?: string }).error) {
      throw new Error((data as { error?: string })?.error || "growth_adaptation_failed");
    }
    return data.response as GrowthAdaptiveResponse;
  },

  async setStepChoice(stepId: string, choice: "accept" | "dismiss"): Promise<void> {
    const { error } = await supabase.rpc("set_growth_step_choice", {
      p_step_id: stepId, p_choice: choice,
    });
    if (error) throw error;
  },

  async confirmAdaptiveResponse(
    responseId: string,
    accepted: boolean
  ): Promise<GrowthAdaptiveResponse> {
    const { data, error } = await supabase.rpc("confirm_growth_adaptive_response", {
      p_response_id: responseId,
      p_accepted: accepted,
    });
    if (error) throw error;
    return data as GrowthAdaptiveResponse;
  },

  async beginVoiceJournal(params: {
    voiceJournalId: string;
    planId: string;
    stepId?: string;
    durationMs: number;
  }): Promise<GrowthVoiceJournal> {
    const { data, error } = await supabase.rpc("begin_growth_voice_journal", {
      p_voice_journal_id: params.voiceJournalId,
      p_plan_id: params.planId,
      p_step_id: params.stepId || null,
      p_mime_type: "audio/m4a",
      p_duration_ms: Math.round(params.durationMs),
    });
    if (error) throw error;
    return data as GrowthVoiceJournal;
  },

  async fetchVoiceJournalDraft(): Promise<GrowthVoiceJournal | null> {
    const { data, error } = await supabase
      .from("growth_voice_journals")
      .select(
        "id, plan_id, step_id, status, object_path, mime_type, duration_ms, machine_transcript, reviewed_transcript, transcript_edited, created_at, updated_at, submitted_at"
      )
      .neq("status", "submitted")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as GrowthVoiceJournal | null) || null;
  },

  async uploadVoiceJournalAudio(
    voiceJournal: GrowthVoiceJournal,
    localUri: string
  ): Promise<void> {
    const audioResponse = await fetch(localUri);
    const audio = await audioResponse.arrayBuffer();
    const { error } = await supabase.storage
      .from("growth-journal-audio")
      .upload(voiceJournal.object_path, audio, {
        contentType: voiceJournal.mime_type,
        upsert: true,
      });
    if (error) throw error;
  },

  async transcribeVoiceJournal(
    voiceJournalId: string,
    locale: string
  ): Promise<{ voiceJournal: GrowthVoiceJournal; transcript: string }> {
    const { data, error } = await supabase.functions.invoke(
      "transcribe-growth-journal",
      { body: { voice_journal_id: voiceJournalId, locale } }
    );
    if (error) throw error;
    if (!data || (data as { error?: string }).error) {
      throw new Error((data as { error?: string })?.error || "voice_transcription_failed");
    }
    return {
      voiceJournal: data.voice_journal as GrowthVoiceJournal,
      transcript: data.transcript as string,
    };
  },

  async submitVoiceJournal(params: {
    voiceJournalId: string;
    interactionId: string;
    reviewedTranscript: string;
    locale: string;
  }): Promise<{ interaction: GrowthInteraction; response: GrowthAdaptiveResponse | null }> {
    const { data: interaction, error: submitError } = await supabase.rpc(
      "submit_growth_voice_journal",
      {
        p_voice_journal_id: params.voiceJournalId,
        p_interaction_id: params.interactionId,
        p_reviewed_transcript: params.reviewedTranscript.trim(),
      }
    );
    if (submitError) throw submitError;
    try {
      const response = await this.adaptInteraction(
        (interaction as GrowthInteraction).id,
        params.locale
      );
      return { interaction: interaction as GrowthInteraction, response };
    } catch {
      return { interaction: interaction as GrowthInteraction, response: null };
    }
  },

  async deleteJournal(params: {
    interactionId?: string;
    voiceJournalId?: string;
  }): Promise<void> {
    const { data, error } = await supabase.functions.invoke("delete-growth-journal", {
      body: {
        interaction_id: params.interactionId || null,
        voice_journal_id: params.voiceJournalId || null,
      },
    });
    if (error) throw error;
    if (!data || (data as { error?: string }).error) {
      throw new Error((data as { error?: string })?.error || "journal_deletion_failed");
    }
  },
};
