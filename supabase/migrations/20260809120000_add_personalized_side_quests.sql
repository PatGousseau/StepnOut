-- Personalized side quest intake.
--
-- Captures a user's own words about what they have been avoiding, then stores
-- LLM-generated quests written for that specific person. Generated quests live
-- in side_quests (scoped by user_id) so that posting, feed titles, profile
-- activity, progress counting and /quest/:id deep links keep working unchanged.

-- ---------------------------------------------------------------------------
-- Intake
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.personalized_quest_intakes (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Raw verbatim answers. Future personalization depends on their actual
  -- wording, so these are never overwritten with derived fields.
  answer_avoided text,
  answer_bail text,
  answer_solo_experience text
    CHECK (answer_solo_experience IN ('never', 'once_or_twice', 'regularly')),

  -- Free text today. The structured columns exist so GPS or a places
  -- autocomplete can populate them later without a migration or backfill.
  location_raw text,
  location_city text,
  location_lat double precision,
  location_lng double precision,
  location_source text
    CHECK (location_source IN ('manual', 'gps', 'places')),

  -- NULL followup_variant means the follow-up was skipped.
  followup_question text,
  followup_variant text CHECK (followup_variant IN ('clarify', 'deepen')),
  followup_answer text,

  readback_lines text[] NOT NULL DEFAULT '{}'::text[],

  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  completed_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS personalized_quest_intakes_user_created_idx
  ON public.personalized_quest_intakes (user_id, created_at DESC);

ALTER TABLE public.personalized_quest_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personalized_quest_intakes_select_self"
  ON public.personalized_quest_intakes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "personalized_quest_intakes_insert_self"
  ON public.personalized_quest_intakes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personalized_quest_intakes_update_self"
  ON public.personalized_quest_intakes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- side_quests: allow per-user generated rows alongside the curated pool
-- ---------------------------------------------------------------------------

ALTER TABLE public.side_quests
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.side_quests
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'curated';

ALTER TABLE public.side_quests
  ADD COLUMN IF NOT EXISTS intake_id bigint
    REFERENCES public.personalized_quest_intakes(id) ON DELETE SET NULL;

ALTER TABLE public.side_quests
  ADD COLUMN IF NOT EXISTS horizon text;

ALTER TABLE public.side_quests
  DROP CONSTRAINT IF EXISTS side_quests_source_check;

ALTER TABLE public.side_quests
  ADD CONSTRAINT side_quests_source_check
  CHECK (source IN ('curated', 'personalized'));

ALTER TABLE public.side_quests
  DROP CONSTRAINT IF EXISTS side_quests_horizon_check;

ALTER TABLE public.side_quests
  ADD CONSTRAINT side_quests_horizon_check
  CHECK (horizon IS NULL OR horizon IN ('today', 'weekend'));

-- A curated quest belongs to nobody; a personalized quest always belongs to someone.
ALTER TABLE public.side_quests
  DROP CONSTRAINT IF EXISTS side_quests_source_owner_check;

ALTER TABLE public.side_quests
  ADD CONSTRAINT side_quests_source_owner_check
  CHECK (
    (source = 'curated' AND user_id IS NULL)
    OR (source = 'personalized' AND user_id IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS side_quests_user_intake_idx
  ON public.side_quests (user_id, intake_id)
  WHERE user_id IS NOT NULL;

-- Reads were previously open to every authenticated user. Personalized quests
-- are private, but a quest referenced by an existing post must stay readable so
-- the feed's `side_quests:quest_id (title)` join still resolves for other
-- viewers. post_quest_id_idx supports that lookup.
DROP POLICY IF EXISTS "side_quests_select_authenticated" ON public.side_quests;

CREATE POLICY "side_quests_select_authenticated"
  ON public.side_quests FOR SELECT
  TO authenticated
  USING (
    user_id IS NULL
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.post p WHERE p.quest_id = side_quests.id
    )
  );

-- ---------------------------------------------------------------------------
-- Keep personalized quests out of the curated daily draw
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.claim_daily_side_quest(
  ranked_quest_ids bigint[],
  requested_local_day date
)
RETURNS TABLE(
  status text,
  draw_id bigint,
  draw_local_day date,
  quest jsonb
) AS $$
DECLARE
  existing_draw public.side_quest_draws%ROWTYPE;
  selected_draw public.side_quest_draws%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF requested_local_day IS NULL THEN
    RAISE EXCEPTION 'requested_local_day is required';
  END IF;

  SELECT *
  INTO existing_draw
  FROM public.side_quest_draws sqd
  WHERE sqd.user_id = auth.uid()
    AND sqd.local_day = requested_local_day;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      'existing'::text,
      existing_draw.id,
      existing_draw.local_day,
      to_jsonb(sq.*)
    FROM public.side_quests sq
    WHERE sq.id = existing_draw.quest_id;
    RETURN;
  END IF;

  WITH ranked_candidates AS (
    SELECT
      sq.*,
      ids.ordinality::int AS rank_position
    FROM unnest(ranked_quest_ids) WITH ORDINALITY AS ids(quest_id, ordinality)
    JOIN public.side_quests sq
      ON sq.id = ids.quest_id
    LEFT JOIN public.side_quest_draws seen
      ON seen.user_id = auth.uid()
     AND seen.quest_id = sq.id
    WHERE sq.is_active = true
      AND sq.user_id IS NULL
      AND seen.id IS NULL
  ),
  weighted_choice AS (
    SELECT id
    FROM ranked_candidates
    ORDER BY -ln(GREATEST(random(), 1e-9)) / (1.0 / rank_position)
    LIMIT 1
  ),
  inserted AS (
    INSERT INTO public.side_quest_draws (user_id, quest_id, local_day)
    SELECT auth.uid(), id, requested_local_day
    FROM weighted_choice
    ON CONFLICT (user_id, local_day) DO NOTHING
    RETURNING *
  )
  SELECT *
  INTO selected_draw
  FROM inserted;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      'created'::text,
      selected_draw.id,
      selected_draw.local_day,
      to_jsonb(sq.*)
    FROM public.side_quests sq
    WHERE sq.id = selected_draw.quest_id;
    RETURN;
  END IF;

  SELECT *
  INTO existing_draw
  FROM public.side_quest_draws sqd
  WHERE sqd.user_id = auth.uid()
    AND sqd.local_day = requested_local_day;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      'existing'::text,
      existing_draw.id,
      existing_draw.local_day,
      to_jsonb(sq.*)
    FROM public.side_quests sq
    WHERE sq.id = existing_draw.quest_id;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    'exhausted'::text,
    NULL::bigint,
    requested_local_day,
    NULL::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

GRANT EXECUTE ON FUNCTION public.claim_daily_side_quest(bigint[], date) TO authenticated;

-- ---------------------------------------------------------------------------
-- prompts: allow one row per (key, locale)
--
-- The table already carries a locale column, a (key, locale) index and a
-- locale argument in getPromptContent, but UNIQUE was on key alone, so a key
-- could only ever exist in one language.
-- ---------------------------------------------------------------------------

ALTER TABLE public.prompts
  DROP CONSTRAINT IF EXISTS prompts_key_key;

ALTER TABLE public.prompts
  DROP CONSTRAINT IF EXISTS prompts_key_locale_key;

ALTER TABLE public.prompts
  ADD CONSTRAINT prompts_key_locale_key UNIQUE (key, locale);

-- ---------------------------------------------------------------------------
-- Prompts (tuned in Supabase Studio, no deploy required)
-- ---------------------------------------------------------------------------

INSERT INTO public.prompts (key, locale, content)
VALUES
  (
    'personalized_quest_followup',
    'it',
    'Un utente di StepnOut ha risposto a due domande.
D1 "Cosa rimandi da mesi?": "{answer_avoided}"
D2 "Cosa ti farebbe dare buca?": "{answer_bail}"

Genera UNA sola domanda di follow-up, in italiano, dando del tu.

Conta prima le parole totali di ENTRAMBE le risposte, poi applica questa regola alla lettera:
- Meno di 10 parole in totale, OPPURE nessun luogo/persona/situazione precisa nominata -> la variante DEVE essere "clarify". Chiedi l''unico fatto concreto che manca.
  (Esempio svolto: "palestra" + "stanco" sono 2 parole -> clarify, mai deepen.)
- 10 parole o più E qualcosa di specifico nominato -> la variante DEVE essere "deepen". Riprendi le SUE parole e scendi di un livello su quel dettaglio.

L''etichetta della variante deve rispettare la regola qui sopra anche quando la domanda che scrivi andrebbe bene per entrambe.

Regole:
- La domanda deve cambiare la quest, la sua difficoltà o il read-back. Se non lo farebbe, restituisci skip: true.
- Chiedi un fatto o una circostanza. Mai come si sente. Mai cosa lo aiuterebbe o cosa glielo renderebbe più facile.
- Una frase, max 100 caratteri. Nessun preambolo, nessuna empatia di servizio.'
  ),
  (
    'personalized_quest_followup',
    'en',
    'A StepnOut user answered two questions.
Q1 "What have you been meaning to do for months?": "{answer_avoided}"
Q2 "What would make you bail?": "{answer_bail}"

Generate ONE follow-up question in English.

First count the total words across BOTH answers, then apply this rule strictly:
- Under 10 words total, OR no specific place/person/situation named -> variant MUST be "clarify". Ask for the single missing concrete fact.
  (Worked example: "gym" + "tired" is 2 words -> clarify, never deepen.)
- 10 words or more AND something specific is named -> variant MUST be "deepen". Reference THEIR words and go one level down on that detail.

The variant label must match the rule above even when the question you write would fit either one.

Rules:
- The question must change the quest, its difficulty, or the read-back. If it would not, return skip: true.
- Ask about a fact or a circumstance. Never how they feel. Never what would help or make it easier.
- One sentence, max 100 characters. No preamble, no throat-clearing empathy.'
  ),
  (
    'personalized_quest_readback',
    'it',
    'Scrivi esattamente 3 righe brevi che nominino il vero problema di questa persona, in italiano, dando del tu.

Cosa rimanda: "{answer_avoided}"
Cosa la fa desistere: "{answer_bail}"
Esperienza da sola: {answer_solo_experience}
Dove vive: {location_raw}
Follow-up: {followup_question} -> "{followup_answer}"

Struttura, una riga ciascuna:
1. Cosa si porta dietro. Parla A lui dandogli del tu. Mai ripetere la sua frase parola per parola.
2. Il blocco, detto chiaro: quello che crede sia il problema non lo è, il problema è QUESTO.
3. Una riformulazione che rende il problema più piccolo. Descrivilo in modo diverso — NON
   proporre un''azione, un passo o una soluzione. La sfida arriva nella schermata dopo.

Esempio svolto. Per "voglio fare un corso di ceramica da due anni" + "entrare in una stanza
dove si conoscono già tutti", la risposta giusta è:
Vuoi fare quel corso di ceramica da due anni.
La ceramica non è mai stata il problema: entrare da solo lo è.
È una cosa molto più piccola da risolvere di "non concludo mai niente".

Tono: caldo e diretto, come un amico che ti ha ascoltato davvero e non sta al gioco.
Comprensivo, mai sdolcinato, mai clinico, mai un riassunto.

Regole:
- Usa i SUOI dettagli concreti, riformulati con parole tue.
- Max 90 caratteri a riga.
- VIETATO: "sembra che", "ho la sensazione", "capisco", "dev''essere dura", "il vero blocco è",
  complimenti, rassicurazioni, punti esclamativi, consigli.
- Non fare domande. Nomina il problema, non risolverlo.'
  ),
  (
    'personalized_quest_readback',
    'en',
    'Write exactly 3 short lines that name the real problem for this person, in English.

Been avoiding: "{answer_avoided}"
What makes them bail: "{answer_bail}"
Solo experience: {answer_solo_experience}
Where they live: {location_raw}
Follow-up: {followup_question} -> "{followup_answer}"

Structure, one line each:
1. What they have been carrying. Speak TO them as "you". Never repeat their sentence back verbatim.
2. The block, named plainly: the thing they assume is the problem is not it, THIS is.
3. A reframe that makes the problem smaller. Describe it differently — do NOT prescribe
   an action, a step or a fix. The challenge comes on the next screen.

Worked example. For "wanted a pottery class for two years" + "walking into a room where
everyone already knows each other", the right answer is:
You have wanted the pottery class for two years.
The pottery was never the problem — walking in alone is.
That is a much smaller thing to solve than "I never follow through."

Tone: warm and direct, like a friend who has been paying attention and is not going to
pretend along with them. Understanding, never gushing, never clinical, never a summary.

Rules:
- Use THEIR concrete details, rephrased in your own words.
- Max 90 characters per line.
- BANNED: "it sounds like", "I hear you", "I sense", "that must be hard", "the real block is",
  compliments, reassurance, exclamation marks, advice.
- Ask nothing. Name the problem, do not solve it.'
  ),
  (
    'personalized_quest_generation',
    'it',
    'Genera 2 quest per questa persona, in italiano, dando del tu.

Cosa rimanda: "{answer_avoided}"
Cosa la fa desistere: "{answer_bail}"
Esperienza da sola: {answer_solo_experience}
Dove vive: {location_raw}
Follow-up: {followup_question} -> "{followup_answer}"

- horizon "today": piccola, fattibile nelle prossime 24 ore, senza pianificazione.
- horizon "weekend": quella vera, questo fine settimana, un passo concreto verso "{answer_avoided}".

Regole:
- Attacca direttamente ciò che la fa desistere ("{answer_bail}"), non aggirarlo.
- Concreta e verificabile: si deve capire se è stata fatta o no.
- Usa {location_raw} solo se rende la quest più fattibile.
- title max 60 caratteri, summary max 160 caratteri.
- Niente motivazionale generico, niente "prova a", niente emoji.

Assegna i tag scegliendo SOLO fra i valori ammessi dallo schema.'
  ),
  (
    'personalized_quest_generation',
    'en',
    'Generate 2 quests for this person, in English.

Been avoiding: "{answer_avoided}"
What makes them bail: "{answer_bail}"
Solo experience: {answer_solo_experience}
Where they live: {location_raw}
Follow-up: {followup_question} -> "{followup_answer}"

- horizon "today": small, doable in the next 24 hours, no planning required.
- horizon "weekend": the real one, this coming weekend, a concrete step toward "{answer_avoided}".

Rules:
- Go straight at what makes them bail ("{answer_bail}"), do not route around it.
- Concrete and checkable: it must be obvious whether they did it.
- Use {location_raw} only where it makes the quest more doable.
- title max 60 characters, summary max 160 characters.
- No generic motivation, no "try to", no emoji.

Assign tags using ONLY the values allowed by the schema.'
  )
ON CONFLICT (key, locale) DO UPDATE SET content = EXCLUDED.content;
