import { supabase } from "../lib/supabase";
import {
  GeneratedQuestSet,
  IntakeAnswers,
  IntakeStatus,
  PersonalizedQuest,
  PersonalizedQuestIntake,
  QuestFollowup,
  QuestSource,
  SoloExperience,
} from "../types/personalizedQuests";

const INTAKE_TABLE = "personalized_quest_intakes";

export const personalizedQuestService = {
  async createIntake(userId: string): Promise<PersonalizedQuestIntake> {
    const { data, error } = await supabase
      .from(INTAKE_TABLE)
      .insert({ user_id: userId, status: "in_progress" })
      .select("*")
      .single();

    if (error) throw error;
    return data as PersonalizedQuestIntake;
  },

  /**
   * Patches whatever the user has answered so far. Called after each step so a
   * drop-off still leaves their words behind.
   */
  async saveAnswers(
    intakeId: number,
    patch: Partial<{
      answer_avoided: string;
      answer_bail: string;
      answer_solo_experience: SoloExperience | null;
      location_raw: string;
      followup_question: string | null;
      followup_variant: string | null;
      followup_answer: string | null;
      status: IntakeStatus;
      completed_at: string | null;
    }>
  ): Promise<void> {
    const { error } = await supabase
      .from(INTAKE_TABLE)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", intakeId);

    if (error) throw error;
  },

  async completeIntake(intakeId: number): Promise<void> {
    await this.saveAnswers(intakeId, {
      status: "completed",
      completed_at: new Date().toISOString(),
    });
  },

  async fetchLatestIntake(userId: string): Promise<PersonalizedQuestIntake | null> {
    const { data, error } = await supabase
      .from(INTAKE_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as PersonalizedQuestIntake) || null;
  },

  async fetchQuestsForIntake(intakeId: number): Promise<PersonalizedQuest[]> {
    const { data, error } = await supabase
      .from("side_quests")
      .select("*")
      .eq("intake_id", intakeId)
      .order("horizon", { ascending: true });

    if (error) throw error;
    return (data || []) as PersonalizedQuest[];
  },

  /**
   * Fires the follow-up generation. Resolves to a skip rather than rejecting:
   * the intake must never block or fail on this call.
   */
  async generateFollowup(params: {
    answerAvoided: string;
    answerBail: string;
    locale: string;
  }): Promise<QuestFollowup> {
    const skipped: QuestFollowup = { skip: true, question: null, variant: null };
    const failed: QuestFollowup = { ...skipped, error: true };

    try {
      const { data, error } = await supabase.functions.invoke("generate-quest-followup", {
        body: {
          answer_avoided: params.answerAvoided,
          answer_bail: params.answerBail,
          locale: params.locale,
        },
      });

      if (error || !data) return failed;

      const followup = data as QuestFollowup;
      if (followup.skip || !followup.question || !followup.variant) return skipped;

      return followup;
    } catch {
      return failed;
    }
  },

  async generateQuests(params: {
    intakeId: number;
    answers: IntakeAnswers;
    locale: string;
  }): Promise<GeneratedQuestSet> {
    const { data, error } = await supabase.functions.invoke("generate-personalized-quests", {
      body: {
        intake_id: params.intakeId,
        answer_avoided: params.answers.answer_avoided,
        answer_bail: params.answers.answer_bail,
        answer_solo_experience: params.answers.answer_solo_experience,
        location_raw: params.answers.location_raw,
        followup_question: params.answers.followup_question ?? null,
        followup_answer: params.answers.followup_answer ?? null,
        locale: params.locale,
      },
    });

    if (error) throw error;
    if (!data || (data as { error?: string }).error) {
      throw new Error((data as { error?: string })?.error || "generation_failed");
    }

    return data as GeneratedQuestSet;
  },
};

/**
 * Current quest source. An events-backed source can be added alongside this one
 * and selected without the intake UI changing.
 */
export const llmQuestSource: QuestSource = {
  id: "llm",
  generate: (params) => personalizedQuestService.generateQuests(params),
};
