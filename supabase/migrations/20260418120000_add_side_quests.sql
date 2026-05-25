CREATE TABLE public.side_quest_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (goal <@ ARRAY['novelty', 'fun', 'connection', 'momentum', 'creativity', 'better_stories']::text[])
    CHECK (cardinality(goal) > 0),
  hard_situation text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (hard_situation <@ ARRAY['low_energy', 'overthinking', 'spending_money', 'planning', 'social_hesitation', 'going_far', 'not_knowing', 'feeling_self_conscious']::text[])
    CHECK (cardinality(hard_situation) > 0),
  stretch_level text NOT NULL
    CHECK (stretch_level IN ('easy_win', 'moderate_push', 'bold_nudge')),
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

CREATE TABLE public.side_quests (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  summary text NOT NULL,
  goal_tags text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (goal_tags <@ ARRAY['novelty', 'fun', 'connection', 'momentum', 'creativity', 'better_stories']::text[])
    CHECK (cardinality(goal_tags) BETWEEN 1 AND 3),
  barrier_tags text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (barrier_tags <@ ARRAY['low_energy', 'overthinking', 'spending_money', 'planning', 'social_hesitation', 'going_far', 'not_knowing', 'feeling_self_conscious']::text[])
    CHECK (cardinality(barrier_tags) BETWEEN 1 AND 2),
  context_tags text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (context_tags <@ ARRAY['at_home', 'near_home', 'out_in_the_city', 'with_other_people', 'solo']::text[])
    CHECK (cardinality(context_tags) BETWEEN 1 AND 4),
  type_tags text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (type_tags <@ ARRAY['playful', 'creative', 'exploratory', 'social', 'reflective', 'growth_edge']::text[])
    CHECK (cardinality(type_tags) BETWEEN 1 AND 3),
  outcome_tags text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (outcome_tags <@ ARRAY['did_something_unusual', 'more_stories', 'days_less_repetitive', 'followed_impulses', 'explored_more', 'felt_more_alive', 'shared_more_with_people']::text[])
    CHECK (cardinality(outcome_tags) BETWEEN 1 AND 3),
  stretch_level text NOT NULL
    CHECK (stretch_level IN ('easy_win', 'moderate_push', 'bold_nudge')),
  cost_level integer NOT NULL CHECK (cost_level BETWEEN 0 AND 3),
  planning_level integer NOT NULL CHECK (planning_level BETWEEN 0 AND 3),
  social_level integer NOT NULL CHECK (social_level BETWEEN 0 AND 3),
  physical_level integer NOT NULL CHECK (physical_level BETWEEN 0 AND 3),
  distance_level integer NOT NULL CHECK (distance_level BETWEEN 0 AND 3),
  night_level integer NOT NULL CHECK (night_level IN (0, 1)),
  avoid_flags text[] NOT NULL DEFAULT '{}'::text[]
    CHECK (avoid_flags <@ ARRAY['spending_money', 'talking_to_strangers', 'group_social_situations', 'lots_of_planning', 'physically_demanding', 'nighttime', 'going_far']::text[]),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX side_quests_is_active_idx ON public.side_quests (is_active);

ALTER TABLE public.side_quest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "side_quest_profiles_select_self"
  ON public.side_quest_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "side_quest_profiles_insert_self"
  ON public.side_quest_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "side_quest_profiles_update_self"
  ON public.side_quest_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "side_quests_select_authenticated"
  ON public.side_quests FOR SELECT
  TO authenticated
  USING (true);
