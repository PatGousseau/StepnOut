/**
 * Real events sourced live 2026-08-09 (see iteration logs), typed as UnifiedQuest.
 * v2: type is not a quality signal; difficulty is a label; attend_mode carried explicitly.
 */
import type { UnifiedQuest } from './pipeline';

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
