import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CATEGORY_GRADIENTS } from '../../constants/EsploraStyles';
import { ContentCategory } from '../../types';

type Variant = 'featured' | 'large';
type Motif = 'orbit' | 'ribbon' | 'cluster' | 'arch';
type ColorRole = 'accentBold' | 'accentSoft' | 'outlineStrong' | 'outlineSoft';
type ShapeKind = 'fill' | 'outline';

type ShapeSpec = {
  kind: ShapeKind;
  role: ColorRole;
  width: number | string;
  height: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  rotate?: string;
  borderRadius?: number;
  borderWidth?: number;
};

interface Props {
  category: ContentCategory;
  variant: Variant;
  seed?: number;
}

const CATEGORY_MOTIF_FAMILIES: Record<ContentCategory, Motif[]> = {
  fear: ['orbit', 'arch', 'cluster'],
  vulnerability: ['ribbon', 'orbit', 'arch'],
  connection: ['cluster', 'ribbon', 'orbit'],
  stories: ['arch', 'cluster', 'ribbon'],
  science: ['orbit', 'ribbon', 'cluster'],
  practice: ['ribbon', 'arch', 'orbit'],
  solitude: ['arch', 'orbit', 'ribbon'],
  assertiveness: ['cluster', 'arch', 'orbit'],
  openness: ['ribbon', 'cluster', 'arch'],
};

const MOTIF_SHAPES: Record<Motif, ShapeSpec[]> = {
  orbit: [
    { kind: 'fill', role: 'accentSoft', width: '68%', height: '68%', top: '-18%', right: '-16%' },
    { kind: 'outline', role: 'outlineStrong', width: '42%', height: '42%', top: '12%', right: '-4%', rotate: '14deg' },
    { kind: 'outline', role: 'outlineSoft', width: '29%', height: '29%', top: '38%', right: '14%', rotate: '-10deg' },
    { kind: 'fill', role: 'accentBold', width: '34%', height: 10, top: '20%', right: '22%', rotate: '-18deg', borderRadius: 999 },
  ],
  ribbon: [
    { kind: 'fill', role: 'accentSoft', width: '74%', height: '54%', top: '-10%', right: '-24%', rotate: '-12deg', borderRadius: 999 },
    { kind: 'fill', role: 'accentBold', width: '42%', height: 11, top: '18%', right: '18%', rotate: '-20deg', borderRadius: 999 },
    { kind: 'outline', role: 'outlineStrong', width: '34%', height: '34%', bottom: '12%', right: '-6%', rotate: '10deg' },
    { kind: 'outline', role: 'outlineSoft', width: '24%', height: '24%', bottom: '18%', right: '20%', rotate: '-10deg' },
  ],
  cluster: [
    { kind: 'fill', role: 'accentSoft', width: '46%', height: '46%', top: '-8%', right: '-8%' },
    { kind: 'fill', role: 'accentBold', width: '26%', height: '26%', top: '20%', right: '18%' },
    { kind: 'outline', role: 'outlineStrong', width: '34%', height: '34%', top: '10%', right: '6%', rotate: '18deg' },
    { kind: 'fill', role: 'accentSoft', width: '34%', height: 10, bottom: '18%', left: '14%', rotate: '16deg', borderRadius: 999 },
  ],
  arch: [
    { kind: 'fill', role: 'accentSoft', width: '82%', height: '64%', top: '-20%', right: '-22%' },
    { kind: 'outline', role: 'outlineStrong', width: '54%', height: '54%', top: '2%', right: '-8%', rotate: '10deg' },
    { kind: 'outline', role: 'outlineSoft', width: '36%', height: '36%', bottom: '10%', right: '10%', rotate: '-8deg' },
    { kind: 'fill', role: 'accentBold', width: '30%', height: 10, top: '18%', right: '24%', rotate: '-18deg', borderRadius: 999 },
  ],
};

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  const normalized = value.length === 3
    ? value.split('').map((char) => `${char}${char}`).join('')
    : value;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export const DecorativeCardBackground: React.FC<Props> = ({
  category,
  variant,
  seed = 0,
}) => {
  const [background, accent] = CATEGORY_GRADIENTS[category];
  const motifs = CATEGORY_MOTIF_FAMILIES[category];
  const motif = motifs[Math.abs(seed) % motifs.length];
  const shapes = variant === 'featured' ? MOTIF_SHAPES[motif] : MOTIF_SHAPES[motif].slice(0, 2);
  const mirrored = Math.abs(seed) % 2 === 1;
  const palette = {
    background,
    accentBold: hexToRgba(accent, variant === 'featured' ? 0.28 : 0.24),
    accentSoft: hexToRgba(accent, variant === 'featured' ? 0.2 : 0.16),
    outlineStrong: hexToRgba('#FFFFFF', variant === 'featured' ? 0.34 : 0.28),
    outlineSoft: hexToRgba('#FFFFFF', variant === 'featured' ? 0.18 : 0.14),
  };

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        styles.base,
        {
          backgroundColor: palette.background,
          transform: mirrored ? [{ scaleX: -1 }] : undefined,
        },
      ]}
    >
      {shapes.map((shape, index) => (
        <View
          key={`${motif}-${index}`}
          style={[
            styles.shape,
            {
              backgroundColor: shape.kind === 'fill' ? palette[shape.role] : 'transparent',
              borderColor: shape.kind === 'outline' ? palette[shape.role] : 'transparent',
              borderWidth: shape.kind === 'outline' ? shape.borderWidth ?? 1 : 0,
              borderRadius: shape.borderRadius ?? 999,
              width: shape.width,
              height: shape.height,
              top: shape.top,
              right: shape.right,
              bottom: shape.bottom,
              left: shape.left,
              transform: shape.rotate ? [{ rotate: shape.rotate }] : undefined,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  shape: {
    position: 'absolute',
  },
});
