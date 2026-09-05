# Event selection regressions

- Early mini-model runs relaxed weekday-only availability because the Saturday event was the only candidate. Keep `budget-timing-mismatch`; supply explicit local weekday/time and require constraints even with one candidate.
- Mini `v1.2` passed all 24 selection judgments but invented accessible ordinary venues and misread weekdays where the unknown-access fixture omitted formatted local time. Apply identical context formatting to every fixture; inspect explanations, not only selected IDs.
- Mini `v1.3` overchallenge run 3 selected a group despite “No group participation yet,” invented a companion, and reinterpreted the boundary. Retain this fixture and use `gpt-4.1`; all three final samples reject the group.
- Stronger-model `v1.3` accessible run 1 suggested repeated attendance without evidence. `v1.4` supplies explicit attendance scope: only the dated occurrence is verified, with benefit limited to a first introduction.
- The original rejection fixture invented free-text feedback absent from the UI. Final fixture uses the exact production shape: `rejection_reason` plus nested event title/category/location. All three final samples reject a materially similar format without inventing a broader preference.

The final baseline documents the checked sample, not a guarantee that model failures are impossible. Hard source, freshness, cost, distance, wheelchair, snapshot and ownership constraints are independently enforced in SQL.
