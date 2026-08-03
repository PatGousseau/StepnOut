import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import {brand, fontFamily} from './brand';
import type {RouletteRenderProps, WordTiming} from './types';

const WHEEL_COLORS = [
  brand.indigoSoft,
  brand.coral,
  '#E8C97A',
  '#89BCAA',
  '#C7B9E9',
  '#F0A8A2',
  '#A3B7D9',
  '#D9B67C',
  '#87A99B',
  '#B7B9D9',
  '#EDC0A4',
];

const HOOK_LANES = [43, 58, 39, 61, 42, 59, 40, 60, 44, 57, 41, 59] as const;

const HOOK_COLORS = [brand.indigo, brand.coralDark, brand.indigoSoft, brand.coral] as const;

const full = (value: number) => `${value}%`;

const softEase = (value: number) => 1 - (1 - Math.max(0, Math.min(1, value))) ** 3;

const getHookFontSize = (word: string, wordCount: number) => {
  const densitySize = wordCount <= 6 ? 102 : wordCount <= 8 ? 88 : wordCount <= 10 ? 76 : wordCount <= 12 ? 64 : 54;
  const widthSafeSize = Math.floor(720 / Math.max(1, word.length * 0.72));
  return Math.max(48, Math.min(densitySize, widthSafeSize));
};

const getHookPosition = (index: number, wordCount: number) => {
  const top = wordCount === 1 ? 51 : 29 + (index / (wordCount - 1)) * 44;
  return {left: HOOK_LANES[index % HOOK_LANES.length], top};
};

const getCaptionPages = (words: WordTiming[]) => {
  const captions: Caption[] = words.map((word, index) => ({
    text: `${index === 0 ? '' : ' '}${word.text}`,
    startMs: word.start * 1000,
    endMs: word.end * 1000,
    timestampMs: word.start * 1000,
    confidence: null,
  }));

  return createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: 920,
  }).pages;
};

const BrandMark: React.FC<{wordmark: string; dark?: boolean}> = ({wordmark, dark = false}) => {
  return (
    <div
      style={{
        alignItems: 'center',
        backgroundColor: dark ? brand.indigo : brand.paper,
        border: `3px solid ${dark ? 'rgba(255,255,255,0.35)' : brand.indigo}`,
        borderRadius: 999,
        boxShadow: `0 10px 24px ${dark ? 'rgba(27,28,65,0.22)' : 'rgba(77,83,130,0.16)'}`,
        display: 'flex',
        height: 80,
        justifyContent: 'center',
        padding: '0 30px',
      }}
    >
      {wordmark ? (
        <img
          alt="StepnOut"
          src={staticFile(wordmark)}
          style={{height: 32, objectFit: 'contain', width: 180}}
        />
      ) : (
        <span style={{color: dark ? brand.white : brand.indigo, fontFamily, fontSize: 32, fontWeight: 800}}>
          StepnOut
        </span>
      )}
    </div>
  );
};

const AmbientBackdrop: React.FC<{strong?: boolean}> = ({strong = false}) => {
  return (
    <AbsoluteFill style={{backgroundColor: strong ? '#EFF0FA' : brand.background, overflow: 'hidden'}}>
      <div
        style={{
          background: `radial-gradient(circle, ${brand.peach} 0%, rgba(235,218,204,0) 72%)`,
          borderRadius: '50%',
          height: 940,
          left: -360,
          position: 'absolute',
          top: -200,
          transform: 'rotate(-18deg)',
          width: 940,
        }}
      />
      <div
        style={{
          background: `radial-gradient(circle, ${brand.lavender} 0%, rgba(229,231,245,0) 70%)`,
          borderRadius: '50%',
          height: 1100,
          position: 'absolute',
          right: -440,
          top: 340,
          width: 1100,
        }}
      />
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.44)',
          border: `4px solid ${brand.line}`,
          borderRadius: 220,
          bottom: -360,
          height: 720,
          left: -100,
          position: 'absolute',
          transform: 'rotate(25deg)',
          width: 780,
        }}
      />
    </AbsoluteFill>
  );
};

const HookScene: React.FC<Pick<RouletteRenderProps, 'brandWordmark' | 'hook' | 'narration'>> = ({
  brandWordmark,
  hook,
  narration,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const words = hook.text.split(/\s+/);

  return (
    <AbsoluteFill>
      <AmbientBackdrop />
      <div style={{left: 58, position: 'absolute', top: 58}}>
        <BrandMark dark wordmark={brandWordmark} />
      </div>
      <div
        style={{
          color: brand.indigo,
          fontFamily,
          fontSize: 29,
          fontWeight: 800,
          left: 65,
          letterSpacing: 3,
          position: 'absolute',
          top: 184,
        }}
      >
        A QUICK REMINDER
      </div>
      {words.map((word, index) => {
        const wordStart = narration.hookWords[index]?.start ?? index * 0.22;
        const progress = interpolate(time, [wordStart, wordStart + 0.36], [0, 1], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const {left, top} = getHookPosition(index, words.length);
        const isVisible = time >= wordStart;

        return (
          <div
            key={`${word}-${index}`}
            style={{
              color: HOOK_COLORS[index % HOOK_COLORS.length],
              fontFamily,
              fontSize: getHookFontSize(word, words.length),
              fontWeight: 900,
              left: full(left),
              letterSpacing: -3,
              lineHeight: 0.92,
              opacity: isVisible ? progress : 0,
              position: 'absolute',
              textAlign: 'center',
              top: full(top),
              transform: `translate(-50%, -50%) rotate(${(index % 2 === 0 ? -1 : 1) * 2.5}deg) scale(${0.72 + progress * 0.28})`,
              width: 720,
              whiteSpace: 'nowrap',
            }}
          >
            {word}
          </div>
        );
      })}
      <div
        style={{
          backgroundColor: brand.indigo,
          borderRadius: 34,
          bottom: 124,
          boxShadow: '0 16px 0 rgba(77,83,130,0.13)',
          color: brand.white,
          fontFamily,
          fontSize: 44,
          fontWeight: 800,
          left: 62,
          letterSpacing: -1,
          padding: '30px 38px',
          position: 'absolute',
          right: 62,
          textAlign: 'center',
        }}
      >
        LET'S FIND A SIDE QUEST
      </div>
    </AbsoluteFill>
  );
};

const RouletteWheel: React.FC<{
  candidateCount: number;
  winnerIndex: number;
  relativeTime: number;
  spinDuration: number;
  turns: number;
}> = ({candidateCount, winnerIndex, relativeTime, spinDuration, turns}) => {
  const spin = softEase(relativeTime / spinDuration);
  const segment = 360 / candidateCount;
  const target = -90 - (winnerIndex + 0.5) * segment;
  const rotation = (turns * 360 + target) * spin;
  const colors = Array.from({length: candidateCount}, (_, index) => {
    const start = (index / candidateCount) * 100;
    const end = ((index + 1) / candidateCount) * 100;
    return `${WHEEL_COLORS[index % WHEEL_COLORS.length]} ${start}% ${end}%`;
  }).join(', ');

  return (
    <div style={{height: 900, left: 90, position: 'absolute', top: 345, width: 900}}>
      <div
        style={{
          borderLeft: '42px solid transparent',
          borderRight: '42px solid transparent',
          borderTop: `86px solid ${brand.paper}`,
          filter: 'drop-shadow(0 8px 0 rgba(40,42,77,0.18))',
          left: 408,
          position: 'absolute',
          top: -6,
          zIndex: 4,
        }}
      />
      <div
        style={{
          background: `conic-gradient(from 0deg, ${colors})`,
          border: `18px solid ${brand.paper}`,
          borderRadius: '50%',
          boxShadow: '0 30px 0 rgba(77,83,130,0.14), 0 46px 80px rgba(40,42,77,0.20), inset 0 0 0 10px rgba(40,42,77,0.14)',
          height: 820,
          left: 40,
          position: 'absolute',
          top: 48,
          transform: `rotate(${rotation}deg)`,
          width: 820,
        }}
      >
        {Array.from({length: candidateCount}, (_, index) => {
          const angle = index * segment + segment / 2;
          return (
            <div
              key={index}
              style={{
                color: 'rgba(255,255,255,0.88)',
                fontFamily,
                fontSize: 45,
                fontWeight: 900,
                left: 410,
                position: 'absolute',
                textShadow: '0 3px 0 rgba(40,42,77,0.16)',
                top: 410,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-274px) rotate(${-angle}deg)`,
              }}
            >
              ·
            </div>
          );
        })}
        <div
          style={{
            alignItems: 'center',
            backgroundColor: brand.indigo,
            border: `12px solid ${brand.paper}`,
            borderRadius: '50%',
            boxShadow: '0 7px 0 rgba(40,42,77,0.22)',
            color: brand.paper,
            display: 'flex',
            fontFamily,
            fontSize: 31,
            fontWeight: 900,
            height: 188,
            justifyContent: 'center',
            left: 298,
            letterSpacing: 2,
            position: 'absolute',
            top: 298,
            width: 188,
          }}
        >
          GO
        </div>
      </div>
    </div>
  );
};

const KaraokeCaption: React.FC<{compact?: boolean; time: number; words: WordTiming[]}> = ({
  compact = false,
  time,
  words,
}) => {
  const pages = getCaptionPages(words);
  const timeMs = time * 1000;
  const page = pages.find((candidate) => timeMs >= candidate.startMs && timeMs < candidate.startMs + candidate.durationMs);
  if (!page) {
    return null;
  }

  const activeToken = page.tokens.reduce((active, token, index) => (timeMs >= token.fromMs ? index : active), 0);

  return (
    <div
      style={{
        bottom: compact ? 154 : 204,
        color: brand.white,
        fontFamily,
        fontSize: compact ? 58 : 66,
        fontWeight: 900,
        left: compact ? 70 : 54,
        letterSpacing: -1.8,
        lineHeight: 1.04,
        position: 'absolute',
        right: compact ? 70 : 54,
        textAlign: 'center',
        textShadow: '0 5px 0 rgba(40,42,77,0.45), 0 10px 22px rgba(40,42,77,0.28)',
        whiteSpace: 'pre-wrap',
        zIndex: 12,
      }}
    >
      {page.tokens.map((token, index) => (
        <span key={`${token.text}-${token.fromMs}`} style={{color: index === activeToken ? '#FFD58A' : brand.white}}>
          {token.text.toUpperCase()}
        </span>
      ))}
    </div>
  );
};

const QuestCard: React.FC<{compact: number; winner: RouletteRenderProps['winner']}> = ({compact, winner}) => {
  const title = winner.title.split('\n');
  const cardTop = interpolate(compact, [0, 1], [900, 270]);
  const cardScale = interpolate(compact, [0, 1], [1, 0.8]);

  return (
    <div
      style={{
        backgroundColor: brand.paper,
        border: `5px solid ${brand.indigo}`,
        borderRadius: 48,
        boxShadow: '20px 23px 0 rgba(77,83,130,0.22), 0 24px 50px rgba(40,42,77,0.12)',
        left: 56,
        padding: '56px 56px 52px',
        position: 'absolute',
        right: 56,
        top: cardTop,
        transform: `scale(${cardScale})`,
        transformOrigin: 'top center',
        zIndex: 9,
      }}
    >
      <div style={{color: brand.coralDark, fontFamily, fontSize: 26, fontWeight: 900, letterSpacing: 4, textAlign: 'center'}}>
        TODAY'S SIDE QUEST
      </div>
      <div
        style={{
          color: brand.indigo,
          fontFamily,
          fontSize: title.some((line) => line.length > 14) ? 86 : 112,
          fontWeight: 900,
          letterSpacing: -4,
          lineHeight: 0.87,
          marginTop: 28,
          textAlign: 'center',
        }}
      >
        {title.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <>
        <div style={{backgroundColor: brand.line, height: 4, margin: '42px 0 32px'}} />
        <div style={{color: brand.text, fontFamily, fontSize: 39, fontWeight: 600, lineHeight: 1.22, textAlign: 'center'}}>
          {winner.completion}
        </div>
      </>
    </div>
  );
};

const InsightFootage: React.FC<{paths: string[]; start: number; time: number}> = ({paths, start, time}) => {
  const {fps} = useVideoConfig();
  if (paths.length === 0 || time < start) {
    return null;
  }
  const interval = 5.5;
  const index = Math.min(paths.length - 1, Math.floor((time - start) / interval));
  const clipStart = start + index * interval;
  return (
    <>
      <Sequence from={Math.round(clipStart * fps)}>
        <OffthreadVideo
          key={paths[index]}
          muted
          src={staticFile(paths[index])}
          style={{height: '100%', objectFit: 'cover', position: 'absolute', width: '100%'}}
        />
      </Sequence>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(40,42,77,0.38) 0%, rgba(40,42,77,0.72) 76%, rgba(40,42,77,0.9) 100%)'}} />
    </>
  );
};

const RouletteScene: React.FC<RouletteRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const rouletteTime = Math.max(0, time - props.narration.rouletteStart);
  const revealTime = props.narration.revealStart - props.narration.rouletteStart;
  const isRevealed = rouletteTime >= revealTime;
  const compact = isRevealed
    ? softEase((rouletteTime - revealTime - 0.9) / 0.7)
    : 0;
  const insightTime = Math.max(0, time - props.narration.revealStart);

  return (
    <AbsoluteFill>
      <AmbientBackdrop strong />
      <InsightFootage paths={props.footage.paths} start={props.footage.start} time={time} />
      <div style={{left: 58, position: 'absolute', top: 58, zIndex: 12}}>
        <BrandMark dark wordmark={props.brandWordmark} />
      </div>
      {!isRevealed ? (
        <>
          <div
            style={{
              color: brand.indigo,
              fontFamily,
              fontSize: 39,
              fontWeight: 800,
              left: 0,
              letterSpacing: 6,
              position: 'absolute',
              right: 0,
              textAlign: 'center',
              top: 185,
            }}
          >
            TODAY'S
          </div>
          <div
            style={{
              color: brand.indigo,
              fontFamily,
              fontSize: 114,
              fontWeight: 900,
              left: 0,
              letterSpacing: -5,
              position: 'absolute',
              right: 0,
              textAlign: 'center',
              top: 222,
            }}
          >
            SIDE QUEST
          </div>
          <RouletteWheel
            candidateCount={props.candidateCount}
            relativeTime={rouletteTime}
            spinDuration={props.narration.spinDuration}
            turns={props.narration.turns}
            winnerIndex={props.winnerIndex}
          />
          <KaraokeCaption time={rouletteTime} words={props.narration.transitionWords} />
        </>
      ) : (
        <>
          <div style={{opacity: 1 - compact}}>
            <RouletteWheel
              candidateCount={props.candidateCount}
              relativeTime={props.narration.spinDuration}
              spinDuration={props.narration.spinDuration}
              turns={props.narration.turns}
              winnerIndex={props.winnerIndex}
            />
          </div>
          <QuestCard compact={compact} winner={props.winner} />
          <KaraokeCaption compact time={insightTime} words={props.narration.insightWords} />
        </>
      )}
    </AbsoluteFill>
  );
};

export const Roulette: React.FC<RouletteRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const revealFrame = Math.round(props.narration.revealStart * fps);
  const musicFrame = props.music ? Math.round(props.music.start * fps) : 0;

  return (
    <AbsoluteFill style={{backgroundColor: brand.background, fontFamily, overflow: 'hidden'}}>
      {props.music ? (
        <Sequence from={musicFrame}>
          <Audio loop src={staticFile(props.music.path)} volume={props.music.volume} />
        </Sequence>
      ) : null}
      {props.narration.introAudio ? <Audio src={staticFile(props.narration.introAudio)} volume={1.05} /> : null}
      {props.narration.clickAudio ? <Audio src={staticFile(props.narration.clickAudio)} volume={0.72} /> : null}
      {props.narration.revealAudio ? (
        <Sequence from={revealFrame}>
          <Audio src={staticFile(props.narration.revealAudio)} volume={1.05} />
        </Sequence>
      ) : null}
      {time < props.narration.rouletteStart ? (
        <HookScene brandWordmark={props.brandWordmark} hook={props.hook} narration={props.narration} />
      ) : (
        <RouletteScene {...props} />
      )}
    </AbsoluteFill>
  );
};
