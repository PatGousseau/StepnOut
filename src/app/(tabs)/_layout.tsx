import { Tabs } from 'expo-router';
import { usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, GestureResponderEvent, Platform } from 'react-native';
import { colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

type ChallengeTabButtonProps = {
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
  accessibilityLabel?: string;
};

function ChallengeTabButton({
  onPress,
  accessibilityLabel,
}: ChallengeTabButtonProps) {
  const pathname = usePathname();
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
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

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

          return <Ionicons name={iconName} size={size} color={color} />;
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
});
