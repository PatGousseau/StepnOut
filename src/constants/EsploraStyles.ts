import { Dimensions, Platform, TextStyle } from 'react-native';
import { ContentCategory } from '../types';

// System serif: Georgia on iOS, the stock serif on Android.
const systemSerif = Platform.select({ ios: 'Georgia', default: 'serif' });

export const esploraFonts = {
  serif: systemSerif,
  serifMedium: systemSerif,
  serifSemibold: systemSerif,
  sans: 'Montserrat-Regular',
} as const;

export const esploraSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
  horizontalPadding: 24,
  readerHorizontalPadding: 32,
  sectionGap: 40,
} as const;

// Two cards plus a peek of a third visible in horizontal scroll, matching the
// reference layout. Grid screens (saved, category) use the same width.
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const HORIZONTAL_PADDING = esploraSpacing.horizontalPadding;
const CARD_WIDTH = Math.round(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 1.85
);
const GRID_CARD_WIDTH = Math.round(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2
);

export const esploraCard = {
  width: CARD_WIDTH,
  height: Math.round(CARD_WIDTH * 1.4),
  gridWidth: GRID_CARD_WIDTH,
  gridHeight: Math.round(GRID_CARD_WIDTH * 1.4),
  gap: CARD_GAP,
  radius: 14,
} as const;

export const esploraType = {
  wordmark: {
    fontFamily: esploraFonts.serif,
    fontWeight: '500',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0.2,
  } as TextStyle,
  display: {
    fontFamily: esploraFonts.serif,
    fontWeight: '500',
    fontSize: 30,
    lineHeight: 38,
  } as TextStyle,
  hook: {
    fontFamily: esploraFonts.serif,
    fontSize: 26,
    lineHeight: 36,
  } as TextStyle,
  hookLarge: {
    fontFamily: esploraFonts.serif,
    fontSize: 30,
    lineHeight: 42,
  } as TextStyle,
  title: {
    fontFamily: esploraFonts.serif,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 26,
  } as TextStyle,
  cardTitle: {
    fontFamily: esploraFonts.serif,
    fontWeight: '500',
    fontSize: 19,
    lineHeight: 24,
  } as TextStyle,
  cardMeta: {
    fontFamily: esploraFonts.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  } as TextStyle,
  body: {
    fontFamily: esploraFonts.sans,
    fontSize: 16,
    lineHeight: 26,
  } as TextStyle,
  preview: {
    fontFamily: esploraFonts.sans,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,
  categoryLabel: {
    fontFamily: esploraFonts.sans,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  } as TextStyle,
  categoryTile: {
    fontFamily: esploraFonts.serif,
    fontSize: 18,
    lineHeight: 24,
  } as TextStyle,
  sectionLabel: {
    fontFamily: esploraFonts.serif,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
  } as TextStyle,
} as const;

export const CATEGORY_ORDER: ContentCategory[] = [
  'fear',
  'vulnerability',
  'connection',
  'stories',
  'science',
  'practice',
];

// Maps a category key to the English translation key consumed by t().
export const CATEGORY_LABEL_KEYS: Record<ContentCategory, string> = {
  fear: 'On fear',
  vulnerability: 'Vulnerability',
  connection: 'Real connection',
  stories: 'True stories',
  science: 'The science',
  practice: 'Daily practice',
};

// Painterly gradients used as a fallback when a piece has no cover image.
// Each pair is [top, bottom] for a vertical linear gradient.
export const CATEGORY_GRADIENTS: Record<ContentCategory, [string, string]> = {
  fear: ['#7C2230', '#E07A5F'],
  vulnerability: ['#A8466A', '#F2B5A3'],
  connection: ['#B86A3A', '#E5B768'],
  stories: ['#2F4A3F', '#93B79A'],
  science: ['#37406C', '#8E96C9'],
  practice: ['#6B6033', '#C9B679'],
};
