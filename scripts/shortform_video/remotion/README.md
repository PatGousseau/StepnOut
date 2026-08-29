# StepnOut Short-Form Renderer

This is the current, CLI-first video system. It uses Remotion for visuals,
ElevenLabs for narration and word timing, local music/SFX, and (when a video
asks for it) Pexels footage. New videos should be made here; the older Python
renderers in `../` are historical references rather than the active pipeline.

This document is the handoff guide for an agent making or revising a video.

## Start here

- Use `src/oneoff-data.ts` and `src/OneOffs.tsx` for a bespoke, one-off video.
- Use `../configs/roulette.json`, `src/prepare.ts`, and `src/Roulette.tsx` for
  the reusable Roulette format.
- Use `src/brand.ts` for shared color and typography values.
- Treat `public/generated/` as a local cache, not source: it contains API
  output, copied media, word timings, and render props and is gitignored.

The system does not prescribe a creative format. A one-off can use any visual
or narrative treatment that the video calls for; its React scene owns those
decisions.

## Install

```bash
cd scripts/shortform_video/remotion
npm install
```

## Requirements

- Node/npm and the installed Remotion dependencies
- `ffmpeg` and `ffprobe`
- `ELEVENLABS_API_KEY` (or `ELEVEN_LABS_API_KEY`) to prepare narration
- `PEXELS_API_KEY` only when Roulette footage is enabled

Never put API values in source, props, or generated files. They are read from
the environment while preparation runs.

## Normal workflow

1. Make the source edit: JSON/config for Roulette, or TypeScript data and a
   React scene for a one-off.
2. Run the appropriate `prepare:*` command. It generates/copies all local
   assets and writes a `props.json` file.
3. Render that props file with the matching `render:*` command.
4. Run `npm run typecheck`, inspect the output, and verify the final media if
   appropriate.

Preparation is the authoritative source for narration timing. If narration
text, voice settings, or speed changes, run preparation again without
`--skip-narration`. That keeps the captions synchronized to the exact audio.

## Roulette: make a new render

Roulette is the only reusable content format. Its content source is
`../configs/roulette.json`; it contains hooks, candidates, selected outcome
controls, voice settings, music, and optional footage queries.

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
`narration-raw.mp3` and alignment data, and only when the spoken script and
voice setup are unchanged. The command prints the generated `props.json` path.

Render the prepared job:

```bash
npm run render:roulette -- \
  --props=public/generated/roulette/daily-roulette/props.json \
  out/daily-roulette.mp4 \
  --log=error
```

The render is a standard 1080×1920 H.264/AAC MP4. `npm run studio` is optional
for interactive local timeline inspection; preparation and final rendering are
both fully CLI-driven.

## One-offs: edit an existing video

The current one-offs are separate scenes, not variants of a format template.

- `src/oneoff-data.ts` holds each ID, narration, local music choice, music
  level/start, duration floor, and simple SFX events.
- `src/OneOffs.tsx` holds shared presentation primitives plus the individual
  React scenes and their ID-to-scene map.
- `src/prepare-oneoffs.ts` calls ElevenLabs, derives word timings, creates
  simple SFX, copies the brand/music files, and writes render props.

For a script change, update the relevant narration in `oneoff-data.ts`, then
prepare and render the same ID:

```bash
npm run prepare:oneoffs -- --only message-thriller
npm run render:oneoff -- \
  --props=public/generated/oneoffs/message-thriller/props.json \
  out/oneoff-message-thriller.mp4 \
  --log=error
```

For a visual-only change with the narration untouched, pass
`--skip-narration` to preparation to reuse its cached ElevenLabs result:

```bash
npm run prepare:oneoffs -- --only message-thriller --skip-narration
```

## One-offs: add a new video

1. Add a definition to `ONE_OFFS` in `src/oneoff-data.ts`. Give it a unique
   `id`, its exact spoken `narration`, a local music path, and any SFX events.
2. Create a dedicated React scene in `src/OneOffs.tsx`. It receives
   `OneOffRenderProps`, including the narration audio and word timings.
3. Add the scene to `oneOffScenes` using the new ID. Extend `OneOffId` in
   `src/types.ts` with the same value.
4. Prepare and render just that ID using the commands above.

The shared `CaptionBar` accepts `props.narration.words`; use it when captions
are useful. Its timings come from ElevenLabs, so do not hand-time caption text
or alter the narration audio after preparation.

The current one-off IDs are `blunt-intervention`, `cancel-brain`,
`nature-documentary`, `message-thriller`, `first-door`, and
`comfort-zone-calendar`.

## Source map

- `src/index.ts` / `src/Root.tsx`: Remotion entry point and compositions
- `src/Roulette.tsx`: Roulette visuals
- `src/prepare.ts`: Roulette media/timing preparation
- `src/OneOffs.tsx`: bespoke one-off visuals and shared caption/audio helpers
- `src/oneoff-data.ts`: one-off scripts and media settings
- `src/prepare-oneoffs.ts`: one-off media/timing preparation
- `src/types.ts`: render prop contracts
- `src/brand.ts`: shared brand constants
- `../assets/stepnout-wordmark-white.png`: brand image copied into each job
- `../music/pixabay/`: local music library

## Verify a render

```bash
npm run typecheck
ffprobe -v error \
  -show_entries stream=codec_name,width,height,r_frame_rate:format=duration \
  -of default=noprint_wrappers=1 \
  out/your-video.mp4
```

Keep the generated props and final MP4 linked by their job/filename so a later
agent can reproduce or iterate on a render without guessing which assets it
used.
