import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { captureEvent } from "../lib/posthog";
import { PERSONALIZED_QUEST_EVENTS } from "../constants/analyticsEvents";
import { personalizedQuestService, llmQuestSource } from "../services/personalizedQuestService";
import {
  GeneratedQuestSet,
  IntakeAnswers,
  QuestFollowup,
  SoloExperience,
} from "../types/personalizedQuests";

/**
 * How long the flow will wait for the follow-up question once the user has
 * finished the tap/location screen. The follow-up is a bonus, never a gate.
 */
const FOLLOWUP_WAIT_MS = 2500;

const NO_FOLLOWUP: QuestFollowup = { skip: true, question: null, variant: null };

/** Distinguishes "the call was too slow" from "the model chose to skip". */
const TIMED_OUT = Symbol("followup_timed_out");

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(fallback);
    }, ms);

    promise
      .then((value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

export function usePersonalizedQuestIntake() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [intakeId, setIntakeId] = useState<number | null>(null);
  const [followup, setFollowup] = useState<QuestFollowup>(NO_FOLLOWUP);
  const [questSet, setQuestSet] = useState<GeneratedQuestSet | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationFailed, setGenerationFailed] = useState(false);

  // Background work started on Q2 submit. Held in refs so re-renders during
  // steps 3 and 4 never restart it.
  const followupPromiseRef = useRef<Promise<QuestFollowup> | null>(null);
  const speculativePromiseRef = useRef<Promise<GeneratedQuestSet> | null>(null);
  const answersRef = useRef<IntakeAnswers>({
    answer_avoided: "",
    answer_bail: "",
    answer_solo_experience: null,
    location_raw: "",
  });

  const start = useCallback(async () => {
    if (!user?.id) return null;

    const intake = await personalizedQuestService.createIntake(user.id);
    setIntakeId(intake.id);
    captureEvent(PERSONALIZED_QUEST_EVENTS.INTAKE_STARTED, { intake_id: intake.id });
    return intake.id;
  }, [user?.id]);

  const trackStep = useCallback((step: string) => {
    captureEvent(PERSONALIZED_QUEST_EVENTS.INTAKE_STEP_VIEWED, { step });
  }, []);

  const saveAnswer = useCallback(
    async (patch: Partial<IntakeAnswers>) => {
      answersRef.current = { ...answersRef.current, ...patch };
      if (!intakeId) return;

      try {
        await personalizedQuestService.saveAnswers(intakeId, {
          ...(patch.answer_avoided !== undefined && { answer_avoided: patch.answer_avoided }),
          ...(patch.answer_bail !== undefined && { answer_bail: patch.answer_bail }),
          ...(patch.answer_solo_experience !== undefined && {
            answer_solo_experience: patch.answer_solo_experience as SoloExperience | null,
          }),
          ...(patch.location_raw !== undefined && { location_raw: patch.location_raw }),
        });
      } catch (error) {
        // A failed autosave must not interrupt the flow.
        console.warn("personalized quest autosave failed:", error);
      }
    },
    [intakeId]
  );

  /**
   * Fired on Q2 submit. Kicks off the follow-up question and a speculative
   * generation from what we have so far, in parallel. Steps 3 and 4 give both
   * calls wall time.
   */
  const startBackgroundWork = useCallback(
    (id: number) => {
      if (followupPromiseRef.current || speculativePromiseRef.current) return;

      const answers = answersRef.current;

      followupPromiseRef.current = personalizedQuestService.generateFollowup({
        answerAvoided: answers.answer_avoided,
        answerBail: answers.answer_bail,
        locale: language,
      });

      const speculative = llmQuestSource.generate({ intakeId: id, answers, locale: language });

      // Nothing awaits this until the read-back step, so a failure in the
      // meantime would surface as an unhandled rejection. This no-op handler
      // silences that; the stored promise still rejects when awaited later.
      speculative.catch(() => undefined);

      speculativePromiseRef.current = speculative;
    },
    [language]
  );

  /**
   * Called when the tap/location screen is done. Races the follow-up against a
   * short timeout so the flow never stalls on it.
   */
  const resolveFollowup = useCallback(async (): Promise<QuestFollowup> => {
    if (!followupPromiseRef.current) {
      setFollowup(NO_FOLLOWUP);
      return NO_FOLLOWUP;
    }

    const result = await withTimeout<QuestFollowup | typeof TIMED_OUT>(
      followupPromiseRef.current,
      FOLLOWUP_WAIT_MS,
      TIMED_OUT
    );

    if (result === TIMED_OUT || result.skip || !result.question || !result.variant) {
      captureEvent(PERSONALIZED_QUEST_EVENTS.FOLLOWUP_SKIPPED, {
        reason: result === TIMED_OUT ? "timeout" : result.error ? "error" : "model_skip",
      });
      setFollowup(NO_FOLLOWUP);
      return NO_FOLLOWUP;
    }

    captureEvent(PERSONALIZED_QUEST_EVENTS.FOLLOWUP_FIRED, { variant: result.variant });
    setFollowup(result);

    if (intakeId) {
      personalizedQuestService
        .saveAnswers(intakeId, {
          followup_question: result.question,
          followup_variant: result.variant,
        })
        .catch(() => undefined);
    }

    return result;
  }, [intakeId]);

  /**
   * Produces the read-back and quests. If the follow-up was answered we
   * regenerate with it and discard the speculative result; otherwise the
   * speculative result is used so the screen appears with no wait.
   */
  const finalize = useCallback(
    async (followupAnswer: string | null) => {
      if (!intakeId) return null;

      setGenerating(true);
      setGenerationFailed(false);

      const usedSpeculative = !followupAnswer?.trim();

      try {
        let result: GeneratedQuestSet;

        if (usedSpeculative) {
          result = speculativePromiseRef.current
            ? await speculativePromiseRef.current
            : await llmQuestSource.generate({
                intakeId,
                answers: answersRef.current,
                locale: language,
              });
        } else {
          answersRef.current = {
            ...answersRef.current,
            followup_question: followup.question,
            followup_answer: followupAnswer,
          };

          await personalizedQuestService
            .saveAnswers(intakeId, { followup_answer: followupAnswer })
            .catch(() => undefined);

          result = await llmQuestSource.generate({
            intakeId,
            answers: answersRef.current,
            locale: language,
          });
        }

        captureEvent(PERSONALIZED_QUEST_EVENTS.SPECULATIVE_USED, {
          used_speculative: usedSpeculative,
        });

        setQuestSet(result);
        await personalizedQuestService.completeIntake(intakeId);
        captureEvent(PERSONALIZED_QUEST_EVENTS.INTAKE_COMPLETED, { intake_id: intakeId });

        // The new quests are the user's own, so any cached quest list is stale.
        queryClient.invalidateQueries({ queryKey: ["side-quests"] });

        return result;
      } catch (error) {
        console.error("personalized quest generation failed:", error);
        captureEvent(PERSONALIZED_QUEST_EVENTS.GENERATION_FAILED, {
          used_speculative: usedSpeculative,
        });
        setGenerationFailed(true);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [followup.question, intakeId, language, queryClient]
  );

  const abandon = useCallback(
    (step: string) => {
      captureEvent(PERSONALIZED_QUEST_EVENTS.INTAKE_ABANDONED, { step, intake_id: intakeId });
      if (!intakeId) return;
      personalizedQuestService.saveAnswers(intakeId, { status: "abandoned" }).catch(() => undefined);
    },
    [intakeId]
  );

  return {
    intakeId,
    followup,
    questSet,
    generating,
    generationFailed,
    answers: answersRef.current,
    start,
    trackStep,
    saveAnswer,
    startBackgroundWork,
    resolveFollowup,
    finalize,
    abandon,
  };
}
