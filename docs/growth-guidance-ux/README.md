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

The September 7 Impeccable refinement applies its task-focused (Operate) guidance within the existing StepnOut identity: native system reading type, a tighter weight hierarchy, quieter secondary actions, and fewer ornamental containers. Purple marks primary actions and selected states; warm off-white remains the app canvas. Only the completion criterion and current focus use a pale tint. Milestones retain their meaningful sequence and current/completed states. Decorative illustrations were removed; no remote assets or extra dependencies are needed.

Buttons use 44-point iOS / 48-point Android minimum touch targets. Shared buttons have pressed, hover, keyboard-focus, busy, and disabled states. Native text continues to follow system font scaling. Placeholder colours are strengthened for readability. Event headings explicitly wrap alongside their icon at enlarged sizes.

Current browser screenshots: [Step](impeccable/step.png), [Journal](impeccable/journal.png), [Goal](impeccable/goal.png), [report](impeccable/report.png), [enlarged Italian event](impeccable/event-italian-large-text.png). The `impeccable/` directory also covers onboarding, writing, responses, voice intro, empty state, wide layout, and 320-point Italian screens. These are the actual components rendered with react-native-web and synthetic data, not mockups. They do not include the app's native tab bar/safe-area shell. `?voice` enables native-only voice entry controls in this preview; it does not simulate recording hardware. Model/user fixture text remains English when previewing Italian labels.

The older PNGs directly in this directory and in `polished/` are historical previous designs. Existing app-wide light appearance, navigation architecture and icon family remain unchanged; this pass does not claim a dark-mode or full native-navigation redesign.

## Verification

September 7 Impeccable refinement:

- `npx eslint src/components/growthGuidance src/constants/translations.ts` passed.
- `npx jest src/utils/__tests__/growthGuidance.test.ts --watchAll=false --runInBand` passed (7 tests).
- Offline browser `check.mjs` passed for navigation, single-form reporting, journal draft retention, requests, empty-step voice, report-only Journal empty state, and event rejection.
- `screenshots.mjs` captured 16 browser layouts/states, checked horizontal text overflow at phone/narrow/wide sizes, and collected no browser page errors. A new narrow Italian 1.5× text check verifies the event heading stays within its row. Browser scaling is supplemental, not native Dynamic Type evidence.
- `npx expo export --platform all --output-dir .local/growth-guidance-verification/impeccable-final` produced both iOS and Android bundles.
- Two autoreview passes fixed localized enlarged-text event-heading overflow; no new findings in pass two. Ledger: ignored `tmp/autoreview-ledger.md`. The prior report-only Journal fix remains covered.
- Root `npx tsc --noEmit` still reports pre-existing app/Deno configuration errors; no reported errors in changed guidance components or translations.
- Native screenshot verification is incomplete: an isolated Expo Go preview bundled on the iPhone 16 Plus simulator, but its developer overlay obstructed captures and macOS denied automated keystrokes. No obstructed captures are published as UI evidence. The simulator's text-size setting was restored to its original value. No Android emulator was running. Browser screenshots are supplemental evidence, not a native-runtime pass.

To reproduce the offline browser checks, start `node tests/growth-guidance-preview/preview.mjs [esbuild-module-path]`, then run `node tests/growth-guidance-preview/check.mjs [playwright-module-path]` and `node tests/growth-guidance-preview/screenshots.mjs [playwright-module-path]`. Set `CHROME_PATH` if using an installed Chrome instead of Playwright's bundled browser. No backend, analytics, model, or microphone requests are made.

The earlier structural revision also passed Deno event tests (6), endpoint type checking, and local rolled-back SQL event/cache tests. This visual increment does not change backend code. Native recording hardware and live-model relevance quality remain unverified. Nothing deployed.
