-- Seed data for local development
-- Run with: supabase db reset

-- =============================================================================
-- USERS (auth.users + profiles)
-- Password for all test users: "password123"
-- Note: A trigger auto-creates profiles when auth.users are inserted
-- =============================================================================

-- Create auth users (trigger will auto-create basic profiles)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'charlie@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '', ''),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '', '');

-- Create identities for users (required for auth to work)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub": "11111111-1111-1111-1111-111111111111", "email": "alice@test.com"}', 'email', '11111111-1111-1111-1111-111111111111', now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub": "22222222-2222-2222-2222-222222222222", "email": "bob@test.com"}', 'email', '22222222-2222-2222-2222-222222222222', now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub": "33333333-3333-3333-3333-333333333333", "email": "charlie@test.com"}', 'email', '33333333-3333-3333-3333-333333333333', now(), now()),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '{"sub": "44444444-4444-4444-4444-444444444444", "email": "admin@test.com"}', 'email', '44444444-4444-4444-4444-444444444444', now(), now());

-- =============================================================================
-- MEDIA (placeholder entries for posts, challenges, and profiles)
-- =============================================================================

INSERT INTO public.media (id, file_path, thumbnail_path, upload_status, created_at)
VALUES
  -- Post images
  (1, 'image/seed_1.jpg', null, 'completed', now() - interval '20 days'),
  (2, 'image/seed_2.jpg', null, 'completed', now() - interval '18 days'),
  (3, 'image/seed_3.jpg', null, 'completed', now() - interval '15 days'),
  (4, 'image/seed_4.jpg', null, 'completed', now() - interval '10 days'),
  (5, 'image/seed_5.jpg', null, 'completed', now() - interval '5 days'),
  (6, 'video/seed_6.mp4', 'thumbnails/video/seed_6.jpg', 'completed', now() - interval '3 days'),
  -- Challenge images
  (7, 'image/seed_1.jpg', null, 'completed', now() - interval '21 days'),
  (8, 'image/seed_2.jpg', null, 'completed', now() - interval '14 days'),
  (9, 'image/seed_3.jpg', null, 'completed', now() - interval '7 days'),
  -- Profile images
  (10, 'image/seed_4.jpg', null, 'completed', now() - interval '30 days'),
  (11, 'image/seed_5.jpg', null, 'completed', now() - interval '25 days'),
  (12, 'image/seed_6.jpg', null, 'completed', now() - interval '20 days'),
  (13, 'image/seed_1.jpg', null, 'completed', now() - interval '60 days');

SELECT setval('public.media_id_seq', (SELECT MAX(id) FROM public.media));

-- Update profiles with full data (trigger created basic profiles)
UPDATE public.profiles SET username = 'alice', name = 'Alice Johnson', is_admin = false, first_login = false, eula_accepted = true, profile_media_id = 10 WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET username = 'bob', name = 'Bob Smith', is_admin = false, first_login = false, eula_accepted = true, profile_media_id = 11 WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET username = 'charlie', name = 'Charlie Brown', is_admin = false, first_login = false, eula_accepted = true, profile_media_id = 12 WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET username = 'admin', name = 'Admin User', is_admin = true, first_login = false, eula_accepted = true, profile_media_id = 13 WHERE id = '44444444-4444-4444-4444-444444444444';

-- =============================================================================
-- CHALLENGES
-- =============================================================================

INSERT INTO public.challenges (id, title, title_it, description, description_it, difficulty, created_by, is_active, image_media_id, created_at, updated_at)
VALUES
  (1, 'Talk to a stranger', 'Parla con uno sconosciuto', 'Start a conversation with someone you don''t know. It could be at a coffee shop, in line at the store, or anywhere else.', 'Inizia una conversazione con qualcuno che non conosci. Potrebbe essere in un bar, in fila al negozio o in qualsiasi altro posto.', 'easy', '44444444-4444-4444-4444-444444444444', false, 7, now() - interval '21 days', now() - interval '14 days'),
  (2, 'Try a new food', 'Prova un nuovo cibo', 'Order something you''ve never tried before at a restaurant. Step outside your comfort zone with your taste buds!', 'Ordina qualcosa che non hai mai provato prima al ristorante. Esci dalla tua zona di comfort con le tue papille gustative!', 'easy', '44444444-4444-4444-4444-444444444444', false, 8, now() - interval '14 days', now() - interval '7 days'),
  (3, 'Public speaking', 'Parlare in pubblico', 'Give a short speech or presentation in front of at least 3 people. Share something you''re passionate about!', 'Fai un breve discorso o presentazione davanti ad almeno 3 persone. Condividi qualcosa che ti appassiona!', 'hard', '44444444-4444-4444-4444-444444444444', true, 9, now() - interval '7 days', now());

SELECT setval('public.challenges_id_seq', (SELECT MAX(id) FROM public.challenges));

-- =============================================================================
-- POSTS (challenge submissions and discussion posts)
-- =============================================================================

-- Challenge 1 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'I talked to someone at the coffee shop today! We ended up chatting for 20 minutes about travel. Such a great experience!', 1, 1, false, false, now() - interval '20 days'),
  (2, '22222222-2222-2222-2222-222222222222', 'Met a fellow dog owner at the park. Turns out we live on the same street! 🐕', 1, 2, false, true, now() - interval '19 days');

-- Challenge 2 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (3, '11111111-1111-1111-1111-111111111111', 'Tried sushi for the first time! I was nervous but it was actually delicious 🍣', 2, 3, false, false, now() - interval '12 days'),
  (4, '33333333-3333-3333-3333-333333333333', 'Finally tried Ethiopian food. The injera bread was so unique!', 2, 4, false, false, now() - interval '10 days');

-- Challenge 3 submissions (current active challenge)
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (5, '22222222-2222-2222-2222-222222222222', 'Gave a presentation at work today about my hobby project. Hands were shaking but I did it! 💪', 3, 5, false, false, now() - interval '3 days');

-- Discussion posts (no challenge)
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (6, '33333333-3333-3333-3333-333333333333', 'This app has really helped me push my boundaries. What''s been your favorite challenge so far?', null, null, false, false, now() - interval '8 days'),
  (7, '11111111-1111-1111-1111-111111111111', 'Feeling nervous about this week''s challenge but I''m going to do it!', null, null, false, false, now() - interval '2 days');

-- Welcome posts
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (8, '33333333-3333-3333-3333-333333333333', '', null, null, true, false, now() - interval '20 days');

SELECT setval('public.post_id_seq', (SELECT MAX(id) FROM public.post));

-- =============================================================================
-- COMMENTS
-- =============================================================================

INSERT INTO public.comments (id, post_id, user_id, body, created_at)
VALUES
  (1, 1, '22222222-2222-2222-2222-222222222222', 'That''s awesome! I need to try this too.', now() - interval '19 days'),
  (2, 1, '33333333-3333-3333-3333-333333333333', 'Love hearing these stories! ❤️', now() - interval '19 days'),
  (3, 2, '11111111-1111-1111-1111-111111111111', 'That''s such a cool coincidence!', now() - interval '18 days'),
  (4, 3, '22222222-2222-2222-2222-222222222222', 'Welcome to the sushi club! 🍣', now() - interval '11 days'),
  (5, 5, '11111111-1111-1111-1111-111111111111', 'So proud of you! That takes courage.', now() - interval '2 days'),
  (6, 5, '33333333-3333-3333-3333-333333333333', 'You''re inspiring me to try this challenge!', now() - interval '2 days'),
  (7, 6, '11111111-1111-1111-1111-111111111111', 'The stranger challenge was my favorite - it really opened my eyes!', now() - interval '7 days'),
  (8, 6, '22222222-2222-2222-2222-222222222222', 'Same here! Each one gets a little easier.', now() - interval '7 days');

SELECT setval('public.comments_id_seq', (SELECT MAX(id) FROM public.comments));

-- =============================================================================
-- LIKES
-- =============================================================================

INSERT INTO public.likes (id, post_id, comment_id, user_id, created_at)
VALUES
  -- Post likes
  (1, 1, null, '22222222-2222-2222-2222-222222222222', now() - interval '19 days'),
  (2, 1, null, '33333333-3333-3333-3333-333333333333', now() - interval '19 days'),
  (3, 1, null, '44444444-4444-4444-4444-444444444444', now() - interval '18 days'),
  (4, 2, null, '11111111-1111-1111-1111-111111111111', now() - interval '18 days'),
  (5, 2, null, '33333333-3333-3333-3333-333333333333', now() - interval '18 days'),
  (6, 3, null, '22222222-2222-2222-2222-222222222222', now() - interval '11 days'),
  (7, 4, null, '11111111-1111-1111-1111-111111111111', now() - interval '9 days'),
  (8, 5, null, '11111111-1111-1111-1111-111111111111', now() - interval '2 days'),
  (9, 5, null, '33333333-3333-3333-3333-333333333333', now() - interval '2 days'),
  (10, 5, null, '44444444-4444-4444-4444-444444444444', now() - interval '2 days'),
  (11, 6, null, '11111111-1111-1111-1111-111111111111', now() - interval '7 days'),
  (12, 6, null, '22222222-2222-2222-2222-222222222222', now() - interval '7 days'),
  -- Comment likes
  (13, null, 1, '11111111-1111-1111-1111-111111111111', now() - interval '18 days'),
  (14, null, 5, '22222222-2222-2222-2222-222222222222', now() - interval '2 days');

SELECT setval('public.likes_id_seq', (SELECT MAX(id) FROM public.likes));

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

INSERT INTO public.notifications (notification_id, user_id, trigger_user_id, post_id, comment_id, action_type, is_read, created_at)
VALUES
  (1, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1, null, 'like', true, now() - interval '19 days'),
  (2, '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 1, null, 'like', true, now() - interval '19 days'),
  (3, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1, 1, 'comment', true, now() - interval '19 days'),
  (4, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 5, null, 'like', false, now() - interval '2 days'),
  (5, '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 5, null, 'like', false, now() - interval '2 days'),
  (6, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 5, 5, 'comment', false, now() - interval '2 days');

SELECT setval('public.notifications_notification_id_seq', (SELECT MAX(notification_id) FROM public.notifications));

-- =============================================================================
-- APP_CONFIG
-- =============================================================================

INSERT INTO public.app_config (id, key, value, created_at)
VALUES
  (1, 'share_link', 'https://linktr.ee/stepnout', now());

SELECT setval('public.app_config_id_seq', (SELECT MAX(id) FROM public.app_config));
