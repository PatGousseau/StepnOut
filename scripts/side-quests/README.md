# Side Quest Content Pipeline

This directory contains the scripts for:

1. generating raw side quests
2. annotating them for deterministic matching
3. turning the final annotated JSON into a SQL migration

## Requirements

- Node 22+
- `OPENAI_API_KEY`

Optional env vars:

- `OPENAI_MODEL`
  - default: `gpt-5.5`
- `SIDE_QUEST_COUNT`
  - default: `500`
- `OPENAI_MAX_OUTPUT_TOKENS`
  - default: `120000`
- `OPENAI_BACKGROUND_MODE`
  - default: `1`
  - when enabled, the raw generation request is created with `background: true` and polled until completion
- `OPENAI_BACKGROUND_POLL_MS`
  - default: `5000`

## Commands

Generate and annotate in one run:

```bash
./scripts/side-quests/run.sh run
```

Generate only the raw quests:

```bash
./scripts/side-quests/run.sh generate
```

Annotate or resume an existing raw JSON file:

```bash
./scripts/side-quests/run.sh annotate scripts/side-quests/output/<file>.raw.json
```

Build a migration from a finished annotated JSON file:

```bash
./scripts/side-quests/run.sh build-migration scripts/side-quests/output/<file>.annotated.json 20260418123000_seed_side_quests.sql
```

## Output

The script writes:

- `<timestamp>.raw.json`
- `<timestamp>.annotated.json`

to `scripts/side-quests/output/`.

`output/` is intentionally gitignored. The scripts are checked in; the generated artifacts are not.
