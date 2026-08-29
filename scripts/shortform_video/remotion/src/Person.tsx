type PersonMood = 'anxious' | 'happy' | 'neutral';
type PersonGesture = 'phone' | 'rest' | 'talk';

export type PersonPose = 'cafe' | 'seated' | 'standing';

export type PersonProps = {
  accent?: string;
  gesture?: PersonGesture;
  gestureOffset?: number;
  mood?: PersonMood;
  pose: PersonPose;
  scale?: number;
  skin?: string;
  time: number;
  x: number;
  y: number;
};

const part = {position: 'absolute' as const};

const Limb: React.FC<{
  color: string;
  hand: string;
  lowerAngle: number;
  lowerHeight: number;
  upperAngle: number;
  upperHeight: number;
  x: number;
  y: number;
}> = ({color, hand, lowerAngle, lowerHeight, upperAngle, upperHeight, x, y}) => (
  <div style={{...part, height: upperHeight + lowerHeight, left: x, top: y, transform: `rotate(${upperAngle}deg)`, transformOrigin: '50% 13px', width: 48}}>
    <div style={{...part, height: upperHeight, left: 0, top: 0, width: 48}}>
      <div style={{background: color, border: '5px solid #192236', borderRadius: 999, height: upperHeight, width: 48}} />
    </div>
    <div style={{...part, background: '#192236', borderRadius: '50%', height: 28, left: 10, top: upperHeight - 14, width: 28}} />
    <div style={{...part, height: lowerHeight, left: 2, top: upperHeight - 12, transform: `rotate(${lowerAngle}deg)`, transformOrigin: '50% 14px', width: 43}}>
      <div style={{background: color, border: '5px solid #192236', borderRadius: 999, height: lowerHeight, width: 43}} />
      <div style={{...part, background: hand, borderRadius: '48% 48% 45% 45%', bottom: -24, height: 42, left: 1, width: 42}} />
    </div>
  </div>
);

const Face: React.FC<{mood: PersonMood; skin: string}> = ({mood, skin}) => (
  <>
    <div style={{...part, background: skin, borderRadius: '49% 49% 45% 45%', height: 125, left: 118, top: 40, width: 124}}>
      <div style={{...part, background: '#1B1D27', borderRadius: '52% 52% 18% 24%', height: 58, left: -5, top: -6, width: 134}} />
      <div style={{...part, background: 'rgba(255,255,255,0.14)', borderRadius: 999, height: 20, left: 16, top: 65, width: 10}} />
      <div style={{...part, background: '#242431', borderRadius: 999, height: 8, left: 37, top: 68, width: 18}} />
      <div style={{...part, background: '#242431', borderRadius: 999, height: 8, right: 35, top: 68, width: 18}} />
      <div
        style={{
          ...part,
          borderBottom: mood === 'happy' ? '6px solid #813D48' : undefined,
          borderRadius: '0 0 30px 30px',
          borderTop: mood === 'anxious' ? '5px solid #813D48' : mood === 'neutral' ? '4px solid #813D48' : undefined,
          height: mood === 'happy' ? 15 : 0,
          left: 48,
          top: mood === 'happy' ? 91 : 99,
          width: 30,
        }}
      />
    </div>
    <div style={{...part, background: skin, borderRadius: '0 0 18px 18px', height: 34, left: 158, top: 151, width: 42}} />
  </>
);

const StandingLegs: React.FC = () => (
  <>
    <div style={{...part, background: '#202B41', borderRadius: '34px 34px 13px 13px', height: 132, left: 118, top: 350, transform: 'rotate(3deg)', width: 62}} />
    <div style={{...part, background: '#202B41', borderRadius: '28px 28px 12px 12px', height: 128, left: 126, top: 467, transform: 'rotate(-2deg)', width: 57}} />
    <div style={{...part, background: '#2B3851', borderRadius: '34px 34px 13px 13px', height: 132, left: 205, top: 350, transform: 'rotate(-3deg)', width: 62}} />
    <div style={{...part, background: '#2B3851', borderRadius: '28px 28px 12px 12px', height: 128, left: 202, top: 467, transform: 'rotate(2deg)', width: 57}} />
    <div style={{...part, background: '#F1E8D9', borderRadius: '11px 28px 12px 9px', height: 31, left: 101, top: 579, width: 95}} />
    <div style={{...part, background: '#F1E8D9', borderRadius: '11px 28px 12px 9px', height: 31, left: 191, top: 579, width: 95}} />
  </>
);

const SittingLegs: React.FC = () => (
  <>
    <div style={{...part, background: '#202B41', borderRadius: '46px 45px 29px 32px', height: 65, left: 108, top: 350, transform: 'rotate(19deg)', transformOrigin: '20px 32px', width: 153}} />
    <div style={{...part, background: '#1D283D', borderRadius: '26px 26px 12px 12px', height: 151, left: 222, top: 401, transform: 'rotate(4deg)', width: 61}} />
    <div style={{...part, background: '#2B3851', borderRadius: '45px 42px 30px 29px', height: 67, left: 179, top: 354, transform: 'rotate(9deg)', transformOrigin: '18px 32px', width: 152}} />
    <div style={{...part, background: '#28364F', borderRadius: '26px 26px 12px 12px', height: 148, left: 295, top: 391, transform: 'rotate(-3deg)', width: 62}} />
    <div style={{...part, background: '#F1E8D9', borderRadius: '11px 28px 12px 9px', height: 30, left: 202, top: 544, transform: 'rotate(2deg)', width: 93}} />
    <div style={{...part, background: '#F1E8D9', borderRadius: '11px 28px 12px 9px', height: 30, left: 279, top: 534, transform: 'rotate(-3deg)', width: 93}} />
  </>
);

export const Person: React.FC<PersonProps> = ({accent = '#34435F', gesture = 'rest', gestureOffset = 0, mood = 'neutral', pose, scale = 1, skin = '#A96548', time, x, y}) => {
  const breathe = Math.sin(time * 2.1 + gestureOffset) * 2;
  const phase = ((time * 1.03 + gestureOffset / (Math.PI * 2)) % 1 + 1) % 1;
  const easeOut = (value: number) => 1 - (1 - Math.max(0, Math.min(1, value))) ** 3;
  const speaking = gesture === 'talk'
    ? phase < 0.16
      ? easeOut(phase / 0.16)
      : phase < 0.51
        ? 1
        : phase < 0.78
          ? 1 - easeOut((phase - 0.51) / 0.27)
          : 0
    : 0;
  const wristBeat = gesture === 'talk' && phase > 0.2 && phase < 0.51 ? Math.sin((phase - 0.2) * 32) * 4 : 0;
  const isStanding = pose === 'standing';
  const isSitting = pose === 'seated' || pose === 'cafe';

  return (
    <div aria-hidden style={{...part, height: 615, left: x, top: y, transform: `translateY(${isStanding ? Math.sin(time * 4.5) * 1.5 : 0}px) scale(${scale})`, transformOrigin: 'bottom center', width: 400}}>
      <div style={{...part, background: 'rgba(5,8,17,0.26)', borderRadius: '50%', bottom: 0, filter: 'blur(3px)', height: 21, left: 77, width: 265}} />
      {isStanding ? <StandingLegs /> : <SittingLegs />}
      <div style={{...part, background: accent, border: '6px solid #192236', borderRadius: '76px 76px 25px 25px', height: 204, left: 91, top: 185 + breathe, width: 205}}>
        <div style={{...part, background: 'rgba(255,255,255,0.09)', borderRadius: '60px 24px 22px 22px', height: 178, left: 18, top: 11, width: 44}} />
        <div style={{...part, background: '#F7F0E5', clipPath: 'polygon(24% 0, 75% 0, 62% 88%, 43% 88%)', height: 151, left: 47, top: 0, width: 112}} />
      </div>
      <Limb color={accent} hand={skin} lowerAngle={gesture === 'talk' ? 5 + wristBeat : isSitting ? -7 : -3} lowerHeight={86} upperAngle={gesture === 'talk' ? 9 + speaking * 28 : isSitting ? -7 : 7} upperHeight={118} x={91} y={198 + breathe - speaking * 34} />
      <Limb color={accent} hand={skin} lowerAngle={gesture === 'phone' ? -24 : isSitting ? 10 : 2} lowerHeight={gesture === 'phone' ? 78 : 86} upperAngle={gesture === 'phone' ? 20 : isSitting ? 11 : -8} upperHeight={120} x={261} y={200 + breathe} />
      {gesture === 'phone' ? (
        <div style={{...part, background: '#131C2C', border: '5px solid #31425E', borderRadius: 14, boxShadow: '0 7px 0 rgba(0,0,0,0.16)', height: 82, left: 191, top: 350 + breathe, transform: 'rotate(17deg)', width: 51}}>
          <div style={{background: '#6B88E8', borderRadius: 8, bottom: 7, left: 6, position: 'absolute', right: 6, top: 7}} />
        </div>
      ) : null}
      <Face mood={mood} skin={skin} />
    </div>
  );
};

export const SittingPerson: React.FC<Omit<PersonProps, 'pose'>> = (props) => <Person {...props} gesture={props.gesture ?? 'phone'} pose="seated" />;

export const StandingPerson: React.FC<Omit<PersonProps, 'pose'>> = (props) => <Person {...props} pose="standing" />;
