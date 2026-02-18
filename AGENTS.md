# Repository Guidelines

## Project Structure & Module Organization
- `src/` is the app source for the Expo Router setup.
- `src/app/` contains file-based routes: `(auth)/`, `(tabs)/`, and dynamic screens like `post/[id].tsx` or `profile/[id].tsx`.
- `src/components/` holds reusable UI, `src/hooks/` has custom hooks, and `src/contexts/` stores global providers.
- `src/services/` is the data/business layer that wraps Supabase calls; `src/lib/` contains service clients and configuration.
- `src/constants/` stores theme values and translations; `src/models/` and `src/types.ts` define shared data shapes.
- `src/utils/` contains shared helpers, while `src/assets/` and `public/` store images and static assets.
- `supabase/` contains local Supabase config, migrations, and seed scripts.
- `tests/` currently houses load-testing scripts (see `tests/k6/`).

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run start` starts the Expo dev server.
- `npm run ios` launches the iOS simulator build.
- `npm run android` launches the Android emulator build.
- `npm run web` starts the web build.
- `npm test` runs Jest in watch mode (preset `jest-expo`).
- `npm run lint` runs ESLint; `npm run lint:fix` auto-fixes issues.
- `npm run db:start` / `npm run db:stop` start or stop local Supabase.
- `npm run db:reset` resets DB and re-seeds storage.
- `npm run db:new` / `npm run db:up` / `npm run db:push` manage migrations.

## Coding Style & Naming Conventions
- TypeScript-first codebase; use `.ts`/`.tsx` for new files.
- Indentation is 2 spaces; keep imports sorted and concise.
- ESLint is configured with React, React Hooks, React Native, and TypeScript rules. Fix warnings before shipping.
- Prefer descriptive component names (PascalCase) and hook names starting with `use`.
- All user-facing strings must go through `t()`; English strings are the keys, and Italian translations live in `src/constants/translations.ts`.

## Testing Guidelines
- Jest is configured via `jest-expo`; run with `npm test`.
- Load testing uses k6 scripts in `tests/k6/` (e.g., `k6 run tests/k6/fetchHomeData.js`).
- If adding unit tests, follow the common `*.test.ts(x)` naming pattern and keep tests close to the feature.

## Commit & Pull Request Guidelines
- Recent commits use short, imperative, lowercase summaries (e.g., `fix android build`, `add y axis tick labels`). Follow that style.
- PRs should include a clear description, testing notes (commands run), and screenshots or screen recordings for UI changes.
- Link related issues or tasks when applicable.

## Configuration & Secrets
- Environment values live in `.env` (Expo public keys for Supabase and analytics). Do not commit sensitive secrets.
- For local Supabase, start services with `npm run db:start` and point Expo env vars at `http://127.0.0.1:54321`.
