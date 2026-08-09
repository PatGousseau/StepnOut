/**
 * Real events sourced live 2026-08-09 (see iteration logs), typed as UnifiedQuest.
 * v2: type is not a quality signal; difficulty is a label; attend_mode carried explicitly.
 */
import type { UnifiedQuest } from './pipeline';
import type { UserProfile } from './profile';

const base = { description: null, lat: null, lng: null, address: null } as const;

// --- ITER 1: naive generic query -> unverified, monotone ---------------------

export const ITER1: Record<string, UnifiedQuest[]> = {
  Milan: [{
    ...base, id: 'mi-jazz', source: 'milanofree', source_url: 'https://www.milanofree.it/',
    title: 'Marco Mezquida jazz trio', kind: 'concert', difficulty: 2, attend_mode: 'solo',
    start_datetime: '2026-08-09T21:30:00+02:00', recurrence: null,
    venue_name: 'Giardino delle Culture', city: 'Milan', price_eur: 0, is_free: true,
    confidence: 'listed_unconfirmed',
  }],
  Bologna: [{
    ...base, id: 'bo-cinema', source: 'bolognatoday', source_url: 'https://www.bolognatoday.it/',
    title: 'Sotto le Stelle del Cinema', kind: 'cinema', difficulty: 1, attend_mode: 'solo',
    start_datetime: '2026-08-09T21:45:00+02:00', recurrence: null,
    venue_name: 'Piazza Maggiore', city: 'Bologna', price_eur: 0, is_free: true,
    confidence: 'listed_unconfirmed',
  }],
  Fabriano: [],
};

// --- ITER 2: category-targeted -> variety found, recurrence unresolved --------

export const ITER2: Record<string, UnifiedQuest[]> = {
  Milan: [{
    ...base, id: 'mi-tandem', source: 'milanotoday',
    source_url: 'https://www.milanotoday.it/eventi/tandem-exchange-ostello-bello.html',
    title: 'Tandem Exchange @ Ostello Bello', kind: 'language_social', difficulty: 4, attend_mode: 'solo',
    start_datetime: null, recurrence: 'weekly', venue_name: 'Ostello Bello', city: 'Milan',
    price_eur: 0, is_free: true, confidence: 'recurring_unresolved',
  }],
  Bologna: [{
    ...base, id: 'bo-blabla', source: 'blablacommunity',
    source_url: 'https://www.blablacommunity.com/events/bologna-blabla-language-exchange-1',
    title: 'Bologna BlaBla Language Exchange', kind: 'language_social', difficulty: 4, attend_mode: 'solo',
    start_datetime: null, recurrence: 'weekly', venue_name: null, city: 'Bologna',
    price_eur: 0, is_free: true, confidence: 'recurring_unresolved',
  }],
  Fabriano: [{
    ...base, id: 'fab-sagra', source: 'eventiesagre', source_url: 'https://www.eventiesagre.it/',
    title: 'Sagra della Lumaca, Cancelli', kind: 'community_sagra', difficulty: 3, attend_mode: 'either',
    start_datetime: null, recurrence: null, venue_name: 'Cancelli di Fabriano', city: 'Fabriano',
    price_eur: 8, is_free: false, confidence: 'listed_unconfirmed',
  }],
};

// --- ITER 3: recurrence resolved + fallback ----------------------------------

export const ITER3: Record<string, UnifiedQuest[]> = {
  Milan: [{ ...ITER2.Milan[0], confidence: 'recurring_scheduled', verified_upcoming: true }],
  Bologna: [{
    ...ITER2.Bologna[0], confidence: 'recurring_scheduled',
    recurrence: 'weekly, Wed 20:30', venue_name: 'Scuderie, Piazza Verdi',
    start_datetime: '2026-08-12T20:30:00+02:00', verified_upcoming: true,
  }],
  Fabriano: [{
    ...base, id: 'mission:Fabriano:aperitivo', source: 'self_directed', source_url: null,
    title: 'Solo aperitivo mission', kind: 'self_directed_mission', difficulty: 4, attend_mode: 'either',
    start_datetime: null, recurrence: 'anytime', venue_name: 'Bar in Piazza del Comune', city: 'Fabriano',
    price_eur: 10, is_free: false, confidence: 'self_directed', age_restricted: false,
  }],
};

// --- ITER 4: dedup + Ferragosto freshness ------------------------------------

export const ITER4_BOLOGNA_POOL: UnifiedQuest[] = [
  { ...ITER3.Bologna[0], verified_upcoming: undefined },
  { ...ITER3.Bologna[0], id: 'bo-blabla-meetup', source: 'meetup',
    source_url: 'https://www.meetup.com/', confidence: 'recurring_unresolved' },
  { ...ITER3.Bologna[0], id: 'bo-blabla-fb', source: 'facebook',
    source_url: 'https://www.facebook.com/BlaBlaItaly/', confidence: 'listed_unconfirmed' },
];

// --- ITER 6 (v2): a diverse Milan pool so the diversity selector has choices ---
// All high-actionability; the point is variety of KIND, not who scores hardest.

export const MILAN_WEEKLY_POOL: UnifiedQuest[] = [
  { ...base, id: 'mi-tandem', source: 'ostellobello', source_url: 'https://www.milanotoday.it/',
    title: 'Tandem language exchange @ Ostello Bello', kind: 'language_social', difficulty: 4,
    attend_mode: 'solo', start_datetime: null, recurrence: 'weekly, Tue 19:30', venue_name: 'Ostello Bello',
    city: 'Milan', price_eur: 0, is_free: true, confidence: 'recurring_scheduled', verified_upcoming: true },
  { ...base, id: 'mi-jazz', source: 'milanofree', source_url: 'https://www.milanofree.it/',
    title: 'Free jazz concert @ Giardino delle Culture', kind: 'concert', difficulty: 2,
    attend_mode: 'solo', start_datetime: '2026-08-09T21:30:00+02:00', recurrence: null,
    venue_name: 'Giardino delle Culture', city: 'Milan', price_eur: 0, is_free: true, confidence: 'confirmed_dated' },
  { ...base, id: 'mi-navigli-market', source: 'yesmilano', source_url: 'https://www.yesmilano.it/',
    title: 'Mercato Antiquariato sul Naviglio', kind: 'market', difficulty: 2, attend_mode: 'either',
    start_datetime: null, recurrence: 'monthly, last Sun', venue_name: 'Naviglio Grande', city: 'Milan',
    price_eur: 0, is_free: true, confidence: 'recurring_scheduled', verified_upcoming: true },
  { ...base, id: 'mi-salsa', source: 'meetup', source_url: 'https://www.meetup.com/',
    title: 'Beginners salsa social (bring a friend)', kind: 'dance_movement', difficulty: 4,
    attend_mode: 'bring_friend', start_datetime: null, recurrence: 'weekly, Fri 21:00', venue_name: 'Tunnel Club',
    city: 'Milan', price_eur: 10, is_free: false, confidence: 'recurring_scheduled', verified_upcoming: true },
  { ...base, id: 'mi-boardgames', source: 'meetup', source_url: 'https://www.meetup.com/',
    title: 'Board-game social night', kind: 'meetup_hobby', difficulty: 3, attend_mode: 'solo',
    start_datetime: null, recurrence: 'weekly, Thu', venue_name: 'Ludoteca', city: 'Milan',
    price_eur: 5, is_free: false, confidence: 'recurring_scheduled', verified_upcoming: true },
  { ...base, id: 'mi-museum', source: 'yesmilano', source_url: 'https://www.yesmilano.it/',
    title: 'Museo del Novecento free evening', kind: 'exhibition', difficulty: 2, attend_mode: 'solo',
    start_datetime: '2026-08-11T18:00:00+02:00', recurrence: null, venue_name: 'Museo del Novecento',
    city: 'Milan', price_eur: 0, is_free: true, confidence: 'confirmed_dated' },
];

// ---------------------------------------------------------------------------
// ITER 7: one Milan week, wide enough that different people CAN diverge.
//
// Deliberately contains NO physical/sport option — one test profile wants
// bouldering, so the POI fallback has to carry them.
// ---------------------------------------------------------------------------

export const MILAN_WEEK_V7: UnifiedQuest[] = [
  ...MILAN_WEEKLY_POOL,
  { ...base, id: 'mi-swing', source: 'meetup', source_url: 'https://www.meetup.com/',
    title: 'Swing beginners taster — free trial', kind: 'dance_movement', difficulty: 4,
    attend_mode: 'either', start_datetime: null, recurrence: 'weekly, Wed 20:30',
    venue_name: 'Circolo Magnolia', city: 'Milan', price_eur: 0, is_free: true,
    confidence: 'recurring_scheduled', verified_upcoming: true },
  { ...base, id: 'mi-lifedrawing', source: 'milanotoday', source_url: 'https://www.milanotoday.it/',
    title: 'Life drawing session, all levels', kind: 'meetup_hobby', difficulty: 3,
    attend_mode: 'solo', start_datetime: null, recurrence: 'weekly, Wed 19:00',
    venue_name: 'Spazio Tadini', city: 'Milan', price_eur: 8, is_free: false,
    confidence: 'recurring_scheduled', verified_upcoming: true },
  { ...base, id: 'mi-openmic', source: 'milanofree', source_url: 'https://www.milanofree.it/',
    title: 'Open-mic night, sign up on the door', kind: 'concert', difficulty: 5,
    attend_mode: 'solo', start_datetime: '2026-08-13T21:00:00+02:00', recurrence: null,
    venue_name: 'Blue Note Off', city: 'Milan', price_eur: 0, is_free: true,
    confidence: 'confirmed_dated' },
  { ...base, id: 'mi-sagra-isola', source: 'eventiesagre', source_url: 'https://www.eventiesagre.it/',
    title: 'Festa di quartiere, Isola', kind: 'community_sagra', difficulty: 3,
    attend_mode: 'either', start_datetime: '2026-08-15T17:00:00+02:00', recurrence: null,
    venue_name: 'Piazza Minniti', city: 'Milan', price_eur: 0, is_free: true,
    confidence: 'confirmed_dated' },
  { ...base, id: 'mi-aperitivo-lingua', source: 'ostellobello', source_url: 'https://www.ostellobello.com/',
    title: 'Aperitivo linguistico, tavoli per lingua', kind: 'language_social', difficulty: 3,
    attend_mode: 'solo', start_datetime: null, recurrence: 'weekly, Thu 19:00',
    venue_name: 'Ostello Bello Grande', city: 'Milan', price_eur: 5, is_free: false,
    confidence: 'recurring_scheduled', verified_upcoming: true },
  { ...base, id: 'mi-cinema-parco', source: 'milanotoday', source_url: 'https://www.milanotoday.it/',
    title: 'Cinema all aperto al Parco Sempione', kind: 'cinema', difficulty: 1,
    attend_mode: 'solo', start_datetime: '2026-08-12T21:45:00+02:00', recurrence: null,
    venue_name: 'Parco Sempione', city: 'Milan', price_eur: 0, is_free: true,
    confidence: 'confirmed_dated' },
];

// ---------------------------------------------------------------------------
// ITER 8: a THIN week — Fabriano-sized inventory (3 candidates).
//
// Iter 8 turned the bail condition into a hard filter. In Milan that is safe
// because the pool is deep. This fixture tests the case that actually matters:
// most Italian towns are Fabriano-sized, and a filter is only a guarantee if it
// survives a pool that can't absorb it.
// ---------------------------------------------------------------------------

export const THIN_WEEK_V8: UnifiedQuest[] = [
  { ...base, id: 'th-sagra', source: 'eventiesagre', source_url: 'https://www.eventiesagre.it/',
    title: 'Sagra della Lumaca, Cancelli', kind: 'community_sagra', difficulty: 3,
    attend_mode: 'either', start_datetime: '2026-08-15T20:30:00+02:00', recurrence: null,
    venue_name: 'Cancelli', city: 'Milan', price_eur: 8, is_free: false,
    confidence: 'confirmed_dated' },
  { ...base, id: 'th-banda', source: 'virgilio', source_url: 'https://www.virgilio.it/',
    title: 'Concerto della banda cittadina', kind: 'concert', difficulty: 2,
    attend_mode: 'solo', start_datetime: '2026-08-14T21:00:00+02:00', recurrence: null,
    venue_name: 'Piazza del Comune', city: 'Milan', price_eur: 0, is_free: true,
    confidence: 'confirmed_dated' },
  { ...base, id: 'th-museo', source: 'virgilio', source_url: 'https://www.virgilio.it/',
    title: 'Museo della Carta e della Filigrana', kind: 'exhibition', difficulty: 2,
    attend_mode: 'solo', start_datetime: null, recurrence: 'open daily',
    venue_name: 'Museo della Carta', city: 'Milan', price_eur: 6, is_free: false,
    confidence: 'recurring_scheduled', verified_upcoming: true },
];

// ---------------------------------------------------------------------------
// ITER 7: user profiles — SAME city, SAME week. Raw wording kept verbatim,
// exactly as the intake flow would store it.
// ---------------------------------------------------------------------------

export const PROFILES: UserProfile[] = [
  {
    id: 'sofia',
    meaningToDo: "I've been meaning to actually speak Italian with real people instead of just an app",
    bailCondition: 'If I have to perform in front of a group I will not go',
    soloHistory: 'once_or_twice', city: 'Milan', neighbourhood: 'Porta Venezia',
    followUp: [{
      question: 'What stops you at the moment?',
      answer: 'I freeze when I have to speak and make mistakes in front of strangers',
    }],
  },
  {
    id: 'marco',
    meaningToDo: 'Been meaning to start dancing again, I have not danced since university',
    bailCondition: 'Anything that costs more than a pizza',
    soloHistory: 'regularly', city: 'Milan', neighbourhood: 'NoLo',
    followUp: [{ question: 'What kind of thing appeals?', answer: 'Something social, not a class where I stand in a line' }],
  },
  {
    id: 'elena',
    meaningToDo: 'Been meaning to start drawing again, the sketchbook has been untouched for a year',
    bailCondition: 'Big loud crowds at night',
    soloHistory: 'never', city: 'Milan', neighbourhood: 'Città Studi',
    followUp: [{ question: 'What would a good version of this look like?', answer: 'Somewhere quiet where I can look at art slowly and not be rushed' }],
  },
  {
    // NO physical / sport option exists in MILAN_WEEK_V7 — the fallback must carry him.
    id: 'tommaso',
    meaningToDo: 'Been meaning to get back into bouldering, I have not climbed since 2019',
    bailCondition: 'Signing up for a whole course',
    soloHistory: 'once_or_twice', city: 'Milan', neighbourhood: 'Lambrate',
  },
  {
    // LOW DATA: skipped the follow-up, gave almost nothing.
    id: 'giulia',
    meaningToDo: 'idk, get out more',
    bailCondition: '',
    soloHistory: 'never', city: 'Milan',
  },
  {
    // LOW DATA, but one word ('people') happens to land in the lexicon.
    id: 'andrea',
    meaningToDo: 'meet more people i guess',
    bailCondition: 'nothing really',
    soloHistory: 'regularly', city: 'Milan',
  },
];
