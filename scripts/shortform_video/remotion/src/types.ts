export type WordTiming = {
  text: string;
  start: number;
  end: number;
};

export type RouletteCandidate = {
  id: string;
  title: string;
  spokenTitle: string;
  completion: string;
  narration: string;
  footageQueries: string[];
};

export type RouletteRenderProps = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  winner: RouletteCandidate;
  candidateCount: number;
  winnerIndex: number;
  hook: {
    id: string;
    text: string;
  };
  narration: {
    introAudio: string;
    revealAudio: string;
    clickAudio: string;
    introDuration: number;
    revealStart: number;
    revealDuration: number;
    rouletteStart: number;
    spinDuration: number;
    turns: number;
    revealDelay: number;
    hookWords: WordTiming[];
    transitionWords: WordTiming[];
    insightWords: WordTiming[];
  };
  footage: {
    paths: string[];
    start: number;
  };
  music?: {
    path: string;
    start: number;
    volume: number;
  };
  brandWordmark: string;
};

export type OneOffId =
  | 'blunt-intervention'
  | 'cancel-brain'
  | 'nature-documentary'
  | 'message-thriller'
  | 'first-door'
  | 'comfort-zone-calendar'
  | 'life-begins';

export type OneOffRenderProps = {
  id: OneOffId;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  narration: {
    audio: string;
    duration: number;
    words: WordTiming[];
  };
  music?: {
    path: string;
    start: number;
    volume: number;
  };
  sfx?: {
    path: string;
    volume: number;
  };
  brandWordmark: string;
};
