#!/usr/bin/env python3
"""Generate short-form vertical videos from JSON configs.

This tool combines:
- ElevenLabs narration
- Pexels footage
- ffmpeg rendering + subtitles

Usage:
    python scripts/shortform_video/generate.py
    python scripts/shortform_video/generate.py scripts/shortform_video/configs/rejection.json
"""

from __future__ import annotations

import argparse
import json
import math
import os
import random
import re
import shlex
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from dataclasses import dataclass, field
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DEFAULT_CONFIG_PATH = ROOT / "configs" / "rejection.json"
DEFAULT_MUSIC_CATALOG_PATH = ROOT / "music_catalog.json"
DEFAULT_WORK_DIR = Path("/tmp/stepnout_shortform")
DEFAULT_HEADERS = {
    "User-Agent": "StepnOutVideoBot/1.0 (+https://stepnout.com)",
    "Accept": "application/json, */*;q=0.8",
}
DEFAULT_FALLBACK_QUERIES = ["cinematic city aesthetic", "golden hour street people"]
DEFAULT_SCENE_TAIL_PADDING = 0.06
AUDIO_TAG_RE = re.compile(r"\[[^\]]+\]")


@dataclass
class VoiceConfig:
    model_id: str = "eleven_v3"
    voice_id: str | None = None
    voice_name: str = "Hale"
    narration_speed: float = 1.1


@dataclass
class CaptionConfig:
    words_per_chunk: int = 2
    font: str = "Futura"
    font_size: int = 112
    margin_v: int = 700
    primary_color: str = "&H00FFFFFF"
    accent_color: str = "&H0082534D"


@dataclass
class FootageConfig:
    fallback_queries: list[str] = field(default_factory=lambda: list(DEFAULT_FALLBACK_QUERIES))
    search_pages: list[int] = field(default_factory=lambda: [1, 2, 3, 4])
    zoom_amount: float = 0.08
    default_cuts: int = 2


@dataclass
class OutputConfig:
    width: int = 1080
    height: int = 1920
    fps: int = 30
    filename: str = "stepnout_short.mp4"
    brand_text: str = "StepnOut"
    brand_image: str | None = None
    brand_position: str = "bottom_left"
    brand_width: int = 260
    brand_margin_x: int = 56
    brand_margin_y: int = 132


@dataclass
class AudioBedConfig:
    mode: str = "none"
    path: str | None = None
    volume: float = 0.16
    mood: str | None = None
    energy: str | None = None
    instruments: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)


@dataclass
class SceneConfig:
    narration: str
    queries: list[str]
    cuts: int | None = None


@dataclass
class VideoConfig:
    voice: VoiceConfig
    captions: CaptionConfig
    footage: FootageConfig
    output: OutputConfig
    audio_bed: AudioBedConfig
    scenes: list[SceneConfig]


@dataclass
class RuntimeConfig:
    elevenlabs_api_key: str
    pexels_api_key: str
    work_dir: Path
    output_path: Path


@dataclass
class MusicTrack:
    path: str
    moods: list[str] = field(default_factory=list)
    energy: str | None = None
    instruments: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)


@dataclass
class ResolvedAudioBed:
    path: Path | None
    description: str


@dataclass
class BrandOverlay:
    path: Path | None
    position: str
    width: int
    margin_x: int
    margin_y: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "config",
        nargs="?",
        default=str(DEFAULT_CONFIG_PATH),
        help="Path to the video config JSON.",
    )
    parser.add_argument(
        "--work-dir",
        default=os.environ.get("STEPNOUT_VIDEO_WORKDIR", str(DEFAULT_WORK_DIR)),
        help="Scratch directory for audio/video intermediates.",
    )
    parser.add_argument(
        "--output",
        default=os.environ.get("STEPNOUT_VIDEO_OUTPUT"),
        help="Optional explicit output file path.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional random seed for reproducible footage choices.",
    )
    return parser.parse_args()


def load_runtime_config(args: argparse.Namespace, video_config: VideoConfig) -> RuntimeConfig:
    elevenlabs_api_key = os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("ELEVEN_LABS_API_KEY")
    pexels_api_key = os.environ.get("PEXELS_API_KEY")

    missing = []
    if not elevenlabs_api_key:
        missing.append("ELEVENLABS_API_KEY")
    if not pexels_api_key:
        missing.append("PEXELS_API_KEY")
    if missing:
        raise SystemExit(
            "Missing required env vars: "
            + ", ".join(missing)
            + "\nExample:\n"
            + "  export ELEVENLABS_API_KEY=...\n"
            + "  export PEXELS_API_KEY=..."
        )

    work_dir = Path(args.work_dir).resolve()
    output_path = (
        Path(args.output).resolve()
        if args.output
        else (work_dir / video_config.output.filename).resolve()
    )
    return RuntimeConfig(
        elevenlabs_api_key=elevenlabs_api_key,
        pexels_api_key=pexels_api_key,
        work_dir=work_dir,
        output_path=output_path,
    )


def load_video_config(path: Path) -> VideoConfig:
    raw = json.loads(path.read_text(encoding="utf-8"))
    audio_bed_raw = raw.get("audio_bed", {})

    voice = VoiceConfig(**raw.get("voice", {}))
    captions = CaptionConfig(
        words_per_chunk=max(1, int(raw.get("captions", {}).get("words_per_chunk", 2))),
        font=raw.get("captions", {}).get("font", "Futura"),
        font_size=int(raw.get("captions", {}).get("font_size", 112)),
        margin_v=int(raw.get("captions", {}).get("margin_v", 700)),
        primary_color=raw.get("captions", {}).get("primary_color", "&H00FFFFFF"),
        accent_color=raw.get("captions", {}).get("accent_color", "&H0082534D"),
    )
    footage = FootageConfig(
        fallback_queries=list(raw.get("footage", {}).get("fallback_queries", DEFAULT_FALLBACK_QUERIES)),
        search_pages=list(raw.get("footage", {}).get("search_pages", [1, 2, 3, 4])),
        zoom_amount=float(raw.get("footage", {}).get("zoom_amount", 0.08)),
        default_cuts=max(1, int(raw.get("footage", {}).get("default_cuts", 2))),
    )
    output = OutputConfig(
        width=int(raw.get("output", {}).get("width", 1080)),
        height=int(raw.get("output", {}).get("height", 1920)),
        fps=int(raw.get("output", {}).get("fps", 30)),
        filename=raw.get("output", {}).get("filename", "stepnout_short.mp4"),
        brand_text=raw.get("output", {}).get("brand_text", "StepnOut"),
        brand_image=raw.get("output", {}).get("brand_image"),
        brand_position=str(raw.get("output", {}).get("brand_position", "bottom_left")).lower(),
        brand_width=int(raw.get("output", {}).get("brand_width", 260)),
        brand_margin_x=int(raw.get("output", {}).get("brand_margin_x", 56)),
        brand_margin_y=int(raw.get("output", {}).get("brand_margin_y", 132)),
    )
    audio_bed = AudioBedConfig(
        mode=str(audio_bed_raw.get("mode", "none")).lower(),
        path=audio_bed_raw.get("path"),
        volume=float(audio_bed_raw.get("volume", 0.16)),
        mood=audio_bed_raw.get("mood"),
        energy=audio_bed_raw.get("energy"),
        instruments=list(audio_bed_raw.get("instruments", [])),
        tags=list(audio_bed_raw.get("tags", [])),
    )
    scenes = []
    for index, scene in enumerate(raw.get("scenes", []), start=1):
        queries = scene.get("queries") or ([scene["query"]] if scene.get("query") else [])
        if not scene.get("narration") or not queries:
            raise SystemExit(f"Scene {index} needs 'narration' and 'queries'.")
        cuts = scene.get("cuts")
        scenes.append(
            SceneConfig(
                narration=scene["narration"],
                queries=queries,
                cuts=max(1, int(cuts)) if cuts is not None else None,
            )
        )

    if not scenes:
        raise SystemExit(f"No scenes found in config: {path}")

    return VideoConfig(
        voice=voice,
        captions=captions,
        footage=footage,
        output=output,
        audio_bed=audio_bed,
        scenes=scenes,
    )


def normalize_token(value: str) -> str:
    return value.strip().lower()


def resolve_config_path(config_path: Path, candidate: str) -> Path:
    path = Path(candidate)
    if path.is_absolute():
        return path.resolve()

    candidates = [
        (config_path.parent / path).resolve(),
        (ROOT / path).resolve(),
    ]
    for resolved in candidates:
        if resolved.exists():
            return resolved
    return candidates[0]


def load_music_catalog(path: Path) -> list[MusicTrack]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    tracks = []
    for entry in raw.get("tracks", []):
        tracks.append(
            MusicTrack(
                path=entry["path"],
                moods=[normalize_token(value) for value in entry.get("moods", [])],
                energy=normalize_token(entry["energy"]) if entry.get("energy") else None,
                instruments=[normalize_token(value) for value in entry.get("instruments", [])],
                tags=[normalize_token(value) for value in entry.get("tags", [])],
            )
        )
    return tracks


def score_music_track(track: MusicTrack, audio_bed: AudioBedConfig) -> int | None:
    score = 0

    if audio_bed.mood:
        mood = normalize_token(audio_bed.mood)
        if mood not in track.moods:
            return None
        score += 4

    if audio_bed.energy:
        energy = normalize_token(audio_bed.energy)
        if energy != track.energy:
            return None
        score += 3

    requested_instruments = [normalize_token(value) for value in audio_bed.instruments]
    if requested_instruments:
        if not all(value in track.instruments for value in requested_instruments):
            return None
        score += len(requested_instruments) * 2

    requested_tags = [normalize_token(value) for value in audio_bed.tags]
    if requested_tags:
        if not all(value in track.tags for value in requested_tags):
            return None
        score += len(requested_tags)

    return score if score > 0 else None


def resolve_audio_bed(config_path: Path, video_config: VideoConfig) -> ResolvedAudioBed:
    audio_bed = video_config.audio_bed
    mode = normalize_token(audio_bed.mode or "none")

    if mode == "none":
        return ResolvedAudioBed(path=None, description="disabled")

    if mode == "file":
        if not audio_bed.path:
            raise SystemExit("audio_bed.mode=file requires audio_bed.path")
        music_path = resolve_config_path(config_path, audio_bed.path)
        if not music_path.is_file():
            raise SystemExit(f"Music file not found: {music_path}")
        return ResolvedAudioBed(path=music_path, description=f"file: {audio_bed.path}")

    if mode == "match":
        if not any([audio_bed.mood, audio_bed.energy, audio_bed.instruments, audio_bed.tags]):
            raise SystemExit(
                "audio_bed.mode=match requires at least one of: mood, energy, instruments, tags"
            )
        if not DEFAULT_MUSIC_CATALOG_PATH.is_file():
            raise SystemExit(f"Music catalog not found: {DEFAULT_MUSIC_CATALOG_PATH}")

        matches = []
        for track in load_music_catalog(DEFAULT_MUSIC_CATALOG_PATH):
            score = score_music_track(track, audio_bed)
            if score is None:
                continue
            resolved_path = resolve_config_path(config_path, track.path)
            if not resolved_path.is_file():
                continue
            matches.append((score, track.path, resolved_path))

        if not matches:
            raise SystemExit("No matching music tracks found for audio_bed selectors.")

        matches.sort(key=lambda item: (-item[0], item[1]))
        _, relative_path, resolved_path = matches[0]
        return ResolvedAudioBed(path=resolved_path, description=f"match: {relative_path}")

    raise SystemExit(f"Unsupported audio_bed.mode: {audio_bed.mode}")


def resolve_brand_overlay(config_path: Path, output: OutputConfig) -> BrandOverlay:
    if not output.brand_image:
        return BrandOverlay(
            path=None,
            position=output.brand_position,
            width=output.brand_width,
            margin_x=output.brand_margin_x,
            margin_y=output.brand_margin_y,
        )

    brand_path = resolve_config_path(config_path, output.brand_image)
    if not brand_path.is_file():
        raise SystemExit(f"Brand image not found: {brand_path}")

    return BrandOverlay(
        path=brand_path,
        position=output.brand_position,
        width=output.brand_width,
        margin_x=output.brand_margin_x,
        margin_y=output.brand_margin_y,
    )


def ensure_dirs(work_dir: Path) -> None:
    for subdir in ("audio", "video_src", "video_rendered", "subs"):
        (work_dir / subdir).mkdir(parents=True, exist_ok=True)


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    print(">>", " ".join(shlex.quote(part) for part in cmd))
    return subprocess.run(cmd, check=True, **kwargs)


def probe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(path),
        ]
    )
    return float(json.loads(out)["format"]["duration"])


def quantize_duration(seconds: float, fps: int) -> float:
    frames = max(1, math.ceil(seconds * fps))
    return frames / fps


def http_bytes(url: str, *, headers: dict[str, str] | None = None, data: bytes | None = None) -> bytes:
    request_headers = DEFAULT_HEADERS.copy()
    if headers:
        request_headers.update(headers)
    req = urllib.request.Request(url, data=data, headers=request_headers)
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code} from {url}\n{detail}") from None


def http_json(url: str, *, headers: dict[str, str] | None = None, data: dict | None = None) -> dict:
    body = None
    request_headers = dict(headers or {})
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        request_headers["Content-Type"] = "application/json"
    return json.loads(http_bytes(url, headers=request_headers, data=body).decode("utf-8"))


def http_download(url: str, dest: Path, *, headers: dict[str, str] | None = None) -> None:
    request_headers = DEFAULT_HEADERS.copy()
    if headers:
        request_headers.update(headers)
    req = urllib.request.Request(url, headers=request_headers)
    with urllib.request.urlopen(req) as response, dest.open("wb") as file_handle:
        file_handle.write(response.read())


def strip_audio_tags(text: str) -> str:
    return re.sub(r"\s+", " ", AUDIO_TAG_RE.sub("", text)).strip()


def resolve_elevenlabs_voice_id(runtime: RuntimeConfig, voice: VoiceConfig) -> str:
    if voice.voice_id:
        return voice.voice_id

    payload = http_json(
        "https://api.elevenlabs.io/v1/voices",
        headers={"xi-api-key": runtime.elevenlabs_api_key},
    )
    voices = payload.get("voices", [])
    if not voices:
        raise RuntimeError("ElevenLabs returned no voices for this account.")

    requested = voice.voice_name.lower()
    for candidate in voices:
        if candidate.get("name", "").lower() == requested:
            return candidate["voice_id"]
    for candidate in voices:
        if requested in candidate.get("name", "").lower():
            return candidate["voice_id"]
    return voices[0]["voice_id"]


def build_voice_settings(model_id: str) -> dict:
    if model_id.startswith("eleven_v3"):
        return {"stability": 0.5}
    return {
        "stability": 0.45,
        "similarity_boost": 0.75,
        "style": 0.15,
        "speed": 1.0,
        "use_speaker_boost": True,
    }


def generate_narration(runtime: RuntimeConfig, voice_id: str, voice: VoiceConfig, text: str, dest: Path) -> None:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"
    audio = http_bytes(
        url,
        headers={
            "xi-api-key": runtime.elevenlabs_api_key,
            "Content-Type": "application/json",
        },
        data=json.dumps(
            {
                "text": text,
                "model_id": voice.model_id,
                "voice_settings": build_voice_settings(voice.model_id),
            }
        ).encode("utf-8"),
    )
    dest.write_bytes(audio)


def force_align(runtime: RuntimeConfig, audio_path: Path, text: str) -> dict:
    boundary = uuid.uuid4().hex
    body = b"".join(
        [
            (
                f"--{boundary}\r\n"
                'Content-Disposition: form-data; name="file"; filename="narration.mp3"\r\n'
                "Content-Type: audio/mpeg\r\n\r\n"
            ).encode("utf-8")
            + audio_path.read_bytes()
            + b"\r\n",
            (
                f"--{boundary}\r\n"
                'Content-Disposition: form-data; name="text"\r\n\r\n'
                f"{text}\r\n"
            ).encode("utf-8"),
            f"--{boundary}--\r\n".encode("utf-8"),
        ]
    )
    payload = json.loads(
        http_bytes(
            "https://api.elevenlabs.io/v1/forced-alignment",
            headers={
                "xi-api-key": runtime.elevenlabs_api_key,
                "Content-Type": f"multipart/form-data; boundary={boundary}",
            },
            data=body,
        ).decode("utf-8")
    )
    characters = payload["characters"]
    return {
        "characters": [char["text"] for char in characters],
        "character_start_times_seconds": [char["start"] for char in characters],
        "character_end_times_seconds": [char["end"] for char in characters],
    }


def extract_word_timings(
    alignment: dict, start_index: int, matched_text: str
) -> list[tuple[str, float, float]]:
    starts = alignment["character_start_times_seconds"]
    ends = alignment["character_end_times_seconds"]
    words: list[tuple[str, float, float]] = []
    word_chars: list[str] = []
    word_start = word_end = 0.0
    in_tag = False

    for offset, char in enumerate(matched_text):
        index = start_index + offset
        if in_tag:
            in_tag = char != "]"
            continue
        if char == "[":
            in_tag = True
            continue
        if char.isspace():
            if word_chars:
                words.append(("".join(word_chars), word_start, word_end))
                word_chars = []
            continue
        if not word_chars:
            word_start = starts[index]
        word_end = ends[index]
        word_chars.append(char)

    if word_chars:
        words.append(("".join(word_chars), word_start, word_end))
    return words


def locate_scene_words(alignment: dict, scenes: list[SceneConfig]) -> list[list[tuple[str, float, float]]]:
    joined = "".join(alignment["characters"])
    cursor = 0
    scene_words = []

    for scene in scenes:
        match_index = -1
        matched_text = scene.narration
        for candidate in (scene.narration, strip_audio_tags(scene.narration)):
            match_index = joined.find(candidate, cursor)
            if match_index != -1:
                matched_text = candidate
                break
        if match_index == -1:
            raise RuntimeError(f"scene text not found in alignment: {scene.narration!r}")
        scene_words.append(extract_word_timings(alignment, match_index, matched_text))
        cursor = match_index + len(matched_text)

    return scene_words


def change_audio_tempo(src: Path, dest: Path, factor: float) -> None:
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-filter:a",
            f"atempo={factor}",
            "-c:a",
            "pcm_s16le",
            str(dest),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def transcode_audio_to_wav(src: Path, dest: Path) -> None:
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-c:a",
            "pcm_s16le",
            str(dest),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def slice_narration(
    full_audio: Path, scene_words: list[list[tuple[str, float, float]]], dests: list[Path]
) -> list[float]:
    total = probe_duration(full_audio)
    boundaries = [0.0]
    for previous, current in zip(scene_words, scene_words[1:]):
        boundaries.append(round((previous[-1][2] + current[0][1]) / 2, 3))
    boundaries.append(total)

    offsets = []
    for index, dest in enumerate(dests):
        start, end = boundaries[index], boundaries[index + 1]
        if end - start < 0.05:
            raise RuntimeError(
                f"Degenerate audio slice for scene {index}: {start:.3f}s-{end:.3f}s "
                "(bad alignment timings)"
            )
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(full_audio),
                "-ss",
                f"{start:.3f}",
                "-to",
                f"{end:.3f}",
                "-c:a",
                "pcm_s16le",
                str(dest),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        offsets.append(start)
    return offsets


def pexels_search(runtime: RuntimeConfig, query: str, *, page: int, per_page: int = 12) -> list[dict]:
    params = urllib.parse.urlencode(
        {
            "query": query,
            "orientation": "portrait",
            "per_page": per_page,
            "page": page,
            "size": "medium",
        }
    )
    payload = http_json(
        f"https://api.pexels.com/v1/videos/search?{params}",
        headers={"Authorization": runtime.pexels_api_key},
    )
    return payload.get("videos", [])


def pick_video_file(video: dict) -> dict | None:
    candidates = []
    for file_data in video.get("video_files", []):
        link = file_data.get("link", "")
        if not link.endswith(".mp4"):
            continue
        width = file_data.get("width") or 0
        height = file_data.get("height") or 0
        portrait_bias = 1 if height >= width else 0
        quality_bias = {"sd": 1, "hd": 2, "uhd": 3}.get(file_data.get("quality", ""), 0)
        candidates.append((portrait_bias, quality_bias, width * height, file_data))

    if not candidates:
        return None

    candidates.sort(reverse=True)
    return candidates[0][3]


def choose_source_clip(
    runtime: RuntimeConfig,
    footage: FootageConfig,
    queries: list[str],
    used_ids: set[int],
) -> tuple[dict, dict]:
    pages = list(footage.search_pages)
    random.shuffle(pages)

    for query in [*queries, *footage.fallback_queries]:
        for page in pages:
            videos = pexels_search(runtime, query, page=page)
            random.shuffle(videos)
            for video in videos:
                video_id = video.get("id")
                if video_id in used_ids:
                    continue
                file_data = pick_video_file(video)
                if not file_data:
                    continue
                used_ids.add(video_id)
                return video, file_data

    raise RuntimeError(f"Unable to find a usable Pexels clip for queries: {queries}")


def to_ass_timestamp(seconds: float) -> str:
    millis = max(0, int(round(seconds * 1000)))
    hours = millis // 3_600_000
    millis %= 3_600_000
    minutes = millis // 60_000
    millis %= 60_000
    secs = millis // 1_000
    millis %= 1_000
    centis = millis // 10
    return f"{hours}:{minutes:02d}:{secs:02d}.{centis:02d}"


def ass_escape(value: str) -> str:
    return value.replace("\\", r"\\").replace("{", r"\{").replace("}", r"\}")


def build_caption_events(
    narration: str,
    duration: float,
    captions: CaptionConfig,
    word_timings: list[tuple[str, float, float]] | None,
) -> list[tuple[str, float, float]]:
    if word_timings:
        events = []
        chunks = [
            word_timings[start : start + captions.words_per_chunk]
            for start in range(0, len(word_timings), captions.words_per_chunk)
        ]
        for chunk_index, chunk in enumerate(chunks):
            chunk_start = chunk[0][1]
            is_last_chunk = chunk_index + 1 == len(chunks)
            chunk_end = duration if is_last_chunk else chunks[chunk_index + 1][0][1]
            for word_index in range(len(chunk)):
                start = chunk_start if word_index == 0 else chunk[word_index][1]
                end = chunk[word_index + 1][1] if word_index + 1 < len(chunk) else chunk_end
                start = max(0.0, min(duration, start))
                end = max(0.0, min(duration, end))
                if end - start < 0.01:
                    continue
                tokens = []
                for token_index, (word, _, _) in enumerate(chunk):
                    token = ass_escape(word.upper())
                    if token_index == word_index:
                        token = (
                            "{\\1c"
                            + captions.accent_color
                            + "}"
                            + token
                            + "{\\1c"
                            + captions.primary_color
                            + "}"
                        )
                    tokens.append(token)
                text = " ".join(tokens)
                if word_index == 0:
                    text = "{\\fad(60,0)}" + text
                events.append((text, start, end))
        return events

    words = narration.split()
    if not words:
        return []

    chunks = []
    for start in range(0, len(words), captions.words_per_chunk):
        chunks.append(" ".join(words[start : start + captions.words_per_chunk]))

    words_per_chunk = [max(1, len(chunk.split())) for chunk in chunks]
    total_words = sum(words_per_chunk)
    events = []
    cursor = 0.0
    for index, chunk in enumerate(chunks, start=1):
        share = words_per_chunk[index - 1] / total_words
        end_time = duration if index == len(chunks) else min(duration, cursor + duration * share)
        events.append((ass_escape(chunk.upper()), cursor, end_time))
        cursor = end_time
    return events


def write_ass(
    path: Path,
    scene_text: str,
    duration: float,
    output: OutputConfig,
    captions: CaptionConfig,
    word_timings: list[tuple[str, float, float]] | None = None,
) -> None:
    events = build_caption_events(scene_text, duration, captions, word_timings)
    lines = [
        "[Script Info]",
        "ScriptType: v4.00+",
        f"PlayResX: {output.width}",
        f"PlayResY: {output.height}",
        "WrapStyle: 2",
        "ScaledBorderAndShadow: yes",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        (
            "Style: Caption,"
            f"{captions.font},{captions.font_size},{captions.primary_color},&H000000FF,"
            f"&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,5,2,2,90,90,{captions.margin_v},1"
        ),
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]

    for text, start_time, end_time in events:
        lines.append(
            "Dialogue: 0,"
            f"{to_ass_timestamp(start_time)},{to_ass_timestamp(end_time)},"
            f"Caption,,0,0,0,,{text}"
        )

    path.write_text("\n".join(lines), encoding="utf-8")


def ffmpeg_escape(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace(":", "\\:")
        .replace("'", r"\'")
        .replace(",", r"\,")
        .replace("[", r"\[")
        .replace("]", r"\]")
    )


def build_brand_overlay_expr(brand: BrandOverlay) -> str:
    position = normalize_token(brand.position or "bottom_left")
    if position == "bottom_left":
        return f"x={brand.margin_x}:y=H-h-{brand.margin_y}"
    if position == "bottom_right":
        return f"x=W-w-{brand.margin_x}:y=H-h-{brand.margin_y}"
    if position == "top_left":
        return f"x={brand.margin_x}:y={brand.margin_y}"
    if position == "top_right":
        return f"x=W-w-{brand.margin_x}:y={brand.margin_y}"
    raise SystemExit(f"Unsupported brand_position: {brand.position}")


def render_scene(
    index: int,
    duration: float,
    output: OutputConfig,
    footage: FootageConfig,
    brand: BrandOverlay,
    source_clips: list[Path],
    audio_path: Path,
    subtitle_path: Path,
    dest: Path,
) -> None:
    subtitle_filter = f"subtitles='{ffmpeg_escape(str(subtitle_path))}'"
    cut_duration = duration / len(source_clips)
    video_chains = []
    for clip_index, source_clip in enumerate(source_clips):
        source_duration = probe_duration(source_clip)
        max_start = max(0.0, source_duration - cut_duration - 0.1)
        start = round(random.uniform(0.0, max_start), 3) if max_start > 0 else 0.0
        frames = max(1, int(round(cut_duration * output.fps)))
        zoom_in = (index + clip_index) % 2 == 0
        zoom_expr = (
            f"1+{footage.zoom_amount}*in/{frames}"
            if zoom_in
            else f"{1 + footage.zoom_amount}-{footage.zoom_amount}*in/{frames}"
        )
        zoom_filter = (
            f"zoompan=z='{zoom_expr}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2'"
            f":d=1:s={output.width}x{output.height}:fps={output.fps}"
        )
        video_chains.append(
            f"[{clip_index}:v]trim=start={start}:duration={cut_duration:.3f},setpts=PTS-STARTPTS,"
            f"fps={output.fps},scale={output.width}:{output.height}:force_original_aspect_ratio=increase,"
            f"crop={output.width}:{output.height},{zoom_filter},eq=saturation=1.14:contrast=1.06:brightness=-0.01,"
            f"vignette,format=yuv420p[v{clip_index}]"
        )

    video_labels = "".join(f"[v{clip_index}]" for clip_index in range(len(source_clips)))
    base_chain = (
        ";".join(video_chains)
        + f";{video_labels}concat=n={len(source_clips)}:v=1:a=0,"
        + f"{subtitle_filter}[base]"
    )

    cmd = ["ffmpeg", "-y"]
    for source_clip in source_clips:
        cmd.extend(["-stream_loop", "-1", "-i", str(source_clip)])
    audio_input_index = len(source_clips)
    cmd.extend(["-i", str(audio_path)])

    if brand.path:
        brand_expr = build_brand_overlay_expr(brand)
        filter_complex = (
            f"{base_chain};"
            f"[{audio_input_index}:a]apad=whole_dur={duration:.3f},atrim=0:{duration:.3f}[a];"
            f"[{audio_input_index + 1}:v]scale={brand.width}:-1[brand];"
            f"[base][brand]overlay={brand_expr}[v]"
        )
        cmd.extend(["-loop", "1", "-i", str(brand.path)])
    else:
        filter_complex = (
            f"{base_chain};"
            f"[{audio_input_index}:a]apad=whole_dur={duration:.3f},atrim=0:{duration:.3f}[a];"
            "[base]copy[v]"
        )

    cmd.extend(
        [
            "-filter_complex",
            filter_complex,
            "-map",
            "[v]",
            "-map",
            "[a]",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "20",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-t",
            f"{duration:.3f}",
            "-r",
            str(output.fps),
            "-pix_fmt",
            "yuv420p",
            str(dest),
        ]
    )

    run(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def concat_videos(work_dir: Path, clips: list[Path], dest: Path) -> None:
    concat_file = work_dir / "concat.txt"
    concat_file.write_text("".join(f"file '{clip.as_posix()}'\n" for clip in clips), encoding="utf-8")
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_file),
            "-c",
            "copy",
            str(dest),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def add_music_bed(video: Path, music: Path, volume: float) -> None:
    duration = probe_duration(video)
    fade_start = max(0.0, duration - 1.2)
    mixed = video.with_name(video.stem + "_music" + video.suffix)
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video),
            "-stream_loop",
            "-1",
            "-i",
            str(music),
            "-filter_complex",
            (
                f"[1:a]volume={volume},atrim=0:{duration:.3f},"
                f"afade=t=out:st={fade_start:.3f}:d=1.2[m];"
                "[0:a][m]amix=inputs=2:duration=first:normalize=0[a]"
            ),
            "-map",
            "0:v",
            "-map",
            "[a]",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            str(mixed),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    mixed.replace(video)


def write_attribution_file(work_dir: Path, records: list[dict]) -> Path:
    path = work_dir / "pexels_attribution.txt"
    lines = ["Pexels attribution", ""]
    for record in records:
        lines.append(f"scene {record['scene']}: {record['photographer']} | {record['url']}")
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def build_full_script(scenes: list[SceneConfig]) -> tuple[str, str]:
    full_text = "\n\n".join(scene.narration for scene in scenes)
    full_plain = "\n\n".join(strip_audio_tags(scene.narration) for scene in scenes)
    return full_text, full_plain


def render_video(config_path: Path, video_config: VideoConfig, runtime: RuntimeConfig, seed: int | None) -> None:
    ensure_dirs(runtime.work_dir)
    if seed is None:
        random.seed()
    else:
        random.seed(seed)

    resolved_audio_bed = resolve_audio_bed(config_path, video_config)
    brand_overlay = resolve_brand_overlay(config_path, video_config.output)
    voice_id = resolve_elevenlabs_voice_id(runtime, video_config.voice)
    full_text, full_plain = build_full_script(video_config.scenes)

    raw_audio_path = runtime.work_dir / "audio" / "narration_raw.mp3"
    full_audio_path = runtime.work_dir / "audio" / "narration_full.wav"

    print(f"Generating narration in one pass (model: {video_config.voice.model_id})")
    generate_narration(runtime, voice_id, video_config.voice, full_text, raw_audio_path)
    if abs(video_config.voice.narration_speed - 1.0) > 0.01:
        print(f"Adjusting narration pace to {video_config.voice.narration_speed:.2f}x")
        change_audio_tempo(raw_audio_path, full_audio_path, video_config.voice.narration_speed)
    else:
        transcode_audio_to_wav(raw_audio_path, full_audio_path)

    print("Force-aligning transcript for scene timings")
    alignment = force_align(runtime, full_audio_path, full_plain)
    scene_words = locate_scene_words(alignment, video_config.scenes)
    audio_paths = [
        runtime.work_dir / "audio" / f"scene_{index:02d}.wav"
        for index in range(len(video_config.scenes))
    ]
    offsets = slice_narration(full_audio_path, scene_words, audio_paths)

    rendered_clips: list[Path] = []
    used_video_ids: set[int] = set()
    attribution_records: list[dict] = []

    for index, scene in enumerate(video_config.scenes):
        audio_path = audio_paths[index]
        subtitle_path = runtime.work_dir / "subs" / f"scene_{index:02d}.ass"
        source_clip_path = runtime.work_dir / "video_src" / f"scene_{index:02d}.mp4"
        rendered_clip_path = runtime.work_dir / "video_rendered" / f"scene_{index:02d}.mp4"
        caption_text = strip_audio_tags(scene.narration)

        print(f"\nScene {index + 1}/{len(video_config.scenes)}")
        print(f"  narration: {scene.narration}")

        audio_duration = probe_duration(audio_path)
        duration = quantize_duration(audio_duration + DEFAULT_SCENE_TAIL_PADDING, video_config.output.fps)
        relative_words = [
            (word, max(0.0, start - offsets[index]), max(0.0, end - offsets[index]))
            for word, start, end in scene_words[index]
        ]
        write_ass(
            subtitle_path,
            caption_text,
            duration,
            video_config.output,
            video_config.captions,
            relative_words,
        )

        cut_count = scene.cuts or video_config.footage.default_cuts
        selected_clips = [
            choose_source_clip(
                runtime,
                video_config.footage,
                scene.queries,
                used_video_ids,
            )
            for _ in range(cut_count)
        ]
        print(f"  pexels queries: {scene.queries}")
        source_clip_paths = []
        for clip_index, (video, file_data) in enumerate(selected_clips, start=1):
            clip_path = source_clip_path.with_stem(f"{source_clip_path.stem}_{clip_index:02d}")
            print(f"  source {clip_index}/{cut_count}: {video.get('url')}")
            http_download(file_data["link"], clip_path)
            source_clip_paths.append(clip_path)
            attribution_records.append(
                {
                    "scene": f"{index + 1}.{clip_index}",
                    "photographer": video.get("user", {}).get("name", "unknown"),
                    "url": video.get("url", ""),
                }
            )
        render_scene(
            index,
            duration,
            video_config.output,
            video_config.footage,
            brand_overlay,
            source_clip_paths,
            audio_path,
            subtitle_path,
            rendered_clip_path,
        )

        rendered_clips.append(rendered_clip_path)

    concat_videos(runtime.work_dir, rendered_clips, runtime.output_path)
    if resolved_audio_bed.path:
        print(f"\nMixing music bed ({resolved_audio_bed.description}): {resolved_audio_bed.path}")
        add_music_bed(runtime.output_path, resolved_audio_bed.path, video_config.audio_bed.volume)
    else:
        print("\nNOTE: no music bed. Set audio_bed.mode to file or match if you want one.")

    attribution_path = write_attribution_file(runtime.work_dir, attribution_records)
    total_duration = sum(probe_duration(clip) for clip in rendered_clips)
    print(f"\nDONE: {runtime.output_path} ({total_duration:.1f}s)")
    print(f"ATTRIBUTION: {attribution_path}")


def main() -> None:
    args = parse_args()
    config_path = Path(args.config).resolve()
    video_config = load_video_config(config_path)
    runtime = load_runtime_config(args, video_config)
    render_video(config_path, video_config, runtime, args.seed)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
