# Growth adaptation evaluations

These longitudinal fixtures cover the seven required issue #280 timelines. Each
generated artifact retains the original intake, confirmed plan, active step,
chronological user evidence, earlier model responses (explicitly separated from
evidence), generated response, proposed state change, confirmation state, and a
rubric judgment.

Run three generations per timeline from the repository root:

```bash
deno run --allow-env --allow-net=api.openai.com --allow-write=supabase/functions/adapt-growth-plan/evals/artifacts \
  supabase/functions/adapt-growth-plan/evals/run.ts 3
```

Pass a fixture ID as the second argument to rerun one case. Preserve any
discovered failure as a named fixture before changing the prompt. A human beta
reviewer should inspect the artifacts; schema validity and the automated judge
are not sufficient acceptance criteria.
