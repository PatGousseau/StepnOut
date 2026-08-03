# StepnOut Short-Form Renderer

This is the CLI-rendered Remotion implementation of the daily side-quest
roulette. It intentionally consumes the existing `../configs/roulette.json`
schema, so the candidate catalog, hooks, voice, and footage choices remain in
one familiar config file.

The old Python renderers are unchanged and remain available as historical
references. New output is rendered through Remotion.

## Install

```bash
cd scripts/shortform_video/remotion
npm install
```

## Prepare a roulette job

Preparation makes one ElevenLabs narration take with timestamps, splits and
speeds the audio, writes word-level timing props, synthesizes roulette clicks,
and downloads the selected Pexels clips into an ignored local cache.

```bash
npm run prepare:roulette -- ../configs/roulette.json \
  --seed 42 \
  --job daily-roulette
```

Useful optional flags:

```bash
--winner take-yourself-out
--hook maybe-later
--skip-footage
--skip-narration
```

`--skip-narration` only works after a job has already generated its cached
`narration-raw.mp3` and alignment data. This makes visual iteration free and
fast. The command prints the generated `props.json` path.

## Render

```bash
npm run render:roulette -- \
  --props=public/generated/roulette/daily-roulette/props.json \
  out/daily-roulette.mp4 \
  --log=error
```

To inspect a single timestamp without a full MP4, use the same props with
`npm run still` and the Remotion `--frame` option. `npm run studio` is optional
for interactive local timeline inspection; preparation and final rendering are
both fully CLI-driven.

## What is reusable

- `src/prepare.ts` is the media and timing pipeline.
- `src/Roulette.tsx` is the visual composition.
- `src/brand.ts` is the single source of the current video colors and type
  treatment.
- `public/generated/` is intentionally ignored: it contains local API output,
  footage, and render props rather than source material.

## One-off videos

The six former format experiments are now individual Remotion stories, rather
than variants of a generic video template. Each has its own rewritten
narration, visual treatment, music choice, and motion beats. The shared pieces
are deliberately limited to brand treatment, audio preparation, and
word-timed captions.

Their source of truth is `src/oneoff-data.ts`; scene implementations live in
`src/OneOffs.tsx`.

Prepare all six voiceovers and generated assets:

```bash
npm run prepare:oneoffs
```

Or prepare a single story while refining it:

```bash
npm run prepare:oneoffs -- --only message-thriller
```

Use `--skip-narration` only when the script is unchanged and its cached
alignment already exists. Render a prepared video with:

```bash
npm run render:oneoff -- \
  --props=public/generated/oneoffs/message-thriller/props.json \
  out/oneoff-message-thriller.mp4 \
  --log=error
```

Available IDs: `blunt-intervention`, `cancel-brain`,
`nature-documentary`, `message-thriller`, `first-door`, and
`comfort-zone-calendar`.
