import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {cp, mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {basename, dirname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

import type {RouletteCandidate, RouletteRenderProps, WordTiming} from './types';

const execFileAsync = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const remotionRoot = resolve(here, '..');
const shortformRoot = resolve(remotionRoot, '..');
const defaultConfig = join(shortformRoot, 'configs', 'roulette.json');
const publicRoot = join(remotionRoot, 'public');
const sampleRate = 44_100;

type RawCandidate = {
  id: string;
  title: string;
  spoken_title?: string;
  completion: string;
  narration: string;
  footage_queries?: string[];
};

type RawHook = {
  id: string;
  text: string;
  bridge?: string;
};

type RawConfig = {
  audio_bed?: {
    mode?: string;
    path?: string;
    volume?: number;
  };
  voice?: {
    model_id?: string;
    voice_id?: string;
    narration_speed?: number;
  };
  footage?: {
    enabled?: boolean;
    clip_count?: number;
    excluded_video_ids?: number[];
    fallback_queries?: string[];
  };
  output?: {
    width?: number;
    height?: number;
    fps?: number;
  };
  roulette?: {
    spin_duration?: number;
    turns?: number;
    reveal_delay?: number;
    winner?: string;
    hook?: string;
    candidates?: RawCandidate[];
    hooks?: RawHook[];
  };
  narration?: {
    reveal_lead?: string;
    cta_line?: string;
  };
};

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

type TtsResponse = {
  audio_base64: string;
  alignment: Alignment;
};

type PexelsVideo = {
  id: number;
  url: string;
  user?: {name?: string};
  video_files?: Array<{
    file_type: string;
    height: number;
    link: string;
    quality: string;
    width: number;
  }>;
};

type ParsedArgs = {
  configPath: string;
  hook?: string;
  job?: string;
  seed?: number;
  skipFootage: boolean;
  skipNarration: boolean;
  winner?: string;
};

const parseArgs = (): ParsedArgs => {
  const args = process.argv.slice(2);
  let configPath = defaultConfig;
  let hook: string | undefined;
  let job: string | undefined;
  let seed: number | undefined;
  let skipFootage = false;
  let skipNarration = false;
  let winner: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      configPath = resolve(arg);
      continue;
    }
    if (arg === '--skip-footage') {
      skipFootage = true;
      continue;
    }
    if (arg === '--skip-narration') {
      skipNarration = true;
      continue;
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }
    index += 1;
    if (arg === '--winner') winner = value;
    else if (arg === '--hook') hook = value;
    else if (arg === '--job') job = value;
    else if (arg === '--seed') seed = Number.parseInt(value, 10);
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (seed !== undefined && Number.isNaN(seed)) {
    throw new Error('--seed must be an integer.');
  }
  return {configPath, hook, job, seed, skipFootage, skipNarration, winner};
};

const toStaticPath = (path: string) => relative(publicRoot, path).split(sep).join('/');

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

const wordsIn = (value: string) => normalizeText(value).split(' ').filter(Boolean).length;

const select = <T extends {id: string}>(items: T[], requested: string | undefined, label: string): T => {
  if (!requested) {
    throw new Error(`No ${label} was selected.`);
  }
  const result = items.find((item) => item.id === requested);
  if (!result) {
    throw new Error(`Unknown ${label}: ${requested}`);
  }
  return result;
};

const createRng = (seed: number | undefined, fallback: string) => {
  const hash = createHash('sha256').update(`${seed ?? fallback}`).digest();
  let state = hash.readUInt32LE(0) || 1;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
};

const selectRandom = <T>(items: T[], rng: () => number): T => items[Math.floor(rng() * items.length)];

const run = async (command: string, args: string[]) => {
  console.log(`> ${command} ${args.join(' ')}`);
  await execFileAsync(command, args, {maxBuffer: 10 * 1024 * 1024});
};

const probeDuration = async (path: string): Promise<number> => {
  const {stdout} = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'json',
    path,
  ]);
  const parsed = JSON.parse(stdout) as {format: {duration: string}};
  return Number(parsed.format.duration);
};

const changeTempo = async (source: string, destination: string, speed: number) => {
  await run('ffmpeg', [
    '-y',
    '-i',
    source,
    '-filter:a',
    `atempo=${speed}`,
    '-c:a',
    'libmp3lame',
    '-q:a',
    '2',
    destination,
  ]);
};

const trimAudio = async (source: string, destination: string, start: number, end?: number) => {
  const args = ['-y', '-i', source, '-ss', start.toFixed(3)];
  if (end !== undefined) {
    args.push('-to', end.toFixed(3));
  }
  args.push('-c:a', 'libmp3lame', '-q:a', '2', destination);
  await run('ffmpeg', args);
};

const getApiKey = (name: 'ELEVENLABS_API_KEY' | 'PEXELS_API_KEY') => {
  if (name === 'ELEVENLABS_API_KEY') {
    return process.env.ELEVENLABS_API_KEY ?? process.env.ELEVEN_LABS_API_KEY;
  }
  return process.env.PEXELS_API_KEY;
};

const fetchOrThrow = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }
  return response;
};

const generateNarration = async (text: string, voiceId: string, modelId: string, destination: string): Promise<Alignment> => {
  const apiKey = getApiKey('ELEVENLABS_API_KEY');
  if (!apiKey) {
    throw new Error('Missing ELEVENLABS_API_KEY.');
  }
  const response = await fetchOrThrow(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {stability: 0.22},
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      method: 'POST',
    },
  );
  const payload = (await response.json()) as TtsResponse;
  if (!payload.audio_base64 || !payload.alignment?.characters?.length) {
    throw new Error('ElevenLabs returned audio without timing data.');
  }
  await writeFile(destination, Buffer.from(payload.audio_base64, 'base64'));
  return payload.alignment;
};

const isWordCharacter = (character: string) => /[\p{L}\p{N}]/u.test(character) || character === "'" || character === '’';

const wordsFromAlignment = (alignment: Alignment, speed: number): WordTiming[] => {
  const words: WordTiming[] = [];
  let text = '';
  let start: number | undefined;
  let end: number | undefined;

  const finish = () => {
    if (text && start !== undefined && end !== undefined) {
      words.push({text, start: start / speed, end: end / speed});
    }
    text = '';
    start = undefined;
    end = undefined;
  };

  alignment.characters.forEach((character, index) => {
    if (isWordCharacter(character)) {
      if (start === undefined) start = alignment.character_start_times_seconds[index];
      text += character;
      end = alignment.character_end_times_seconds[index];
      return;
    }
    finish();
  });
  finish();
  if (!words.length) {
    throw new Error('Could not turn ElevenLabs alignment data into word timings.');
  }
  return words;
};

const buildScript = (hook: RawHook, winner: RouletteCandidate, revealLead: string, ctaLine: string) => {
  const hookText = normalizeText(hook.text.toLowerCase());
  const bridge = normalizeText(hook.bridge ?? "Instead of waiting, do something now.");
  const reveal = `${revealLead} ${winner.spokenTitle}. ${winner.narration}${ctaLine ? ` ${ctaLine}` : ''}`;
  const intro = `${hookText}. ${bridge}`;
  return {full: `${intro} ${reveal}`, intro, reveal};
};

const toCandidate = (candidate: RawCandidate): RouletteCandidate => ({
  completion: candidate.completion,
  footageQueries: candidate.footage_queries ?? [],
  id: candidate.id,
  narration: candidate.narration,
  spokenTitle: candidate.spoken_title ?? candidate.title.replace(/\n/g, ' ').toLowerCase(),
  title: candidate.title,
});

const pickPexelsFile = (video: PexelsVideo) => {
  const files = (video.video_files ?? []).filter(
    (file) => file.file_type === 'video/mp4' && file.height >= file.width && file.width >= 540,
  );
  return files.sort((left, right) => right.width * right.height - left.width * left.height)[0];
};

const searchPexels = async (query: string): Promise<PexelsVideo[]> => {
  const apiKey = getApiKey('PEXELS_API_KEY');
  if (!apiKey) return [];
  const params = new URLSearchParams({
    orientation: 'portrait',
    page: '1',
    per_page: '15',
    query,
    size: 'medium',
  });
  const response = await fetchOrThrow(`https://api.pexels.com/v1/videos/search?${params}`, {
    headers: {Authorization: apiKey},
  });
  const payload = (await response.json()) as {videos?: PexelsVideo[]};
  return payload.videos ?? [];
};

const downloadFootage = async ({
  candidate,
  clipCount,
  fallbackQueries,
  jobDir,
  rng,
  excludedVideoIds,
}: {
  candidate: RouletteCandidate;
  clipCount: number;
  excludedVideoIds: number[];
  fallbackQueries: string[];
  jobDir: string;
  rng: () => number;
}): Promise<string[]> => {
  if (!getApiKey('PEXELS_API_KEY')) {
    console.warn('PEXELS_API_KEY is not set; rendering the insight with the branded abstract background.');
    return [];
  }
  const queries = [...candidate.footageQueries, ...fallbackQueries];
  const videos = (await Promise.all(queries.map(searchPexels))).flat();
  const available = videos
    .map((video) => ({file: pickPexelsFile(video), video}))
    .filter(
      (item): item is {file: NonNullable<ReturnType<typeof pickPexelsFile>>; video: PexelsVideo} =>
        Boolean(item.file) && !excludedVideoIds.includes(item.video.id),
    );
  const unused = [...available];
  const paths: string[] = [];
  const attribution: string[] = ['Pexels attribution', ''];

  for (let index = 0; index < clipCount && unused.length; index += 1) {
    const selected = unused.splice(Math.floor(rng() * unused.length), 1)[0];
    const extension = selected.file.file_type === 'video/mp4' ? 'mp4' : 'mov';
    const destination = join(jobDir, `footage-${String(index + 1).padStart(2, '0')}.${extension}`);
    const response = await fetchOrThrow(selected.file.link);
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    paths.push(toStaticPath(destination));
    attribution.push(`${basename(destination)}: ${selected.video.user?.name ?? 'unknown'} | ${selected.video.url}`);
  }

  await writeFile(join(jobDir, 'pexels-attribution.txt'), `${attribution.join('\n')}\n`);
  return paths;
};

const writeClickTrack = async ({
  candidateCount,
  destination,
  duration,
  revealTime,
  rouletteStart,
  spinDuration,
  totalDegrees,
}: {
  candidateCount: number;
  destination: string;
  duration: number;
  revealTime: number;
  rouletteStart: number;
  spinDuration: number;
  totalDegrees: number;
}) => {
  const sampleCount = Math.ceil(duration * sampleRate);
  const samples = new Float32Array(sampleCount);
  const segment = 360 / candidateCount;
  const clickCount = Math.max(1, Math.floor(totalDegrees / segment));
  let noiseState = 17;
  const noise = () => {
    noiseState = (noiseState * 1_103_515_245 + 12_345) & 0x7fffffff;
    return noiseState / 0x7fffffff * 2 - 1;
  };

  for (let eventIndex = 1; eventIndex <= clickCount; eventIndex += 1) {
    const progress = Math.min(1, (eventIndex * segment) / totalDegrees);
    const eventTime = rouletteStart + spinDuration * (1 - (1 - progress) ** (1 / 3));
    const start = Math.floor(eventTime * sampleRate);
    const length = Math.floor(0.037 * sampleRate);
    for (let offset = 0; offset < length && start + offset < sampleCount; offset += 1) {
      const envelope = Math.exp(-offset / (sampleRate * 0.0065));
      const tone = Math.sin((2 * Math.PI * (1220 + (eventIndex % 3) * 145) * offset) / sampleRate);
      samples[start + offset] += (noise() * 0.45 + tone * 0.25) * envelope * 0.42;
    }
  }

  const revealStart = Math.floor(revealTime * sampleRate);
  const revealLength = Math.floor(0.55 * sampleRate);
  for (let offset = 0; offset < revealLength && revealStart + offset < sampleCount; offset += 1) {
    const envelope = Math.exp(-offset / (sampleRate * 0.17));
    const tone = Math.sin((2 * Math.PI * 440 * offset) / sampleRate) + Math.sin((2 * Math.PI * 660 * offset) / sampleRate);
    samples[revealStart + offset] += tone * envelope * 0.12;
  }

  const output = Buffer.alloc(44 + sampleCount * 2);
  output.write('RIFF', 0);
  output.writeUInt32LE(36 + sampleCount * 2, 4);
  output.write('WAVEfmt ', 8);
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(sampleRate, 24);
  output.writeUInt32LE(sampleRate * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write('data', 36);
  output.writeUInt32LE(sampleCount * 2, 40);
  samples.forEach((sample, index) => {
    output.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + index * 2);
  });
  await writeFile(destination, output);
};

const exists = async (path: string) => {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
};

const resolveMusic = async (configPath: string, raw: RawConfig, jobDir: string) => {
  const audioBed = raw.audio_bed;
  if (!audioBed || audioBed.mode === 'none') return undefined;
  if (audioBed.mode !== 'file' || !audioBed.path) {
    throw new Error('roulette audio_bed supports mode "none" or mode "file" with a local path.');
  }
  const candidates = [
    resolve(dirname(configPath), audioBed.path),
    resolve(shortformRoot, audioBed.path),
  ];
  const source = (
    await Promise.all(
      candidates.map(async (candidate) => ({
        candidate,
        available: await exists(candidate),
      })),
    )
  ).find(({available}) => available)?.candidate;
  if (!source) {
    throw new Error(`Could not find roulette music: ${audioBed.path}`);
  }
  const extension = audioBed.path.split('.').at(-1) ?? 'mp3';
  const destination = join(jobDir, `music-bed.${extension}`);
  await cp(source, destination);
  return {
    path: toStaticPath(destination),
    volume: Math.max(0, Math.min(1, audioBed.volume ?? 0.12)),
  };
};

const main = async () => {
  const args = parseArgs();
  const raw = JSON.parse(await readFile(args.configPath, 'utf8')) as RawConfig;
  const candidates = (raw.roulette?.candidates ?? []).map(toCandidate);
  const hooks = raw.roulette?.hooks ?? [];
  if (candidates.length < 4 || hooks.length === 0) {
    throw new Error('The roulette config must have at least four candidates and one hook.');
  }

  const rng = createRng(args.seed, `${args.configPath}:${raw.roulette?.winner ?? ''}`);
  const winner = args.winner || raw.roulette?.winner
    ? select(candidates, args.winner ?? raw.roulette?.winner, 'winner')
    : selectRandom(candidates, rng);
  const hook = args.hook || raw.roulette?.hook
    ? select(hooks, args.hook ?? raw.roulette?.hook, 'hook')
    : selectRandom(hooks, rng);
  const winnerIndex = candidates.findIndex((candidate) => candidate.id === winner.id);
  const jobName = (args.job ?? `${hook.id}-${winner.id}`).replace(/[^a-zA-Z0-9_-]/g, '-');
  const jobDir = join(publicRoot, 'generated', 'roulette', jobName);
  await mkdir(jobDir, {recursive: true});

  const speed = Math.max(0.8, Math.min(1.5, raw.voice?.narration_speed ?? 1.2));
  const modelId = raw.voice?.model_id ?? 'eleven_v3';
  const voiceId = raw.voice?.voice_id ?? process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) throw new Error('Missing voice.voice_id or ELEVENLABS_VOICE_ID.');
  const spinDuration = Math.max(3.5, raw.roulette?.spin_duration ?? 5);
  const turns = Math.max(4, raw.roulette?.turns ?? 7.5);
  const revealDelay = Math.max(0.2, raw.roulette?.reveal_delay ?? 0.45);
  const fps = raw.output?.fps ?? 30;
  const width = raw.output?.width ?? 1080;
  const height = raw.output?.height ?? 1920;
  const revealLead = raw.narration?.reveal_lead ?? "Today's side quest is";
  const ctaLine = raw.narration?.cta_line ?? '';
  const script = buildScript(hook, winner, revealLead, ctaLine);
  const rawNarration = join(jobDir, 'narration-raw.mp3');
  const alignmentPath = join(jobDir, 'narration-alignment.json');
  let alignment: Alignment;

  if (args.skipNarration) {
    if (!(await exists(rawNarration)) || !(await exists(alignmentPath))) {
      throw new Error('--skip-narration needs cached narration-raw.mp3 and narration-alignment.json for this job.');
    }
    alignment = JSON.parse(await readFile(alignmentPath, 'utf8')) as Alignment;
  } else {
    console.log(`Generating ElevenLabs narration for ${hook.id} / ${winner.id}`);
    alignment = await generateNarration(script.full, voiceId, modelId, rawNarration);
    await writeFile(alignmentPath, `${JSON.stringify(alignment, null, 2)}\n`);
  }

  const rawWords = wordsFromAlignment(alignment, 1);
  const adjustedWords = wordsFromAlignment(alignment, speed);
  const hookWordCount = wordsIn(hook.text);
  const introWordCount = wordsIn(script.intro);
  const revealPrefixWordCount = wordsIn(`${revealLead} ${winner.spokenTitle}`);
  if (rawWords.length <= introWordCount || adjustedWords.length <= introWordCount + revealPrefixWordCount) {
    throw new Error('ElevenLabs returned incomplete narration timing. Try preparing this job again.');
  }

  const rawSplitTime = rawWords[introWordCount].start;
  const adjustedSplitTime = adjustedWords[introWordCount].start;
  const introWords = adjustedWords.slice(0, introWordCount);
  const hookWords = introWords.slice(0, hookWordCount);
  const rouletteStart = introWords[hookWordCount].start;
  const transitionWords = introWords.slice(hookWordCount).map((word) => ({
    ...word,
    end: word.end - rouletteStart,
    start: word.start - rouletteStart,
  }));
  const revealWords = adjustedWords.slice(introWordCount).map((word) => ({
    ...word,
    end: word.end - adjustedSplitTime,
    start: word.start - adjustedSplitTime,
  }));
  const insightWords = revealWords.slice(revealPrefixWordCount);
  if (!insightWords.length) throw new Error('The reveal narration did not contain an insight section.');

  const rawIntro = join(jobDir, 'intro-raw.mp3');
  const rawReveal = join(jobDir, 'reveal-raw.mp3');
  const introAudio = join(jobDir, 'intro.mp3');
  const revealAudio = join(jobDir, 'reveal.mp3');
  await trimAudio(rawNarration, rawIntro, 0, rawSplitTime);
  await trimAudio(rawNarration, rawReveal, rawSplitTime);
  await changeTempo(rawIntro, introAudio, speed);
  await changeTempo(rawReveal, revealAudio, speed);
  const introDuration = await probeDuration(introAudio);
  const revealDuration = await probeDuration(revealAudio);
  const revealStart = Math.max(rouletteStart + spinDuration + revealDelay, introDuration + 0.1);
  const duration = revealStart + revealDuration + 0.9;
  const footageStart = revealStart + insightWords[0].start;
  const target = -90 - (winnerIndex + 0.5) * (360 / candidates.length);
  const totalDegrees = turns * 360 + target;
  const clickAudio = join(jobDir, 'roulette-clicks.wav');
  await writeClickTrack({
    candidateCount: candidates.length,
    destination: clickAudio,
    duration,
    revealTime: rouletteStart + spinDuration,
    rouletteStart,
    spinDuration,
    totalDegrees,
  });

  const wordmarkSource = join(shortformRoot, 'assets', 'stepnout-wordmark-white.png');
  const wordmarkDestination = join(jobDir, 'stepnout-wordmark-white.png');
  await cp(wordmarkSource, wordmarkDestination);
  const music = await resolveMusic(args.configPath, raw, jobDir);
  const footage = args.skipFootage || raw.footage?.enabled === false
    ? []
    : await downloadFootage({
        candidate: winner,
        clipCount: Math.max(1, Math.min(4, raw.footage?.clip_count ?? 2)),
        excludedVideoIds: raw.footage?.excluded_video_ids ?? [],
        fallbackQueries: raw.footage?.fallback_queries ?? [],
        jobDir,
        rng,
      });

  const props: RouletteRenderProps = {
    brandWordmark: toStaticPath(wordmarkDestination),
    candidateCount: candidates.length,
    durationInFrames: Math.ceil(duration * fps),
    footage: {paths: footage, start: footageStart},
    fps,
    height,
    hook: {id: hook.id, text: hook.text},
    narration: {
      clickAudio: toStaticPath(clickAudio),
      hookWords,
      insightWords,
      introAudio: toStaticPath(introAudio),
      introDuration,
      revealAudio: toStaticPath(revealAudio),
      revealDelay,
      revealDuration,
      revealStart,
      rouletteStart,
      spinDuration,
      transitionWords,
      turns,
    },
    music: music
      ? {
          ...music,
          start: rouletteStart,
        }
      : undefined,
    width,
    winner,
    winnerIndex,
  };
  const propsPath = join(jobDir, 'props.json');
  await writeFile(propsPath, `${JSON.stringify(props, null, 2)}\n`);
  console.log(JSON.stringify({
    durationSeconds: Number(duration.toFixed(2)),
    footage: footage.length,
    hook: hook.id,
    props: toStaticPath(propsPath),
    winner: winner.id,
  }, null, 2));
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
