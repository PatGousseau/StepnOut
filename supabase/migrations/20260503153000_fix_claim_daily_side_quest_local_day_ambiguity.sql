DROP FUNCTION IF EXISTS public.claim_daily_side_quest(bigint[], date);

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
