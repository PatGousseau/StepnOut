import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/Colors';
import { Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TabsLayout() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.light.primary,
        tabBarStyle: { 
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 0 : 48,
          backgroundColor: colors.light.background,
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
        name="(auth)"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home'),
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: t('Challenge'),
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