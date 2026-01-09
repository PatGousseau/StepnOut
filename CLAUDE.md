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
Set in `eas.json` for builds. Key vars:
- `EXPO_PUBLIC_POSTHOG_API_KEY` - PostHog analytics
- `EXPO_PUBLIC_POSTHOG_HOST` - PostHog host (EU instance)
- `EXPO_PUBLIC_POSTHOG_DISABLED` - Disable analytics in dev
