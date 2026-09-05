# Event selection evaluations

Run `deno run --no-lock --env-file=.env --allow-env --allow-net=api.openai.com --allow-write=supabase/functions/find-growth-event/evals/artifacts supabase/functions/find-growth-event/evals/run.ts 3` from the repository root.

All eight fixtures are synthetic. They cover useful accessible small-city inventory, workplace and creative goals needing no event, a better ordinary setting, timing mismatch, unknown accessibility, prior rejection feedback, and overchallenge. Outputs, exact prompt/model versions, input evidence, and deterministic selection judgments are retained for inspection. Read every output for grounding, feasibility, meaningful controllable criteria, and tone; selection checks do not establish overall guidance quality. Persistence/freshness/radius/deletion and confirmation are verified separately in the SQL suite. No fixture data is imported into deployed inventory.
