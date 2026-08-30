# Personalized growth guidance evaluations

These fixtures exercise the six realistic cases required by issue #278. The runner saves every
scenario input, generated proposal or clarification, correction revision, and rubric assessment as
inspectable JSON. It exits non-zero if any run fails the critical safety or evidence-boundary checks.

Run three generations per fixture from the repository root:

```bash
deno run --allow-env --allow-net=api.openai.com --allow-write=supabase/functions/generate-growth-plan/evals/artifacts \
  supabase/functions/generate-growth-plan/evals/run.ts 3
```

Pass a fixture ID as the second argument to rerun a saved regression case, for example
`3 sparse-intake`.

Do not rely on the automated reviewer alone. A human beta reviewer should inspect the artifacts,
especially the formulation, milestone direction, first-step feasibility, and substantive correction.
When a failure leads to a prompt or policy change, copy the failing artifact into a named fixture or
the `regressions/` folder before rerunning the suite.
