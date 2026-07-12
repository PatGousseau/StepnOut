# Shortform Video Generator

This directory contains the tracked version of the short-form video generator prototype.

It takes:
- a JSON config describing the script and footage queries
- ElevenLabs for narration
- Pexels for source footage
- `ffmpeg` / `ffprobe` for rendering

## Files

- `generate.py`: main generator
- `configs/rejection.json`: sample config
- `music_catalog.json`: optional tagged catalog for deterministic music matching

## Requirements

- `python3`
- `ffmpeg`
- `ffprobe`
- `ELEVENLABS_API_KEY`
- `PEXELS_API_KEY`

## Run

```bash
python scripts/shortform_video/generate.py
```

That uses `configs/rejection.json` by default.

To use a custom config:

```bash
python scripts/shortform_video/generate.py path/to/video.json
```

Useful flags:

```bash
python scripts/shortform_video/generate.py path/to/video.json \
  --work-dir /tmp/stepnout_video \
  --output /tmp/stepnout_video/out.mp4 \
  --seed 42
```

## Config shape

```json
{
  "voice": {
    "model_id": "eleven_v3",
    "voice_id": "optional",
    "voice_name": "Hale",
    "narration_speed": 1.1
  },
  "captions": {
    "words_per_chunk": 2
  },
  "footage": {
    "fallback_queries": ["cinematic city aesthetic"],
    "search_pages": [1, 2, 3, 4],
    "zoom_amount": 0.08,
    "default_cuts": 2
  },
  "output": {
    "filename": "example.mp4",
    "brand_image": "assets/stepnout-wordmark-white.png",
    "brand_position": "bottom_left",
    "brand_width": 260
  },
  "audio_bed": {
    "mode": "none",
    "volume": 0.16
  },
  "scenes": [
    {
      "narration": "[confident] Spoken line here.",
      "queries": ["pexels query one", "pexels query two"],
      "cuts": 3
    }
  ]
}
```

## Series Format

The generator supports a repeatable visual structure without encoding any specific
challenge mechanics:

- State the challenge immediately in the first spoken line and its kinetic captions;
  do not lead with an abstract reframe or a separate title card.
- `footage.default_cuts` controls the number of distinct Pexels clips in each
  narration scene. Override it per scene with `cuts`; use 3 for the hook and
  closing beat, and 1 only when a deliberate pause is useful.

The included rejection config is an example of this pacing: a strong first-frame
premise, faster footage changes around concrete examples, and a shorter delivery.

`audio_bed` supports three modes:

- `none`: no background music
- `file`: use an exact local file path
- `match`: choose the best matching local track from `music_catalog.json`

Example `file` mode:

```json
{
  "audio_bed": {
    "mode": "file",
    "path": "music/pixabay/dream-protocol-fun-times-ahead-soft-acoustic-guitar-instrumental-22173.mp3",
    "volume": 0.16
  }
}
```

Example `match` mode:

```json
{
  "audio_bed": {
    "mode": "match",
    "mood": "inspiring",
    "energy": "low",
    "instruments": ["piano"],
    "volume": 0.16
  }
}
```

Branding can use a real logo asset instead of subtitle text:

```json
{
  "output": {
    "brand_image": "assets/stepnout-wordmark-white.png",
    "brand_position": "bottom_left",
    "brand_width": 260,
    "brand_margin_x": 56,
    "brand_margin_y": 132
  }
}
```

## Notes

- The config is meant to be simple and hand-editable.
- API keys stay in env vars; per-video creative decisions live in JSON.
- Output defaults to `<work-dir>/<output.filename>`.
- Pexels attribution is written to `<work-dir>/pexels_attribution.txt`.
- Music matching is deterministic. If multiple tracks match, the script picks the highest-scoring one, then breaks ties by path name.
