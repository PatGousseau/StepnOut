import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

import {SittingPerson, StandingPerson} from './Person';

export const CharacterStudy: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;

  return (
    <AbsoluteFill style={{background: 'linear-gradient(140deg, #F8F0E6 0%, #E8EAF8 54%, #D9E7E4 100%)', overflow: 'hidden'}}>
      <div style={{color: '#282A4D', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 34, fontWeight: 900, left: 72, letterSpacing: 5, position: 'absolute', top: 72}}>CHARACTER STUDY</div>
      <div style={{backgroundColor: 'rgba(255,255,255,0.74)', border: '4px solid rgba(77,83,130,0.2)', borderRadius: 48, bottom: 120, boxShadow: '0 24px 52px rgba(77,83,130,0.13)', left: 60, position: 'absolute', top: 220, width: 448}}>
        <div style={{color: '#4D5382', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 28, fontWeight: 900, left: 0, letterSpacing: 4, position: 'absolute', right: 0, textAlign: 'center', top: 56}}>SITTING</div>
        <div style={{backgroundColor: '#68545D', borderRadius: '30px 30px 0 0', bottom: 370, height: 150, left: 30, position: 'absolute', width: 388}} />
        <div style={{backgroundColor: '#493C4A', borderRadius: 24, bottom: 300, height: 90, left: 12, position: 'absolute', width: 424}} />
        <SittingPerson mood="anxious" scale={0.9} time={time} x={25} y={690} />
      </div>
      <div style={{backgroundColor: 'rgba(255,255,255,0.74)', border: '4px solid rgba(77,83,130,0.2)', borderRadius: 48, bottom: 120, boxShadow: '0 24px 52px rgba(77,83,130,0.13)', position: 'absolute', right: 60, top: 220, width: 448}}>
        <div style={{color: '#4D5382', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 28, fontWeight: 900, left: 0, letterSpacing: 4, position: 'absolute', right: 0, textAlign: 'center', top: 56}}>STANDING</div>
        <div style={{backgroundColor: '#D8C9B5', bottom: 178, height: 10, left: 30, position: 'absolute', width: 388}} />
        <StandingPerson mood="neutral" scale={0.9} time={time} x={29} y={736} />
      </div>
    </AbsoluteFill>
  );
};
