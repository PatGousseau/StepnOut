# Coaching UX

Coaching has its own app tab, separate from Sidequests.

- **Step:** current action and completion criterion, How did it go?, Make it easier, Change step, and Set aside. Reports use one form.
- **Journal:** write or record a reviewed voice entry, read previous entries and requests, and delete them. Available without an active step.
- **Goal:** goal, milestones, previous steps, and their reports.
- Events are contextual suggestions, with a model relevance check before candidate matching. No event setup or opt-in; a supported city is requested only when needed. Previously stated constraints remain respected.
- Automatic checks are serialized and cached by step, evidence, and location. Verified-source, freshness, stale-context, and acceptance checks remain enforced.
- Leaving Coaching stops microphone capture. Leaving onboarding preserves its draft.

This revision includes an automatic-event database migration and an updated matching endpoint. Deploy them together with the client; nothing has been deployed by this PR.

## Verification

Focused ESLint, Jest guidance tests (7), Deno event tests (6) and endpoint type checking, local rolled-back SQL event/cache tests, and iOS/Android bundle exports passed. Three code-review passes fixed five findings, with no new findings in the final pass. The root TypeScript check still has pre-existing app/Deno errors; changed guidance UI/services have no reported type errors.

UI verification was explicitly skipped for this revision. The PNGs in this directory are **historical screenshots of the previous design**, not evidence for the current UI. The offline preview and walkthrough are updated for future use but were not run for this revision. Native recording hardware and live-model relevance quality remain unverified in this pass.
