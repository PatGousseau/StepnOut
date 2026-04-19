import { Platform, TextStyle } from 'react-native';
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
    fontFamily: esploraFonts.sans,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '600',
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
