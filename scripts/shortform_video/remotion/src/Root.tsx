import {Composition} from 'remotion';

import {CharacterStudy} from './CharacterStudy';
import {OneOff} from './OneOffs';
import {Roulette} from './Roulette';
import type {OneOffRenderProps, RouletteRenderProps} from './types';

const placeholderProps: RouletteRenderProps = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 900,
  winner: {
    id: 'take-yourself-out',
    title: 'TAKE YOURSELF\nOUT',
    spokenTitle: 'take yourself out',
    completion: 'Do one thing this week you would usually save for company.',
    narration: 'Go do something on your own that you would normally wait for a friend to join.',
    footageQueries: [],
  },
  candidateCount: 10,
  winnerIndex: 0,
  hook: {id: 'waiting-ready', text: 'YOU KEEP WAITING TO FEEL READY'},
  narration: {
    introAudio: '',
    revealAudio: '',
    clickAudio: '',
    introDuration: 7,
    revealStart: 11,
    revealDuration: 11,
    rouletteStart: 3,
    spinDuration: 5,
    turns: 7.5,
    revealDelay: 0.45,
    hookWords: [],
    transitionWords: [],
    insightWords: [],
  },
  footage: {paths: [], start: 13},
  music: undefined,
  brandWordmark: '',
};

const oneOffPlaceholderProps: OneOffRenderProps = {
  id: 'blunt-intervention',
  fps: 24,
  width: 1080,
  height: 1920,
  durationInFrames: 600,
  narration: {
    audio: '',
    duration: 24,
    words: [],
  },
  brandWordmark: '',
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Roulette"
        component={Roulette}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={placeholderProps.durationInFrames}
        defaultProps={placeholderProps}
        calculateMetadata={({props}) => ({
          durationInFrames: props.durationInFrames,
          fps: props.fps,
          width: props.width,
          height: props.height,
        })}
      />
      <Composition
        id="OneOff"
        component={OneOff}
        width={1080}
        height={1920}
        fps={24}
        durationInFrames={oneOffPlaceholderProps.durationInFrames}
        defaultProps={oneOffPlaceholderProps}
        calculateMetadata={({props}) => ({
          durationInFrames: props.durationInFrames,
          fps: props.fps,
          width: props.width,
          height: props.height,
        })}
      />
      <Composition id="CharacterStudy" component={CharacterStudy} width={1080} height={1920} fps={24} durationInFrames={144} />
    </>
  );
};
