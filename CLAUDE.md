# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StepnOut is a React Native mobile app (iOS and Android) that helps users step outside their comfort zone through weekly challenges. Users complete challenges by posting photos/videos to a community feed.

## Common Commands

```bash
# Development
npx expo start           # Start dev server
npx expo run:ios         # Run on iOS simulator
npx expo run:android     # Run on Android emulator

# Testing & Linting
npm test                 # Run Jest tests (watch mode)
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint issues

# Building with EAS
eas build --profile development  # Dev build
eas build --profile preview      # Preview/internal build
eas build --profile production   # Production build
```

## Architecture

### Tech Stack
- **Framework**: React Native + Expo SDK 54
- **Navigation**: Expo Router (file-based routing in `src/app/`)
- **Backend**: Supabase (Auth, Database, Storage)
- **State**: React Context API + TanStack React Query for server state
- **Analytics**: PostHog

### Directory Structure
```
src/
├── app/                    # Expo Router file-based routes
│   ├── (auth)/            # Auth screens (login, register, onboarding)
│   ├── (tabs)/            # Main tab screens (home, challenge, profile, admin)
│   ├── post/[id].tsx      # Dynamic post detail route
│   ├── profile/[id].tsx   # Dynamic profile route
│   └── challenge/[id].tsx # Dynamic challenge route
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── services/              # API/business logic layer
├── lib/                   # External service configs (Supabase, PostHog)
├── constants/             # Colors, styles, translations
├── types.ts               # TypeScript interfaces
└── models/                # Data models
```

### Key Patterns

**Data Fetching**: Uses TanStack React Query with infinite scroll pagination. See `useFetchHomeData.ts` for the pattern - uses `useInfiniteQuery` for posts and `useQueries` for parallel user fetches.

**Authentication**: `AuthContext` wraps the app, uses Supabase Auth with SecureStore for token persistence. Supports email/password and Google OAuth.

**Internationalization**: `LanguageContext` with `t()` function. English is the source language; Italian translations live in `src/constants/translations.ts`. Pattern: `t('Key text')` returns Italian if locale is 'it', otherwise returns the key.

**Services Layer**: Business logic in `src/services/` (postService, profileService, etc.) that wraps Supabase queries.

**Likes System**: Generic `LikeableItem` type supports likes on both posts and comments. `LikesContext` manages optimistic updates.

### Supabase Schema (Key Tables)
- `profiles` - User profiles (linked to auth.users)
- `post` - User posts (challenge submissions or discussion posts)
- `challenges` - Weekly challenges with difficulty levels
- `comments` - Post comments
- `likes` - Polymorphic (post_id or comment_id)
- `notifications` - In-app notifications
- `blocks` / `reports` - Moderation

### Environment Variables
Copy `.env.example` to `.env` and fill in values. Key vars:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `EXPO_PUBLIC_POSTHOG_API_KEY` - PostHog analytics
- `EXPO_PUBLIC_POSTHOG_HOST` - PostHog host (EU instance)
- `EXPO_PUBLIC_POSTHOG_DISABLED` - Disable analytics in dev

## Local Supabase Development

### Prerequisites
- Docker (must be running)
- Supabase CLI: `brew install supabase/tap/supabase`

### Setup
```bash
# Start local Supabase (runs Postgres, Auth, Storage, etc.)
supabase start

# This outputs local credentials - use these in your .env:
# API URL: http://127.0.0.1:54321
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Switch Between Local and Production
Edit `.env` to toggle:
```bash
# Local development
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Production (get from Supabase dashboard)
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Useful Commands
```bash
supabase start      # Start local Supabase
supabase stop       # Stop local Supabase
supabase status     # Show running services and credentials
supabase db reset   # Reset DB and re-run all migrations

# Migrations
supabase migration new <name>    # Create new migration
supabase db push                 # Push migrations to production (careful!)
supabase db pull                 # Pull remote schema changes
```

### Local Dashboard
When running locally, access Supabase Studio at: http://127.0.0.1:54323
