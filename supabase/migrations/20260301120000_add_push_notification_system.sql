-- Push notification system (highlights, streak-at-risk, personalized nudges)

-- Log for push notifications sent by backend jobs
CREATE TABLE IF NOT EXISTS public.push_notification_log (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('streak_at_risk', 'community_highlight', 'personalized_nudge')),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  post_id int REFERENCES public.post(id) ON DELETE SET NULL,
  challenge_id int REFERENCES public.challenges(id) ON DELETE SET NULL,
  ai_generated boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  opened_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_push_notification_log_user_type_created
  ON public.push_notification_log (user_id, type, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_push_notification_log_user_challenge
  ON public.push_notification_log (user_id, type, challenge_id)
  WHERE challenge_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_push_notification_log_user_post
  ON public.push_notification_log (user_id, type, post_id)
  WHERE post_id IS NOT NULL;

ALTER TABLE public.push_notification_log ENABLE ROW LEVEL SECURITY;

-- Track when a user last opened the app
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_open_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_last_open_at
  ON public.profiles (last_open_at DESC);

-- Pre-generated community highlights (shared copy for all recipients)
CREATE TABLE IF NOT EXISTS public.community_highlights (
  id bigserial PRIMARY KEY,
  post_id int NOT NULL UNIQUE REFERENCES public.post(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  generated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_highlights_generated_at
  ON public.community_highlights (generated_at DESC);

ALTER TABLE public.community_highlights ENABLE ROW LEVEL SECURITY;

-- Prompt templates (Italian)
CREATE TABLE IF NOT EXISTS public.prompts (
  id bigserial PRIMARY KEY,
  key text NOT NULL UNIQUE,
  locale text NOT NULL DEFAULT 'it',
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompts_key_locale
  ON public.prompts (key, locale);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

INSERT INTO public.prompts (key, locale, content)
VALUES
  (
    'community_highlight',
    'it',
    'Stai scrivendo una push notification per StepnOut, un''app di sfide per uscire dalla comfort zone. Un membro della community di nome {poster_first_name} ha appena condiviso questa storia sulla sfida "{challenge_title}": "{post_body}". Scrivi una notifica in italiano (titolo: max 40 caratteri, corpo: max 100 caratteri) che invogli ad aprire l''app. Riferisciti al cuore emotivo della storia senza citarla direttamente. Sii specifico, niente motivazionale generico. Nessuna emoji nel titolo. Max 1 emoji nel corpo. Output JSON: {"title": "...", "body": "..."}'
  ),
  (
    'personalized_nudge',
    'it',
    'Stai scrivendo una push notification di re-engagement per StepnOut, in italiano. Utente: {first_name}. Ultima sfida completata: "{last_challenge_title}" ({days_ago} giorni fa). Totale sfide completate: {total_count}. Streak prima di sparire: {streak_count}. Scrivi una notifica che sembri personale, richiami ciò che ha fatto, crei curiosita gentile (non senso di colpa), tono caldo ma non pressante. Output JSON: {"title": "...", "body": "..."}'
  ),
  (
    'streak_at_risk_templates',
    'it',
    '[{"title":"Non perdere la serie","body":"Mancano 2 giorni alla sfida: se la salti perdi la tua serie. Ci sei?"},{"title":"Serie a rischio","body":"Ti restano 2 giorni per completare la sfida e salvare la tua serie."},{"title":"Ultimo avviso","body":"Ancora 2 giorni: fai la sfida di oggi e tieni viva la tua serie."}]'
  )
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;

-- Latest pre-generated highlight for the last 48 hours
CREATE OR REPLACE FUNCTION public.get_latest_community_highlight()
RETURNS TABLE (post_id int, title text, body text)
LANGUAGE sql STABLE AS $$
  SELECT h.post_id, h.title, h.body
  FROM public.community_highlights h
  JOIN public.post p ON p.id = h.post_id
  WHERE p.created_at >= now() - interval '48 hours'
  ORDER BY h.generated_at DESC
  LIMIT 1;
$$;

-- Users eligible for today's highlight (not opened today, not already sent this post)
CREATE OR REPLACE FUNCTION public.get_daily_highlight_candidates(highlight_post_id int)
RETURNS TABLE (user_id uuid, push_token text)
LANGUAGE sql STABLE AS $$
  SELECT p.id AS user_id, p.push_token
  FROM public.profiles p
  WHERE p.push_token IS NOT NULL
    AND coalesce(p.last_open_at, p.created_at) >= now() - interval '14 days'
    AND date_trunc('day', coalesce(p.last_open_at, p.created_at) AT TIME ZONE 'utc') < date_trunc('day', now() AT TIME ZONE 'utc')
    AND NOT EXISTS (
      SELECT 1
      FROM public.push_notification_log l
      WHERE l.user_id = p.id
        AND l.type = 'community_highlight'
        AND l.post_id = highlight_post_id
    );
$$;

-- Users eligible for streak-at-risk (2 days left, no submission yet)
CREATE OR REPLACE FUNCTION public.get_streak_at_risk_candidates()
RETURNS TABLE (
  user_id uuid,
  push_token text,
  challenge_id int,
  challenge_title text
)
LANGUAGE sql STABLE AS $$
  WITH active_challenge AS (
    SELECT cs.challenge_id, cs.end_date
    FROM public.challenges_status cs
    WHERE cs.is_active = true
    ORDER BY cs.end_date DESC
    LIMIT 1
  )
  SELECT
    p.id AS user_id,
    p.push_token,
    ac.challenge_id,
    coalesce(c.title_it, c.title) AS challenge_title
  FROM active_challenge ac
  JOIN public.challenges c ON c.id = ac.challenge_id
  JOIN public.profiles p ON p.push_token IS NOT NULL
  JOIN public.user_progress up ON up.user_id = p.id
  WHERE up.total_challenges_completed >= 1
    AND ac.end_date > now()
    AND ac.end_date <= now() + interval '2 days'
    AND coalesce(p.last_open_at, p.created_at) >= now() - interval '14 days'
    AND NOT EXISTS (
      SELECT 1
      FROM public.submission s
      WHERE s.user_id = p.id
        AND s.challenge_id = ac.challenge_id
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.push_notification_log l
      WHERE l.user_id = p.id
        AND l.type = 'streak_at_risk'
        AND l.challenge_id = ac.challenge_id
    );
$$;

-- Users eligible for personalized nudge (3-14 days inactive, completed >=1)
CREATE OR REPLACE FUNCTION public.get_personalized_nudge_candidates()
RETURNS TABLE (
  user_id uuid,
  push_token text,
  name text,
  last_challenge_title text,
  days_since_last_open int,
  total_challenges_completed int,
  streak int
)
LANGUAGE sql STABLE AS $$
  WITH last_nudge AS (
    SELECT user_id, max(created_at) AS last_nudge_at
    FROM public.push_notification_log
    WHERE type = 'personalized_nudge'
    GROUP BY user_id
  )
  SELECT
    p.id AS user_id,
    p.push_token,
    p.name,
    coalesce(ch.title_it, ch.title) AS last_challenge_title,
    floor(extract(epoch from (now() - coalesce(p.last_open_at, p.created_at))) / 86400)::int AS days_since_last_open,
    up.total_challenges_completed,
    up.streak
  FROM public.profiles p
  JOIN public.user_progress up ON up.user_id = p.id
  LEFT JOIN last_nudge ln ON ln.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT s.challenge_id, s.created_at
    FROM public.submission s
    WHERE s.user_id = p.id
    ORDER BY s.created_at DESC
    LIMIT 1
  ) last_sub ON true
  LEFT JOIN public.challenges ch ON ch.id = last_sub.challenge_id
  WHERE p.push_token IS NOT NULL
    AND up.total_challenges_completed >= 1
    AND coalesce(p.last_open_at, p.created_at) >= now() - interval '14 days'
    AND coalesce(p.last_open_at, p.created_at) <= now() - interval '3 days'
    AND (ln.last_nudge_at IS NULL OR ln.last_nudge_at < coalesce(p.last_open_at, p.created_at));
$$;

-- Schedules (UTC)
-- Note: uses service role JWT (matches existing pattern in remote_schema)
DO $$
DECLARE
  existing_job_id int;
BEGIN
  -- generate community highlight every 6 hours
  SELECT jobid INTO existing_job_id FROM cron.job WHERE jobname = 'generate_community_highlight' LIMIT 1;
  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
  PERFORM cron.schedule(
    'generate_community_highlight',
    '0 */6 * * *',
    $$
      SELECT
        net.http_post(
          'https://kiplxlahalqyahstmmjg.supabase.co/functions/v1/generate-community-highlight',
          json_build_object(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM5MTE1MSwiZXhwIjoyMDQ0OTY3MTUxfQ.qTUtndeAxu4IUDQucVzlBowkwgAh6W1S6j4x5QeWJv4'
          )::jsonb,
          '{}'::jsonb
        );
    $$
  );

  -- send daily community highlight to users who haven't opened today
  SELECT jobid INTO existing_job_id FROM cron.job WHERE jobname = 'send_daily_highlight' LIMIT 1;
  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
  PERFORM cron.schedule(
    'send_daily_highlight',
    '0 18 * * *',
    $$
      SELECT
        net.http_post(
          'https://kiplxlahalqyahstmmjg.supabase.co/functions/v1/send-community-highlight',
          json_build_object(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM5MTE1MSwiZXhwIjoyMDQ0OTY3MTUxfQ.qTUtndeAxu4IUDQucVzlBowkwgAh6W1S6j4x5QeWJv4'
          )::jsonb,
          '{}'::jsonb
        );
    $$
  );

  -- send streak-at-risk notifications daily
  SELECT jobid INTO existing_job_id FROM cron.job WHERE jobname = 'send_streak_at_risk' LIMIT 1;
  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
  PERFORM cron.schedule(
    'send_streak_at_risk',
    '0 17 * * *',
    $$
      SELECT
        net.http_post(
          'https://kiplxlahalqyahstmmjg.supabase.co/functions/v1/send-streak-at-risk',
          json_build_object(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM5MTE1MSwiZXhwIjoyMDQ0OTY3MTUxfQ.qTUtndeAxu4IUDQucVzlBowkwgAh6W1S6j4x5QeWJv4'
          )::jsonb,
          '{}'::jsonb
        );
    $$
  );

  -- send personalized nudges daily
  SELECT jobid INTO existing_job_id FROM cron.job WHERE jobname = 'send_personalized_nudge' LIMIT 1;
  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
  PERFORM cron.schedule(
    'send_personalized_nudge',
    '0 19 * * *',
    $$
      SELECT
        net.http_post(
          'https://kiplxlahalqyahstmmjg.supabase.co/functions/v1/send-personalized-nudge',
          json_build_object(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM5MTE1MSwiZXhwIjoyMDQ0OTY3MTUxfQ.qTUtndeAxu4IUDQucVzlBowkwgAh6W1S6j4x5QeWJv4'
          )::jsonb,
          '{}'::jsonb
        );
    $$
  );
END $$;
