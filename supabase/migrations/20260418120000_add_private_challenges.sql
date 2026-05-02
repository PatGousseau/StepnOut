CREATE TABLE public.private_challenge_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (goal <@ ARRAY['novelty', 'fun', 'connection', 'momentum', 'creativity', 'better_stories']::text[])
    CHECK (cardinality(goal) > 0),
  hard_situation text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (hard_situation <@ ARRAY['low_energy', 'overthinking', 'spending_money', 'planning', 'social_hesitation', 'going_far', 'not_knowing', 'feeling_self_conscious']::text[])
    CHECK (cardinality(hard_situation) > 0),
  stretch_level text NOT NULL CHECK (stretch_level IN ('easy_win', 'moderate_push', 'bold_nudge')),
  preferred_context text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (preferred_context <@ ARRAY['at_home', 'near_home', 'out_in_the_city', 'with_other_people', 'solo']::text[])
    CHECK (cardinality(preferred_context) > 0),
  meaningful_type text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (meaningful_type <@ ARRAY['playful', 'creative', 'exploratory', 'social', 'reflective', 'growth_edge']::text[])
    CHECK (cardinality(meaningful_type) > 0),
  avoid_types text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (avoid_types <@ ARRAY['spending_money', 'talking_to_strangers', 'group_social_situations', 'lots_of_planning', 'physically_demanding', 'nighttime', 'going_far']::text[]),
  progress_definition text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (progress_definition <@ ARRAY['did_something_unusual', 'more_stories', 'days_less_repetitive', 'followed_impulses', 'explored_more', 'felt_more_alive', 'shared_more_with_people']::text[])
    CHECK (cardinality(progress_definition) > 0),
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.private_challenge_sets (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_difficulty text CHECK (completed_difficulty IN ('easy', 'medium', 'hard')),
  completed_note text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT private_challenge_sets_user_id_date_key UNIQUE (user_id, challenge_date),
  CONSTRAINT private_challenge_sets_completion_state_check CHECK (
    (
      status IN ('pending', 'skipped')
      AND completed_difficulty IS NULL
      AND completed_at IS NULL
    )
    OR (
      status = 'completed'
      AND completed_difficulty IS NOT NULL
      AND completed_at IS NOT NULL
    )
  )
);

CREATE TABLE public.private_challenges (
  id bigserial PRIMARY KEY,
  set_id bigint NOT NULL REFERENCES public.private_challenge_sets(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  title text NOT NULL,
  description text NOT NULL,
  why_this_matters text NOT NULL,
  coaching_tip text,
  theme text,
  llm_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT private_challenges_set_id_difficulty_key UNIQUE (set_id, difficulty)
);

CREATE INDEX private_challenge_sets_user_id_date_idx
  ON public.private_challenge_sets (user_id, challenge_date DESC);

ALTER TABLE public.private_challenge_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_challenge_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "private_challenge_profiles_select_self"
  ON public.private_challenge_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "private_challenge_profiles_insert_self"
  ON public.private_challenge_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "private_challenge_profiles_update_self"
  ON public.private_challenge_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "private_challenge_sets_select_self"
  ON public.private_challenge_sets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "private_challenge_sets_insert_self"
  ON public.private_challenge_sets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "private_challenge_sets_update_self"
  ON public.private_challenge_sets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "private_challenges_select_self"
  ON public.private_challenges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.private_challenge_sets s
      WHERE s.id = private_challenges.set_id
        AND s.user_id = auth.uid()
    )
  );
