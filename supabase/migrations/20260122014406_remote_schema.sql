

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."challenge_status" AS ENUM (
    'active',
    'inactive',
    'pending'
);


ALTER TYPE "public"."challenge_status" OWNER TO "postgres";


CREATE TYPE "public"."upload_status" AS ENUM (
    'pending',
    'completed',
    'failed',
    'none'
);


ALTER TYPE "public"."upload_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  -- Delete all posts by the user
  delete from post where user_id = auth.uid();
  
  -- Delete all comments by the user
  delete from comments where user_id = auth.uid();
  
  -- Delete all likes by the user
  delete from likes where user_id = auth.uid();
  
  -- Delete the user's profile
  delete from profiles where id = auth.uid();
  
  -- Finally delete the auth user
  delete from auth.users where id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."delete_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_comment_counts"("post_ids" bigint[]) RETURNS TABLE("post_id" bigint, "count" bigint)
    LANGUAGE "sql"
    AS $$
  SELECT post_id, COUNT(*)::bigint
  FROM comments
  WHERE post_id = ANY(post_ids)
  GROUP BY post_id;
$$;


ALTER FUNCTION "public"."get_comment_counts"("post_ids" bigint[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.profiles (id, username, name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_active_challenge"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  url TEXT := 'https://kiplxlahalqyahstmmjg.supabase.co/functions/v1/send-challenge-notification';
  auth_header TEXT := 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSIsInNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM5MTE1MSwiZXhwIjoyMDQ0OTY3MTUxfQ.qTUtndeAxu4IUDQucVzlBowkwgAh6W1S6j4x5QeWJv4';
  body JSONB := json_build_object('challenge_id', NEW.challenge_id);
BEGIN
  -- Perform the HTTP request
  PERFORM http_post(
    url,
    auth_header,
    body::text,
    'application/json'
  );

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."notify_active_challenge"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_challenge_active"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- Call the Edge Function with the challenge_id using pg_net
  PERFORM
    net.http_post(
      'https://kiplxlahalqyahstmmjg.supabase.co/functions/v1/send-challenge-notification',
      json_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSIsInNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM5MTE1MSwiZXhwIjoyMDQ0OTY3MTUxfQ.qTUtndeAxu4IUDQucVzlBowkwgAh6W1S6j4x5QeWJv4'
      )::jsonb, -- Headers as JSONB
      json_build_object(
        'challenge_id', NEW.challenge_id
      )::jsonb -- Body as JSONB
    );

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."notify_challenge_active"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rotate_recently_active"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  BEGIN
    PERFORM rotate_recently_active_real();
  END;
  $$;


ALTER FUNCTION "public"."rotate_recently_active"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rotate_recently_active_real"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  DECLARE
    current_hour int;
    desired_minimum int;
    real_active_count int;
    users_to_add int;
  BEGIN
    current_hour := extract(hour from (now() at time zone 'Europe/Rome'));

    IF current_hour BETWEEN 8 AND 23 THEN
      desired_minimum := floor(random() * 6) + 5;
    ELSE
      desired_minimum := floor(random() * 2) + 1;
    END IF;

    IF desired_minimum < 1 THEN desired_minimum := 1; END IF;
    IF desired_minimum > 10 THEN desired_minimum := 10; END IF;

    UPDATE profiles SET is_recently_active = false;

    UPDATE profiles p
    SET is_recently_active = true
    FROM auth.sessions s
    WHERE s.user_id = p.id
      AND s.updated_at >= NOW() - INTERVAL '24 hours';

    SELECT COUNT(*) INTO real_active_count
    FROM profiles
    WHERE is_recently_active = true;

    IF real_active_count < desired_minimum THEN
      users_to_add := desired_minimum - real_active_count;

      UPDATE profiles
      SET is_recently_active = true
      WHERE id IN (
        SELECT id FROM profiles
        WHERE is_recently_active = false
        ORDER BY random()
        LIMIT users_to_add
      );
    END IF;
  END;
  $$;


ALTER FUNCTION "public"."rotate_recently_active_real"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_challenge_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    start_date TIMESTAMP := '2024-10-29 00:00:00';  -- Starting point for the first challenge
    current_end TIMESTAMP;
    current_challenge RECORD;
    cumulative_days INT := 0;
BEGIN
    -- Deactivate all challenges first (if intended behavior)
    UPDATE public.challenges_status
    SET is_active = FALSE
    WHERE is_active = TRUE;  -- Adding a condition to update only active challenges

    -- Loop through each challenge ordered by created_at
    FOR current_challenge IN
        SELECT id, created_at, duration FROM public.challenges ORDER BY created_at
    LOOP
        -- Calculate the start and end timestamps for the current challenge
        current_end := start_date + (cumulative_days || ' days')::interval + (current_challenge.duration || ' days')::interval;

        -- Insert or update challenge status
        INSERT INTO public.challenges_status (challenge_id, start_date, end_date, is_active)
        VALUES (
            current_challenge.id,
            start_date + (cumulative_days || ' days')::interval,
            current_end,
            current_timestamp >= (start_date + (cumulative_days || ' days')::interval) AND current_timestamp < current_end
        )
        ON CONFLICT (challenge_id) DO UPDATE SET
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            is_active = EXCLUDED.is_active;

        -- Increment cumulative days by the duration of the current challenge
        cumulative_days := cumulative_days + current_challenge.duration;
    END LOOP;

    RETURN NULL;
END;$$;


ALTER FUNCTION "public"."update_challenge_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Determine user_id based on whether it's an INSERT, UPDATE, or DELETE operation
    user_uuid := COALESCE(NEW.user_id, OLD.user_id);

    -- Update total challenges completed, categorized counts, and streak
    UPDATE user_progress
    SET
        total_challenges_completed = (SELECT COUNT(*) FROM submission WHERE user_id = user_uuid),
        easy_challenges_completed = (SELECT COUNT(*) FROM submission s JOIN challenges c ON s.challenge_id = c.id WHERE s.user_id = user_uuid AND c.difficulty = 'easy'),
        medium_challenges_completed = (SELECT COUNT(*) FROM submission s JOIN challenges c ON s.challenge_id = c.id WHERE s.user_id = user_uuid AND c.difficulty = 'medium'),
        hard_challenges_completed = (SELECT COUNT(*) FROM submission s JOIN challenges c ON s.challenge_id = c.id WHERE s.user_id = user_uuid AND c.difficulty = 'hard'),
        streak = COALESCE(( -- calculate streak of sequential submissions
            SELECT COUNT(*)
            FROM (
                SELECT created_at,
                       created_at - LAG(created_at) OVER (ORDER BY created_at) AS gap
                FROM submission
                WHERE user_id = user_uuid
            ) AS gaps
            WHERE gap = INTERVAL '1 day'
        ), 0)
    WHERE user_id = user_uuid;

    -- If no row exists for the user, insert one
    INSERT INTO user_progress (user_id, total_challenges_completed, streak, easy_challenges_completed, medium_challenges_completed, hard_challenges_completed)
    SELECT user_uuid,
           COUNT(*),
           COALESCE((SELECT COUNT(*) FROM (
                        SELECT created_at,
                               created_at - LAG(created_at) OVER (ORDER BY created_at) AS gap
                        FROM submission
                        WHERE user_id = user_uuid
                    ) AS gaps WHERE gap = INTERVAL '1 day'), 0),
           COUNT(*) FILTER (WHERE c.difficulty = 'easy'),
           COUNT(*) FILTER (WHERE c.difficulty = 'medium'),
           COUNT(*) FILTER (WHERE c.difficulty = 'hard')
    FROM submission s
    JOIN challenges c ON s.challenge_id = c.id
    WHERE s.user_id = user_uuid
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_user_progress"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_progress"("user_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update total challenges completed, categorized counts, and streak
    UPDATE user_progress
    SET
        total_challenges_completed = (SELECT COUNT(*) FROM submission WHERE user_id = user_uuid),
        easy_challenges_completed = (SELECT COUNT(*) FROM submission s JOIN challenges c ON s.challenge_id = c.id WHERE s.user_id = user_uuid AND c.difficulty = 'easy'),
        medium_challenges_completed = (SELECT COUNT(*) FROM submission s JOIN challenges c ON s.challenge_id = c.id WHERE s.user_id = user_uuid AND c.difficulty = 'medium'),
        hard_challenges_completed = (SELECT COUNT(*) FROM submission s JOIN challenges c ON s.challenge_id = c.id WHERE s.user_id = user_uuid AND c.difficulty = 'hard'),
        streak = COALESCE(( -- calculate streak of sequential submissions
            SELECT COUNT(*)
            FROM (
                SELECT created_at,
                       created_at - LAG(created_at) OVER (ORDER BY created_at) AS gap
                FROM submission
                WHERE user_id = user_uuid
            ) AS gaps
            WHERE gap = INTERVAL '1 day'
        ), 0)
    WHERE user_id = user_uuid;
    
    -- If no row exists for the user, insert one
    INSERT INTO user_progress (user_id, total_challenges_completed, streak, easy_challenges_completed, medium_challenges_completed, hard_challenges_completed)
    SELECT user_uuid,
           COUNT(*),
           COALESCE((SELECT COUNT(*) FROM (
                        SELECT created_at,
                               created_at - LAG(created_at) OVER (ORDER BY created_at) AS gap
                        FROM submission
                        WHERE user_id = user_uuid
                    ) AS gaps WHERE gap = INTERVAL '1 day'), 0),
           COUNT(*) FILTER (WHERE c.difficulty = 'easy'),
           COUNT(*) FILTER (WHERE c.difficulty = 'medium'),
           COUNT(*) FILTER (WHERE c.difficulty = 'hard')
    FROM submission s
    JOIN challenges c ON s.challenge_id = c.id
    WHERE s.user_id = user_uuid
    ON CONFLICT (user_id) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."update_user_progress"("user_uuid" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_config" (
    "id" bigint NOT NULL,
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."app_config" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."app_config_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."app_config_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."app_config_id_seq" OWNED BY "public"."app_config"."id";



CREATE TABLE IF NOT EXISTS "public"."blocks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "blocker_id" "uuid" NOT NULL,
    "blocked_id" "uuid" NOT NULL
);


ALTER TABLE "public"."blocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."challenges" (
    "id" integer NOT NULL,
    "title" character varying(100) NOT NULL,
    "description" "text" NOT NULL,
    "difficulty" character varying(10) NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" "date" DEFAULT "now"() NOT NULL,
    "updated_at" "date" DEFAULT "now"() NOT NULL,
    "image_media_id" bigint,
    "is_active" boolean,
    "title_it" "text",
    "description_it" "text",
    CONSTRAINT "challenges_difficulty_check" CHECK ((("difficulty")::"text" = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::"text"[])))
);


ALTER TABLE "public"."challenges" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."challenges_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."challenges_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."challenges_id_seq" OWNED BY "public"."challenges"."id";



CREATE TABLE IF NOT EXISTS "public"."challenges_status" (
    "id" integer NOT NULL,
    "challenge_id" integer NOT NULL,
    "start_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "end_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."challenges_status" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."challenges_status_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."challenges_status_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."challenges_status_id_seq" OWNED BY "public"."challenges_status"."id";



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" integer NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."comments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comments_id_seq" OWNED BY "public"."comments"."id";



CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


ALTER TABLE "public"."feedback" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "post_id" bigint,
    "comment_id" bigint,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."likes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."likes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."likes_id_seq" OWNED BY "public"."likes"."id";



CREATE TABLE IF NOT EXISTS "public"."media" (
    "id" bigint NOT NULL,
    "file_path" character varying(255),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "thumbnail_path" "text",
    "is_thumbnail_only" boolean DEFAULT false,
    "upload_status" "public"."upload_status" DEFAULT 'none'::"public"."upload_status" NOT NULL
);


ALTER TABLE "public"."media" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."media_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."media_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."media_id_seq" OWNED BY "public"."media"."id";



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "notification_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trigger_user_id" "uuid" NOT NULL,
    "post_id" bigint,
    "action_type" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "comment_id" bigint,
    CONSTRAINT "notifications_action_type_check" CHECK (("action_type" = ANY (ARRAY['like'::"text", 'comment'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


ALTER TABLE "public"."notifications" ALTER COLUMN "notification_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_notification_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."post" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "media_id" bigint,
    "body" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "challenge_id" integer,
    "is_welcome" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."post" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."post_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."post_id_seq" OWNED BY "public"."post"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "profile_media_id" bigint,
    "is_admin" boolean DEFAULT false NOT NULL,
    "push_token" "text",
    "first_login" boolean DEFAULT true,
    "instagram" "text",
    "eula_accepted" boolean DEFAULT false NOT NULL,
    "is_recently_active" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."instagram" IS 'Optional link to users instragram account';



CREATE TABLE IF NOT EXISTS "public"."push_tokens" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "push_token" "text" NOT NULL,
    "device_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."push_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "post_id" bigint,
    "reporter_id" "uuid" NOT NULL,
    "reported_user_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "comment_id" integer,
    CONSTRAINT "reports_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'resolved'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."submission" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "challenge_id" integer NOT NULL,
    "media_id" bigint,
    "body" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "post_id" integer
);


ALTER TABLE "public"."submission" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."submission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."submission_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."submission_id_seq" OWNED BY "public"."submission"."id";



CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "user_id" "uuid" NOT NULL,
    "total_challenges_completed" integer,
    "streak" integer,
    "easy_challenges_completed" integer,
    "medium_challenges_completed" integer,
    "hard_challenges_completed" integer
);


ALTER TABLE "public"."user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_submitted_challenges" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_submitted_challenges" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_submitted_challenges_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_submitted_challenges_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_submitted_challenges_id_seq" OWNED BY "public"."user_submitted_challenges"."id";



ALTER TABLE ONLY "public"."app_config" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."app_config_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."challenges" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."challenges_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."challenges_status" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."challenges_status_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."comments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."comments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."likes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."likes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."media" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."media_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."post" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."post_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."submission" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."submission_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_submitted_challenges" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_submitted_challenges_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."challenges_status"
    ADD CONSTRAINT "challenges_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media"
    ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media"
    ADD CONSTRAINT "media_thumbnails_key" UNIQUE ("thumbnail_path");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."push_tokens"
    ADD CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "unique_block" UNIQUE ("blocker_id", "blocked_id");



ALTER TABLE ONLY "public"."challenges_status"
    ADD CONSTRAINT "unique_challenge_id" UNIQUE ("challenge_id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_submitted_challenges"
    ADD CONSTRAINT "user_submitted_challenges_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_notifications_comment_id" ON "public"."notifications" USING "btree" ("comment_id");



CREATE UNIQUE INDEX "unique_active_row" ON "public"."challenges" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE OR REPLACE TRIGGER "submission_update_user_progress" AFTER INSERT OR DELETE OR UPDATE ON "public"."submission" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_progress"();



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_challenge_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id");



ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."challenges_status"
    ADD CONSTRAINT "challenges_status_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_trigger_user_id_fkey" FOREIGN KEY ("trigger_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_profile_media_id_fkey" FOREIGN KEY ("profile_media_id") REFERENCES "public"."media"("id");



ALTER TABLE ONLY "public"."push_tokens"
    ADD CONSTRAINT "push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id");



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id");



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_submitted_challenges"
    ADD CONSTRAINT "user_submitted_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."challenges_status";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


















































































































































































































GRANT ALL ON FUNCTION "public"."delete_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_comment_counts"("post_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_comment_counts"("post_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_comment_counts"("post_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_active_challenge"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_active_challenge"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_active_challenge"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_challenge_active"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_challenge_active"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_challenge_active"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rotate_recently_active"() TO "anon";
GRANT ALL ON FUNCTION "public"."rotate_recently_active"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rotate_recently_active"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rotate_recently_active_real"() TO "anon";
GRANT ALL ON FUNCTION "public"."rotate_recently_active_real"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rotate_recently_active_real"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_challenge_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_challenge_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_challenge_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_progress"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_progress"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_progress"("user_uuid" "uuid") TO "service_role";
























GRANT ALL ON TABLE "public"."app_config" TO "anon";
GRANT ALL ON TABLE "public"."app_config" TO "authenticated";
GRANT ALL ON TABLE "public"."app_config" TO "service_role";



GRANT ALL ON SEQUENCE "public"."app_config_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."app_config_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."app_config_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."blocks" TO "anon";
GRANT ALL ON TABLE "public"."blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."blocks" TO "service_role";



GRANT ALL ON TABLE "public"."challenges" TO "anon";
GRANT ALL ON TABLE "public"."challenges" TO "authenticated";
GRANT ALL ON TABLE "public"."challenges" TO "service_role";



GRANT ALL ON SEQUENCE "public"."challenges_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."challenges_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."challenges_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."challenges_status" TO "anon";
GRANT ALL ON TABLE "public"."challenges_status" TO "authenticated";
GRANT ALL ON TABLE "public"."challenges_status" TO "service_role";



GRANT ALL ON SEQUENCE "public"."challenges_status_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."challenges_status_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."challenges_status_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."media" TO "anon";
GRANT ALL ON TABLE "public"."media" TO "authenticated";
GRANT ALL ON TABLE "public"."media" TO "service_role";



GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_notification_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_notification_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_notification_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."post" TO "anon";
GRANT ALL ON TABLE "public"."post" TO "authenticated";
GRANT ALL ON TABLE "public"."post" TO "service_role";



GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."push_tokens" TO "anon";
GRANT ALL ON TABLE "public"."push_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."push_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."submission" TO "anon";
GRANT ALL ON TABLE "public"."submission" TO "authenticated";
GRANT ALL ON TABLE "public"."submission" TO "service_role";



GRANT ALL ON SEQUENCE "public"."submission_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."submission_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."submission_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_submitted_challenges" TO "anon";
GRANT ALL ON TABLE "public"."user_submitted_challenges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_submitted_challenges" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_submitted_challenges_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_submitted_challenges_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_submitted_challenges_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























drop extension if exists "pg_net";

create extension if not exists "pg_net" with schema "public";

alter table "public"."challenges" drop constraint "challenges_difficulty_check";

alter table "public"."challenges" add constraint "challenges_difficulty_check" CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))) not valid;

alter table "public"."challenges" validate constraint "challenges_difficulty_check";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "full-access-to-remove 1karuw8_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'challenge-uploads'::text));



  create policy "full-access-to-remove 1karuw8_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'challenge-uploads'::text));



  create policy "full-access-to-remove 1karuw8_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'challenge-uploads'::text));



  create policy "full-access-to-remove 1karuw8_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'challenge-uploads'::text));



