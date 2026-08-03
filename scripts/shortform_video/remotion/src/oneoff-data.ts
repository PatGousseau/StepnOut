import type {OneOffId} from './types';

export type OneOffDefinition = {
  id: OneOffId;
  title: string;
  narration: string;
  music: string;
  musicVolume: number;
  musicStart: number;
  minDuration: number;
  sfx: Array<{time: number; frequency: number; length: number; volume: number}>;
};

export const ONE_OFFS: OneOffDefinition[] = [
  {
    id: 'blunt-intervention',
    title: 'The internal committee',
    narration:
      "Maybe your life isn't boring. Maybe every interesting idea has to clear a five-person committee in your head. Is it worth it? Who else is going? What if you regret it? By the time the committee approves the plan, the event is over. This has been a hostile takeover by caution.",
    music: 'music/pixabay/onetent-happy-inspiration-music-159193.mp3',
    musicVolume: 0.25,
    musicStart: 2.1,
    minDuration: 21,
    sfx: [
      {time: 1.0, frequency: 135, length: 0.16, volume: 0.28},
      {time: 5.3, frequency: 570, length: 0.07, volume: 0.2},
      {time: 8.2, frequency: 670, length: 0.07, volume: 0.2},
      {time: 10.9, frequency: 780, length: 0.09, volume: 0.24},
      {time: 15.1, frequency: 930, length: 0.14, volume: 0.25},
    ],
  },
  {
    id: 'cancel-brain',
    title: 'Cancel brain',
    narration:
      "Every plan gets a four-hour trial period where it feels like a brilliant idea. Then, fifty minutes before, cancel brain arrives with data. You had a long day. It might rain. Think of the laundry. It doesn't actually want rest. It wants the comforting achievement of almost doing something.",
    music: 'music/pixabay/harumachimusic-my-favorite-cafe-slow-swing-piano-164144.mp3',
    musicVolume: 0.23,
    musicStart: 1.9,
    minDuration: 22,
    sfx: [
      {time: 1.3, frequency: 520, length: 0.06, volume: 0.22},
      {time: 4.9, frequency: 400, length: 0.09, volume: 0.2},
      {time: 9.3, frequency: 680, length: 0.07, volume: 0.22},
      {time: 13.2, frequency: 760, length: 0.07, volume: 0.22},
      {time: 15.5, frequency: 980, length: 0.15, volume: 0.28},
    ],
  },
  {
    id: 'nature-documentary',
    title: 'The modern adult',
    narration:
      "Here we see the modern adult encountering a perfectly good invitation. Listen closely. It makes the ceremonial sound: we should totally do that sometime. A phrase that communicates enthusiasm, affection, and no plans whatsoever. Remarkable. The animal will now return to its natural habitat and wait for someone else to pick a date.",
    music: 'music/pixabay/sigmamusicart-historical-documentary-background-atmospheric-moments-253424.mp3',
    musicVolume: 0.24,
    musicStart: 2.3,
    minDuration: 24,
    sfx: [
      {time: 1.8, frequency: 220, length: 0.1, volume: 0.13},
      {time: 7.0, frequency: 185, length: 0.08, volume: 0.14},
      {time: 12.0, frequency: 300, length: 0.08, volume: 0.15},
      {time: 17.0, frequency: 440, length: 0.13, volume: 0.2},
    ],
  },
  {
    id: 'message-thriller',
    title: 'Send the message',
    narration:
      "Somewhere, a person is staring at a text that says, want to get coffee this week? The message has been finished for nine minutes. But in those nine minutes it has become a legal document, a personality test, and a possible meteor strike. Will they send it? We may never know. The typing cursor blinks on, indifferent.",
    music: 'music/pixabay/alex_makemusic-soft-ambient-10782.mp3',
    musicVolume: 0.24,
    musicStart: 2.1,
    minDuration: 21,
    sfx: [
      {time: 2.5, frequency: 170, length: 0.18, volume: 0.15},
      {time: 7.4, frequency: 245, length: 0.12, volume: 0.16},
      {time: 11.4, frequency: 390, length: 0.1, volume: 0.18},
      {time: 13.3, frequency: 880, length: 0.16, volume: 0.24},
    ],
  },
  {
    id: 'first-door',
    title: 'The mysterious storefront',
    narration:
      "Everyone has a place in their neighborhood they have accidentally turned into a myth. The restaurant with the mysterious lights. The bookshop that might not be a bookshop. The studio with no sign. You walk past it a hundred times, invent a whole backstory, then never open the door. At some point it becomes less of a building and more of a tiny private haunted house.",
    music: 'music/pixabay/dream-protocol-twilight-dream-inspirational-guitar-99201.mp3',
    musicVolume: 0.25,
    musicStart: 2.2,
    minDuration: 23,
    sfx: [
      {time: 2.4, frequency: 300, length: 0.1, volume: 0.16},
      {time: 6.8, frequency: 520, length: 0.09, volume: 0.2},
      {time: 10.4, frequency: 660, length: 0.1, volume: 0.22},
      {time: 15.6, frequency: 830, length: 0.15, volume: 0.22},
    ],
  },
  {
    id: 'comfort-zone-calendar',
    title: 'Comfort-zone calendar',
    narration:
      "Your comfort zone maintains a very organized calendar. Friday: maybe later. Saturday: what if we're tired. Sunday: starting fresh next week. It never has a plan, exactly. It just has a beautifully color-coded system for postponing one. Honestly, its operations team is incredible.",
    music: 'music/pixabay/dream-protocol-fun-times-ahead-soft-acoustic-guitar-instrumental-22173.mp3',
    musicVolume: 0.26,
    musicStart: 2.0,
    minDuration: 22,
    sfx: [
      {time: 1.0, frequency: 112, length: 0.15, volume: 0.25},
      {time: 4.4, frequency: 300, length: 0.08, volume: 0.18},
      {time: 7.0, frequency: 360, length: 0.08, volume: 0.18},
      {time: 10.5, frequency: 720, length: 0.14, volume: 0.25},
      {time: 15.0, frequency: 920, length: 0.1, volume: 0.23},
    ],
  },
];

export const oneOffById = (id: OneOffId) => {
  const result = ONE_OFFS.find((video) => video.id === id);
  if (!result) throw new Error(`Unknown one-off video: ${id}`);
  return result;
};
