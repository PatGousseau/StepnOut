# Guidance: one next step, one check-in

This is a UI-only layer on top of #289. The guidance, journal, voice, and event service contracts are unchanged; there are no migrations or model changes.

## Experience

- The opening screen shows the next step and one primary action: **Check in**. No internal tabs, introductory slogans, dashboard cards, or inline adjustment menu.
- **Check in** opens a text box directly. The microphone is an alternative input on mobile. Sending opens the response; **Done** returns to the step.
- A small attempt-report link is available inside the composer. Choosing an outcome advances directly to the follow-up, then optional notes—no extra Continue buttons. Back preserves text.
- **More** contains step details, a request for a different step, the direction, past check-ins, nearby opportunities, and the latest response. Requests use free text; the user needn't choose among five kinds of guidance request.
- The plan reads as a single document with no per-milestone disclosure controls. The step's acceptance/set-aside controls live in its details, outside the everyday flow.
- Pending suggestions take precedence over a new check-in. A check-in remains available even when no step is active.
- Cross-platform dialogs protect text and event preference drafts. Switching a nonempty written draft to voice explicitly asks to discard it. Native recording/processing blocks back navigation; leaving unsaved audio/transcript edits requires confirmation.
- The intake keeps its existing questions, back navigation, and optional event disclosure. Confirming opens the step directly.

## Screenshots

These are the real components rendered with React Native Web, bundled offline with synthetic service responses and the app's font/icon assets. They are not native-device screenshots. The mobile journal/voice introduction previews simulate the platform flag; microphone APIs are stubbed and were not exercised. Italian screenshots translate UI chrome; generated fixture content intentionally stays in English.

| Next step | Check-in (mobile) | Writing |
| --- | --- | --- |
| ![Next step](today.png) | ![Check-in](journal-mobile.png) | ![Writing](write.png) |

| Check-in | Voice introduction | Direction |
| --- | --- | --- |
| ![Check-in](check-in.png) | ![Voice](voice-intro.png) | ![Direction](direction.png) |

Additional captures: [event setup](events.png), [event match](event-match.png), [change review](review-change.png), [response](response.png), [empty state](empty.png), [Italian](italian.png), [320px phone](small-phone.png).

## Verification

- `npx eslint src/components/growthGuidance/*.tsx src/constants/translations.ts`
- `npx jest src/utils/__tests__/growthGuidance.test.ts src/utils/__tests__/voiceJournal.test.ts --runInBand` — 11 tests pass.
- `npx expo export --platform ios --platform android --output-dir .local/growth-guidance-verification/ux-final-export` — both native bundles build.
- Offline browser walkthrough asserts no tabs and exactly three opening-screen buttons (Close, More, Check in). It covers text draft keep/discard, writing/voice replacement consent and successful recovered-transcript submission, no-step and dismissed-step composition, report stages/back, proposal review, all menu destinations, preference draft guards, all six event rejection reasons, event acceptance/cancel, Italian, narrow layouts, and failed-load recovery. No browser runtime errors.
- Literal translation coverage checked; all static `t()` calls in guidance components have Italian entries.
- Root `npx tsc --noEmit` remains blocked by existing app and Deno configuration/type errors outside this change. Changed feature files have no reported type errors. Removed one duplicate translation key while editing the dictionary.
- The initial UX had three review passes; this simplification revision had two further passes. Accepted draft-safety and no-step navigation findings are fixed and covered by the walkthrough; the second pass found no new issues. Ledger remains local at `tmp/autoreview-ledger.md`.

The iPhone simulator boots and has a StepnOut build installed, but an authenticated native walkthrough was not completed. Still verify physical microphone permission/recording/transcription, keyboard and accessibility behavior on iOS/Android, and live backend flows on a test account. No production data, deployments, event-source activation, or beta-readiness work is included.

## Reproduce the offline preview

Install `esbuild` and `playwright` into a temporary directory (not the app's dependencies), then run:

```sh
node tests/growth-guidance-preview/preview.mjs /absolute/path/to/esbuild/lib/main.js
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/growth-guidance-preview/check.mjs /absolute/path/to/playwright/index.js
```

The preview listens only on `127.0.0.1:4173`. Optional query flags: `?empty`, `?event`, `?voice`, and `?lang=it`. The check rewrites the screenshots in this directory. It uses synthetic in-memory service responses: it verifies UI interactions, not backend persistence or model quality.
