import {execFile} from 'node:child_process';
import {cp, mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {promisify} from 'node:util';
import {dirname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

import {ONE_OFFS, oneOffById} from './oneoff-data';
import type {OneOffId, OneOffRenderProps, WordTiming} from './types';

const execFileAsync = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const remotionRoot = resolve(here, '..');
const shortformRoot = resolve(remotionRoot, '..');
const publicRoot = join(remotionRoot, 'public');
const sampleRate = 44_100;
const narrationSpeed = 1.13;
const voiceId = 'wWWn96OtTHu1sn8SRGEr';
const modelId = 'eleven_v3';

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

type TtsResponse = {
  audio_base64: string;
  alignment: Alignment;
};

type Args = {
  ids: OneOffId[];
  skipNarration: boolean;
};

const parseArgs = (): Args => {
  const values = process.argv.slice(2);
  const ids: OneOffId[] = [];
  let skipNarration = false;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--skip-narration') {
      skipNarration = true;
      continue;
    }
    if (value !== '--only') throw new Error(`Unknown option: ${value}`);
    const id = values[index + 1] as OneOffId | undefined;
    if (!id) throw new Error('Missing value for --only.');
    oneOffById(id);
    ids.push(id);
    index += 1;
  }
  return {ids: ids.length ? ids : ONE_OFFS.map((video) => video.id), skipNarration};
};

const staticPath = (path: string) => relative(publicRoot, path).split(sep).join('/');

const exists = async (path: string) => {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
};

const run = async (command: string, args: string[]) => {
  console.log(`> ${command} ${args.join(' ')}`);
  await execFileAsync(command, args, {maxBuffer: 10 * 1024 * 1024});
};

const probeDuration = async (path: string) => {
  const {stdout} = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'json',
    path,
  ]);
  return Number((JSON.parse(stdout) as {format: {duration: string}}).format.duration);
};

const requestNarration = async (text: string, destination: string): Promise<Alignment> => {
  const apiKey = process.env.ELEVENLABS_API_KEY ?? process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY.');
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {stability: 0.25},
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      method: 'POST',
    },
  );
  if (!response.ok) throw new Error(`ElevenLabs failed: ${response.status} ${await response.text()}`);
  const data = (await response.json()) as TtsResponse;
  if (!data.audio_base64 || !data.alignment.characters.length) throw new Error('ElevenLabs returned incomplete narration data.');
  await writeFile(destination, Buffer.from(data.audio_base64, 'base64'));
  return data.alignment;
};

const isWordCharacter = (character: string) => /[\p{L}\p{N}]/u.test(character) || character === "'" || character === '’';

const wordsFromAlignment = (alignment: Alignment, speed: number): WordTiming[] => {
  const words: WordTiming[] = [];
  let text = '';
  let start: number | undefined;
  let end: number | undefined;
  const finish = () => {
    if (text && start !== undefined && end !== undefined) words.push({end: end / speed, start: start / speed, text});
    end = undefined;
    start = undefined;
    text = '';
  };
  alignment.characters.forEach((character, index) => {
    if (isWordCharacter(character)) {
      if (start === undefined) start = alignment.character_start_times_seconds[index];
      end = alignment.character_end_times_seconds[index];
      text += character;
    } else {
      finish();
    }
  });
  finish();
  if (!words.length) throw new Error('Could not derive word timings from ElevenLabs alignment.');
  return words;
};

const changeTempo = async (source: string, destination: string) => {
  await run('ffmpeg', ['-y', '-i', source, '-filter:a', `atempo=${narrationSpeed}`, '-c:a', 'libmp3lame', '-q:a', '2', destination]);
};

const makeSfx = async ({
  destination,
  duration,
  events,
}: {
  destination: string;
  duration: number;
  events: Array<{time: number; frequency: number; length: number; volume: number}>;
}) => {
  const count = Math.ceil(duration * sampleRate);
  const samples = new Float32Array(count);
  events.forEach((event, eventIndex) => {
    const start = Math.round(event.time * sampleRate);
    const length = Math.round(event.length * sampleRate);
    for (let offset = 0; offset < length && start + offset < count; offset += 1) {
      const progress = offset / Math.max(1, length);
      const envelope = (1 - progress) ** 3;
      const tone = Math.sin((2 * Math.PI * event.frequency * offset) / sampleRate);
      const overtone = Math.sin((2 * Math.PI * event.frequency * 1.88 * offset) / sampleRate) * 0.25;
      samples[start + offset] += (tone + overtone) * envelope * event.volume;
    }
    const click = Math.round((event.time + event.length * 0.15) * sampleRate);
    for (let offset = 0; offset < sampleRate * 0.015 && click + offset < count; offset += 1) {
      samples[click + offset] += Math.sin((2 * Math.PI * (1700 + eventIndex * 110) * offset) / sampleRate) * Math.exp(-offset / 120) * 0.08;
    }
  });

  const output = Buffer.alloc(44 + count * 2);
  output.write('RIFF', 0);
  output.writeUInt32LE(36 + count * 2, 4);
  output.write('WAVEfmt ', 8);
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(sampleRate, 24);
  output.writeUInt32LE(sampleRate * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write('data', 36);
  output.writeUInt32LE(count * 2, 40);
  samples.forEach((sample, index) => output.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + index * 2));
  await writeFile(destination, output);
};

const prepare = async (id: OneOffId, skipNarration: boolean) => {
  const definition = oneOffById(id);
  const jobDir = join(publicRoot, 'generated', 'oneoffs', id);
  await mkdir(jobDir, {recursive: true});
  const rawNarration = join(jobDir, 'narration-raw.mp3');
  const alignmentPath = join(jobDir, 'narration-alignment.json');
  let alignment: Alignment;

  if (skipNarration) {
    if (!(await exists(rawNarration)) || !(await exists(alignmentPath))) {
      throw new Error(`--skip-narration needs cached narration for ${id}.`);
    }
    alignment = JSON.parse(await readFile(alignmentPath, 'utf8')) as Alignment;
  } else {
    console.log(`Generating ElevenLabs narration for ${id}`);
    alignment = await requestNarration(definition.narration, rawNarration);
    await writeFile(alignmentPath, `${JSON.stringify(alignment, null, 2)}\n`);
  }

  const narration = join(jobDir, 'narration.mp3');
  await changeTempo(rawNarration, narration);
  const narrationDuration = await probeDuration(narration);
  const duration = Math.max(definition.minDuration, narrationDuration + 1.1);
  const sfx = join(jobDir, 'effects.wav');
  await makeSfx({destination: sfx, duration, events: definition.sfx});

  const wordmark = join(jobDir, 'stepnout-wordmark-white.png');
  const musicSource = resolve(shortformRoot, definition.music);
  const music = join(jobDir, definition.music.split('/').at(-1) ?? 'music.mp3');
  await cp(join(shortformRoot, 'assets', 'stepnout-wordmark-white.png'), wordmark);
  await cp(musicSource, music);

  const props: OneOffRenderProps = {
    brandWordmark: staticPath(wordmark),
    durationInFrames: Math.ceil(duration * 24),
    fps: 24,
    height: 1920,
    id,
    music: {path: staticPath(music), start: definition.musicStart, volume: definition.musicVolume},
    narration: {audio: staticPath(narration), duration: narrationDuration, words: wordsFromAlignment(alignment, narrationSpeed)},
    sfx: {path: staticPath(sfx), volume: 0.54},
    width: 1080,
  };
  const propsPath = join(jobDir, 'props.json');
  await writeFile(propsPath, `${JSON.stringify(props, null, 2)}\n`);
  console.log(JSON.stringify({durationSeconds: Number(duration.toFixed(2)), id, props: staticPath(propsPath)}, null, 2));
};

const main = async () => {
  const args = parseArgs();
  for (const id of args.ids) await prepare(id, args.skipNarration);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
