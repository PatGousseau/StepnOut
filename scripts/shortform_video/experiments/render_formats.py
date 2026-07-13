#!/usr/bin/env python3
"""Render six original short-form video format experiments.

These experiments deliberately do not use the JSON/Pexels generator. They are
format studies: each combines a distinct narrative device, visual system, and
sound design so the team can compare formats before standardising a pipeline.

Usage:
    python scripts/shortform_video/experiments/render_formats.py
    python scripts/shortform_video/experiments/render_formats.py --only roulette

Output defaults to /tmp/stepnout_shortform/experiments.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = Path("/tmp/stepnout_shortform/experiments")
WIDTH = 1080
HEIGHT = 1920
FPS = 24
VOICE_ID = "wWWn96OtTHu1sn8SRGEr"  # Hale
FONT_HEAVY = "/System/Library/Fonts/Supplemental/Impact.ttf"
FONT_FUTURA = "/System/Library/Fonts/Supplemental/Futura.ttc"
FONT_MONO = "/System/Library/Fonts/Courier.ttc"
MUSIC = ROOT / "music" / "pixabay"


@dataclass(frozen=True)
class Experiment:
    slug: str
    title: str
    hypothesis: str
    narration: str
    min_duration: float
    visual: str
    sound: str
    music: str | None = None


EXPERIMENTS = [
    Experiment(
        slug="blunt_intervention",
        title="Blunt intervention",
        hypothesis=(
            "A confrontational, instantly legible reframe plus kinetic type can "
            "earn attention before the viewer has time to classify it as advice."
        ),
        narration=(
            "[direct, slightly incredulous] Your life is not boring. It is overprotected. "
            "[fast, conspiratorial] You do not need a new personality. You need one tiny "
            "thing that makes your stomach say, absolutely not. "
            "[firm] Text first. Ask second. Go alone if no one comes. "
            "[quietly, encouraging] Do it today. Make the story better."
        ),
        min_duration=22.0,
        visual="blunt",
        sound="impact",
    ),
    Experiment(
        slug="cancel_brain",
        title="The Cancel Brain",
        hypothesis=(
            "A comedic internal conflict makes the viewer feel seen, then resolves "
            "into a specific action rather than another generic motivational line."
        ),
        narration=(
            "[playful, mock serious] Today's challenge: make one plan you cannot quietly cancel. "
            "[as if reading a tiny argument] You want more stories. The part of you that "
            "cancels says, maybe later. "
            "[whispering, judgemental] That is not a plan. That is an escape hatch wearing "
            "a little hat. "
            "[energetic] Send the exact time. Send the exact place. Then put your phone down."
        ),
        min_duration=23.0,
        visual="brain",
        sound="bouncy",
    ),
    Experiment(
        slug="nature_documentary",
        title="Nature documentary",
        hypothesis=(
            "An unexpectedly serious documentary treatment can turn an ordinary social "
            "avoidance pattern into a memorable joke people want to send to a friend."
        ),
        narration=(
            "[documentary narrator, grave] Today's challenge: offer one real invitation before sunset. "
            "Here we observe the modern adult in its natural habitat. It longs for adventure, "
            "and returns to the exact same chair. "
            "[thoughtful] Notice the protective ritual: opening a message, waiting seven minutes, "
            "then answering, haha. "
            "[bright] Interrupt the pattern. Ask someone to do an actual thing. "
            "[quietly] The species may feel exposed. This is normal."
        ),
        min_duration=26.0,
        visual="documentary",
        sound="documentary",
        music="sigmamusicart-historical-documentary-background-atmospheric-moments-253424.mp3",
    ),
    Experiment(
        slug="side_quest_roulette",
        title="Side-quest roulette",
        hypothesis=(
            "Giving the viewer a literal pause-and-choose interaction creates agency, replay "
            "behaviour, and a natural reason to comment with the challenge they got."
        ),
        narration=(
            "[excited game show host] Stop scrolling. You get one side quest. Ready? "
            "[quick] Pause the wheel. Whatever it lands on, do it before midnight. "
            "[punchy] It is not a personality test. It is an exit ramp. "
            "[bright] Three, two, one. Go make a memory."
        ),
        min_duration=20.0,
        visual="roulette",
        sound="game",
    ),
    Experiment(
        slug="message_thriller",
        title="Message thriller",
        hypothesis=(
            "Treating a tiny familiar act as a suspense scene creates a miniature story with "
            "a payoff, rather than presenting a challenge as an instruction."
        ),
        narration=(
            "[quiet, cinematic] Today's challenge: send the message you have been postponing. "
            "[close] It is written. Your thumb is hovering. And your brain has invented thirteen "
            "reasons to wait. "
            "[urgent whisper] Send it before the typing bubble disappears. "
            "[relieved, warm] There. Nothing exploded. You just changed the plot."
        ),
        min_duration=23.0,
        visual="thriller",
        sound="tension",
        music="alex_makemusic-soft-ambient-10782.mp3",
    ),
    Experiment(
        slug="domino_laboratory",
        title="Domino laboratory",
        hypothesis=(
            "A satisfying causal animation turns an abstract self-improvement idea into a "
            "physical, rewatchable payoff and keeps the final instruction visually earned."
        ),
        narration=(
            "[bright, deliberate] Today's challenge is absurdly small: walk into one place you "
            "have never entered. "
            "[calm] Not because it will change your life. Because it changes the next five minutes. "
            "[building] One unfamiliar door. One question. One version of you with a new story. "
            "[confident] That is how boring days lose."
        ),
        min_duration=23.0,
        visual="domino",
        sound="domino",
    ),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Directory for MP4s and intermediates (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--only",
        choices=[experiment.slug for experiment in EXPERIMENTS],
        help="Render exactly one experiment.",
    )
    parser.add_argument(
        "--voice-id",
        default=os.environ.get("ELEVENLABS_VOICE_ID", VOICE_ID),
        help="ElevenLabs voice ID (defaults to Hale).",
    )
    parser.add_argument(
        "--skip-narration",
        action="store_true",
        help="Reuse an existing narration MP3; useful when tuning visuals.",
    )
    return parser.parse_args()


def run(command: list[str], *, stdout=None, stdin=None) -> subprocess.CompletedProcess:
    print(">>", " ".join(command))
    return subprocess.run(command, check=True, stdout=stdout, stdin=stdin)


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


def generate_narration(experiment: Experiment, voice_id: str, destination: Path) -> None:
    api_key = os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("ELEVEN_LABS_API_KEY")
    if not api_key:
        raise SystemExit("Missing ELEVENLABS_API_KEY.")

    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        data=json.dumps(
            {
                "text": experiment.narration,
                "model_id": "eleven_v3",
                # v3 performs best here with the delivery notes in the text, not a high style value.
                "voice_settings": {"stability": 0.38},
            }
        ).encode("utf-8"),
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
    )
    try:
        with urllib.request.urlopen(request) as response:
            destination.write_bytes(response.read())
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs failed for {experiment.slug}: {detail}") from error


def make_sfx(destination: Path, duration: float, style: str) -> None:
    """Make sparse original UI/impact effects, not a generic background beat."""
    events_by_style = {
        "impact": [(0.10, 92, 0.22, 1.4), (1.15, 68, 0.18, 1.1), (3.9, 112, 0.13, 0.8), (7.4, 72, 0.18, 1.0), (15.2, 128, 0.18, 0.7), (19.0, 92, 0.28, 1.3)],
        "bouncy": [(0.25, 620, 0.08, 0.45), (2.3, 760, 0.08, 0.4), (5.2, 510, 0.11, 0.5), (9.1, 820, 0.08, 0.45), (14.4, 680, 0.1, 0.45), (20.0, 920, 0.16, 0.5)],
        "documentary": [(1.8, 220, 0.1, 0.17), (7.4, 280, 0.08, 0.14), (14.0, 180, 0.1, 0.16), (21.2, 340, 0.12, 0.16)],
        "game": [(0.35, 980, 0.09, 0.45), (2.8, 660, 0.08, 0.35), (4.8, 720, 0.08, 0.35), (8.3, 880, 0.1, 0.45), (14.4, 1040, 0.12, 0.55), (18.1, 1320, 0.2, 0.5)],
        "tension": [(0.5, 170, 0.28, 0.16), (5.0, 220, 0.12, 0.18), (10.2, 280, 0.10, 0.19), (14.8, 420, 0.12, 0.23), (18.6, 680, 0.3, 0.25)],
        "domino": [(1.4, 400, 0.07, 0.34), (5.0, 450, 0.07, 0.34), (9.0, 500, 0.07, 0.34), (13.0, 550, 0.07, 0.34), (16.1, 600, 0.07, 0.34), (19.0, 740, 0.24, 0.44)],
    }
    events = events_by_style[style]
    command = ["ffmpeg", "-y"]
    for _, frequency, length, _ in events:
        command.extend(["-f", "lavfi", "-t", f"{length:.3f}", "-i", f"sine=frequency={frequency}:sample_rate=44100"])

    filters = []
    labels = []
    for index, (start, _, _, volume) in enumerate(events):
        label = f"s{index}"
        filters.append(
            f"[{index}:a]volume={volume:.2f},afade=t=out:st=0.02:d=0.08,"
            f"adelay={int(start * 1000)}|{int(start * 1000)}[{label}]"
        )
        labels.append(f"[{label}]")
    filters.append(
        "".join(labels)
        + f"amix=inputs={len(labels)}:normalize=0,atrim=0:{duration:.3f},aformat=channel_layouts=stereo[a]"
    )
    command.extend(
        [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[a]",
            "-c:a",
            "pcm_s16le",
            str(destination),
        ]
    )
    run(command, stdout=subprocess.DEVNULL)


def mix_audio(narration: Path, sfx: Path, experiment: Experiment, duration: float, destination: Path) -> None:
    command = ["ffmpeg", "-y", "-i", str(narration), "-i", str(sfx)]
    filters = ["[0:a]volume=1.12,apad,atrim=0:{:.3f}[voice]".format(duration), "[1:a]volume=0.80[effects]"]
    inputs = "[voice][effects]"
    if experiment.music:
        music_path = MUSIC / experiment.music
        command.extend(["-stream_loop", "-1", "-i", str(music_path)])
        filters.append(
            "[2:a]volume=0.075,atrim=0:{:.3f},afade=t=out:st={:.3f}:d=1.0[music]".format(
                duration, max(0.0, duration - 1.0)
            )
        )
        inputs += "[music]"
    filters.append(f"{inputs}amix=inputs={2 if not experiment.music else 3}:normalize=0,alimiter=limit=0.92[a]")
    command.extend(
        [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[a]",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            str(destination),
        ]
    )
    run(command, stdout=subprocess.DEVNULL)


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def ease_out(value: float) -> float:
    value = clamp(value)
    return 1 - (1 - value) ** 3


def ease_in_out(value: float) -> float:
    value = clamp(value)
    return 0.5 - math.cos(value * math.pi) / 2


def lerp(left: float, right: float, amount: float) -> float:
    return left + (right - left) * amount


@lru_cache(maxsize=None)
def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


@lru_cache(maxsize=None)
def background(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(image)
    for y in range(HEIGHT):
        ratio = y / (HEIGHT - 1)
        draw.line(
            (0, y, WIDTH, y),
            fill=tuple(int(lerp(top[channel], bottom[channel], ratio)) for channel in range(3)),
        )
    return image


GRAIN = Image.effect_noise((WIDTH, HEIGHT), 18).convert("L")
GRAIN_ALPHA = Image.new("L", (WIDTH, HEIGHT), 14)
GRAIN_LAYER = Image.merge("RGBA", (GRAIN, GRAIN, GRAIN, GRAIN_ALPHA))


def finish(frame: Image.Image) -> Image.Image:
    return Image.alpha_composite(frame.convert("RGBA"), GRAIN_LAYER).convert("RGB")


def text_size(draw: ImageDraw.ImageDraw, text: str, typeface: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=typeface, stroke_width=0)
    return box[2] - box[0], box[3] - box[1]


def draw_centered(
    draw: ImageDraw.ImageDraw,
    text: str,
    center_x: float,
    top_y: float,
    typeface: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int] | str,
    *,
    stroke_width: int = 0,
    stroke_fill: tuple[int, int, int] | str | None = None,
    spacing: int = 0,
) -> tuple[int, int]:
    lines = text.split("\n")
    boxes = [draw.textbbox((0, 0), line, font=typeface, stroke_width=stroke_width) for line in lines]
    line_heights = [box[3] - box[1] for box in boxes]
    height = sum(line_heights) + max(0, len(lines) - 1) * spacing
    y = top_y
    max_width = 0
    for line, box, line_height in zip(lines, boxes, line_heights):
        width = box[2] - box[0]
        max_width = max(max_width, width)
        draw.text(
            (center_x - width / 2, y - box[1]),
            line,
            font=typeface,
            fill=fill,
            stroke_width=stroke_width,
            stroke_fill=stroke_fill,
        )
        y += line_height + spacing
    return max_width, height


def fit_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, start_size: int, path: str = FONT_HEAVY) -> ImageFont.FreeTypeFont:
    for size in range(start_size, 30, -2):
        candidate = font(path, size)
        if text_size(draw, text, candidate)[0] <= max_width:
            return candidate
    return font(path, 30)


def phase(t: float, start: float, end: float) -> float:
    return clamp((t - start) / max(0.01, end - start))


def draw_label(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, *, fill=(255, 255, 255), background_fill=(16, 16, 20)) -> None:
    typeface = font(FONT_MONO, 30)
    width, height = text_size(draw, text, typeface)
    draw.rounded_rectangle((x, y, x + width + 32, y + height + 22), radius=9, fill=background_fill)
    draw.text((x + 16, y + 7), text, font=typeface, fill=fill)


def draw_blunt(frame: Image.Image, t: float, duration: float) -> None:
    draw = ImageDraw.Draw(frame)
    red = (255, 71, 51)
    cream = (255, 243, 219)
    navy = (16, 19, 29)
    for line in range(-300, WIDTH + 500, 150):
        offset = int((t * 150) % 150)
        draw.line((line - offset, 0, line + 800 - offset, HEIGHT), fill=(28, 34, 49), width=5)
    draw_label(draw, "UNCOMFORTABLE TRUTH", 58, 58, fill=cream, background_fill=red)
    if t < 5.0:
        p = ease_out(phase(t, 0.0, 0.5))
        y = lerp(-220, 270, p)
        draw_centered(draw, "YOUR LIFE", WIDTH / 2, y, font(FONT_HEAVY, 184), cream)
        y2 = lerp(HEIGHT + 100, 510, ease_out(phase(t, 0.20, 0.8)))
        draw_centered(draw, "IS NOT BORING.", WIDTH / 2, y2, font(FONT_HEAVY, 142), cream)
        if t > 1.15:
            punch = ease_out(phase(t, 1.15, 1.55))
            bar_y = 790
            bar_width = int(lerp(0, WIDTH + 60, punch))
            draw.rectangle((WIDTH / 2 - bar_width / 2, bar_y, WIDTH / 2 + bar_width / 2, bar_y + 176), fill=red)
            draw_centered(draw, "IT'S OVERPROTECTED.", WIDTH / 2, bar_y + 10, font(FONT_HEAVY, 100), navy)
        if t > 2.4:
            for index, word in enumerate(("SAFE", "SAFE", "SAFE")):
                x = 150 + index * 320 + int(math.sin(t * 5 + index) * 20)
                y_stamp = 1230 + (index % 2) * 170
                draw.rounded_rectangle((x, y_stamp, x + 260, y_stamp + 104), radius=16, outline=red, width=8)
                draw_centered(draw, word, x + 130, y_stamp + 13, font(FONT_HEAVY, 58), red)
    elif t < 14.5:
        p = ease_in_out(phase(t, 5, 5.7))
        draw_centered(draw, "YOU DON'T NEED", WIDTH / 2, 250, font(FONT_HEAVY, 118), cream)
        draw_centered(draw, "A NEW PERSONALITY.", WIDTH / 2, 410, font(FONT_HEAVY, 105), cream)
        x = lerp(WIDTH + 80, 55, p)
        if x < WIDTH - 55:
            draw.rounded_rectangle((x, 730, WIDTH - 55, 950), radius=30, fill=red)
            draw_centered(draw, "YOU NEED ONE SMALL NO.", WIDTH / 2, 782, font(FONT_HEAVY, 88), navy)
        for index, text in enumerate(("TEXT FIRST.", "ASK SECOND.", "GO ANYWAY.")):
            reveal = phase(t, 7.2 + index * 1.6, 7.65 + index * 1.6)
            if reveal > 0:
                y = 1130 + index * 150
                x = lerp(-600, 105, ease_out(reveal))
                draw.text((x, y), text, font=font(FONT_HEAVY, 85), fill=cream)
                draw.rectangle((58, y + 42, 86, y + 104), fill=red)
    else:
        wobble = math.sin(t * 9) * 6
        draw_centered(draw, "DO THE THING", WIDTH / 2 + wobble, 290, font(FONT_HEAVY, 150), cream)
        draw_centered(draw, "THAT MAKES YOU", WIDTH / 2 - wobble, 475, font(FONT_HEAVY, 132), cream)
        draw.rounded_rectangle((60, 670, WIDTH - 60, 930), radius=34, fill=red)
        draw_centered(draw, "GULP.", WIDTH / 2, 692, font(FONT_HEAVY, 180), navy)
        progress = phase(t, 15.3, duration - 0.8)
        draw.line((110, 1300, WIDTH - 110, 1300), fill=(72, 76, 86), width=18)
        draw.line((110, 1300, lerp(110, WIDTH - 110, progress), 1300), fill=cream, width=18)
        draw_centered(draw, "MAKE THE STORY BETTER.", WIDTH / 2, 1420, font(FONT_FUTURA, 55), cream)
        draw_label(draw, "TODAY", 58, 1700, fill=navy, background_fill=cream)


def face(draw: ImageDraw.ImageDraw, center: tuple[float, float], radius: int, color: tuple[int, int, int], expression: str) -> None:
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color, outline=(24, 25, 34), width=8)
    eye_y = y - radius * 0.15
    draw.ellipse((x - radius * 0.37, eye_y - 15, x - radius * 0.17, eye_y + 15), fill=(24, 25, 34))
    draw.ellipse((x + radius * 0.17, eye_y - 15, x + radius * 0.37, eye_y + 15), fill=(24, 25, 34))
    if expression == "smile":
        draw.arc((x - radius * 0.30, y - 5, x + radius * 0.30, y + radius * 0.42), 12, 168, fill=(24, 25, 34), width=10)
    elif expression == "flat":
        draw.line((x - radius * 0.28, y + radius * 0.23, x + radius * 0.28, y + radius * 0.23), fill=(24, 25, 34), width=10)
    else:
        draw.ellipse((x - radius * 0.11, y + radius * 0.10, x + radius * 0.11, y + radius * 0.31), outline=(24, 25, 34), width=8)


def speech_bubble(draw: ImageDraw.ImageDraw, box: tuple[float, float, float, float], text: str, color: tuple[int, int, int], side: str) -> None:
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=38, fill=color)
    if side == "left":
        draw.polygon([(x1 + 65, y2 - 25), (x1 + 125, y2 - 25), (x1 + 78, y2 + 55)], fill=color)
    else:
        draw.polygon([(x2 - 125, y2 - 25), (x2 - 65, y2 - 25), (x2 - 78, y2 + 55)], fill=color)
    typeface = fit_text(draw, text, int(x2 - x1 - 60), 64, FONT_FUTURA)
    draw_centered(draw, text, (x1 + x2) / 2, y1 + 38, typeface, (24, 25, 34))


def draw_brain(frame: Image.Image, t: float, duration: float) -> None:
    draw = ImageDraw.Draw(frame)
    ink = (24, 25, 34)
    butter = (255, 221, 70)
    blue = (92, 181, 255)
    pink = (255, 119, 143)
    draw.rectangle((0, 0, WIDTH / 2, HEIGHT), fill=(255, 243, 204))
    draw.rectangle((WIDTH / 2, 0, WIDTH, HEIGHT), fill=(174, 219, 255))
    draw_label(draw, "YOU", 58, 58, fill=ink, background_fill=butter)
    draw_label(draw, "CANCEL BRAIN", 596, 58, fill=ink, background_fill=pink)
    bob_left = math.sin(t * 2.5) * 12
    bob_right = math.sin(t * 3.2 + 1) * 12
    face(draw, (280, 1390 + bob_left), 172, butter, "smile" if t > 14 else "flat")
    face(draw, (800, 1390 + bob_right), 172, pink, "surprised" if t > 14 else "flat")
    if t < 4.5:
        speech_bubble(draw, (55, 310, 510, 620), "WE SHOULD\nDO SOMETHING.", butter, "left")
        speech_bubble(draw, (570, 610, 1025, 900), "MAYBE\nLATER?", pink, "right")
        draw_centered(draw, "MAKE A PLAN", WIDTH / 2, 1020, font(FONT_HEAVY, 118), ink)
        draw_centered(draw, "YOU CAN'T QUIETLY CANCEL.", WIDTH / 2, 1155, font(FONT_HEAVY, 64), ink)
    elif t < 14.5:
        speech_bubble(draw, (55, 300, 510, 565), "I WANT\nMORE STORIES.", butter, "left")
        speech_bubble(draw, (570, 600, 1025, 935), "WHAT IF WE\nSTAY HOME\nFOREVER?", pink, "right")
        hat_y = 1170 + math.sin(t * 4) * 8
        draw.polygon([(694, hat_y + 100), (906, hat_y + 100), (850, hat_y + 15), (750, hat_y + 15)], fill=(45, 61, 128), outline=ink)
        draw.rectangle((680, hat_y + 95, 920, hat_y + 125), fill=(45, 61, 128), outline=ink, width=5)
        draw_centered(draw, "ESCAPE HATCH", WIDTH / 2, 1035, font(FONT_HEAVY, 75), ink)
        draw_centered(draw, "WEARING A LITTLE HAT.", WIDTH / 2, 1130, font(FONT_FUTURA, 45), ink)
    else:
        phone_x, phone_y = 260, 340
        draw.rounded_rectangle((phone_x, phone_y, 820, 1130), radius=70, fill=ink)
        draw.rounded_rectangle((phone_x + 24, phone_y + 70, 796, 1100), radius=48, fill=(247, 247, 242))
        draw_centered(draw, "SEND THIS:", WIDTH / 2, 475, font(FONT_MONO, 37), ink)
        draw.rounded_rectangle((330, 580, 750, 760), radius=36, fill=blue)
        draw_centered(draw, "THURSDAY. 7PM.\nYOU IN?", WIDTH / 2, 615, font(FONT_HEAVY, 63), ink)
        progress = phase(t, 16.0, 17.6)
        button_color = tuple(int(lerp(ink[index], (48, 201, 121)[index], progress)) for index in range(3))
        draw.rounded_rectangle((445, 855, 635, 980), radius=60, fill=button_color)
        draw_centered(draw, "SEND", WIDTH / 2, 890, font(FONT_HEAVY, 53), (255, 255, 255))
        if t > 18:
            speech_bubble(draw, (600, 1180, 1030, 1405), "OH.\nTHAT WAS FINE.", blue, "right")
        draw_centered(draw, "THEN PUT YOUR PHONE DOWN.", WIDTH / 2, 1600, font(FONT_HEAVY, 62), ink)


def draw_documentary(frame: Image.Image, t: float, duration: float) -> None:
    draw = ImageDraw.Draw(frame)
    paper = (225, 215, 185)
    ink = (33, 38, 33)
    moss = (74, 97, 66)
    frame.paste(paper, (0, 0, WIDTH, HEIGHT))
    for x in range(0, WIDTH, 90):
        draw.line((x, 0, x, HEIGHT), fill=(206, 196, 166), width=2)
    draw.rectangle((55, 220, WIDTH - 55, 1510), outline=ink, width=12)
    draw.rectangle((75, 240, WIDTH - 75, 1490), fill=(93, 104, 83))
    vignette = phase(t, 0.0, 0.6)
    draw.ellipse((160, 420, 920, 1180), fill=(112, 122, 97), outline=(44, 52, 42), width=14)
    chair_x = 540 + math.sin(t * 0.6) * 12
    draw.rounded_rectangle((chair_x - 225, 830, chair_x + 225, 1130), radius=28, fill=(73, 60, 48), outline=ink, width=9)
    draw.rectangle((chair_x - 155, 1090, chair_x - 115, 1310), fill=ink)
    draw.rectangle((chair_x + 115, 1090, chair_x + 155, 1310), fill=ink)
    face(draw, (chair_x, 690), 120, (239, 185, 132), "flat")
    draw.rectangle((chair_x - 150, 775, chair_x + 150, 910), fill=(59, 84, 74), outline=ink, width=8)
    draw_label(draw, "FIELD FOOTAGE // 00:00:{:02d}".format(int(t) % 60), 86, 265, fill=paper, background_fill=ink)
    observation_end = duration * 0.24
    ritual_end = duration * 0.70
    if t < observation_end:
        draw.rectangle((80, 1220, WIDTH - 80, 1460), fill=paper)
        draw_centered(draw, "SUBJECT 001", WIDTH / 2, 1250, font(FONT_HEAVY, 84), ink)
        draw_centered(draw, "LONGS FOR ADVENTURE.", WIDTH / 2, 1350, font(FONT_FUTURA, 46), ink)
        draw_centered(draw, "RETURNS TO THE SAME CHAIR.", WIDTH / 2, 1405, font(FONT_FUTURA, 40), moss)
    elif t < ritual_end:
        draw.line((115, 1170, 930, 550), fill=(235, 78, 59), width=10)
        draw.ellipse((885, 505, 975, 595), outline=(235, 78, 59), width=10)
        draw_centered(draw, "PROTECTIVE RITUAL DETECTED", WIDTH / 2, 1560, font(FONT_HEAVY, 58), ink)
        draw_centered(draw, "OPEN MESSAGE  >  WAIT  >  'HAHA'", WIDTH / 2, 1645, font(FONT_MONO, 32), moss)
        for index in range(5):
            x = 120 + index * 180
            pulse = 1 if int(t * 3) % 5 == index else 0
            draw.ellipse((x, 1730, x + 78, 1808), fill=(235, 78, 59) if pulse else ink)
    else:
        draw.rectangle((80, 1220, WIDTH - 80, 1460), fill=(235, 78, 59))
        draw_centered(draw, "OFFER ONE REAL", WIDTH / 2, 1255, font(FONT_HEAVY, 84), paper)
        draw_centered(draw, "INVITATION", WIDTH / 2, 1350, font(FONT_HEAVY, 112), paper)
        draw_centered(draw, "BEFORE SUNSET.", WIDTH / 2, 1435, font(FONT_HEAVY, 42), ink)
        draw_label(draw, "EXPOSURE RESPONSE: NORMAL", 124, 1630, fill=paper, background_fill=moss)
    draw_centered(draw, "THE MODERN ADULT", WIDTH / 2, 70, font(FONT_HEAVY, 58), ink)
    draw_centered(draw, "A VERY SERIOUS OBSERVATION", WIDTH / 2, 159, font(FONT_MONO, 28), moss)


ROULETTE_ITEMS = [
    "ASK FOR A\nRECOMMENDATION",
    "GO TO THE\nEVENT ALONE",
    "SEND THE\nINVITE",
    "TRY THE\nCLASS",
    "SIT AT THE\nBAR",
    "ASK THE\nQUESTION",
]


def draw_roulette(frame: Image.Image, t: float, duration: float) -> None:
    draw = ImageDraw.Draw(frame)
    teal = (22, 173, 161)
    navy = (18, 29, 58)
    frame.paste(background((25, 48, 94), (7, 17, 36)), (0, 0))
    for index in range(13):
        x = (index * 187 + int(t * 85)) % (WIDTH + 200) - 100
        draw.line((x, 0, x - 420, HEIGHT), fill=(31, 63, 113), width=6)
    draw_centered(draw, "STOP. YOU GET ONE", WIDTH / 2, 74, font(FONT_HEAVY, 84), (255, 248, 210))
    draw_centered(draw, "SIDE QUEST.", WIDTH / 2, 165, font(FONT_HEAVY, 112), (255, 248, 210))
    cx, cy, radius = WIDTH / 2, 900, 405
    speed = 10.5 * (1 - ease_out(phase(t, 2.5, 12.5))) + 0.18
    rotation = t * speed * 40
    colors = [(255, 106, 89), (255, 210, 66), (77, 201, 176), (138, 167, 255), (244, 137, 197), (160, 224, 107)]
    for index, item in enumerate(ROULETTE_ITEMS):
        start = math.radians(rotation + index * 60)
        end = math.radians(rotation + (index + 1) * 60)
        points = [(cx, cy)] + [
            (cx + math.cos(start + (end - start) * step / 16) * radius, cy + math.sin(start + (end - start) * step / 16) * radius)
            for step in range(17)
        ]
        draw.polygon(points, fill=colors[index], outline=navy)
        label_angle = start + (end - start) / 2
        tx = cx + math.cos(label_angle) * radius * 0.58
        ty = cy + math.sin(label_angle) * radius * 0.58
        draw_centered(draw, item, tx, ty - 28, font(FONT_HEAVY, 30), navy, spacing=-3)
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=(255, 248, 210), width=16)
    draw.ellipse((cx - 78, cy - 78, cx + 78, cy + 78), fill=navy, outline=(255, 248, 210), width=10)
    draw_centered(draw, "GO", cx, cy - 29, font(FONT_HEAVY, 68), (255, 248, 210))
    draw.polygon([(cx - 44, cy - radius - 90), (cx + 44, cy - radius - 90), (cx, cy - radius + 25)], fill=(255, 248, 210))
    if 1.8 < t < 12.5:
        blink = int(t * 2) % 2 == 0
        if blink:
            draw.rounded_rectangle((140, 1435, WIDTH - 140, 1580), radius=44, fill=(255, 248, 210))
            draw_centered(draw, "PAUSE THE WHEEL.", WIDTH / 2, 1466, font(FONT_HEAVY, 72), navy)
    elif t >= 12.5:
        selected = ROULETTE_ITEMS[2]
        draw.rounded_rectangle((95, 1395, WIDTH - 95, 1630), radius=48, fill=(255, 248, 210))
        draw_centered(draw, "YOUR QUEST:", WIDTH / 2, 1435, font(FONT_MONO, 38), navy)
        draw_centered(draw, selected, WIDTH / 2, 1500, font(FONT_HEAVY, 78), navy, spacing=-4)
    draw_centered(draw, "BEFORE MIDNIGHT.", WIDTH / 2, 1715, font(FONT_HEAVY, 60), teal)


def phone(draw: ImageDraw.ImageDraw, x: float, y: float, scale: float, screen: tuple[int, int, int]) -> tuple[float, float, float, float]:
    width = 620 * scale
    height = 1110 * scale
    draw.rounded_rectangle((x, y, x + width, y + height), radius=90 * scale, fill=(24, 27, 39), outline=(99, 106, 130), width=int(8 * scale))
    draw.rounded_rectangle((x + 24 * scale, y + 65 * scale, x + width - 24 * scale, y + height - 28 * scale), radius=58 * scale, fill=screen)
    draw.rounded_rectangle((x + width * 0.38, y + 25 * scale, x + width * 0.62, y + 43 * scale), radius=12 * scale, fill=(0, 0, 0))
    return x + 24 * scale, y + 65 * scale, x + width - 24 * scale, y + height - 28 * scale


def draw_thriller(frame: Image.Image, t: float, duration: float) -> None:
    draw = ImageDraw.Draw(frame)
    ink = (15, 17, 27)
    soft = (244, 242, 237)
    frame.paste(background((35, 39, 59), (5, 6, 12)), (0, 0))
    for index in range(8):
        radius = 260 + index * 130 + int(math.sin(t * 2) * 20)
        draw.ellipse((WIDTH / 2 - radius, 800 - radius, WIDTH / 2 + radius, 800 + radius), outline=(42, 48, 71), width=3)
    pulse = 1 + math.sin(t * 3.1) * 0.015
    screen = phone(draw, WIDTH / 2 - 310 * pulse, 350, pulse, (244, 242, 237))
    sx1, sy1, sx2, sy2 = screen
    draw.rounded_rectangle((sx1, sy1, sx2, sy1 + 120), radius=42, fill=(231, 232, 238))
    draw.ellipse((sx1 + 38, sy1 + 24, sx1 + 104, sy1 + 90), fill=(138, 163, 210))
    draw.text((sx1 + 130, sy1 + 36), "MAYA", font=font(FONT_FUTURA, 43), fill=ink)
    if t < 6:
        draw_centered(draw, "SEND THE MESSAGE", WIDTH / 2, 110, font(FONT_HEAVY, 92), soft)
        draw_centered(draw, "YOU'VE BEEN POSTPONING.", WIDTH / 2, 214, font(FONT_HEAVY, 58), soft)
        bubble_text = "hey! want to get\ncoffee this week?"
        draw.rounded_rectangle((sx1 + 55, sy1 + 610, sx2 - 50, sy1 + 800), radius=35, fill=(101, 159, 255))
        draw_centered(draw, bubble_text, (sx1 + sx2) / 2, sy1 + 645, font(FONT_FUTURA, 45), (255, 255, 255))
    elif t < 16:
        draw_centered(draw, "YOUR THUMB IS HOVERING.", WIDTH / 2, 115, font(FONT_HEAVY, 70), soft)
        draw_centered(draw, "YOUR BRAIN IS WRITING A NOVEL.", WIDTH / 2, 200, font(FONT_FUTURA, 43), (159, 171, 208))
        for index, reason in enumerate(("too late", "too random", "what if busy", "tomorrow?")):
            x = sx1 + 45 + (index % 2) * 245
            y = sy1 + 230 + (index // 2) * 150
            drift = math.sin(t * 4 + index) * 8
            draw.rounded_rectangle((x, y + drift, x + 210, y + 90 + drift), radius=28, fill=(238, 184, 99))
            draw_centered(draw, reason, x + 105, y + 26 + drift, font(FONT_FUTURA, 29), ink)
        draw.rounded_rectangle((sx2 - 130, sy2 - 145, sx2 - 35, sy2 - 50), radius=48, fill=(69, 126, 240))
        draw.polygon([(sx2 - 104, sy2 - 116), (sx2 - 62, sy2 - 96), (sx2 - 102, sy2 - 74)], fill=soft)
    else:
        sent = ease_out(phase(t, 16, 17))
        y = lerp(sy1 + 610, sy1 + 360, sent)
        draw.rounded_rectangle((sx1 + 55, y, sx2 - 50, y + 180), radius=35, fill=(101, 159, 255))
        draw_centered(draw, "hey! want to get\ncoffee this week?", (sx1 + sx2) / 2, y + 32, font(FONT_FUTURA, 45), (255, 255, 255))
        if t > 18.0:
            draw.rounded_rectangle((sx1 + 50, sy1 + 610, sx1 + 355, sy1 + 750), radius=35, fill=(225, 228, 234))
            draw_centered(draw, "YES. THURSDAY?", sx1 + 202, sy1 + 658, font(FONT_FUTURA, 34), ink)
        if t > 19.2:
            draw_centered(draw, "NOTHING EXPLODED.", WIDTH / 2, 1545, font(FONT_HEAVY, 84), soft)
            draw_centered(draw, "YOU CHANGED THE PLOT.", WIDTH / 2, 1640, font(FONT_HEAVY, 65), (101, 159, 255))
    if 12 < t < 16.5:
        draw_centered(draw, "SEND IT.", WIDTH / 2, 1550, font(FONT_HEAVY, 112), (238, 184, 99))


def draw_door(draw: ImageDraw.ImageDraw, x: float, y: float, size: float, open_amount: float) -> None:
    draw.rectangle((x, y, x + size * 0.58, y + size), fill=(31, 52, 62), outline=(248, 235, 202), width=8)
    door_width = size * 0.48 * (1 - open_amount * 0.62)
    draw.polygon(
        [(x + 25, y + 20), (x + 25 + door_width, y + 45), (x + 25 + door_width, y + size - 25), (x + 25, y + size - 25)],
        fill=(237, 113, 69),
    )
    draw.ellipse((x + 25 + door_width - 35, y + size * 0.52, x + 25 + door_width - 10, y + size * 0.52 + 25), fill=(248, 235, 202))


def draw_domino(frame: Image.Image, t: float, duration: float) -> None:
    draw = ImageDraw.Draw(frame)
    cream = (248, 235, 202)
    dark = (20, 37, 50)
    coral = (237, 113, 69)
    blue = (70, 183, 196)
    frame.paste(background((34, 72, 90), (16, 31, 42)), (0, 0))
    for y in range(0, HEIGHT, 80):
        draw.line((0, y, WIDTH, y), fill=(42, 88, 105), width=2)
    draw_centered(draw, "WALK INTO ONE PLACE", WIDTH / 2, 72, font(FONT_HEAVY, 78), cream)
    draw_centered(draw, "YOU'VE NEVER ENTERED.", WIDTH / 2, 158, font(FONT_HEAVY, 65), cream)
    path = [(150, 690), (330, 820), (510, 690), (690, 820), (870, 690)]
    draw.line(path, fill=(108, 154, 162), width=16, joint="curve")
    for index, (x, y) in enumerate(path):
        fall = ease_in_out(phase(t, 4.5 + index * 2.0, 5.3 + index * 2.0))
        angle = fall * math.pi / 2
        width, height = 96, 310
        corners = []
        for local_x, local_y in ((-width / 2, -height), (width / 2, -height), (width / 2, 0), (-width / 2, 0)):
            rotated_x = local_x * math.cos(angle) - local_y * math.sin(angle)
            rotated_y = local_x * math.sin(angle) + local_y * math.cos(angle)
            corners.append((x + rotated_x, y + rotated_y))
        color = coral if index % 2 == 0 else blue
        draw.polygon(corners, fill=color, outline=dark)
        if fall < 0.35:
            label = ("NEW\nDOOR", "ONE\nQUESTION", "NEW\nSTORY", "ONE\nMORE", "GO")[index]
            draw_centered(draw, label, x, y - 245, font(FONT_HEAVY, 30), dark, spacing=-5)
    door_open = ease_out(phase(t, 15.5, 18.0))
    draw_door(draw, 385, 1050, 500, door_open)
    if t < 14:
        draw_centered(draw, "ONE DOOR.", WIDTH / 2, 1450, font(FONT_HEAVY, 92), cream)
        draw_centered(draw, "ONE QUESTION.", WIDTH / 2, 1555, font(FONT_HEAVY, 92), cream)
    else:
        draw_centered(draw, "THE NEXT FIVE MINUTES", WIDTH / 2, 1510, font(FONT_HEAVY, 66), cream)
        draw_centered(draw, "ARE DIFFERENT NOW.", WIDTH / 2, 1590, font(FONT_HEAVY, 76), (250, 210, 92))
    if t > 19:
        draw_centered(draw, "THAT'S HOW BORING DAYS LOSE.", WIDTH / 2, 1740, font(FONT_HEAVY, 49), cream)


VISUALS = {
    "blunt": draw_blunt,
    "brain": draw_brain,
    "documentary": draw_documentary,
    "roulette": draw_roulette,
    "thriller": draw_thriller,
    "domino": draw_domino,
}


def render_visual(experiment: Experiment, duration: float, destination: Path) -> None:
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
    draw_frame = VISUALS[experiment.visual]
    try:
        for index in range(total_frames):
            time = index / FPS
            if experiment.visual == "blunt":
                frame = background((16, 19, 29), (8, 10, 16)).copy()
            elif experiment.visual == "thriller":
                frame = background((35, 39, 59), (5, 6, 12)).copy()
            elif experiment.visual == "domino":
                frame = background((34, 72, 90), (16, 31, 42)).copy()
            else:
                frame = Image.new("RGB", (WIDTH, HEIGHT), (246, 246, 240))
            draw_frame(frame, time, duration)
            process.stdin.write(finish(frame).tobytes())
    except BrokenPipeError:
        raise RuntimeError(f"ffmpeg stopped while rendering {experiment.slug}") from None
    finally:
        if process.stdin:
            process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError(f"ffmpeg failed while rendering {experiment.slug}")


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
        ],
        stdout=subprocess.DEVNULL,
    )


def render_experiment(experiment: Experiment, output_dir: Path, voice_id: str, skip_narration: bool) -> dict:
    experiment_dir = output_dir / experiment.slug
    experiment_dir.mkdir(parents=True, exist_ok=True)
    narration = experiment_dir / "narration.mp3"
    sfx = experiment_dir / "effects.wav"
    audio = experiment_dir / "mix.m4a"
    silent_video = experiment_dir / "visual.mp4"
    output = output_dir / f"{experiment.slug}.mp4"

    print(f"\n=== {experiment.title} ===")
    if not skip_narration or not narration.exists():
        print("Generating expressive ElevenLabs narration")
        generate_narration(experiment, voice_id, narration)
    narration_duration = probe_duration(narration)
    duration = max(experiment.min_duration, narration_duration + 1.2)
    print(f"Narration: {narration_duration:.1f}s | render: {duration:.1f}s")
    make_sfx(sfx, duration, experiment.sound)
    mix_audio(narration, sfx, experiment, duration, audio)
    render_visual(experiment, duration, silent_video)
    mux_audio(silent_video, audio, output)
    return {
        "slug": experiment.slug,
        "title": experiment.title,
        "hypothesis": experiment.hypothesis,
        "narration_duration_seconds": round(narration_duration, 2),
        "video_duration_seconds": round(probe_duration(output), 2),
        "output": str(output),
    }


def main() -> None:
    args = parse_args()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    selected = [experiment for experiment in EXPERIMENTS if not args.only or experiment.slug == args.only]
    results = [render_experiment(experiment, output_dir, args.voice_id, args.skip_narration) for experiment in selected]
    manifest = output_dir / "manifest.json"
    manifest.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    print(f"\nDONE: {len(results)} experiments in {output_dir}")
    for result in results:
        print(f"- {result['slug']}: {result['output']} ({result['video_duration_seconds']}s)")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
