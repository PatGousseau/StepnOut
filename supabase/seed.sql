-- Seed data for local development
-- Run with: supabase db reset

-- =============================================================================
-- USERS (auth.users + profiles)
-- Password for all test users: "password123"
-- Note: A trigger auto-creates profiles when auth.users are inserted
-- =============================================================================

-- Create auth users (trigger will auto-create basic profiles)
-- Note: String columns cannot be NULL in GoTrue, must use empty strings (except phone which has unique constraint)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data
)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '', '{"provider": "email", "providers": ["email"]}', '{}'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '', '{"provider": "email", "providers": ["email"]}', '{}'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'charlie@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '', '{"provider": "email", "providers": ["email"]}', '{}'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '', '{"provider": "email", "providers": ["email"]}', '{}');

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
  (13, 'image/seed_1.jpg', null, 'completed', now() - interval '60 days'),
  -- Extra post images
  (14, 'image/seed_2.jpg', null, 'completed', now() - interval '18 days'),
  (15, 'image/seed_3.jpg', null, 'completed', now() - interval '17 days'),
  (16, 'image/seed_4.jpg', null, 'completed', now() - interval '11 days'),
  (17, 'image/seed_5.jpg', null, 'completed', now() - interval '9 days'),
  (18, 'image/seed_6.jpg', null, 'completed', now() - interval '4 days'),
  (19, 'image/seed_1.jpg', null, 'completed', now() - interval '2 days');

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

-- More challenge 1 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (9, '33333333-3333-3333-3333-333333333333', 'Asked for directions even though I had Google Maps open. Baby steps right? 😅', 1, 14, false, false, now() - interval '18 days'),
  (10, '44444444-4444-4444-4444-444444444444', 'Complimented a stranger on their jacket. They looked so happy it made my whole day.', 1, 15, false, false, now() - interval '17 days');

-- More challenge 2 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (11, '22222222-2222-2222-2222-222222222222', 'Tried durian. I will not be doing that again. 0/10 experience but 10/10 for stepping out of my comfort zone', 2, 16, false, false, now() - interval '11 days'),
  (12, '44444444-4444-4444-4444-444444444444', 'Had crickets at a food festival! Crunchy but honestly not bad with hot sauce 🦗', 2, 17, false, true, now() - interval '9 days');

-- More challenge 3 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (13, '11111111-1111-1111-1111-111111111111', 'Spoke up at a community meeting for the first time. My voice was shaking but people actually agreed with my point!', 3, 18, false, false, now() - interval '4 days'),
  (14, '33333333-3333-3333-3333-333333333333', 'Did a toast at my friend''s birthday dinner. 15 people staring at me. Survived.', 3, 19, false, false, now() - interval '2 days'),
  (15, '44444444-4444-4444-4444-444444444444', 'Led the standup at work today instead of just listening. Small win but it counts!', 3, null, false, false, now() - interval '1 day');

-- More discussion posts
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (16, '22222222-2222-2222-2222-222222222222', 'Hot take: the easy challenges are actually harder than the hard ones because you have no excuse not to do them', null, null, false, false, now() - interval '15 days'),
  (17, '44444444-4444-4444-4444-444444444444', 'What do you all do when you feel like chickening out? I need strategies lol', null, null, false, false, now() - interval '6 days'),
  (18, '11111111-1111-1111-1111-111111111111', 'Just realized I''ve done 5 challenges in a row without skipping. Who even am I anymore??', null, null, false, false, now() - interval '4 days'),
  (19, '33333333-3333-3333-3333-333333333333', 'The growth is real. I used to dread Mondays because of new challenges. Now I look forward to them.', null, null, false, false, now() - interval '1 day'),
  (20, '22222222-2222-2222-2222-222222222222', 'Anyone else feel like this app is basically free therapy? 😂', null, null, false, false, now() - interval '6 hours');

-- Challenge submissions with default body (no custom text)
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (21, '44444444-4444-4444-4444-444444444444', 'Just completed this week''s challenge!', 1, null, false, false, now() - interval '16 days'),
  (22, '33333333-3333-3333-3333-333333333333', 'Just completed this week''s challenge!', 2, null, false, false, now() - interval '8 days'),
  (23, '11111111-1111-1111-1111-111111111111', 'Just completed this week''s challenge!', 3, null, false, false, now() - interval '1 day');

-- Welcome posts
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (8, '33333333-3333-3333-3333-333333333333', '', null, null, true, false, now() - interval '20 days'),
  (24, '11111111-1111-1111-1111-111111111111', '', null, null, true, false, now() - interval '19 days'),
  (25, '22222222-2222-2222-2222-222222222222', '', null, null, true, false, now() - interval '15 days'),
  (26, '44444444-4444-4444-4444-444444444444', '', null, null, true, false, now() - interval '12 days'),
  (27, '33333333-3333-3333-3333-333333333333', '', null, null, true, false, now() - interval '6 days'),
  (28, '22222222-2222-2222-2222-222222222222', '', null, null, true, false, now() - interval '3 days'),
  (29, '11111111-1111-1111-1111-111111111111', '', null, null, true, false, now() - interval '1 day');

SELECT setval('public.post_id_seq', (SELECT MAX(id) FROM public.post));

-- =============================================================================
-- COMMENTS
-- =============================================================================

INSERT INTO public.comments (id, post_id, user_id, body, parent_comment_id, created_at)
VALUES
  (1, 1, '22222222-2222-2222-2222-222222222222', 'That''s awesome! I need to try this too.', null, now() - interval '19 days'),
  (2, 1, '33333333-3333-3333-3333-333333333333', 'Love hearing these stories! ❤️', null, now() - interval '19 days'),
  (3, 2, '11111111-1111-1111-1111-111111111111', 'That''s such a cool coincidence!', null, now() - interval '18 days'),
  (4, 3, '22222222-2222-2222-2222-222222222222', 'Welcome to the sushi club! 🍣', null, now() - interval '11 days'),
  (5, 5, '11111111-1111-1111-1111-111111111111', 'So proud of you! That takes courage.', null, now() - interval '2 days'),
  (6, 5, '33333333-3333-3333-3333-333333333333', 'You''re inspiring me to try this challenge!', null, now() - interval '2 days'),
  (7, 6, '11111111-1111-1111-1111-111111111111', 'The stranger challenge was my favorite - it really opened my eyes!', null, now() - interval '7 days'),
  (8, 6, '22222222-2222-2222-2222-222222222222', 'Same here! Each one gets a little easier.', null, now() - interval '7 days'),
  (9, 5, '22222222-2222-2222-2222-222222222222', 'facts. first time is always the scariest.', 5, now() - interval '2 days' + interval '5 minutes'),
  (10, 5, '44444444-4444-4444-4444-444444444444', 'fr, and you nailed it.', 9, now() - interval '2 days' + interval '10 minutes'),
  (11, 6, '33333333-3333-3333-3333-333333333333', 'same, it felt weirdly empowering.', 7, now() - interval '7 days' + interval '20 minutes'),
  (12, 6, '11111111-1111-1111-1111-111111111111', 'lol yep, exposure therapy but wholesome', 11, now() - interval '7 days' + interval '30 minutes'),
  -- Comments on new posts
  (13, 9, '11111111-1111-1111-1111-111111111111', 'Haha that totally counts!', null, now() - interval '17 days'),
  (14, 10, '22222222-2222-2222-2222-222222222222', 'This is so wholesome', null, now() - interval '16 days'),
  (15, 10, '33333333-3333-3333-3333-333333333333', 'Making someone''s day is the best feeling', null, now() - interval '16 days'),
  (16, 10, '11111111-1111-1111-1111-111111111111', 'I''m stealing this idea', null, now() - interval '16 days'),
  (17, 11, '11111111-1111-1111-1111-111111111111', 'LMAO the honesty 😂', null, now() - interval '10 days'),
  (18, 11, '33333333-3333-3333-3333-333333333333', 'durian is an acquired taste... that I will never acquire', null, now() - interval '10 days'),
  (19, 12, '11111111-1111-1111-1111-111111111111', 'ok but hot sauce makes everything edible', null, now() - interval '8 days'),
  (20, 12, '22222222-2222-2222-2222-222222222222', 'you are braver than any marine', null, now() - interval '8 days'),
  (21, 12, '33333333-3333-3333-3333-333333333333', 'the real challenge was keeping it down 😂', null, now() - interval '8 days'),
  (22, 13, '22222222-2222-2222-2222-222222222222', 'That takes guts! Proud of you', null, now() - interval '3 days'),
  (23, 13, '33333333-3333-3333-3333-333333333333', 'speaking truth to power 💪', null, now() - interval '3 days'),
  (24, 13, '44444444-4444-4444-4444-444444444444', 'this is exactly what this challenge is about', null, now() - interval '3 days'),
  (25, 14, '11111111-1111-1111-1111-111111111111', 'toasts are TERRIFYING, well done', null, now() - interval '1 day'),
  (26, 14, '22222222-2222-2222-2222-222222222222', 'your friend is lucky to have you', null, now() - interval '1 day'),
  (27, 16, '11111111-1111-1111-1111-111111111111', 'THIS. the easy ones haunt me more', null, now() - interval '14 days'),
  (28, 16, '33333333-3333-3333-3333-333333333333', 'facts, no hiding behind "it''s too hard"', null, now() - interval '14 days'),
  (29, 16, '44444444-4444-4444-4444-444444444444', 'never thought of it that way but you''re right', null, now() - interval '13 days'),
  (30, 16, '11111111-1111-1111-1111-111111111111', 'exactly why I skip the easy ones... wait', 28, now() - interval '13 days'),
  (31, 17, '11111111-1111-1111-1111-111111111111', 'I count down from 5 and just GO before my brain catches up', null, now() - interval '5 days'),
  (32, 17, '33333333-3333-3333-3333-333333333333', 'I tell myself "future me will be grateful"', null, now() - interval '5 days'),
  (33, 17, '22222222-2222-2222-2222-222222222222', 'honestly just opening this app helps. seeing everyone else doing scary stuff', null, now() - interval '5 days'),
  (34, 18, '22222222-2222-2222-2222-222222222222', 'character development arc 🔥', null, now() - interval '3 days'),
  (35, 18, '33333333-3333-3333-3333-333333333333', 'you''re a different person and we love to see it', null, now() - interval '3 days'),
  (36, 19, '11111111-1111-1111-1111-111111111111', 'same!! the dread turned into excitement somehow', null, now() - interval '12 hours'),
  (37, 19, '22222222-2222-2222-2222-222222222222', 'growth mindset activated', null, now() - interval '10 hours'),
  (38, 20, '11111111-1111-1111-1111-111111111111', 'lol cheaper than therapy at least', null, now() - interval '4 hours'),
  (39, 20, '33333333-3333-3333-3333-333333333333', 'my therapist would approve tbh', null, now() - interval '3 hours'),
  (40, 20, '44444444-4444-4444-4444-444444444444', 'we should add "go to actual therapy" as a challenge 😂', null, now() - interval '2 hours');

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
  -- Post 10 (compliment stranger) - lots of likes, old = high popular score
  (13, 10, null, '11111111-1111-1111-1111-111111111111', now() - interval '16 days'),
  (14, 10, null, '22222222-2222-2222-2222-222222222222', now() - interval '16 days'),
  (15, 10, null, '33333333-3333-3333-3333-333333333333', now() - interval '16 days'),
  -- Post 12 (crickets) - heavily liked
  (16, 12, null, '11111111-1111-1111-1111-111111111111', now() - interval '8 days'),
  (17, 12, null, '22222222-2222-2222-2222-222222222222', now() - interval '8 days'),
  (18, 12, null, '33333333-3333-3333-3333-333333333333', now() - interval '8 days'),
  (19, 12, null, '44444444-4444-4444-4444-444444444444', now() - interval '7 days'),
  -- Post 13 (community meeting) - well liked + many comments
  (20, 13, null, '22222222-2222-2222-2222-222222222222', now() - interval '3 days'),
  (21, 13, null, '33333333-3333-3333-3333-333333333333', now() - interval '3 days'),
  (22, 13, null, '44444444-4444-4444-4444-444444444444', now() - interval '3 days'),
  -- Post 16 (hot take) - most popular discussion post
  (23, 16, null, '11111111-1111-1111-1111-111111111111', now() - interval '14 days'),
  (24, 16, null, '22222222-2222-2222-2222-222222222222', now() - interval '14 days'),
  (25, 16, null, '33333333-3333-3333-3333-333333333333', now() - interval '13 days'),
  (26, 16, null, '44444444-4444-4444-4444-444444444444', now() - interval '13 days'),
  -- Post 17 (chickening out) - well liked
  (27, 17, null, '11111111-1111-1111-1111-111111111111', now() - interval '5 days'),
  (28, 17, null, '22222222-2222-2222-2222-222222222222', now() - interval '5 days'),
  (29, 17, null, '33333333-3333-3333-3333-333333333333', now() - interval '5 days'),
  -- Post 18 (5 in a row)
  (30, 18, null, '22222222-2222-2222-2222-222222222222', now() - interval '3 days'),
  (31, 18, null, '44444444-4444-4444-4444-444444444444', now() - interval '3 days'),
  -- Post 19 (growth is real) - recent + liked
  (32, 19, null, '11111111-1111-1111-1111-111111111111', now() - interval '12 hours'),
  (33, 19, null, '22222222-2222-2222-2222-222222222222', now() - interval '10 hours'),
  (34, 19, null, '44444444-4444-4444-4444-444444444444', now() - interval '8 hours'),
  -- Post 20 (free therapy) - very recent, some likes
  (35, 20, null, '11111111-1111-1111-1111-111111111111', now() - interval '4 hours'),
  (36, 20, null, '33333333-3333-3333-3333-333333333333', now() - interval '3 hours'),
  -- Post 14 (toast)
  (37, 14, null, '11111111-1111-1111-1111-111111111111', now() - interval '1 day'),
  (38, 14, null, '44444444-4444-4444-4444-444444444444', now() - interval '1 day'),
  -- Post 15 (standup) - barely liked, text only
  (39, 15, null, '22222222-2222-2222-2222-222222222222', now() - interval '12 hours'),
  -- Comment likes
  (40, null, 1, '11111111-1111-1111-1111-111111111111', now() - interval '18 days'),
  (41, null, 5, '22222222-2222-2222-2222-222222222222', now() - interval '2 days'),
  (42, null, 17, '22222222-2222-2222-2222-222222222222', now() - interval '10 days'),
  (43, null, 20, '11111111-1111-1111-1111-111111111111', now() - interval '8 days'),
  (44, null, 27, '22222222-2222-2222-2222-222222222222', now() - interval '13 days'),
  (45, null, 31, '33333333-3333-3333-3333-333333333333', now() - interval '4 days'),
  (46, null, 40, '11111111-1111-1111-1111-111111111111', now() - interval '1 hour');

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
