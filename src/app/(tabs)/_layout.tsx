import { Tabs } from 'expo-router';
import { usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View, GestureResponderEvent, Platform, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TabBadgeProvider, useTabBadges } from '../../contexts/TabBadgeContext';

type ChallengeTabButtonProps = {
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
  accessibilityLabel?: string;
};

function NotificationDot({ style }: { style?: object }) {
  return <View style={[styles.notificationDot, style]} />;
}

// A faded silver ring with a bright arc that continuously orbits it — a softer,
// more attention-drawing alternative to a dot for the challenge tab.
const SHIMMER_SIZE = 60; // ride on the purple circle's border (58px) for contrast
const SHIMMER_STROKE = 3;
const SHIMMER_RADIUS = (SHIMMER_SIZE - SHIMMER_STROKE) / 2;
const SHIMMER_CIRC = 2 * Math.PI * SHIMMER_RADIUS;
const SHIMMER_ARC = SHIMMER_CIRC * 0.5; // visible arc length (~50% of the ring)
const SHIMMER_SILVER = '#EDEEF4';

function ChallengeShimmerRing() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View pointerEvents="none" style={styles.shimmerWrap}>
      {/* Faded base ring */}
      <Svg width={SHIMMER_SIZE} height={SHIMMER_SIZE} style={StyleSheet.absoluteFill}>
        <Circle
          cx={SHIMMER_SIZE / 2}
          cy={SHIMMER_SIZE / 2}
          r={SHIMMER_RADIUS}
          stroke={SHIMMER_SILVER}
          strokeOpacity={0.5}
          strokeWidth={SHIMMER_STROKE}
          fill="none"
        />
      </Svg>
      {/* Orbiting shimmer arc */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={SHIMMER_SIZE} height={SHIMMER_SIZE}>
          <Defs>
            <LinearGradient
              id="challengeShimmer"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2={SHIMMER_SIZE}
              y2="0"
            >
              {/* Soft glint: fades in and out on both ends, bright in the middle */}
              <Stop offset="0" stopColor="#EDEEF4" stopOpacity="0" />
              <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="1" stopColor="#EDEEF4" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={SHIMMER_SIZE / 2}
            cy={SHIMMER_SIZE / 2}
            r={SHIMMER_RADIUS}
            stroke="url(#challengeShimmer)"
            strokeWidth={SHIMMER_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${SHIMMER_ARC} ${SHIMMER_CIRC - SHIMMER_ARC}`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

function ChallengeTabButton({
  onPress,
  accessibilityLabel,
}: ChallengeTabButtonProps) {
  const pathname = usePathname();
  const { hasUnseenChallenge } = useTabBadges();
  const focused = pathname === '/challenge' || pathname.startsWith('/challenge/');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: focused }}
      style={styles.challengeButtonHit}
    >
      <View style={styles.challengeButtonWrap}>
        <View style={styles.challengeCircle}>
          <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={26} color="white" />
        </View>
        {hasUnseenChallenge && <ChallengeShimmerRing />}
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <TabBadgeProvider>
      <TabsLayoutNav />
    </TabBadgeProvider>
  );
}

function TabsLayoutNav() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const { hasNewSideQuest } = useTabBadges();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.light.primarySoft,
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 0 : 48,
          backgroundColor: colors.light.background,
          overflow: 'visible',
        },
        tabBarShowLabel: false,
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'index':
              iconName = 'home';
              break;
            case 'challenge':
              iconName = 'trophy';
              break;
            case 'esplora':
              iconName = 'book';
              break;
            case 'path':
              iconName = 'footsteps';
              break;
            case 'profile':
              iconName = 'person';
              break;
            case 'admin':
              iconName = 'settings';
              break;
            default:
              iconName = 'home';
          }

          const showDot = route.name === 'path' && hasNewSideQuest;

          return (
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {showDot && <NotificationDot />}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home'),
        }}
      />
      <Tabs.Screen
        name="esplora"
        options={{
          title: t('Esplora'),
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: t('Challenge'),
          tabBarButton: (props) => <ChallengeTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="path"
        options={{
          title: t('Path'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('Profile'),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: !isAdmin ? null : undefined,
          title: t('Admin'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  challengeButtonHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  challengeButtonWrap: {
    position: 'absolute',
    top: -22,
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    height: 76,
  },
  challengeCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.light.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  notificationDot: {
    position: 'absolute',
    top: -5,
    right: -7,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: colors.light.alertRed,
  },
  // Shimmer ring overlay, centered over the trophy circle within the 76px wrap.
  shimmerWrap: {
    position: 'absolute',
    top: (76 - SHIMMER_SIZE) / 2,
    left: (76 - SHIMMER_SIZE) / 2,
    width: SHIMMER_SIZE,
    height: SHIMMER_SIZE,
  },
});
