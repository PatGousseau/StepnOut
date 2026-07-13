#!/usr/bin/env python3
"""Render a config-driven, suspense-first side-quest roulette video.

Unlike the initial roulette experiment, the wheel never asks the viewer to
pause. Every slice remains anonymous while it spins; only the selected outcome
is revealed, with a completion rule and a reason to take the challenge.

Usage:
    python scripts/shortform_video/roulette.py scripts/shortform_video/configs/roulette.json
    python scripts/shortform_video/roulette.py path/to/roulette.json --seed 42
"""

from __future__ import annotations

import argparse
import base64
import json
import math
import os
import random
import shutil
import struct
import subprocess
import sys
import urllib.error
import urllib.request
import wave
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
DEFAULT_CONFIG = ROOT / "configs" / "roulette.json"
DEFAULT_WORK_DIR = Path("/tmp/stepnout_shortform/roulette")
WIDTH = 1080
HEIGHT = 1920
FPS = 24
SAMPLE_RATE = 44100
VOICE_ID = "wWWn96OtTHu1sn8SRGEr"  # Hale
FONT_HEAVY = "/System/Library/Fonts/Supplemental/Impact.ttf"
FONT_FUTURA = "/System/Library/Fonts/Supplemental/Futura.ttc"
WORDMARK_PATH = ROOT / "assets" / "stepnout-wordmark-white.png"


@dataclass(frozen=True)
class Candidate:
    id: str
    title: str
    spoken_title: str
    completion: str
    narration: str


@dataclass(frozen=True)
class Hook:
    id: str
    text: str


@dataclass(frozen=True)
class WordTiming:
    text: str
    start: float
    end: float


@dataclass(frozen=True)
class RouletteSettings:
    candidates: list[Candidate]
    hooks: list[Hook]
    spin_duration: float
    turns: float
    reveal_delay: float
    winner: str | None
    hook: str | None


@dataclass(frozen=True)
class VoiceSettings:
    voice_id: str
    model_id: str
    narration_speed: float
    transition_line: str
    reveal_lead: str


@dataclass(frozen=True)
class OutputSettings:
    filename: str
    width: int
    height: int
    fps: int


@dataclass(frozen=True)
class VideoSettings:
    roulette: RouletteSettings
    voice: VoiceSettings
    output: OutputSettings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", nargs="?", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--work-dir", type=Path, default=DEFAULT_WORK_DIR)
    parser.add_argument("--output", type=Path, help="Optional explicit MP4 path.")
    parser.add_argument("--winner", help="Candidate ID override for a deterministic render.")
    parser.add_argument("--hook", help="Hook ID override for a deterministic render.")
    parser.add_argument("--seed", type=int, help="Select a candidate deterministically when no winner is configured.")
    parser.add_argument("--skip-narration", action="store_true", help="Reuse cached TTS files while tuning visuals.")
    return parser.parse_args()


def run(command: list[str]) -> None:
    print(">>", " ".join(command))
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def probe_duration(path: Path) -> float:
    output = subprocess.check_output(
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
    return float(json.loads(output)["format"]["duration"])


def load_settings(path: Path) -> VideoSettings:
    raw = json.loads(path.read_text(encoding="utf-8"))
    roulette_raw = raw.get("roulette", {})
    candidates = [
        Candidate(
            id=str(item["id"]),
            title=str(item["title"]),
            spoken_title=str(item.get("spoken_title", item["title"].replace("\n", " ").lower())),
            completion=str(item["completion"]),
            narration=str(item["narration"]),
        )
        for item in roulette_raw.get("candidates", [])
    ]
    if len(candidates) < 4:
        raise SystemExit("roulette.candidates needs at least four outcomes.")
    if len({candidate.id for candidate in candidates}) != len(candidates):
        raise SystemExit("roulette.candidates IDs must be unique.")
    hooks = [
        Hook(
            id=str(item["id"]),
            text=str(item["text"]),
        )
        for item in roulette_raw.get("hooks", [])
    ]
    if not hooks:
        raise SystemExit("roulette.hooks needs at least one hook.")
    if len({hook.id for hook in hooks}) != len(hooks):
        raise SystemExit("roulette.hooks IDs must be unique.")

    voice_raw = raw.get("voice", {})
    narration_raw = raw.get("narration", {})
    output_raw = raw.get("output", {})
    output = OutputSettings(
        filename=str(output_raw.get("filename", "side_quest_roulette.mp4")),
        width=int(output_raw.get("width", WIDTH)),
        height=int(output_raw.get("height", HEIGHT)),
        fps=int(output_raw.get("fps", FPS)),
    )
    if (output.width, output.height, output.fps) != (WIDTH, HEIGHT, FPS):
        raise SystemExit("roulette.py currently renders only 1080x1920 at 24 fps.")

    return VideoSettings(
        roulette=RouletteSettings(
            candidates=candidates,
            hooks=hooks,
            spin_duration=max(3.5, float(roulette_raw.get("spin_duration", 7.2))),
            turns=max(4.0, float(roulette_raw.get("turns", 9))),
            reveal_delay=max(0.2, float(roulette_raw.get("reveal_delay", 0.65))),
            winner=roulette_raw.get("winner"),
            hook=roulette_raw.get("hook"),
        ),
        voice=VoiceSettings(
            voice_id=str(voice_raw.get("voice_id") or os.environ.get("ELEVENLABS_VOICE_ID") or VOICE_ID),
            model_id=str(voice_raw.get("model_id", "eleven_v3")),
            narration_speed=max(0.8, min(1.5, float(voice_raw.get("narration_speed", 1.2)))),
            transition_line=str(
                narration_raw.get(
                    "transition_line",
                    "You don't need a new life. You need one new move.",
                )
            ),
            reveal_lead=str(narration_raw.get("reveal_lead", "Today's challenge:")),
        ),
        output=output,
    )


def choose_winner(settings: VideoSettings, override: str | None, seed: int | None) -> Candidate:
    requested = override or settings.roulette.winner
    if requested:
        for candidate in settings.roulette.candidates:
            if candidate.id == requested:
                return candidate
        raise SystemExit(f"Unknown roulette winner: {requested}")
    chooser = random.Random(seed)
    return chooser.choice(settings.roulette.candidates)


def choose_hook(settings: VideoSettings, override: str | None, seed: int | None) -> Hook:
    requested = override or settings.roulette.hook
    if requested:
        for hook in settings.roulette.hooks:
            if hook.id == requested:
                return hook
        raise SystemExit(f"Unknown roulette hook: {requested}")
    chooser = random.Random(f"{seed}:hook") if seed is not None else random.Random()
    return chooser.choice(settings.roulette.hooks)


def generate_narration(text: str, destination: Path, voice: VoiceSettings) -> None:
    api_key = os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("ELEVEN_LABS_API_KEY")
    if not api_key:
        raise SystemExit("Missing ELEVENLABS_API_KEY.")
    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice.voice_id}?output_format=mp3_44100_128",
        data=json.dumps(
            {
                "text": text,
                "model_id": voice.model_id,
                "voice_settings": {"stability": 0.22},
            }
        ).encode("utf-8"),
        headers={"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
    )
    try:
        with urllib.request.urlopen(request) as response:
            destination.write_bytes(response.read())
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs failed: {detail}") from error


def generate_narration_with_timestamps(text: str, destination: Path, voice: VoiceSettings) -> dict[str, object]:
    """Generate the opening as one take so its delivery and timing stay coherent."""
    api_key = os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("ELEVEN_LABS_API_KEY")
    if not api_key:
        raise SystemExit("Missing ELEVENLABS_API_KEY.")
    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice.voice_id}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(
            {
                "text": text,
                "model_id": voice.model_id,
                "voice_settings": {"stability": 0.22},
            }
        ).encode("utf-8"),
        headers={"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(request) as response:
            payload = json.loads(response.read())
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs failed: {detail}") from error

    alignment = payload.get("alignment")
    if not isinstance(alignment, dict) or not alignment.get("characters"):
        raise RuntimeError("ElevenLabs did not return narration timing for the opening.")
    destination.write_bytes(base64.b64decode(payload["audio_base64"]))
    return alignment


def reveal_script(voice: VoiceSettings, winner: Candidate) -> str:
    return f"{voice.reveal_lead} {winner.spoken_title}. {winner.narration}"


def hook_script(hook: Hook) -> str:
    return " ".join(hook.text.lower().split()) + "."


def intro_script(hook: Hook, voice: VoiceSettings) -> str:
    return f"{hook_script(hook)} {voice.transition_line}"


def aligned_words(alignment: dict[str, object], speed: float) -> list[WordTiming]:
    """Collapse ElevenLabs character timestamps into word-onset timings."""
    characters = alignment.get("characters")
    starts = alignment.get("character_start_times_seconds")
    ends = alignment.get("character_end_times_seconds")
    if not isinstance(characters, list) or not isinstance(starts, list) or not isinstance(ends, list):
        raise RuntimeError("ElevenLabs returned invalid opening narration timing.")
    if not (len(characters) == len(starts) == len(ends)):
        raise RuntimeError("ElevenLabs returned incomplete opening narration timing.")

    words: list[WordTiming] = []
    word_characters: list[str] = []
    word_start: float | None = None
    word_end: float | None = None
    for character, start, end in zip(characters, starts, ends):
        is_word_character = isinstance(character, str) and (
            any(letter.isalnum() for letter in character) or character in {"'", "\u2019"}
        )
        if is_word_character:
            if word_start is None:
                word_start = float(start)
            word_characters.append(character)
            word_end = float(end)
        elif word_start is not None and word_end is not None:
            words.append(WordTiming("".join(word_characters), word_start / speed, word_end / speed))
            word_characters = []
            word_start = None
            word_end = None
    if word_start is not None and word_end is not None:
        words.append(WordTiming("".join(word_characters), word_start / speed, word_end / speed))
    if not words:
        raise RuntimeError("Could not derive opening word timings from ElevenLabs alignment.")
    return words


def change_tempo(source: Path, destination: Path, speed: float) -> None:
    if abs(speed - 1.0) < 0.01:
        shutil.copy2(source, destination)
        return
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(source),
            "-filter:a",
            f"atempo={speed:.3f}",
            "-c:a",
            "libmp3lame",
            "-b:a",
            "128k",
            str(destination),
        ]
    )


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def ease_out(value: float) -> float:
    value = clamp(value)
    return 1 - (1 - value) ** 3


def lerp(left: float, right: float, amount: float) -> float:
    return left + (right - left) * amount


def phase(time: float, start: float, end: float) -> float:
    return clamp((time - start) / max(0.001, end - start))


@lru_cache(maxsize=None)
def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


@lru_cache(maxsize=None)
def background(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(image)
    for y in range(HEIGHT):
        amount = y / (HEIGHT - 1)
        draw.line(
            (0, y, WIDTH, y),
            fill=tuple(int(lerp(top[index], bottom[index], amount)) for index in range(3)),
        )
    return image


GRAIN = Image.effect_noise((WIDTH, HEIGHT), 15).convert("L")
GRAIN_LAYER = Image.merge("RGBA", (GRAIN, GRAIN, GRAIN, Image.new("L", (WIDTH, HEIGHT), 12)))


@lru_cache(maxsize=1)
def wordmark() -> Image.Image:
    image = Image.open(WORDMARK_PATH).convert("RGBA")
    width = 238
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def finish(frame: Image.Image) -> Image.Image:
    return Image.alpha_composite(frame.convert("RGBA"), GRAIN_LAYER).convert("RGB")


def add_wordmark(frame: Image.Image) -> None:
    image = wordmark()
    x = WIDTH - image.width - 62
    y = HEIGHT - image.height - 92
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle((x - 22, y - 18, WIDTH - 40, y + image.height + 18), radius=30, fill=(77, 83, 130))
    frame.paste(image, (x, y), image)


def text_box(draw: ImageDraw.ImageDraw, text: str, typeface: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=typeface)
    return box[2] - box[0], box[3] - box[1]


def fit_font(draw: ImageDraw.ImageDraw, text: str, max_width: int, start_size: int, path: str = FONT_HEAVY) -> ImageFont.FreeTypeFont:
    for size in range(start_size, 28, -2):
        candidate = font(path, size)
        if text_box(draw, text, candidate)[0] <= max_width:
            return candidate
    return font(path, 28)


def draw_centered(
    draw: ImageDraw.ImageDraw,
    text: str,
    center_x: float,
    top_y: float,
    typeface: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int] | str,
    *,
    spacing: int = 0,
) -> tuple[int, int]:
    lines = text.split("\n")
    boxes = [draw.textbbox((0, 0), line, font=typeface) for line in lines]
    heights = [box[3] - box[1] for box in boxes]
    width = 0
    y = top_y
    for line, box, height in zip(lines, boxes, heights):
        line_width = box[2] - box[0]
        width = max(width, line_width)
        draw.text((center_x - line_width / 2, y - box[1]), line, font=typeface, fill=fill)
        y += height + spacing
    return width, y - top_y


def wrap_text(draw: ImageDraw.ImageDraw, text: str, typeface: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current: list[str] = []
    for word in text.split():
        candidate = " ".join([*current, word])
        if current and text_box(draw, candidate, typeface)[0] > max_width:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    max_width: int,
    typeface: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    *,
    line_gap: int = 14,
) -> int:
    lines = wrap_text(draw, text, typeface, max_width)
    line_height = text_box(draw, "Ag", typeface)[1]
    for index, line in enumerate(lines):
        draw.text((x, y + index * (line_height + line_gap)), line, font=typeface, fill=fill)
    return len(lines) * (line_height + line_gap) - line_gap


def caption_state(time: float, words: list[WordTiming], words_per_chunk: int = 2) -> tuple[list[WordTiming], int] | None:
    """Return the current short caption and the word to highlight."""
    for chunk_start in range(0, len(words), words_per_chunk):
        chunk = words[chunk_start : chunk_start + words_per_chunk]
        chunk_end = (
            words[chunk_start + words_per_chunk].start
            if chunk_start + words_per_chunk < len(words)
            else chunk[-1].end + 0.28
        )
        if not chunk[0].start <= time < chunk_end:
            continue
        active = 0
        for index, word in enumerate(chunk):
            if word.start <= time:
                active = index
        return chunk, active
    return None


def draw_timed_caption(draw: ImageDraw.ImageDraw, time: float, words: list[WordTiming], top_y: int) -> None:
    state = caption_state(time, words)
    if state is None:
        return

    chunk, active_index = state
    navy = (77, 83, 130)
    white = (255, 255, 253)
    outline = (17, 18, 39)
    text = " ".join(word.text.upper() for word in chunk)
    typeface = fit_font(draw, text, 900, 104)
    space_width = text_box(draw, " ", typeface)[0]
    widths = [text_box(draw, word.text.upper(), typeface)[0] for word in chunk]
    total_width = sum(widths) + space_width * (len(chunk) - 1)
    x = (WIDTH - total_width) / 2
    for index, (word, width) in enumerate(zip(chunk, widths)):
        draw.text(
            (x, top_y),
            word.text.upper(),
            font=typeface,
            fill=navy if index == active_index else white,
            stroke_width=6,
            stroke_fill=outline,
        )
        x += width + space_width


def wheel_rotation(time: float, spin_duration: float, total_degrees: float) -> float:
    if time >= spin_duration:
        return total_degrees
    return total_degrees * ease_out(time / spin_duration)


def winning_rotation(candidate_count: int, winner_index: int, turns: float) -> float:
    segment = 360 / candidate_count
    # Put the selected slice's centre under the fixed pointer at -90 degrees.
    target = -90 - (winner_index + 0.5) * segment
    return turns * 360 + target


WHEEL_COLORS = [
    (103, 109, 160),  # app primary soft
    (226, 125, 96),   # side-quest coral
    (235, 218, 204),  # app secondary
    (178, 219, 185),
    (142, 150, 201),
    (240, 154, 129),
    (229, 231, 245),  # app accent 2
    (255, 229, 180),
]


def draw_wheel(
    draw: ImageDraw.ImageDraw,
    candidate_count: int,
    rotation: float,
    center_x: float,
    center_y: float,
    radius: float,
    *,
    selected_index: int | None = None,
) -> None:
    deep_indigo = (37, 40, 96)
    primary = (77, 83, 130)
    soft_indigo = (103, 109, 160)
    cream = (245, 242, 237)
    segment = 360 / candidate_count
    draw.ellipse((center_x - radius, center_y - radius, center_x + radius, center_y + radius), fill=primary)
    wedge_radius = radius - 20
    for index in range(candidate_count):
        start = math.radians(rotation + index * segment)
        end = math.radians(rotation + (index + 1) * segment)
        points = [(center_x, center_y)] + [
            (
                center_x + math.cos(start + (end - start) * step / 24) * wedge_radius,
                center_y + math.sin(start + (end - start) * step / 24) * wedge_radius,
            )
            for step in range(25)
        ]
        color = WHEEL_COLORS[index % len(WHEEL_COLORS)]
        if selected_index is not None and index != selected_index:
            color = tuple(int(value * 0.62) for value in color)
        draw.polygon(points, fill=color, outline=deep_indigo)
    draw.ellipse((center_x - wedge_radius, center_y - wedge_radius, center_x + wedge_radius, center_y + wedge_radius), outline=soft_indigo, width=max(6, int(radius * 0.018)))
    draw.ellipse((center_x - radius, center_y - radius, center_x + radius, center_y + radius), outline=cream, width=max(8, int(radius * 0.032)))
    inner_ring = radius * 0.72
    draw.ellipse((center_x - inner_ring, center_y - inner_ring, center_x + inner_ring, center_y + inner_ring), outline=(255, 255, 255), width=max(3, int(radius * 0.009)))
    hub = radius * 0.20
    draw.ellipse((center_x - hub, center_y - hub, center_x + hub, center_y + hub), fill=deep_indigo, outline=cream, width=max(6, int(radius * 0.022)))
    draw.ellipse((center_x - hub * 0.24, center_y - hub * 0.24, center_x + hub * 0.24, center_y + hub * 0.24), fill=(226, 125, 96))


def draw_pointer(draw: ImageDraw.ImageDraw, center_x: float, center_y: float, radius: float) -> None:
    cream = (245, 242, 237)
    deep_indigo = (37, 40, 96)
    draw.polygon(
        [
            (center_x - radius * 0.12, center_y - radius - radius * 0.16),
            (center_x + radius * 0.12, center_y - radius - radius * 0.16),
            (center_x, center_y - radius + radius * 0.05),
        ],
        fill=cream,
        outline=deep_indigo,
    )


def draw_challenge_card(
    draw: ImageDraw.ImageDraw,
    winner: Candidate,
    top_y: float,
    scale: float,
    *,
    show_completion: bool,
) -> None:
    navy = (77, 83, 130)
    card_width = 968 * scale
    card_height = 770 * scale
    card_left = (WIDTH - card_width) / 2
    card_right = card_left + card_width
    card_bottom = top_y + card_height
    radius = max(28, int(46 * scale))
    shadow_offset = max(10, int(18 * scale))
    draw.rounded_rectangle(
        (card_left + shadow_offset, top_y + shadow_offset, card_right + shadow_offset, card_bottom + shadow_offset),
        radius=radius,
        fill=navy,
    )
    draw.rounded_rectangle(
        (card_left, top_y, card_right, card_bottom),
        radius=radius,
        fill=(255, 255, 253),
        outline=navy,
        width=max(3, int(5 * scale)),
    )
    longest_title_line = max(winner.title.split("\n"), key=len)
    title_font = fit_font(draw, longest_title_line, int(card_width - 138 * scale), max(34, int(106 * scale)))
    draw_centered(draw, winner.title.upper(), WIDTH / 2, top_y + 76 * scale, title_font, navy, spacing=max(-8, int(-8 * scale)))

    if not show_completion:
        return
    divider_y = top_y + 345 * scale
    inner_margin = 42 * scale
    draw.line((card_left + inner_margin, divider_y, card_right - inner_margin, divider_y), fill=(229, 231, 245), width=max(2, int(4 * scale)))
    draw_wrapped(
        draw,
        winner.completion,
        int(card_left + inner_margin),
        int(divider_y + 52 * scale),
        int(card_width - inner_margin * 2),
        font(FONT_FUTURA, max(28, int(48 * scale))),
        navy,
        line_gap=max(10, int(14 * scale)),
    )


def draw_ambient_background(frame: Image.Image, time: float) -> None:
    draw = ImageDraw.Draw(frame)
    drift_a = math.sin(time * 0.42) * 42
    drift_b = math.cos(time * 0.31) * 34
    # Slow, soft forms keep the background alive without becoming a visual pattern.
    draw.ellipse((-390 + drift_a, -170, 390 + drift_a, 610), fill=(229, 231, 245))
    draw.ellipse((720 + drift_b, 100, 1320 + drift_b, 700), fill=(235, 218, 204))
    draw.rounded_rectangle((-150, 1380 + drift_b, 590, 2050 + drift_b), radius=260, fill=(255, 241, 236))
    draw.ellipse((630 - drift_a, 1325, 1260 - drift_a, 1955), fill=(241, 242, 251))
    draw.arc((90, 410, 990, 1310), 205, 326, fill=(229, 231, 245), width=16)
    draw.arc((170, 490, 910, 1230), 205, 326, fill=(235, 218, 204), width=10)


HOOK_POSITIONS = [
    (250, 245),
    (765, 330),
    (390, 520),
    (745, 690),
    (285, 870),
    (690, 1060),
    (365, 1240),
    (755, 1400),
]
HOOK_COLORS = [
    (77, 83, 130),
    (161, 78, 57),
    (103, 109, 160),
    (226, 125, 96),
]


def draw_hook_frame(frame: Image.Image, time: float, hook: Hook, word_timings: list[WordTiming]) -> None:
    frame.paste(background((255, 255, 253), (245, 242, 237)), (0, 0))
    draw_ambient_background(frame, time)
    draw = ImageDraw.Draw(frame)
    words = hook.text.upper().split()
    visible_words = min(len(words), sum(timing.start <= time for timing in word_timings))
    for index, word in enumerate(words[:visible_words]):
        x, y = HOOK_POSITIONS[index % len(HOOK_POSITIONS)]
        max_width = 510 if index % 2 == 0 else 470
        typeface = fit_font(draw, word, max_width, 122)
        draw_centered(draw, word, x, y, typeface, HOOK_COLORS[index % len(HOOK_COLORS)])
    add_wordmark(frame)


def draw_roulette_frame(
    frame: Image.Image,
    time: float,
    duration: float,
    settings: VideoSettings,
    winner: Candidate,
    transition_words: list[WordTiming],
    insight_words: list[WordTiming],
    reveal_start: float,
    insight_start: float,
) -> None:
    draw = ImageDraw.Draw(frame)
    navy = (77, 83, 130)
    cream = (245, 242, 237)
    count = len(settings.roulette.candidates)
    winner_index = settings.roulette.candidates.index(winner)
    total_rotation = winning_rotation(count, winner_index, settings.roulette.turns)
    spin_duration = settings.roulette.spin_duration
    rotation = wheel_rotation(time, spin_duration, total_rotation)

    frame.paste(background((255, 255, 253), (245, 242, 237)), (0, 0))
    draw_ambient_background(frame, time)

    if time < reveal_start:
        draw_centered(draw, "TODAY'S", WIDTH / 2, 92, font(FONT_FUTURA, 45), navy)
        draw_centered(draw, "SIDE QUEST", WIDTH / 2, 145, font(FONT_HEAVY, 92), navy)
        bounce = math.sin(time * 14) * (8 if time < spin_duration else 0)
        draw_wheel(draw, count, rotation, WIDTH / 2, 930 + bounce, 470, selected_index=winner_index if time >= spin_duration else None)
        draw_pointer(draw, WIDTH / 2, 930 + bounce, 470)
        if time >= spin_duration:
            impact = ease_out(phase(time, spin_duration, reveal_start))
            flash_radius = int(lerp(0, 620, impact))
            draw.ellipse((WIDTH / 2 - flash_radius, 930 - flash_radius, WIDTH / 2 + flash_radius, 930 + flash_radius), outline=(77, 83, 130), width=12)
        draw_timed_caption(draw, time, transition_words, 1490)
        add_wordmark(frame)
        return

    reveal = ease_out(phase(time, reveal_start, reveal_start + 0.75))
    wheel_scale = lerp(1.0, 0.46, reveal)
    wheel_y = lerp(880, 394, reveal)
    card_y = lerp(1970, 810, ease_out(phase(time, reveal_start + 0.08, reveal_start + 0.95)))
    compact_start = max(reveal_start + 1.05, insight_start - 0.75)
    compact = ease_out(phase(time, compact_start, compact_start + 0.65))
    wheel_y = lerp(wheel_y, -120, compact)
    wheel_radius = 426 * lerp(wheel_scale, 0.12, compact)
    if wheel_y + wheel_radius > 0:
        draw_wheel(draw, count, total_rotation, WIDTH / 2, wheel_y, wheel_radius, selected_index=winner_index)
        draw_pointer(draw, WIDTH / 2, wheel_y, wheel_radius)

    card_y = lerp(card_y, 220, compact)
    card_scale = lerp(1.0, 0.72, compact)
    if card_y < HEIGHT - 76:
        draw_challenge_card(
            draw,
            winner,
            card_y,
            card_scale,
            show_completion=time >= reveal_start + 1.05,
        )
    if time >= insight_start:
        draw_timed_caption(draw, time - reveal_start, insight_words, 1050)
    add_wordmark(frame)


def click_times(spin_duration: float, total_degrees: float, candidate_count: int) -> list[float]:
    segment = 360 / candidate_count
    count = max(1, int(total_degrees // segment))
    times = []
    for index in range(1, count + 1):
        progress = min(1.0, index * segment / total_degrees)
        # Invert 1 - (1 - x)^3, matching the wheel's deceleration curve.
        time = spin_duration * (1 - (1 - progress) ** (1 / 3))
        times.append(time)
    return times


def write_click_track(destination: Path, duration: float, click_at: list[float], reveal_time: float) -> None:
    """Synthesize a short mechanical tick for each slice passing the pointer."""
    sample_count = int(math.ceil(duration * SAMPLE_RATE))
    samples = [0.0] * sample_count
    rng = random.Random(17)

    for event_index, event_time in enumerate(click_at):
        start = int(event_time * SAMPLE_RATE)
        click_length = int(0.037 * SAMPLE_RATE)
        for offset in range(click_length):
            index = start + offset
            if index >= sample_count:
                break
            envelope = math.exp(-offset / (SAMPLE_RATE * 0.0065))
            noise = rng.uniform(-1.0, 1.0)
            tone = math.sin(2 * math.pi * (1220 + event_index % 3 * 145) * offset / SAMPLE_RATE)
            samples[index] += (noise * 0.45 + tone * 0.25) * envelope * 0.42

    # A restrained two-note reveal sting makes the stop feel resolved rather than abrupt.
    start = int(reveal_time * SAMPLE_RATE)
    sting_length = int(0.55 * SAMPLE_RATE)
    for offset in range(sting_length):
        index = start + offset
        if index >= sample_count:
            break
        envelope = math.exp(-offset / (SAMPLE_RATE * 0.17))
        tone = math.sin(2 * math.pi * 440 * offset / SAMPLE_RATE) + math.sin(2 * math.pi * 660 * offset / SAMPLE_RATE)
        samples[index] += tone * envelope * 0.12

    pcm = bytearray()
    for sample in samples:
        value = int(max(-1.0, min(1.0, sample)) * 32767)
        pcm.extend(struct.pack("<h", value))
    with wave.open(str(destination), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(bytes(pcm))


def mix_audio(
    intro: Path,
    reveal: Path,
    clicks: Path,
    reveal_start: float,
    duration: float,
    destination: Path,
) -> None:
    reveal_delay = int(reveal_start * 1000)
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(intro),
            "-i",
            str(reveal),
            "-i",
            str(clicks),
            "-filter_complex",
            (
                "[0:a]volume=1.16,adelay=0|0[intro];"
                f"[1:a]volume=1.12,adelay={reveal_delay}|{reveal_delay}[reveal];"
                "[2:a]volume=0.88[clicks];"
                "[intro][reveal][clicks]amix=inputs=3:normalize=0,"
                f"apad=whole_dur={duration:.3f},atrim=0:{duration:.3f},alimiter=limit=0.92[a]"
            ),
            "-map",
            "[a]",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            str(destination),
        ]
    )


def render_visual(
    settings: VideoSettings,
    winner: Candidate,
    hook: Hook,
    hook_word_timings: list[WordTiming],
    transition_words: list[WordTiming],
    insight_words: list[WordTiming],
    reveal_start: float,
    insight_start: float,
    roulette_start: float,
    duration: float,
    destination: Path,
) -> None:
    command = [
        "ffmpeg",
        "-y",
        "-f",
        "rawvideo",
        "-pixel_format",
        "rgb24",
        "-video_size",
        f"{WIDTH}x{HEIGHT}",
        "-framerate",
        str(FPS),
        "-i",
        "pipe:0",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(destination),
    ]
    print(">>", " ".join(command))
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    total_frames = int(math.ceil(duration * FPS))
    try:
        for frame_index in range(total_frames):
            time = frame_index / FPS
            frame = background((255, 255, 253), (245, 242, 237)).copy()
            if time < roulette_start:
                draw_hook_frame(frame, time, hook, hook_word_timings)
            else:
                draw_roulette_frame(
                    frame,
                    time - roulette_start,
                    duration - roulette_start,
                    settings,
                    winner,
                    transition_words,
                    insight_words,
                    reveal_start,
                    insight_start,
                )
            process.stdin.write(finish(frame).tobytes())
    except BrokenPipeError:
        raise RuntimeError("ffmpeg stopped while rendering roulette visuals") from None
    finally:
        if process.stdin:
            process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError("ffmpeg failed while rendering roulette visuals")


def mux_audio(video: Path, audio: Path, destination: Path) -> None:
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video),
            "-i",
            str(audio),
            "-map",
            "0:v",
            "-map",
            "1:a",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(destination),
        ]
    )


def main() -> None:
    args = parse_args()
    config_path = args.config.resolve()
    settings = load_settings(config_path)
    winner = choose_winner(settings, args.winner, args.seed)
    hook = choose_hook(settings, args.hook, args.seed)
    work_dir = args.work_dir.resolve()
    work_dir.mkdir(parents=True, exist_ok=True)
    raw_intro_audio = work_dir / f"intro_{hook.id}_raw.mp3"
    intro_alignment = work_dir / f"intro_{hook.id}_alignment.json"
    raw_reveal_audio = work_dir / f"reveal_{winner.id}_raw.mp3"
    reveal_alignment = work_dir / f"reveal_{winner.id}_alignment.json"
    intro_audio = work_dir / f"intro_{hook.id}.mp3"
    reveal_audio = work_dir / f"reveal_{winner.id}.mp3"
    effects = work_dir / "roulette_clicks.wav"
    mixed_audio = work_dir / "mix.m4a"
    visual = work_dir / "visual.mp4"
    output = args.output.resolve() if args.output else (work_dir / settings.output.filename).resolve()

    if not args.skip_narration or not raw_intro_audio.exists() or not intro_alignment.exists():
        print(f"Generating opening narration for {hook.id}")
        alignment = generate_narration_with_timestamps(intro_script(hook, settings.voice), raw_intro_audio, settings.voice)
        intro_alignment.write_text(json.dumps(alignment), encoding="utf-8")
    if not args.skip_narration or not raw_reveal_audio.exists() or not reveal_alignment.exists():
        print(f"Generating reveal narration for {winner.id}")
        alignment = generate_narration_with_timestamps(reveal_script(settings.voice, winner), raw_reveal_audio, settings.voice)
        reveal_alignment.write_text(json.dumps(alignment), encoding="utf-8")
    change_tempo(raw_intro_audio, intro_audio, settings.voice.narration_speed)
    change_tempo(raw_reveal_audio, reveal_audio, settings.voice.narration_speed)

    alignment = json.loads(intro_alignment.read_text(encoding="utf-8"))
    intro_word_timings = aligned_words(alignment, settings.voice.narration_speed)
    hook_word_count = len(hook.text.split())
    if len(intro_word_timings) <= hook_word_count:
        raise RuntimeError("ElevenLabs opening narration timing is missing the roulette transition.")
    hook_word_timings = intro_word_timings[:hook_word_count]
    roulette_start = intro_word_timings[hook_word_count].start
    transition_words = [
        WordTiming(word.text, word.start - roulette_start, word.end - roulette_start)
        for word in intro_word_timings[hook_word_count:]
    ]
    reveal_word_timings = aligned_words(json.loads(reveal_alignment.read_text(encoding="utf-8")), settings.voice.narration_speed)
    reveal_prefix_words = len(settings.voice.reveal_lead.split()) + len(winner.spoken_title.split())
    if len(reveal_word_timings) <= reveal_prefix_words:
        raise RuntimeError("ElevenLabs reveal narration timing is missing the insight narration.")
    insight_words = reveal_word_timings[reveal_prefix_words:]
    intro_duration = probe_duration(intro_audio)
    reveal_start = max(
        roulette_start + settings.roulette.spin_duration + settings.roulette.reveal_delay,
        intro_duration + 0.1,
    )
    reveal_duration = probe_duration(reveal_audio)
    duration = reveal_start + reveal_duration + 0.9
    reveal_start_in_roulette = reveal_start - roulette_start
    insight_start = reveal_start_in_roulette + insight_words[0].start
    winner_index = settings.roulette.candidates.index(winner)
    total_rotation = winning_rotation(len(settings.roulette.candidates), winner_index, settings.roulette.turns)
    write_click_track(
        effects,
        duration,
        [roulette_start + time for time in click_times(settings.roulette.spin_duration, total_rotation, len(settings.roulette.candidates))],
        roulette_start + settings.roulette.spin_duration,
    )
    mix_audio(intro_audio, reveal_audio, effects, reveal_start, duration, mixed_audio)
    render_visual(
        settings,
        winner,
        hook,
        hook_word_timings,
        transition_words,
        insight_words,
        reveal_start_in_roulette,
        insight_start,
        roulette_start,
        duration,
        visual,
    )
    mux_audio(visual, mixed_audio, output)

    result = {
        "winner": winner.id,
        "hook": hook.id,
        "duration_seconds": round(probe_duration(output), 2),
        "output": str(output),
    }
    (work_dir / "result.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
