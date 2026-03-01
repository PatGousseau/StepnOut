StepnOut Push Notifications PRD
Goal
Build a push notification system that brings users back to the app. Mix deterministic triggers with AI-generated copy. Target 2-3 notifications per week per user.

Global Rules
All notification copy in Italian
After 14 days inactive, stop sending entirely
Store prompts as configurable templates, not hardcoded strings
Notification Types (in priority order)
1. Streak Notifications (highest priority)
Trigger: Streak at risk AI: No — hand-crafted Italian templates Frequency: At most 1/week per user (only when applicable)

If a user has an existing streak (minimum: they have completed the most recent challenge or any past challenge) and the current challenge has 2 days left but they have not completed it, send a notification warning they will lose their streak if they do not do the challenge.

Define templates for the "streak at risk" moment. Keep this as a config so new triggers are easy to add later.

2. Community Story Highlight
Trigger: Daily check for users who have not opened the app today. Select a high-quality post from last 48 hours (hottest). AI: YES — generates a shared title/body (same notification for all). Frequency: At most 1/day per user and only if they haven't already been notified about that post.

Stage 1 — Post selection (deterministic).
Reuse the existing popularity function used by the Popular tab: `public.get_popular_post_ids(...)`.
Filter to posts from the last 48 hours. Pick the top post the user hasn't already been notified about.

Stage 2 — AI copy generation. Call an LLM with:

Post author's first name, post body, challenge title
Prompt constraints: title ≤40 chars (no emoji), body ≤100 chars (max 1 emoji), reference the emotional core without quoting directly, be specific not generic motivational. All output in Italian. Output JSON.

Pre-generate every 6 hours: select the top post, generate Italian copy, store for later delivery. The generated copy is shared for all recipients (not personalized per user).

3. Personalized Nudge (lowest priority)
Trigger: User inactive 3-14 days AND has completed ≥1 challenge AI: YES — generates copy from user history Frequency: Max 1 per inactive stretch. Don't send another until user opens the app.

Eligibility (all must be true): 3-14 days since last open, ≥1 challenge completed, no nudge sent this inactive period, notifications enabled.

Data fed to AI: First name, last challenge title + category, days since last activity, total challenge count, streak before going inactive.

Prompt constraints: feel personal (reference their actual last challenge), create curiosity not guilt, warm not pushy. All output in Italian. Same JSON output format.

Fallback: If API fails or JSON is invalid, skip sending the notification (no generic fallback).

Frequency Management
No separate frequency manager for v1. Each notification type enforces its own simple limits (notified for the specific event, or at most once per inactive stretch). Avoid sending more than one notification for the same type within its window.

Data the System Needs
The agent should inspect the existing DB schema and create/modify tables as needed:

Notification log — every notification sent: recipient, type, title, body, sent_at, opened_at, ai_generated flag
User notification state — per user: last notification sent at, notifications this week count, last active at, completed challenge count, current streak
Pre-generated highlights — source post, Italian title/body, generated at, used flag (shared copy for all recipients)
Post-user tracking — which highlight posts have been sent to which users (avoid repeats)
Last open timestamp — per user `last_open_at` updated by the app when opened/foregrounded
Scheduled Jobs
Job	Schedule	Purpose
Score + pre-gen highlights	Every 6 hours	Score posts, generate AI copy
Deliver highlights	1-2x/week	Send best highlight to eligible users
Inactive user check	Daily	Find lapsing users, send nudges
Reset weekly counts	Weekly	Reset per-user counters
AI Details
Validate output: Parse JSON, check title ≤40 chars and body ≤100 chars. Fall back to template if invalid.
API key: Environment variable, never hardcode
Appendix: AI Prompt Templates
Community Highlight:

You are writing a push notification for StepnOut, a social comfort zone challenge app. A community member named {poster_first_name} just shared this story about their "{challenge_title}" challenge: "{post_body}". Write a push notification in Italian (title: max 40 chars, body: max 100 chars) that makes the reader want to open the app. Reference the story's emotional core without quoting it directly. Be specific, not generic motivational. No emojis in title. Max 1 emoji in body. Output JSON: {"title": "...", "body": "..."}

Nudge:

You're writing a re-engagement push notification for StepnOut, in Italian. User: {first_name}. Last challenge completed: "{last_challenge_title}" ({days_ago} days ago). Total challenges completed: {total_count}. Streak before going inactive: {streak_count}. Write a notification that feels personal, references what they did last time, creates gentle curiosity (not guilt), and is warm (not pushy). Output JSON: {"title": "...", "body": "..."}
