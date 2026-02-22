/**
 * BadgeIcon.tsx
 *
 * High-fidelity SVG metallic medal component using react-native-svg.
 *
 * Visual states
 * ─────────────
 *  locked             → ghost silhouette (40% opacity), matte charcoal, zero shine
 *  unlocked, no level → Ice Blue "Cool Chrome"  — polished non-precious metal
 *  unlocked + level   → Bronze / Silver (Antique) / Gold / Platinum
 *  platinum           → n-tooth scalloped gear edge with its own drop-shadow filter
 *
 * Key techniques
 * ──────────────
 *  • True SVG RadialGradient for the brushed-metal face
 *  • 4–5 gradient stops with alpha-channel transitions to avoid banding
 *  • Specular hot-spot rendered as a blurred RadialGradient (via SVG Filter +
 *    feGaussianBlur) — soft, natural sheen, never a hard circle
 *  • Raised rim: a filled concentric shape with a diagonal LinearGradient
 *  • Inset shadow: dark radial vignette at the face edge
 *  • Ionicons rendered as a native View overlay (no ForeignObject)
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, {
    Circle,
    Defs,
    RadialGradient,
    LinearGradient,
    Stop,
    G,
    Path,
    Ellipse,
    Filter,
    FeGaussianBlur,
    FeComposite,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../types/badges';
import { colors } from '../../constants/Colors';

// ─── Palette definition ───────────────────────────────────────────────────────

interface Palette {
    /**
     * Radial gradient stops for the main face disc.
     * Each entry: [offset (0–100), color-string with optional alpha].
     * Minimum 4 stops required.
     */
    radial: Array<[string, string]>;
    /**
     * Linear overlay stops (top-left → bottom-right) to add directionality.
     */
    linear: Array<[string, string]>;
    /**
     * Rim ring gradient (light-top → mid → dark-bottom).
     */
    rim: Array<[string, string]>;
    /** Specular bloom colour (RadialGradient, soft-blurred via filter) */
    specular: string;
    /** Outer glow opacity — locked = 0 */
    shineOpacity: number;
    /** Icon colour */
    icon: string;
    /** Icon text-shadow colour */
    iconShadow: string;
    /** Render a scalloped/gear edge instead of a circle */
    scalloped: boolean;
}

// ─── Palettes ─────────────────────────────────────────────────────────────────

const PALETTES: Record<string, Palette> = {
    // ── LOCKED — matte charcoal ghost  ──────────────────────────────────────
    // The TouchableOpacity wrapper gets opacity:0.4 to make the whole badge
    // appear as a silhouette.  No specular shine is drawn at all.
    locked: {
        radial: [
            ['0%', '#4A4A4A'],
            ['35%', '#333333'],
            ['70%', '#252525'],
            ['100%', '#181818'],
        ],
        linear: [
            ['0%', 'rgba(80,80,80,0.18)'],
            ['60%', 'rgba(40,40,40,0.00)'],
            ['100%', 'rgba(10,10,10,0.25)'],
        ],
        rim: [
            ['0%', '#5C5C5C'],
            ['40%', '#3A3A3A'],
            ['100%', '#1E1E1E'],
        ],
        specular: 'rgba(100,100,100,0.00)',
        shineOpacity: 0,                           // ← zero shine
        icon: '#5A5A5A',
        iconShadow: 'transparent',
        scalloped: false,
    },

    // ── Brand Primary — unlocked, no level ──────────────────────────────────
    // Built from colors.light.primary (#4D5382, indigo-slate).
    // Light tint at highlight, pure brand at mid, deep indigo in shadow.
    chrome: {
        radial: [
            ['0%', '#BEC3E0'],                  // bright tint of primary
            ['28%', '#7C82B0'],                  // lighter primary
            ['58%', '#4D5382'],                  // pure brand primary
            ['82%', 'rgba(38,40,90,0.95)'],      // deep indigo — alpha blend
            ['100%', 'rgba(20,20,55,0.88)'],      // near-midnight shadow
        ],
        linear: [
            ['0%', 'rgba(200,204,230,0.62)'],
            ['45%', 'rgba(77,83,130,0.00)'],
            ['85%', 'rgba(28,30,75,0.52)'],
            ['100%', 'rgba(12,12,40,0.65)'],
        ],
        rim: [
            ['0%', '#D0D3EE'],
            ['50%', '#5C6298'],
            ['100%', '#252860'],
        ],
        specular: 'rgba(210,213,240,0.95)',
        shineOpacity: 0.90,
        icon: '#D8DBFF',
        iconShadow: 'rgba(20,20,65,0.58)',
        scalloped: false,
    },

    // ── BRONZE — warm reddish-copper with deep walnut bevel ──────────────────
    bronze: {
        radial: [
            ['0%', '#FFD4A0'],                        // bright copper highlight
            ['28%', '#CC7030'],                        // warm orange-copper
            ['60%', '#8B3E0A'],                        // dark sienna
            ['85%', 'rgba(55,18,0,0.95)'],             // walnut — alpha blend
            ['100%', 'rgba(30,8,0,0.85)'],              // near-black shadow
        ],
        linear: [
            ['0%', 'rgba(255,210,150,0.60)'],
            ['40%', 'rgba(175,78,10,0.00)'],
            ['80%', 'rgba(50,15,0,0.55)'],
            ['100%', 'rgba(20,5,0,0.70)'],              // deepened bottom corner
        ],
        rim: [
            ['0%', '#FFE0B0'],
            ['45%', '#B05820'],
            ['100%', '#4A1800'],
        ],
        specular: 'rgba(255,225,170,0.92)',
        shineOpacity: 0.95,
        icon: '#FFE2BC',
        iconShadow: 'rgba(80,22,0,0.65)',
        scalloped: false,
    },

    // ── SILVER — "Antique Silver" (heavier & more reflective than chrome) ────
    // High-contrast neutral metallic.  Clearly richer than the ice-blue chrome.
    silver: {
        radial: [
            ['0%', '#F5F5F5'],                   // near-white polish
            ['25%', '#D8D8D8'],                   // light neutral grey
            ['55%', '#909090'],                   // antique mid-grey
            ['80%', 'rgba(68,68,68,0.95)'],       // shadow grey
            ['100%', 'rgba(35,35,35,0.90)'],       // near-black depth
        ],
        linear: [
            ['0%', 'rgba(255,255,255,0.62)'],
            ['40%', 'rgba(180,180,180,0.00)'],
            ['80%', 'rgba(60,60,60,0.50)'],
            ['100%', 'rgba(20,20,20,0.60)'],
        ],
        rim: [
            ['0%', '#FFFFFF'],
            ['45%', '#A0A0A0'],
            ['100%', '#303030'],
        ],
        specular: 'rgba(255,255,255,0.98)',
        shineOpacity: 0.96,
        icon: '#F0F0F0',
        iconShadow: 'rgba(20,20,20,0.60)',
        scalloped: false,
    },

    // ── GOLD — rich amber / champagne ────────────────────────────────────────
    gold: {
        radial: [
            ['0%', '#FFFAC8'],                   // pale champagne crystal
            ['22%', '#F5C400'],                   // warm pure gold
            ['52%', '#C88000'],                   // amber
            ['78%', 'rgba(88,44,0,0.95)'],        // deep amber-brown
            ['100%', 'rgba(45,20,0,0.88)'],        // dark walnut
        ],
        linear: [
            ['0%', 'rgba(255,252,200,0.68)'],
            ['40%', 'rgba(210,138,0,0.00)'],
            ['80%', 'rgba(70,30,0,0.58)'],
            ['100%', 'rgba(30,12,0,0.70)'],
        ],
        rim: [
            ['0%', '#FFFAD0'],
            ['45%', '#D09000'],
            ['100%', '#5E2C00'],
        ],
        specular: 'rgba(255,255,215,0.95)',
        shineOpacity: 0.97,
        icon: '#FFF7CC',
        iconShadow: 'rgba(80,35,0,0.62)',
        scalloped: false,
    },

    // ── PLATINUM — gunmetal blue-grey, scalloped gear edge ─────────────────
    // Slightly darker & cooler than Antique Silver: same neutral family but
    // shifted toward blue-grey and with a lower peak brightness.
    platinum: {
        radial: [
            ['0%', '#E2E6EE'],                  // light blue-grey (≠ silver's near-white)
            ['25%', '#B8C2D0'],                  // cool mid-grey with blue cast
            ['55%', '#7A8898'],                  // gunmetal blue-grey
            ['80%', 'rgba(45,55,70,0.96)'],      // deep blue-shadow
            ['100%', 'rgba(18,24,38,0.92)'],      // near-black with blue tint
        ],
        linear: [
            ['0%', 'rgba(240,244,252,0.65)'],
            ['42%', 'rgba(160,175,200,0.00)'],
            ['82%', 'rgba(35,48,68,0.55)'],
            ['100%', 'rgba(12,18,32,0.68)'],
        ],
        rim: [
            ['0%', '#D8DDE8'],
            ['48%', '#7A8CA0'],
            ['100%', '#1A2438'],
        ],
        specular: 'rgba(230,236,248,0.96)',
        shineOpacity: 0.96,
        icon: '#D0D8EA',
        iconShadow: 'rgba(10,18,38,0.62)',
        scalloped: true,
    },
};

// ─── Gear / scalloped path ────────────────────────────────────────────────────

function gearPath(
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    teeth: number,
): string {
    const step = (Math.PI * 2) / teeth;
    const halfStep = step / 2;
    const start = -Math.PI / 2;
    let d = '';
    for (let i = 0; i < teeth; i++) {
        const ap = start + i * step;
        const av = ap + halfStep;
        const px = cx + outerR * Math.cos(ap);
        const py = cy + outerR * Math.sin(ap);
        const vx = cx + innerR * Math.cos(av);
        const vy = cy + innerR * Math.sin(av);
        d += i === 0
            ? `M ${px.toFixed(2)} ${py.toFixed(2)} `
            : `L ${px.toFixed(2)} ${py.toFixed(2)} `;
        d += `L ${vx.toFixed(2)} ${vy.toFixed(2)} `;
    }
    return d + 'Z';
}

// ─── Size presets ─────────────────────────────────────────────────────────────

const SIZES = {
    small: { total: 38, icon: 16 },
    medium: { total: 64, icon: 28 },
    large: { total: 104, icon: 44 },
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

interface BadgeIconProps {
    badge: Badge;
    unlocked: boolean;
    size?: 'small' | 'medium' | 'large';
    onPress?: () => void;
    showLevelColor?: boolean;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
    badge,
    unlocked,
    size = 'medium',
    onPress,
    showLevelColor = true,
}) => {
    const { total, icon: iconPx } = SIZES[size];
    const cx = total / 2;
    const cy = total / 2;

    // ── Palette selection ──
    let palKey: string;
    if (!unlocked) palKey = 'locked';
    else if (!badge.level || !showLevelColor) palKey = 'chrome';
    else palKey = badge.level;
    const pal = PALETTES[palKey] ?? PALETTES.chrome;

    // ── Geometry ──
    const rimR = (total / 2) - 2;
    const faceR = rimR - 4;
    const TEETH = 28;
    //
    // Gear geometry for Platinum — teeth must extend OUTSIDE rimR:
    //   gearValleyR  = base circle (same visual size as rimR for other badges)
    //   gearPeakR    = rimR + toothHeight (protrudes beyond the base circle)
    //   gearFaceR    = face disc inset from the valleys
    const gearValleyR = rimR - 2;         // valleys sit slightly inside the badge’s rim
    const gearPeakR = rimR;         // peaks protrude only slightly (fits within container)
    const gearFaceR = gearValleyR - 2.5;    // face disc is inset from valleys
    const effFaceR = pal.scalloped ? gearFaceR : faceR;

    // Unique IDs per palette key (prevent react-native-svg gradient collision)
    const uid = palKey;

    // ── Specular geometry — blurred RadialGradient hot-spot ──
    //  Positioned at ~11 o'clock.
    const shineX = cx - effFaceR * 0.24;
    const shineY = cy - effFaceR * 0.24;
    const shineR = effFaceR * 0.54;      // large radius → gradient fades naturally

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.78 : 1}
            style={[
                styles.touchable,
                { width: total, height: total },
                // Locked state: entire badge becomes a ghost silhouette
                !unlocked && styles.ghostOpacity,
            ]}
        >
            <Svg
                width={total}
                height={total}
                viewBox={`0 0 ${total} ${total}`}
                style={StyleSheet.absoluteFillObject}
            >
                <Defs>
                    {/* ── Radial gradient — brushed-metal face, 4-5 stops ── */}
                    <RadialGradient
                        id={`rg_${uid}`}
                        cx="37%" cy="33%"
                        r="70%"
                        fx="37%" fy="33%"
                    >
                        {pal.radial.map(([offset, color]) => (
                            <Stop key={offset} offset={offset} stopColor={color} />
                        ))}
                    </RadialGradient>

                    {/* ── Linear overlay — directional depth ── */}
                    <LinearGradient
                        id={`lg_${uid}`}
                        x1="0%" y1="0%"
                        x2="100%" y2="100%"
                    >
                        {pal.linear.map(([offset, color]) => (
                            <Stop key={offset} offset={offset} stopColor={color} />
                        ))}
                    </LinearGradient>

                    {/* ── Rim gradient — bevelled edge ── */}
                    <LinearGradient
                        id={`rm_${uid}`}
                        x1="18%" y1="0%"
                        x2="82%" y2="100%"
                    >
                        {pal.rim.map(([offset, color]) => (
                            <Stop key={offset} offset={offset} stopColor={color} />
                        ))}
                    </LinearGradient>

                    {/* ── Inset shadow — dark vignette at face perimeter ── */}
                    <RadialGradient
                        id={`is_${uid}`}
                        cx="50%" cy="50%"
                        r="50%"
                        fx="50%" fy="50%"
                    >
                        <Stop offset="60%" stopColor="rgba(0,0,0,0)" stopOpacity="0" />
                        <Stop offset="88%" stopColor="rgba(0,0,0,0.28)" stopOpacity="1" />
                        <Stop offset="100%" stopColor="rgba(0,0,0,0.55)" stopOpacity="1" />
                    </RadialGradient>

                    {/*
                     * ── Specular RadialGradient — soft bloom ──
                     *  Goes from pal.specular at centre → fully transparent at edge.
                     *  The high-radius RadialGradient already produces a soft fade.
                     *  We additionally run it through an feGaussianBlur filter for
                     *  an even smoother, less "painted" highlight.
                     */}
                    <RadialGradient
                        id={`sh_${uid}`}
                        cx={`${Math.round((shineX / total) * 100)}%`}
                        cy={`${Math.round((shineY / total) * 100)}%`}
                        r={`${Math.round((shineR / total) * 100)}%`}
                        fx={`${Math.round(((shineX - shineR * 0.18) / total) * 100)}%`}
                        fy={`${Math.round(((shineY - shineR * 0.18) / total) * 100)}%`}
                    >
                        <Stop offset="0%" stopColor={pal.specular} stopOpacity="1" />
                        <Stop offset="35%" stopColor={pal.specular} stopOpacity="0.60" />
                        <Stop offset="70%" stopColor={pal.specular} stopOpacity="0.20" />
                        <Stop offset="100%" stopColor={pal.specular} stopOpacity="0" />
                    </RadialGradient>

                    {/*
                     * ── Blur filter for the specular layer ──
                     *  stdDeviation drives the gaussian blur radius (in SVG user units).
                     *  x/y/width/height enlarged to prevent clipping the blurred edges.
                     */}
                    <Filter
                        id={`bf_${uid}`}
                        x="-20%" y="-20%"
                        width="140%" height="140%"
                    >
                        <FeGaussianBlur stdDeviation="3" />
                    </Filter>

                    {/* ── Platinum-specific drop-shadow filter for gear edge ── */}
                    {pal.scalloped && (
                        <Filter
                            id="ptShadow"
                            x="-15%" y="-15%"
                            width="130%" height="130%"
                        >
                            <FeGaussianBlur stdDeviation="2.5" in="SourceAlpha" />
                            <FeComposite in="SourceGraphic" />
                        </Filter>
                    )}
                </Defs>

                {/* ── Layer 0: ambient drop-shadow behind medal ── */}
                <Ellipse
                    cx={cx + 1}
                    cy={cy + 4}
                    rx={rimR - 1}
                    ry={rimR - 3}
                    fill="rgba(0,0,0,0.30)"
                />

                {/* ══ PLATINUM — gear edge with its own pop shadow ══ */}
                {pal.scalloped ? (
                    <G>
                        {/*
                         * Gear drop-shadow: same centred path, blurred via filter.
                         * No more (cx+1, cy+2) offset — that was causing the skew.
                         * feGaussianBlur on SourceAlpha inherently pushes colour
                         * outside the shape boundary, giving the impression of depth.
                         */}
                        <Path
                            d={gearPath(cx, cy, gearPeakR, gearValleyR, TEETH)}
                            fill="rgba(0,0,0,0.45)"
                            filter="url(#ptShadow)"
                            transform={`translate(1.5, 2.5)`}
                        />
                        {/* Gear shape — rim gradient, perfectly centred */}
                        <Path
                            d={gearPath(cx, cy, gearPeakR, gearValleyR, TEETH)}
                            fill={`url(#rm_${uid})`}
                        />
                        {/* Face disc — sits inside the valleys */}
                        <Circle cx={cx} cy={cy} r={gearFaceR} fill={`url(#rg_${uid})`} />
                        <Circle cx={cx} cy={cy} r={gearFaceR} fill={`url(#lg_${uid})`} />
                    </G>
                ) : (
                    /* ══ ALL OTHER TIERS — circular medal ══ */
                    <G>
                        {/* Outer rim */}
                        <Circle cx={cx} cy={cy} r={rimR} fill={`url(#rm_${uid})`} />
                        {/* Face — radial */}
                        <Circle cx={cx} cy={cy} r={faceR} fill={`url(#rg_${uid})`} />
                        {/* Face — directional overlay */}
                        <Circle cx={cx} cy={cy} r={faceR} fill={`url(#lg_${uid})`} />
                    </G>
                )}

                {/* ── Layer 4: inset shadow vignette ── */}
                <Circle cx={cx} cy={cy} r={effFaceR} fill={`url(#is_${uid})`} />

                {/*
                 * ── Layer 5: specular bloom (gaussian-blurred) ──
                 *  Only drawn when shineOpacity > 0 (i.e. not locked).
                 *  The blur filter makes the gradient boundary invisible —
                 *  the light simply "fades into" the metal surface.
                 */}
                {pal.shineOpacity > 0 && (
                    <G opacity={pal.shineOpacity}>
                        {/* Blurred soft bloom */}
                        <Circle
                            cx={shineX}
                            cy={shineY}
                            r={shineR}
                            fill={`url(#sh_${uid})`}
                            filter={`url(#bf_${uid})`}
                        />

                    </G>
                )}
            </Svg>

            {/*
             * ── Icon — native absolute overlay ──
             * Ionicons "-outline" variants render as ~2 px stroke glyphs natively.
             * Keeps crisp rendering on all pixel densities without SVG re-encoding.
             */}
            <View style={styles.iconOverlay} pointerEvents="none">
                <Ionicons
                    name={badge.icon as any}
                    size={iconPx}
                    color={pal.icon}
                    style={{
                        textShadowColor: pal.iconShadow,
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 5,
                    }}
                />
            </View>
        </TouchableOpacity>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    touchable: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 7,
        elevation: 8,
    },
    /** 40% opacity makes the locked badge a clear ghost / silhouette */
    ghostOpacity: {
        opacity: 0.40,
    },
    iconOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
