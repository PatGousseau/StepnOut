# Coaching UX

Coaching has its own app tab, separate from Sidequests.

- **Step:** current action and completion criterion, How did it go?, Make it easier, Change step, and Set aside. Reports use one form.
- **Journal:** write or record a reviewed voice entry, read previous entries and requests, and delete them. Available without an active step.
- **Goal:** goal, milestones, previous steps, and their reports.
- Events are contextual suggestions, with a model relevance check before candidate matching. No event setup or opt-in; a supported city is requested only when needed. Previously stated constraints remain respected.
- Automatic checks are serialized and cached by step, evidence, and location. Verified-source, freshness, stale-context, and acceptance checks remain enforced.
- Leaving Coaching stops microphone capture. Leaving onboarding preserves its draft.

This revision includes an automatic-event database migration and an updated matching endpoint. Deploy them together with the client; nothing has been deployed by this PR.

## Visual design

Coaching uses the existing purple palette with light lavender/white surfaces and dark text. Solid purple marks primary actions. Controls are compact (44-point minimum button height); cards use 16–18-point padding. Small native SVG illustrations distinguish Step, Journal, and Goal without adding navigation or remote image dependencies. Milestones form a connected timeline with current/completed states.

Current screenshots: [Step](polished/step.png), [Journal](polished/journal.png), [Goal](polished/goal.png), [report](polished/report.png), [onboarding](polished/onboarding.png). The `polished/` directory also covers writing, responses, voice intro, events, empty state, wide layout, and 320-point Italian screens. These are the actual components rendered with react-native-web and synthetic data, not mockups. They do not include the app's native tab bar/safe-area shell. `?voice` enables the native-only voice entry controls in the preview; it does not simulate recording hardware. Model/user fixture text remains English when previewing Italian interface labels.

The older PNGs directly in this directory are historical previous designs.

## Verification

Visual-polish revision:

- `npx eslint src/components/growthGuidance src/constants/translations.ts` passed.
- `npx jest src/utils/__tests__/growthGuidance.test.ts --watchAll=false --runInBand` passed (7 tests).
- Offline browser `check.mjs` passed for navigation, single-form reporting, journal draft retention, requests, empty-step voice, report-only Journal empty state, and event rejection.
- `screenshots.mjs` captured 15 layouts/states, checked horizontal text overflow at phone/narrow/wide sizes, and collected no browser page errors. Screenshots visually inspected.
- `npx expo export --platform all --output-dir .local/growth-guidance-verification/polished-final` produced both iOS and Android bundles.
- Two autoreview passes fixed the report-only Journal empty state; no new findings in pass two. Ledger: ignored `tmp/autoreview-ledger.md`.
- Root `npx tsc --noEmit` still reports pre-existing app/Deno configuration errors; no reported errors in changed guidance components or translations.

To reproduce the offline browser checks, start `node tests/growth-guidance-preview/preview.mjs [esbuild-module-path]`, then run `node tests/growth-guidance-preview/check.mjs [playwright-module-path]` and `node tests/growth-guidance-preview/screenshots.mjs [playwright-module-path]`. Set `CHROME_PATH` if using an installed Chrome instead of Playwright's bundled browser. No backend, analytics, model, or microphone requests are made.

The earlier structural revision also passed Deno event tests (6), endpoint type checking, and local rolled-back SQL event/cache tests. This visual increment does not change backend code. Native recording hardware and live-model relevance quality remain unverified. Nothing deployed.
