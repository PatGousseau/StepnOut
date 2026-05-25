# Side Quest Content Pipeline

This directory contains the scripts for generating, critiquing, and annotating side quests, plus turning the final annotated JSON into a SQL migration.

## Quest shape

Each quest has just two user-facing text fields, plus structured tags for matching:

- **`title`** — short, vivid Italian title
- **`summary`** — around two sentences. The first sentence is the quest concept; the second sentence is the concrete actions the user takes. This is the only text the user sees, so it serves as both pitch and instructions.

Older versions of this pipeline produced separate `why_it_hits` and `instructions` fields. They've been collapsed into the summary because the UI doesn't surface them distinctly.

## Pipeline overview

The pipeline runs in 4 steps. Steps 1–3 live in `generate-side-quests.mjs` under the `run` command; step 4 is `annotate`:

1. **Brainstorm seeds** — batched generation of title + summary. Each batch sees the running list of already-generated titles to avoid duplicating earlier output. Default: target × 2 raw seeds (e.g. 600 raw seeds for a target of 300).
2. **Critique** — single call over the full seed list. Rejects observation-only quests, chores, micro-purchases, "pick a favorite" gimmicks, near-duplicates, and translated American concepts. Typically keeps ~40–60% of seeds.
3. **Coverage + targeted top-ups** — lightly tags survivors along context/stretch/type/night dimensions, identifies under-covered cells, and runs one targeted generation call per gap. Capped at 6 top-up calls.
4. **Annotation** — the existing per-quest annotation step that adds the full tag schema. Runs separately via `annotate` so it's resumable.

The output of step 3 is a `<stamp>.raw.json` with just title + summary, which the annotation step then enriches with all the matching tags.

## Requirements

- Node 22+
- `OPENAI_API_KEY`

## Environment variables

| Var | Default | Purpose |
| --- | --- | --- |
| `OPENAI_MODEL` | `gpt-5.5` | Model used for all steps |
| `SIDE_QUEST_COUNT` | `300` | Target number of final quests (before critique attrition) |
| `BRAINSTORM_BATCH_SIZE` | `40` | Seeds per brainstorm batch |
| `BRAINSTORM_OVERAGE` | `2.0` | Multiplier on target to determine total raw seeds |
| `ENABLE_TOPUP` | `1` | Set to `0` to skip targeted top-up step |
| `MAX_TOPUP_CALLS` | `6` | Cap on number of top-up calls per run |
| `BRAINSTORM_EFFORT` | `medium` | Reasoning effort for brainstorm step (`none` \| `low` \| `medium`; `high`/`xhigh` intentionally disallowed) |
| `CRITIQUE_EFFORT` | `medium` | Reasoning effort for critique step |
| `TOPUP_EFFORT` | `medium` | Reasoning effort for targeted top-up calls |
| `COVERAGE_EFFORT` | `none` | Reasoning disabled for coverage tagging (mechanical) |
| `ANNOTATE_EFFORT` | `none` | Reasoning disabled for per-quest annotation (mechanical) |
| `OPENAI_MAX_OUTPUT_TOKENS` | `120000` | Per-call output cap |
| `OPENAI_BACKGROUND_MODE` | `1` | Use OpenAI background mode for large calls |
| `OPENAI_BACKGROUND_POLL_MS` | `5000` | Background poll interval |

## Commands

End-to-end pipeline (steps 1–3, produces a raw.json for annotation):

```bash
./scripts/side-quests/run.sh run
```

Run only the brainstorm step (writes `<stamp>.seeds.json`):

```bash
./scripts/side-quests/run.sh brainstorm
```

Critique an existing seeds file (writes `<stamp>.critique.json` and `<stamp>.raw.json` alongside it):

```bash
./scripts/side-quests/run.sh critique scripts/side-quests/output/<stamp>.seeds.json
```

Annotate the survivors (resumable; writes `<stamp>.annotated.json`):

```bash
./scripts/side-quests/run.sh annotate scripts/side-quests/output/<stamp>.raw.json
```

Build a migration from a finished annotated JSON file:

```bash
./scripts/side-quests/run.sh build-migration scripts/side-quests/output/<stamp>.annotated.json <migration-name>.sql
```

## Output

Each pipeline run writes a sequence of intermediate files keyed by an ISO timestamp:

- `<stamp>.seeds.json` — raw brainstorm output
- `<stamp>.critique.json` — survivors + per-rejection notes
- `<stamp>.coverage.json` — light tags used for gap analysis
- `<stamp>.topup.json` — survivors after targeted top-ups (only if top-ups ran)
- `<stamp>.raw.json` — final quest content (title + summary), ready for annotation
- `<stamp>.annotated.json` — final annotated quests, ready for the migration builder

`output/` is gitignored. The scripts are checked in; the artifacts are not.

## Why this shape

The previous pipeline generated all 400 quests in one OpenAI call with a large coverage matrix in the prompt, then annotated each quest in a separate per-item call. That produced two consistent failure modes:

1. **Archetype duplication** — the one-shot generation couldn't track what it had already written 200 items earlier, so several archetypes (observation-only walks, micro-purchases, "pick a favorite of objects", etc.) appeared 5–10 times across the catalog.
2. **Coverage paid lip service to the matrix but didn't deliver** — the catalog collapsed into the "solo / near-home / easy-win / playful" default even though the prompt explicitly warned against it.

The new pipeline addresses both: smaller brainstorm batches with explicit prior-title context to break duplication streaks, a strict critique pass to throw out filler, and measured coverage with targeted top-ups for genuine gaps. Anti-filler guidance (no "pick a favorite", no "leave before X happens", no observation-only quests) is baked into the brainstorm system prompt with concrete bad-example titles drawn from the previous catalog.
