import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import {brand, fontFamily} from './brand';
import {Person, SittingPerson, StandingPerson} from './Person';
import type {OneOffRenderProps, WordTiming} from './types';

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const ease = (value: number) => 1 - (1 - clamp(value)) ** 3;

const arrive = (time: number, start: number, duration = 0.5) => ease((time - start) / duration);

const fade = (time: number, start: number, end: number) =>
  interpolate(time, [start, start + 0.32, end - 0.32, end], [0, 1, 1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const headline = {
  color: brand.ink,
  fontFamily,
  fontWeight: 900,
  letterSpacing: -4,
  lineHeight: 0.9,
  textAlign: 'center' as const,
};

const pill = (backgroundColor: string, color = brand.white) => ({
  alignItems: 'center',
  backgroundColor,
  borderRadius: 999,
  color,
  display: 'flex',
  fontFamily,
  fontSize: 26,
  fontWeight: 900,
  justifyContent: 'center',
  letterSpacing: 3,
  padding: '16px 24px',
  textAlign: 'center' as const,
});

const BrandMark: React.FC<{wordmark: string}> = ({wordmark}) => (
  <div
    style={{
      alignItems: 'center',
      backgroundColor: brand.indigo,
      border: '3px solid rgba(255,255,255,0.32)',
      borderRadius: 999,
      boxShadow: '0 10px 22px rgba(40,42,77,0.17)',
      display: 'flex',
      height: 70,
      justifyContent: 'center',
      padding: '0 25px',
    }}
  >
    {wordmark ? (
      <img alt="StepnOut" src={staticFile(wordmark)} style={{height: 27, objectFit: 'contain', width: 154}} />
    ) : (
      <span style={{color: brand.white, fontFamily, fontSize: 29, fontWeight: 900}}>StepnOut</span>
    )}
  </div>
);

const CaptionBar: React.FC<{dark?: boolean; time: number; words: WordTiming[]}> = ({dark = false, time, words}) => {
  const captions: Caption[] = words.map((word, index) => ({
    confidence: null,
    endMs: word.end * 1000,
    startMs: word.start * 1000,
    text: `${index === 0 ? '' : ' '}${word.text}`,
    timestampMs: word.start * 1000,
  }));
  const pages = createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: 900}).pages;
  const now = time * 1000;
  const page = pages.find((candidate) => now >= candidate.startMs && now < candidate.startMs + candidate.durationMs);
  if (!page) return null;
  const active = page.tokens.reduce((current, token, index) => (now >= token.fromMs ? index : current), 0);
  const foreground = dark ? brand.ink : brand.white;
  const highlight = dark ? brand.coralDark : '#FFD58A';

  return (
    <div
      style={{
        backgroundColor: dark ? 'rgba(255,253,248,0.92)' : 'rgba(24,27,53,0.84)',
        border: `2px solid ${dark ? 'rgba(77,83,130,0.12)' : 'rgba(255,255,255,0.22)'}`,
        borderRadius: 34,
        bottom: 72,
        boxShadow: '0 12px 26px rgba(25,28,57,0.16)',
        color: foreground,
        fontFamily,
        fontSize: 56,
        fontWeight: 900,
        left: 54,
        letterSpacing: -1.6,
        lineHeight: 1.02,
        padding: '24px 30px 28px',
        position: 'absolute',
        right: 54,
        textAlign: 'center',
        zIndex: 30,
      }}
    >
      {page.tokens.map((token, index) => (
        <span key={`${token.fromMs}-${token.text}`} style={{color: index === active ? highlight : foreground}}>
          {token.text.toUpperCase()}
        </span>
      ))}
    </div>
  );
};

const OneOffAudio: React.FC<Pick<OneOffRenderProps, 'fps' | 'music' | 'narration' | 'sfx'>> = ({fps, music, narration, sfx}) => (
  <>
    <Audio src={staticFile(narration.audio)} />
    {sfx ? <Audio src={staticFile(sfx.path)} volume={sfx.volume} /> : null}
    {music ? (
      <Sequence from={Math.round(music.start * fps)}>
        <Audio loop src={staticFile(music.path)} volume={music.volume} />
      </Sequence>
    ) : null}
  </>
);

const WarmBackdrop: React.FC<{accent?: string; dark?: boolean}> = ({accent = brand.peach, dark = false}) => (
  <AbsoluteFill
    style={{
      background: dark ? '#151A34' : brand.background,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        background: `radial-gradient(circle, ${accent} 0%, rgba(235,218,204,0) 69%)`,
        borderRadius: '50%',
        height: 930,
        left: -340,
        position: 'absolute',
        top: -240,
        width: 930,
      }}
    />
    <div
      style={{
        background: dark
          ? 'radial-gradient(circle, rgba(95,112,177,0.42) 0%, rgba(95,112,177,0) 68%)'
          : 'radial-gradient(circle, #E5E7F5 0%, rgba(229,231,245,0) 68%)',
        borderRadius: '50%',
        height: 1000,
        position: 'absolute',
        right: -440,
        top: 500,
        width: 1000,
      }}
    />
  </AbsoluteFill>
);

const CornerBrand: React.FC<{wordmark: string}> = ({wordmark}) => (
  <div style={{left: 56, position: 'absolute', top: 56, zIndex: 25}}>
    <BrandMark wordmark={wordmark} />
  </div>
);

const PlanProof: React.FC<OneOffRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const hookOut = fade(time, 0, 4.1);
  const planIn = arrive(time, 3.4, 0.65);
  const storyIn = arrive(time, 14.4, 0.65);
  const rows = [
    ['QUESTION', 'is it worth it?', brand.peach],
    ['QUESTION', 'who else is going?', '#DCE5F8'],
    ['RESULT', 'the event is now over', '#F5D5CF'],
  ];

  return (
    <AbsoluteFill>
      <WarmBackdrop accent="#EAC7B6" />
      <CornerBrand wordmark={props.brandWordmark} />
      <div style={{...pill(brand.coralDark), left: 58, position: 'absolute', top: 160, zIndex: 4}}>INTERNAL MEETING</div>
      <div
        style={{
          ...headline,
          fontSize: 128,
          left: 70,
          opacity: hookOut,
          position: 'absolute',
          right: 70,
          top: 365 - (1 - arrive(time, 0, 0.6)) * 110,
        }}
      >
        MAYBE LIFE
        <br />
        ISN&apos;T BORING.
      </div>
      <div
        style={{
          ...headline,
          color: brand.coralDark,
          fontSize: 72,
          left: 70,
          opacity: hookOut * arrive(time, 1.3, 0.45),
          position: 'absolute',
          right: 70,
          top: 875,
          transform: `scale(${0.82 + arrive(time, 1.3, 0.45) * 0.18})`,
        }}
      >
        EVERY INTERESTING IDEA
        <br />
        JUST NEEDS COMMITTEE APPROVAL.
      </div>
      <div
        style={{
          backgroundColor: brand.paper,
          border: `5px solid ${brand.indigo}`,
          borderRadius: 50,
          boxShadow: '20px 25px 0 rgba(77,83,130,0.19)',
          left: 54,
          opacity: planIn,
          overflow: 'hidden',
          position: 'absolute',
          right: 54,
          top: 285,
          transform: `translateY(${(1 - planIn) * 100}px)`,
        }}
      >
        <div style={{alignItems: 'center', backgroundColor: brand.indigo, color: brand.white, display: 'flex', fontFamily, fontSize: 32, fontWeight: 900, justifyContent: 'space-between', letterSpacing: 4, padding: '31px 42px'}}>
          <span>INTERESTING IDEA</span>
          <span style={{color: '#FFD58A'}}>01</span>
        </div>
        <div style={{padding: '38px 38px 42px'}}>
          {rows.map(([label, value, color], index) => {
            const rowIn = arrive(time, 4.2 + index * 2.0, 0.48);
            return (
              <div
                key={`${label}-${index}`}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FAFAF7',
                  border: `3px solid ${brand.line}`,
                  borderRadius: 26,
                  display: 'flex',
                  gap: 22,
                  marginBottom: 22,
                  minHeight: 150,
                  opacity: rowIn,
                  padding: '18px 20px',
                  transform: `translateX(${(1 - rowIn) * 85}px)`,
                }}
              >
                <div style={{...pill(color, brand.ink), fontSize: 22, minWidth: 164, padding: '19px 12px'}}>{label}</div>
                <span style={{color: brand.text, fontFamily, fontSize: 39, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05}}>{value}</span>
              </div>
            );
          })}
          <div
            style={{
              ...pill('#3AA875'),
              fontSize: 30,
              opacity: arrive(time, 10.9, 0.35),
              transform: `scale(${0.78 + arrive(time, 10.9, 0.35) * 0.22})`,
            }}
          >
            APPROVED TOO LATE ✓
          </div>
        </div>
      </div>
      <div
        style={{
          alignItems: 'center',
          backgroundColor: brand.indigo,
          borderRadius: 52,
          bottom: 370,
          boxShadow: '0 18px 0 rgba(77,83,130,0.16)',
          color: brand.paper,
          display: 'flex',
          fontFamily,
          fontSize: 79,
          fontWeight: 900,
          justifyContent: 'center',
          left: 75,
          letterSpacing: -3,
          lineHeight: 0.9,
          minHeight: 230,
          opacity: storyIn,
          padding: '30px 45px',
          position: 'absolute',
          right: 75,
          textAlign: 'center',
          transform: `translateY(${(1 - storyIn) * 80}px)`,
        }}
      >
        HOSTILE TAKEOVER
        <br />
        BY CAUTION.
      </div>
      <CaptionBar dark time={time} words={props.narration.words} />
      <OneOffAudio {...props} />
    </AbsoluteFill>
  );
};

const CancelBrain: React.FC<OneOffRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const send = arrive(time, 14.2, 0.4);
  const brainExit = arrive(time, 16.3, 0.55);
  const dialogueIn = arrive(time, 2.2, 0.55);
  const planIn = arrive(time, 8.3, 0.55);
  const pulse = 1 + Math.sin(time * 7) * 0.025;

  return (
    <AbsoluteFill style={{backgroundColor: '#FFF7DA', overflow: 'hidden'}}>
      <div style={{backgroundColor: '#FFF1C7', bottom: 0, left: 0, position: 'absolute', top: 0, width: '50%'}} />
      <div style={{backgroundColor: '#DDEBFF', bottom: 0, position: 'absolute', right: 0, top: 0, width: '50%'}} />
      <div style={{backgroundColor: 'rgba(77,83,130,0.12)', bottom: 0, left: 537, position: 'absolute', top: 0, width: 6}} />
      <CornerBrand wordmark={props.brandWordmark} />
      <div style={{...pill('#FFDA4B', brand.ink), left: 54, position: 'absolute', top: 160}}>YOU</div>
      <div style={{...pill('#EC8BA3', brand.ink), position: 'absolute', right: 54, top: 160}}>CANCEL BRAIN</div>
      <div style={{...headline, color: brand.ink, fontSize: 86, left: 70, position: 'absolute', right: 70, top: 305}}>
        EVERY PLAN IS BRILLIANT
        <br />
        FOR ABOUT FOUR HOURS.
      </div>
      <div
        style={{
          backgroundColor: '#FFDA4B',
          border: `4px solid ${brand.ink}`,
          borderRadius: 44,
          left: 54,
          opacity: dialogueIn,
          padding: '32px 34px',
          position: 'absolute',
          top: 625,
          transform: `translateX(${(1 - dialogueIn) * -130}px)`,
          width: 440,
        }}
      >
        <div style={{color: brand.ink, fontFamily, fontSize: 31, fontWeight: 900, letterSpacing: 2}}>YOU</div>
        <div style={{color: brand.ink, fontFamily, fontSize: 52, fontWeight: 900, letterSpacing: -2, lineHeight: 0.95, marginTop: 17}}>THIS COULD BE FUN.</div>
      </div>
      <div
        style={{
          backgroundColor: '#F7ABC0',
          border: `4px solid ${brand.ink}`,
          borderRadius: 44,
          opacity: dialogueIn,
          padding: '32px 34px',
          position: 'absolute',
          right: 54,
          top: 860,
          transform: `translateX(${(1 - dialogueIn) * 130}px) rotate(${Math.sin(time * 5) * 1.8}deg)`,
          width: 486,
        }}
      >
        <div style={{color: brand.ink, fontFamily, fontSize: 27, fontWeight: 900, letterSpacing: 2}}>CANCEL BRAIN</div>
        <div style={{color: brand.ink, fontFamily, fontSize: 46, fontWeight: 900, letterSpacing: -2, lineHeight: 0.95, marginTop: 17}}>BUT IT MIGHT RAIN. THINK OF THE LAUNDRY.</div>
      </div>
      <div
        style={{
          backgroundColor: brand.paper,
          border: `5px solid ${brand.ink}`,
          borderRadius: 44,
          boxShadow: '16px 20px 0 rgba(40,42,77,0.18)',
          left: 75,
          opacity: planIn,
          padding: '34px',
          position: 'absolute',
          right: 75,
          top: 540,
          transform: `translateY(${(1 - planIn) * 90}px)`,
        }}
      >
        <div style={{color: brand.coralDark, fontFamily, fontSize: 26, fontWeight: 900, letterSpacing: 4, textAlign: 'center'}}>CANCEL BRAIN HAS DATA</div>
        <div style={{alignItems: 'center', backgroundColor: '#E4EEFF', borderRadius: 27, display: 'flex', justifyContent: 'space-between', marginTop: 24, padding: '21px 24px'}}>
          <span style={{color: brand.indigo, fontFamily, fontSize: 28, fontWeight: 900, letterSpacing: 2}}>EXHIBIT A</span>
          <span style={{color: brand.ink, fontFamily, fontSize: 39, fontWeight: 900, letterSpacing: -1.4}}>you had a long day</span>
        </div>
        <div
          style={{
            ...pill(send > 0.94 ? '#35A96E' : brand.indigo),
            fontSize: 42,
            marginTop: 23,
            opacity: arrive(time, 12.7, 0.4),
            transform: `scale(${(0.85 + send * 0.15) * pulse})`,
          }}
        >
          {send > 0.9 ? 'ALMOST DID IT ✓' : 'CASE FOR CANCELLATION'}
        </div>
      </div>
      <div
        style={{
          backgroundColor: '#F7ABC0',
          border: `4px solid ${brand.ink}`,
          borderRadius: 36,
          bottom: 420,
          color: brand.ink,
          fontFamily,
          fontSize: 58,
          fontWeight: 900,
          left: 105,
          letterSpacing: -2.5,
          lineHeight: 0.92,
          opacity: 1 - brainExit,
          padding: '28px 35px',
          position: 'absolute',
          right: 105,
          textAlign: 'center',
          transform: `translateX(${brainExit * 1000}px) rotate(${brainExit * 18}deg)`,
        }}
      >
        COMFORTING ACHIEVEMENT UNLOCKED.
      </div>
      <div
        style={{
          ...headline,
          color: brand.indigo,
          fontSize: 56,
          left: 95,
          opacity: brainExit,
          position: 'absolute',
          right: 95,
          top: 1370,
          transform: `translateY(${(1 - brainExit) * 70}px)`,
        }}
      >
        IT DOESN&apos;T WANT REST.
        <br />
        IT WANTS THE SATISFACTION OF ALMOST.
      </div>
      <CaptionBar dark time={time} words={props.narration.words} />
      <OneOffAudio {...props} />
    </AbsoluteFill>
  );
};

const NatureDocumentary: React.FC<OneOffRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const oldLine = arrive(time, 6.2, 0.45);
  const intervention = arrive(time, 13.3, 0.55);
  const stamp = arrive(time, 18.2, 0.4);
  const pulse = 1 + Math.sin(time * 3.4) * 0.012;

  return (
    <AbsoluteFill style={{backgroundColor: '#E6DEC4', overflow: 'hidden'}}>
      {Array.from({length: 14}, (_, index) => (
        <div key={index} style={{backgroundColor: 'rgba(64,76,55,0.08)', bottom: 0, left: index * 88, position: 'absolute', top: 0, width: 2}} />
      ))}
      <div style={{backgroundColor: '#6B7E59', border: '12px solid #28312A', borderRadius: 8, height: 1060, left: 55, overflow: 'hidden', position: 'absolute', top: 285, width: 970}}>
        <div style={{background: 'radial-gradient(circle at 50% 34%, #AFC098 0%, #6B7E59 45%, #4A5946 100%)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0}} />
        <div style={{border: '4px solid rgba(230,222,196,0.6)', borderRadius: '50%', height: 655, left: 150, position: 'absolute', top: 160, width: 655}} />
        <div style={{backgroundColor: '#445044', borderRadius: '210px 210px 30px 30px', bottom: 44, height: 520, left: 346, position: 'absolute', width: 278}}>
          <div style={{backgroundColor: '#D8A77B', border: '7px solid #28312A', borderRadius: '50%', height: 178, left: 49, position: 'absolute', top: -125, width: 178}} />
          <div style={{backgroundColor: '#28312A', borderRadius: 999, height: 23, left: 38, position: 'absolute', top: 86, width: 205}} />
        </div>
        <div style={{backgroundColor: '#7A5E48', border: '8px solid #28312A', borderRadius: 27, bottom: 10, height: 214, left: 195, position: 'absolute', width: 580}} />
        <div style={{...pill('#28312A', '#E6DEC4'), fontSize: 25, left: 28, position: 'absolute', top: 28}}>FIELD FOOTAGE // 00:{String(Math.floor(time)).padStart(2, '0')}</div>
      </div>
      <CornerBrand wordmark={props.brandWordmark} />
      <div style={{...headline, color: '#28312A', fontSize: 58, left: 80, letterSpacing: 1, position: 'absolute', right: 80, top: 150}}>THE MODERN ADULT</div>
      <div style={{color: '#52654D', fontFamily, fontSize: 24, fontWeight: 900, left: 0, letterSpacing: 4, position: 'absolute', right: 0, textAlign: 'center', top: 222}}>A VERY SERIOUS OBSERVATION</div>
      <div
        style={{
          backgroundColor: '#F6EED6',
          border: '5px solid #28312A',
          bottom: 472,
          left: 80,
          opacity: oldLine * (1 - intervention),
          padding: '28px 30px',
          position: 'absolute',
          right: 80,
          transform: `scale(${0.84 + oldLine * 0.16})`,
        }}
      >
        <div style={{color: '#52654D', fontFamily, fontSize: 24, fontWeight: 900, letterSpacing: 4, textAlign: 'center'}}>CEREMONIAL SOUND DETECTED</div>
        <div style={{color: '#28312A', fontFamily, fontSize: 56, fontWeight: 900, letterSpacing: -2.2, lineHeight: 0.94, marginTop: 16, textAlign: 'center'}}>“WE SHOULD TOTALLY DO THAT SOMETIME.”</div>
        <div style={{backgroundColor: '#D4604B', height: 11, left: 46, position: 'absolute', right: 46, top: 130, transform: `rotate(-3deg)`}} />
      </div>
      <div
        style={{
          backgroundColor: '#D4604B',
          border: '5px solid #28312A',
          borderRadius: 38,
          bottom: 435,
          left: 65,
          opacity: intervention,
          padding: '31px 34px',
          position: 'absolute',
          right: 65,
          transform: `translateY(${(1 - intervention) * 80}px)`,
        }}
      >
          <div style={{color: '#F6EED6', fontFamily, fontSize: 26, fontWeight: 900, letterSpacing: 4, textAlign: 'center'}}>OBSERVATION</div>
        <div style={{color: '#F6EED6', fontFamily, fontSize: 54, fontWeight: 900, letterSpacing: -2.4, lineHeight: 0.94, marginTop: 18, textAlign: 'center'}}>ENTHUSIASM. AFFECTION. NO PLANS WHATSOEVER.</div>
      </div>
      <div
        style={{
          ...pill('#52654D', '#F6EED6'),
          bottom: 350,
          fontSize: 35,
          left: 140,
          opacity: stamp,
          position: 'absolute',
          right: 140,
          transform: `rotate(-3deg) scale(${stamp * pulse})`,
        }}
      >
        RETURNING TO NATURAL HABITAT
      </div>
      <CaptionBar dark time={time} words={props.narration.words} />
      <OneOffAudio {...props} />
    </AbsoluteFill>
  );
};

const MessageThriller: React.FC<OneOffRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const draft = arrive(time, 3.0, 0.5);
  const thoughts = arrive(time, 7.0, 0.45) * (1 - arrive(time, 13.0, 0.5));
  const suspense = arrive(time, 13.0, 0.42);
  const close = arrive(time, 16.3, 0.55);
  const beat = 1 + Math.sin(time * 3) * 0.017;

  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #292E4A 0%, #090B17 100%)', overflow: 'hidden'}}>
      {Array.from({length: 7}, (_, index) => {
        const size = 260 + index * 150 + Math.sin(time * 2.4) * 15;
        return <div key={index} style={{border: '3px solid rgba(137,154,218,0.16)', borderRadius: '50%', height: size, left: 540 - size / 2, position: 'absolute', top: 760 - size / 2, width: size}} />;
      })}
      <CornerBrand wordmark={props.brandWordmark} />
      <div style={{...pill('#F0B85C', brand.ink), left: 58, position: 'absolute', top: 160}}>LIVE THRILLER // 01</div>
      <div style={{...headline, color: brand.paper, fontSize: 82, left: 72, position: 'absolute', right: 72, top: 300}}>SOMEONE IS STARING AT A FINISHED TEXT.</div>
      <div
        style={{
          backgroundColor: '#161A2B',
          border: '7px solid #7E89B5',
          borderRadius: 72,
          boxShadow: '0 28px 56px rgba(0,0,0,0.42)',
          height: 890,
          left: 180,
          overflow: 'hidden',
          position: 'absolute',
          top: 620,
          transform: `scale(${beat})`,
          width: 720,
        }}
      >
        <div style={{alignItems: 'center', backgroundColor: '#F2F0EB', display: 'flex', gap: 18, height: 128, padding: '0 38px'}}>
          <div style={{backgroundColor: '#AFC6F7', borderRadius: '50%', height: 58, width: 58}} />
          <div>
            <div style={{color: brand.ink, fontFamily, fontSize: 37, fontWeight: 900}}>MAYA</div>
            <div style={{color: '#66708F', fontFamily, fontSize: 22, fontWeight: 800, letterSpacing: 2}}>MESSAGE</div>
          </div>
        </div>
        <div
          style={{
            backgroundColor: '#6E9CF4',
            borderRadius: 34,
            color: brand.white,
            fontFamily,
            fontSize: 51,
            fontWeight: 800,
            left: 55,
            lineHeight: 1.0,
            opacity: draft,
            padding: '29px 31px',
            position: 'absolute',
            right: 55,
            textAlign: 'center',
            top: 505,
            transform: `translateY(${suspense * -8}px)`,
            transition: 'none',
          }}
        >
          WANT TO GET COFFEE THIS WEEK?
        </div>
        {['legal document', 'personality test', 'meteor strike', 'nine minutes'].map((line, index) => (
          <div
            key={line}
            style={{
              ...pill('#EAB25C', brand.ink),
              fontSize: 25,
              left: index % 2 ? 365 : 48,
              opacity: thoughts,
              padding: '14px 19px',
              position: 'absolute',
              top: 205 + Math.floor(index / 2) * 130 + Math.sin(time * 5 + index) * 8,
              transform: `rotate(${(index % 2 ? 3 : -3) + Math.sin(time * 4 + index)}deg)`,
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            alignItems: 'center',
            backgroundColor: suspense > 0.92 ? '#EAB25C' : '#6E9CF4',
            borderRadius: '50%',
            bottom: 45,
            color: brand.white,
            display: 'flex',
            fontFamily,
            fontSize: 35,
            fontWeight: 900,
            height: 106,
            justifyContent: 'center',
            position: 'absolute',
            right: 48,
            transform: `scale(${0.86 + suspense * 0.14})`,
            width: 106,
          }}
        >
          …
        </div>
      </div>
      <div
        style={{
          ...headline,
          color: '#F0B85C',
          fontSize: 82,
          left: 75,
          opacity: close,
          position: 'absolute',
          right: 75,
          top: 1550,
          transform: `translateY(${(1 - close) * 60}px)`,
        }}
      >
        THE CURSOR BLINKS ON.
      </div>
      <CaptionBar time={time} words={props.narration.words} />
      <OneOffAudio {...props} />
    </AbsoluteFill>
  );
};

const FirstDoor: React.FC<OneOffRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const storefront = arrive(time, 2.4, 0.75);
  const theories = arrive(time, 6.3, 0.45);
  const myth = arrive(time, 11.2, 0.55);
  const haunted = arrive(time, 16.4, 0.5);

  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #2B3147 0%, #121725 100%)', overflow: 'hidden'}}>
      <div style={{background: 'radial-gradient(circle, rgba(239,190,101,0.18) 0%, rgba(239,190,101,0) 68%)', borderRadius: '50%', height: 850, left: 115, position: 'absolute', top: 400, width: 850}} />
      {Array.from({length: 10}, (_, index) => (
        <div key={index} style={{backgroundColor: 'rgba(238,236,222,0.05)', bottom: 0, left: index * 125, position: 'absolute', top: 0, width: 2}} />
      ))}
      <CornerBrand wordmark={props.brandWordmark} />
      <div style={{...pill('#EFC56B', brand.ink), left: 58, position: 'absolute', top: 160}}>NEIGHBOURHOOD MYTHS</div>
      <div style={{...headline, color: '#FFF8E8', fontSize: 82, left: 70, position: 'absolute', right: 70, top: 300}}>THE PLACE YOU&apos;VE PASSED A HUNDRED TIMES.</div>
      <div
        style={{
          backgroundColor: '#596075',
          border: '8px solid #101421',
          borderRadius: '20px 20px 0 0',
          bottom: 410,
          height: 845,
          left: 75,
          opacity: storefront,
          overflow: 'hidden',
          position: 'absolute',
          right: 75,
          transform: `translateY(${(1 - storefront) * 130}px)`,
        }}
      >
        <div style={{backgroundColor: '#3E4559', height: 92, left: 0, position: 'absolute', right: 0, top: 0}} />
        <div style={{...pill('#EFC56B', brand.ink), fontSize: 28, left: 165, padding: '18px 34px', position: 'absolute', top: 32}}>NO SIGN</div>
        <div style={{background: 'linear-gradient(135deg, #20283C 0%, #3F506C 54%, #1B2031 55%)', border: '8px solid #181D2D', bottom: 64, left: 52, position: 'absolute', top: 185, width: 266}}>
          <div style={{backgroundColor: 'rgba(240,197,107,0.18)', height: 8, left: 25, position: 'absolute', right: 25, top: 110}} />
          <div style={{backgroundColor: 'rgba(240,197,107,0.18)', height: 8, left: 25, position: 'absolute', right: 25, top: 265}} />
        </div>
        <div style={{background: 'linear-gradient(135deg, #20283C 0%, #3F506C 54%, #1B2031 55%)', border: '8px solid #181D2D', bottom: 64, position: 'absolute', right: 52, top: 185, width: 266}}>
          <div style={{backgroundColor: 'rgba(240,197,107,0.18)', height: 8, left: 25, position: 'absolute', right: 25, top: 110}} />
          <div style={{backgroundColor: 'rgba(240,197,107,0.18)', height: 8, left: 25, position: 'absolute', right: 25, top: 265}} />
        </div>
        <div style={{backgroundColor: '#242A39', border: '9px solid #101421', bottom: 0, height: 600, left: 325, position: 'absolute', width: 276}}>
          <div style={{background: `radial-gradient(circle at 50% 45%, rgba(239,197,107,${0.12 + haunted * 0.48}) 0%, rgba(239,197,107,0) 65%)`, bottom: 0, left: 0, position: 'absolute', right: 0, top: 0}} />
          <div style={{backgroundColor: '#EFC56B', borderRadius: '50%', height: 25, position: 'absolute', right: 38, top: 295, width: 25}} />
          <div style={{color: 'rgba(255,248,232,0.38)', fontFamily, fontSize: 20, fontWeight: 900, left: 0, letterSpacing: 3, position: 'absolute', right: 0, textAlign: 'center', top: 115}}>DEFINITELY NORMAL</div>
        </div>
        <div style={{backgroundColor: '#353C4F', bottom: 0, height: 59, left: 0, position: 'absolute', right: 0}} />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 14,
          justifyContent: 'center',
          left: 65,
          opacity: theories * (1 - myth),
          position: 'absolute',
          right: 65,
          top: 1190,
          transform: `translateY(${(1 - theories) * 50}px)`,
        }}
      >
        {['RESTAURANT?', 'BOOKSHOP?', 'SECRET STUDIO?'].map((label, index) => (
          <div key={label} style={{...pill(index === 1 ? '#D6D9E9' : '#EFC56B', brand.ink), fontSize: 22, flex: 1, padding: '18px 5px', transform: `rotate(${index === 1 ? 0 : index === 0 ? -3 : 3}deg)`}}>{label}</div>
        ))}
      </div>
      <div
        style={{
          ...headline,
          color: '#EFC56B',
          fontSize: 80,
          left: 75,
          opacity: myth * (1 - haunted),
          position: 'absolute',
          right: 75,
          top: 1340,
          transform: `translateY(${(1 - myth) * 55}px)`,
        }}
      >
        ENTIRE BACKSTORY INVENTED.
      </div>
      <div
        style={{
          ...headline,
          color: '#FFF8E8',
          fontSize: 72,
          left: 80,
          opacity: haunted,
          position: 'absolute',
          right: 80,
          top: 1360,
          transform: `translateY(${(1 - haunted) * 55}px)`,
        }}
      >
        A TINY PRIVATE
        <br />
        HAUNTED HOUSE.
      </div>
      <CaptionBar time={time} words={props.narration.words} />
      <OneOffAudio {...props} />
    </AbsoluteFill>
  );
};

const CalendarCard: React.FC<{color: string; day: string; index: number; text: string; time: number; when: number}> = ({color, day, index, text, time, when}) => {
  const inProgress = arrive(time, when, 0.45);
  return (
    <div
      style={{
        alignItems: 'center',
        backgroundColor: brand.paper,
        border: `4px solid ${brand.ink}`,
        borderRadius: 29,
        boxShadow: '9px 11px 0 rgba(40,42,77,0.16)',
        display: 'flex',
        gap: 24,
        left: 60,
        opacity: inProgress,
        padding: '18px',
        position: 'absolute',
        right: 60,
        top: 650 + index * 192,
        transform: `translateX(${(1 - inProgress) * (index % 2 === 0 ? 110 : -110)}px)`,
      }}
    >
      <div style={{...pill(color, brand.ink), fontSize: 29, minWidth: 150, padding: '22px 12px'}}>{day}</div>
      <div style={{color: brand.ink, fontFamily, fontSize: 52, fontWeight: 900, letterSpacing: -2.3}}>{text}</div>
    </div>
  );
};

const ComfortZoneCalendar: React.FC<OneOffRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const status = arrive(time, 9.6, 0.42);
  const operations = arrive(time, 12.2, 0.55);
  const final = arrive(time, 17.4, 0.45);
  const fields = [
    ['FLEXIBILITY', 'no plan required', '#FFD071'],
    ['COLOUR CODING', 'immaculate', '#C9D9FF'],
    ['OUTCOME', 'next week again', '#BFE7D2'],
  ];

  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #FFF6E8 0%, #E7E7F8 100%)', overflow: 'hidden'}}>
      <div style={{backgroundColor: 'rgba(255,211,181,0.44)', borderRadius: '50%', bottom: -240, height: 740, left: -240, position: 'absolute', width: 740}} />
      <div style={{backgroundColor: 'rgba(193,215,255,0.42)', borderRadius: '50%', height: 540, position: 'absolute', right: -200, top: -80, width: 540}} />
      <CornerBrand wordmark={props.brandWordmark} />
      <div style={{...pill(brand.ink), left: 58, position: 'absolute', top: 160}}>WEEKEND UPDATE</div>
      <div style={{...headline, fontSize: 82, left: 70, position: 'absolute', right: 70, top: 300}}>YOUR COMFORT ZONE RUNS A VERY ORGANIZED CALENDAR.</div>
      <CalendarCard color="#FFD18F" day="FRI" index={0} text="MAYBE LATER" time={time} when={2.3} />
      <CalendarCard color="#BBD2FF" day="SAT" index={1} text="WHAT IF WE&apos;RE TIRED" time={time} when={4.2} />
      <CalendarCard color="#BDE3D0" day="SUN" index={2} text="NEXT WEEK" time={time} when={6.0} />
      <div
        style={{
          border: `10px solid ${brand.indigo}`,
          borderRadius: 18,
          bottom: 560,
          color: brand.indigo,
          fontFamily,
          fontSize: 64,
          fontWeight: 900,
          left: 150,
          letterSpacing: -2.8,
          opacity: status,
          padding: '21px 25px',
          position: 'absolute',
          right: 150,
          textAlign: 'center',
          transform: `rotate(-6deg) scale(${0.7 + status * 0.3})`,
        }}
      >
        STATUS: EXCELLENT
      </div>
      <div
        style={{
          backgroundColor: brand.paper,
          border: `5px solid ${brand.ink}`,
          borderRadius: 44,
          boxShadow: '16px 20px 0 rgba(40,42,77,0.18)',
          left: 55,
          opacity: operations,
          padding: '30px',
          position: 'absolute',
          right: 55,
          top: 560,
          transform: `translateY(${(1 - operations) * 100}px)`,
        }}
      >
        <div style={{color: brand.coralDark, fontFamily, fontSize: 30, fontWeight: 900, letterSpacing: 4, textAlign: 'center'}}>POSTPONEMENT OPERATIONS</div>
        {fields.map(([label, value, color], index) => {
          const field = arrive(time, 12.9 + index * 1.0, 0.38);
          return (
            <div key={label} style={{alignItems: 'center', borderBottom: index === fields.length - 1 ? undefined : `3px solid ${brand.line}`, display: 'flex', gap: 20, opacity: field, padding: '22px 0', transform: `translateX(${(1 - field) * 55}px)`}}>
              <div style={{...pill(color, brand.ink), fontSize: 22, minWidth: 182, padding: '18px 10px'}}>{label}</div>
              <div style={{color: brand.ink, fontFamily, fontSize: 42, fontWeight: 900, letterSpacing: -1.7}}>{value}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...pill('#D45A48'),
          bottom: 385,
          fontSize: 40,
          left: 90,
          opacity: final,
          position: 'absolute',
          right: 90,
          transform: `scale(${0.84 + final * 0.16})`,
        }}
      >
        OPERATIONS TEAM: INCREDIBLE.
      </div>
      <CaptionBar dark time={time} words={props.narration.words} />
      <OneOffAudio {...props} />
    </AbsoluteFill>
  );
};

const FilmTexture: React.FC<{strength?: number}> = ({strength = 1}) => (
  <>
    <AbsoluteFill
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)',
        mixBlendMode: 'soft-light',
        opacity: 0.52 * strength,
        pointerEvents: 'none',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at center, transparent 38%, rgba(2,4,12,0.26) 100%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

const HomeScene: React.FC<{dim?: boolean; time: number}> = ({dim = false, time}) => {
  const cityPulse = 0.35 + Math.sin(time * 1.6) * 0.14;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #111A35 0%, #3B2840 59%, #211C2C 59%, #15131E 100%)', overflow: 'hidden'}}>
      <div style={{background: '#0C1731', border: '18px solid #745D5E', height: 630, left: 85, position: 'absolute', top: 235, width: 600}}>
        <div style={{background: 'linear-gradient(180deg, #103565, #142649)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0}} />
        {Array.from({length: 28}, (_, index) => (
          <div key={index} style={{backgroundColor: index % 3 === 0 ? '#F9C76A' : '#5E9EE0', borderRadius: 6, height: 12 + (index % 4) * 6, left: 25 + ((index * 77) % 535), opacity: cityPulse + (index % 5) * 0.08, position: 'absolute', top: 305 + ((index * 53) % 260), width: 13 + (index % 3) * 8}} />
        ))}
        {Array.from({length: 14}, (_, index) => (
          <div
            key={`rain-${index}`}
            style={{
              backgroundColor: 'rgba(183,219,255,0.34)',
              borderRadius: 8,
              height: 42 + (index % 4) * 22,
              left: 22 + ((index * 67) % 530),
              position: 'absolute',
              top: ((index * 113 + time * 180) % 730) - 80,
              transform: 'rotate(14deg)',
              width: 4,
            }}
          />
        ))}
        <div style={{backgroundColor: 'rgba(10,20,40,0.42)', bottom: 0, left: 280, position: 'absolute', top: 0, width: 9}} />
      </div>
      <div style={{border: '10px solid #947460', height: 165, position: 'absolute', right: 86, top: 260, transform: 'rotate(4deg)', width: 176}}>
        <div style={{background: 'linear-gradient(135deg, #C87F67 0%, #E4BF72 48%, #4B6F89 49%)', bottom: 14, left: 14, position: 'absolute', right: 14, top: 14}} />
      </div>
      <div style={{bottom: 367, height: 215, left: 164, position: 'absolute', width: 170}}>
        <div style={{backgroundColor: '#293C32', borderRadius: 40, bottom: 0, height: 78, left: 49, position: 'absolute', width: 82}} />
        {Array.from({length: 8}, (_, index) => <div key={index} style={{backgroundColor: index % 2 ? '#456E4F' : '#587A55', borderRadius: '80% 15% 80% 15%', height: 60, left: 28 + ((index * 23) % 110), position: 'absolute', top: 45 + (index % 3) * 24, transform: `rotate(${-45 + index * 18}deg)`, width: 38}} />)}
      </div>
      <div style={{background: '#5E4851', borderRadius: '38px 38px 0 0', bottom: 366, height: 244, left: 420, position: 'absolute', width: 565}} />
      <div style={{background: '#40313E', borderRadius: 38, bottom: 302, height: 124, left: 355, position: 'absolute', width: 710}} />
      <div style={{background: '#755238', borderRadius: '14px 14px 0 0', bottom: 115, height: 190, left: 745, position: 'absolute', width: 250}}>
        <div style={{backgroundColor: '#F4B96D', borderRadius: 8, boxShadow: '0 0 75px 35px rgba(243,180,97,0.34)', height: 112, left: 76, position: 'absolute', top: -120, width: 104}} />
        <div style={{backgroundColor: '#292030', height: 16, left: 46, position: 'absolute', top: -10, width: 160}} />
      </div>
      <div style={{backgroundColor: '#242432', bottom: 0, height: 130, left: 0, position: 'absolute', right: 0}} />
      <SittingPerson mood="anxious" scale={1.25} time={time} x={395} y={805} />
      <div style={{backgroundColor: dim ? 'rgba(7,9,21,0.58)' : 'rgba(7,9,21,0.16)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0}} />
    </AbsoluteFill>
  );
};

const DoorScene: React.FC<{time: number}> = ({time}) => {
  const open = arrive(time, 28.0, 1.35);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #1A2034 0%, #413143 69%, #1B1A28 69%, #11121C 100%)', overflow: 'hidden'}}>
      <div style={{backgroundColor: '#30243B', border: '12px solid #151725', height: 300, left: 80, position: 'absolute', top: 240, width: 230}}>
        <div style={{background: 'linear-gradient(135deg, #5F89A7 0%, #E5B36A 50%, #4D3148 51%)', bottom: 20, left: 20, position: 'absolute', right: 20, top: 20}} />
      </div>
      <div style={{backgroundColor: '#624853', borderRadius: '18px 18px 0 0', bottom: 225, height: 220, left: 45, position: 'absolute', width: 250}} />
      <div style={{backgroundColor: '#5C4035', bottom: 0, height: 180, left: 0, position: 'absolute', right: 0}} />
      <div style={{backgroundColor: '#111522', border: '18px solid #746052', height: 1290, position: 'absolute', right: 62, top: 210, width: 410}}>
        <div style={{background: 'linear-gradient(180deg, #F8D394 0%, #E3A963 54%, #AC7247 100%)', bottom: 0, boxShadow: 'inset 0 0 65px rgba(94,47,24,0.28)', left: 0, position: 'absolute', right: 0, top: 0}} />
        <div style={{backgroundColor: 'rgba(94,57,43,0.34)', bottom: 0, height: 165, left: 0, position: 'absolute', right: 0}} />
        <div style={{backgroundColor: '#EEC47D', borderRadius: '50%', boxShadow: '0 0 68px 26px rgba(255,223,164,0.55)', height: 42, left: 178, position: 'absolute', top: 160, width: 42}} />
        <div style={{backgroundColor: '#D7A45E', height: 12, left: 0, position: 'absolute', right: 0, top: 640}} />
      </div>
      <div style={{background: '#263047', border: '13px solid #151927', bottom: 210, height: 1290, position: 'absolute', right: 75, transform: `perspective(900px) rotateY(${-open * 78}deg)`, transformOrigin: 'left center', width: 382}}>
        {[100, 490, 880].map((top) => <div key={top} style={{border: '6px solid rgba(120,148,178,0.46)', height: 280, left: 42, position: 'absolute', right: 42, top, width: 286}} />)}
        <div style={{backgroundColor: '#D7AD62', borderRadius: '50%', boxShadow: '0 3px 0 rgba(0,0,0,0.24)', height: 30, position: 'absolute', right: 36, top: 646, width: 30}} />
      </div>
      <div style={{backgroundColor: 'rgba(255,211,137,0.22)', bottom: 0, clipPath: `polygon(62% 0, ${62 + open * 31}% 0, 100% 100%, 41% 100%)`, left: 0, opacity: open, position: 'absolute', right: 0, top: 0}} />
      <StandingPerson mood="neutral" scale={1.12} time={time} x={300 + open * 42} y={810 - open * 16} />
    </AbsoluteFill>
  );
};

const CafeScene: React.FC<{time: number}> = ({time}) => {
  const glow = 0.55 + Math.sin(time * 3) * 0.08;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #1D1929 0%, #493329 63%, #1D1720 100%)', overflow: 'hidden'}}>
      <div style={{backgroundColor: '#2C2022', bottom: 730, left: 0, position: 'absolute', top: 280, width: 155}}>
        {Array.from({length: 4}, (_, shelf) => (
          <div key={shelf} style={{backgroundColor: '#8B5E3E', height: 10, left: 0, position: 'absolute', right: 0, top: 65 + shelf * 138}}>
            {Array.from({length: 4}, (_, bottle) => <div key={bottle} style={{backgroundColor: ['#6A3A36', '#D69D56', '#385659', '#F1C86A'][bottle], borderRadius: '8px 8px 3px 3px', bottom: 10, height: 53 + ((bottle + shelf) % 2) * 22, left: 14 + bottle * 33, position: 'absolute', width: 18}} />)}
          </div>
        ))}
      </div>
      <div style={{background: '#0B1830', border: '13px solid #6E4A3B', height: 610, position: 'absolute', right: 50, top: 190, width: 425}}>
        {Array.from({length: 18}, (_, index) => <div key={index} style={{backgroundColor: '#7AA3D4', borderRadius: 5, height: 9, left: 18 + ((index * 51) % 370), opacity: 0.38 + (index % 4) * 0.12, position: 'absolute', top: 90 + ((index * 61) % 465), width: 12}} />)}
      </div>
      {Array.from({length: 5}, (_, index) => (
        <div key={index} style={{left: 115 + index * 195, position: 'absolute', top: 0}}>
          <div style={{backgroundColor: '#45323A', height: 130 + (index % 2) * 55, marginLeft: 17, width: 5}} />
          <div style={{backgroundColor: '#F4BD64', borderRadius: '50%', boxShadow: `0 0 55px 24px rgba(247,181,87,${glow * 0.26})`, height: 38, width: 38}} />
        </div>
      ))}
      <div style={{background: 'linear-gradient(180deg, #8F5B35, #4D291F)', borderRadius: '30px 30px 0 0', bottom: 360, height: 190, left: 105, position: 'absolute', width: 875}} />
      <div style={{backgroundColor: '#B97842', bottom: 260, height: 120, left: 92, position: 'absolute', transform: 'perspective(450px) rotateX(55deg)', width: 905}} />
      <Person accent="#A96755" gesture="talk" gestureOffset={Math.PI} mood="happy" pose="cafe" scale={0.78} skin="#7C4839" time={time} x={-20} y={875} />
      <Person accent="#36546B" gesture="talk" mood="happy" pose="cafe" scale={1.02} time={time} x={360} y={755} />
      <Person accent="#D0A384" mood="happy" pose="cafe" scale={0.82} skin="#D1916B" time={time} x={725} y={890} />
      {[330, 522, 711].map((left, index) => (
        <div key={left} style={{bottom: 408, left, position: 'absolute'}}>
          <div style={{border: '5px solid rgba(242,225,200,0.75)', borderRadius: '0 0 35px 35px', height: 72, width: 49}} />
          <div style={{backgroundColor: index === 1 ? '#D88256' : '#EEE1C7', height: 17, left: 5, position: 'absolute', top: 43, width: 39}} />
          <div style={{backgroundColor: 'rgba(246,224,202,0.72)', height: 45, left: 22, position: 'absolute', top: 72, width: 5}} />
          <div style={{backgroundColor: 'rgba(246,224,202,0.72)', borderRadius: '50%', height: 8, left: 8, position: 'absolute', top: 115, width: 35}} />
        </div>
      ))}
      {Array.from({length: 5}, (_, index) => <div key={index} style={{backgroundColor: '#F6D476', borderRadius: '50%', height: 10 + index * 3, left: 432 + index * 42, opacity: 0.5 + Math.sin(time * 6 + index) * 0.24, position: 'absolute', top: 780 - (index % 2) * 28, width: 10 + index * 3}} />)}
    </AbsoluteFill>
  );
};

const PhoneInsert: React.FC<{time: number}> = ({time}) => {
  const reply = arrive(time, 4.0, 0.32);
  const cursor = Math.floor(time * 2) % 2 === 0;
  const sent = arrive(time, 20.35, 0.22);
  const phoneScale = 0.92 + arrive(time, 4.0, 0.55) * 0.08 + Math.sin(time * 2.8) * 0.012;

  return (
    <div
      style={{
        background: 'radial-gradient(circle at 50% 35%, #293558 0%, #101526 57%, #050710 100%)',
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    >
      {Array.from({length: 8}, (_, index) => {
        const size = 210 + index * 160;
        return (
          <div
            key={index}
            style={{
              border: '2px solid rgba(154,180,255,0.07)',
              borderRadius: '50%',
              height: size,
              left: 540 - size / 2,
              position: 'absolute',
              top: 890 - size / 2,
              width: size,
            }}
          />
        );
      })}
      <div
        style={{
          backgroundColor: '#10131E',
          border: '8px solid #59657C',
          borderRadius: 78,
          boxShadow: '0 44px 90px rgba(0,0,0,0.52)',
          height: 1220,
          left: 130,
          overflow: 'hidden',
          position: 'absolute',
          top: 285,
          transform: `translateY(${Math.sin(time * 2.1) * 10}px) rotate(${Math.sin(time * 1.8) * 1.2}deg) scale(${phoneScale})`,
          width: 820,
        }}
      >
        <div style={{backgroundColor: '#F5F2ED', height: 164, left: 0, position: 'absolute', right: 0, top: 0}}>
          <div style={{backgroundColor: '#DDAF85', borderRadius: '50%', height: 68, left: 55, position: 'absolute', top: 46, width: 68}} />
          <div style={{color: '#272B41', fontFamily, fontSize: 39, fontWeight: 900, left: 147, position: 'absolute', top: 44}}>Maya</div>
          <div style={{color: '#727A8B', fontFamily, fontSize: 21, fontWeight: 800, left: 148, letterSpacing: 2.4, position: 'absolute', top: 92}}>GROUP CHAT</div>
          <div style={{backgroundColor: '#1B2030', borderRadius: 999, height: 35, left: 322, position: 'absolute', top: 13, width: 176}} />
        </div>
        <div style={{backgroundColor: '#1A2030', bottom: 0, left: 0, position: 'absolute', right: 0, top: 164}}>
          <div
            style={{
              backgroundColor: '#E7E9F0',
              borderRadius: '11px 34px 34px 34px',
              color: '#252B40',
              fontFamily,
              fontSize: 47,
              fontWeight: 750,
              left: 48,
              lineHeight: 1.03,
              opacity: reply,
              padding: '28px 31px',
              position: 'absolute',
              right: 95,
              top: 220,
              transform: `translateY(${(1 - reply) * 32}px)`,
            }}
          >
            We&apos;re at Juniper. Come by if you want.
          </div>
          <div style={{color: 'rgba(255,255,255,0.43)', fontFamily, fontSize: 23, fontWeight: 800, letterSpacing: 2.2, position: 'absolute', right: 64, top: 415}}>7:42 PM</div>
          <div
            style={{
              backgroundColor: sent > 0.88 ? '#567EE8' : '#2A3145',
              border: `2px solid ${sent > 0.88 ? '#7197F7' : '#4A546B'}`,
              borderRadius: '34px 11px 34px 34px',
              bottom: 200,
              color: sent > 0.88 ? brand.white : 'rgba(255,255,255,0.57)',
              fontFamily,
              fontSize: 43,
              fontWeight: 750,
              lineHeight: 1.05,
              opacity: time < 19.2 ? 0 : 1,
              padding: '26px 31px',
              position: 'absolute',
              right: 48,
              transform: `translateY(${(1 - sent) * 12}px)`,
            }}
          >
            I&apos;ll come for a bit{sent > 0.92 ? '  ✓' : cursor ? '|' : ''}
          </div>
          <div style={{alignItems: 'center', backgroundColor: '#252C3F', bottom: 48, display: 'flex', height: 105, left: 42, position: 'absolute', right: 42}}>
            <div style={{backgroundColor: '#3C465C', borderRadius: 999, flex: 1, height: 70, marginLeft: 18, marginRight: 18}} />
            <div style={{backgroundColor: '#567EE8', borderRadius: '50%', height: 70, marginRight: 18, width: 70}} />
          </div>
        </div>
      </div>
      <FilmTexture strength={0.8} />
    </div>
  );
};

const LifeBegins: React.FC<OneOffRenderProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const firstPhone = arrive(time, 3.3, 0.45) * (1 - arrive(time, 11.8, 0.5));
  const decisionPhone = arrive(time, 24.3, 0.35) * (1 - arrive(time, 28.15, 0.42));
  const phone = Math.min(1, firstPhone + decisionPhone);
  const doubt = arrive(time, 12.25, 0.55) * (1 - arrive(time, 24.2, 0.45));
  const doorIn = arrive(time, 27.8, 0.55);
  const socialIn = arrive(time, 31.65, 0.62);
  const endCard = arrive(time, 36.0, 0.48);
  const homeScale = 1.02 + Math.min(time, 16) * 0.004;
  const socialScale = 1.03 + Math.max(0, time - 25) * 0.008;

  return (
    <AbsoluteFill style={{backgroundColor: '#080A12', overflow: 'hidden'}}>
      <div style={{bottom: 0, left: 0, opacity: 1 - firstPhone, position: 'absolute', right: 0, top: 0, transform: `translateX(${time * -1.2}px) scale(${homeScale})`, transformOrigin: 'center'}}>
        <HomeScene time={time} />
      </div>
      <div style={{bottom: 0, left: 0, opacity: phone, position: 'absolute', right: 0, top: 0}}>
        <PhoneInsert time={time} />
      </div>
      <div style={{bottom: 0, filter: 'saturate(0.68) blur(1.3px)', left: 0, opacity: doubt, position: 'absolute', right: 0, top: 0, transform: 'scale(1.07)'}}>
        <HomeScene dim time={time} />
      </div>
      <div style={{bottom: 0, left: 0, opacity: doorIn * (1 - socialIn), position: 'absolute', right: 0, top: 0, transform: `translateX(${-doorIn * 7}px) scale(${1.025 + doorIn * 0.03})`, transformOrigin: 'center'}}>
        <DoorScene time={time} />
      </div>
      <div style={{bottom: 0, left: 0, opacity: socialIn, position: 'absolute', right: 0, top: 0, transform: `translateY(${Math.max(0, time - 25) * -1.2}px) scale(${socialScale})`, transformOrigin: 'center'}}>
        <CafeScene time={time} />
      </div>
      <FilmTexture />

      <div style={{left: 54, position: 'absolute', top: 55, zIndex: 20}}>
        <BrandMark wordmark={props.brandWordmark} />
      </div>
      <div
        style={{
          color: '#FFF8ED',
          fontFamily,
          fontSize: 27,
          fontWeight: 900,
          left: 60,
          letterSpacing: 4.5,
          opacity: time < 4 ? arrive(time, 0.3, 0.4) : 0,
          position: 'absolute',
          right: 60,
          textAlign: 'center',
          top: 182,
          zIndex: 20,
        }}
      >
        MAYBE NEXT TIME
      </div>
      <div
        style={{
          color: '#FFF9EE',
          fontFamily,
          fontSize: 79,
          fontWeight: 900,
          left: 72,
          letterSpacing: -3.3,
          lineHeight: 0.9,
          opacity: doubt,
          position: 'absolute',
          right: 72,
          textAlign: 'center',
          top: 400,
          transform: `translateY(${(1 - doubt) * 38}px)`,
          zIndex: 20,
        }}
      >
        A SIMPLE PLAN
        <br />
        STARTS TO FEEL HUGE.
      </div>
      <div
        style={{
          backgroundColor: '#F6F0E6',
          borderRadius: 999,
          boxShadow: '0 14px 38px rgba(0,0,0,0.22)',
          color: '#25304B',
          fontFamily,
          fontSize: 35,
          fontWeight: 900,
          left: 120,
          letterSpacing: -1.2,
          opacity: doorIn * (1 - socialIn),
          padding: '24px 30px',
          position: 'absolute',
          right: 120,
          textAlign: 'center',
          top: 310,
          transform: `translateY(${(1 - doorIn) * 34}px)`,
          zIndex: 20,
        }}
      >
        I&apos;LL COME FOR A BIT.
      </div>
      <div
        style={{
          color: '#FFF9F0',
          fontFamily,
          fontSize: 29,
          fontWeight: 900,
          left: 70,
          letterSpacing: 4,
          opacity: socialIn,
          position: 'absolute',
          right: 70,
          textAlign: 'center',
          textShadow: '0 3px 14px rgba(0,0,0,0.45)',
          top: 235,
          zIndex: 20,
        }}
      >
        TWENTY MINUTES LATER
      </div>
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(17,8,3,0) 0%, rgba(17,8,3,0.82) 100%)',
          bottom: 0,
          height: 640,
          left: 0,
          opacity: endCard,
          position: 'absolute',
          right: 0,
          zIndex: 21,
        }}
      />
      <div
        style={{
          ...headline,
          top: 390,
          color: '#FFF9F0',
          fontSize: 79,
          left: 70,
          opacity: endCard,
          position: 'absolute',
          right: 70,
          textShadow: '0 4px 22px rgba(0,0,0,0.38)',
          transform: `translateY(${(1 - endCard) * 35}px)`,
          zIndex: 22,
        }}
      >
        YOUR LIFE IS
        <br />
        STILL HERE.
      </div>
      <CaptionBar time={time} words={props.narration.words} />
      <OneOffAudio {...props} />
    </AbsoluteFill>
  );
};

const oneOffScenes: Record<OneOffRenderProps['id'], React.FC<OneOffRenderProps>> = {
  'blunt-intervention': PlanProof,
  'cancel-brain': CancelBrain,
  'comfort-zone-calendar': ComfortZoneCalendar,
  'first-door': FirstDoor,
  'message-thriller': MessageThriller,
  'nature-documentary': NatureDocumentary,
  'life-begins': LifeBegins,
};

export const OneOff: React.FC<OneOffRenderProps> = (props) => {
  const Scene = oneOffScenes[props.id];
  return <Scene {...props} />;
};
