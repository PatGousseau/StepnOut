import React, { useEffect } from 'react';
import { Slot, Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../constants/Colors'; 
import Header from '../components/Header';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuth();

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    
    if (!loading) {
      hideSplash();
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && !session) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (!loading && session) {
      // Redirect to home if authenticated
      router.replace('/');
    }
  }, [session, loading]);

  if (loading) {
    return null;
  }

  // If not authenticated, show auth screens
  if (!session) {
    return <Slot />;
  }

  // If authenticated, show main app tabs
  return (
    <>
      <StatusBar style="dark" />
      <Header />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: colors.light.primary,
          tabBarStyle: { 
            paddingTop: 10,
          },
          tabBarShowLabel: false,
          statusBarStyle: 'dark',
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'index':
                iconName = 'home';
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
            href: null, // This will hide the tab
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerStyle: { backgroundColor: colors.light.primary },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerStyle: { backgroundColor: colors.light.primary },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            headerStyle: { backgroundColor: colors.light.primary },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
      </Tabs>
    </>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
