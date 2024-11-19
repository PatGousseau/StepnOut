import React, { useEffect, useState } from 'react';
import { Slot, Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../constants/Colors'; 
import Header from '../components/Header';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, ImageBackground, StyleSheet } from 'react-native';

function RootLayoutNav() {
  const { session, loading, isAdmin } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (appIsReady) {
      if (!loading && !session) {
        router.replace('/(auth)/login');
      } else if (!loading && session) {
        router.replace('/');
      }
    }
  }, [session, loading, appIsReady]);

  if (loading || !appIsReady) {
    return (
      <View style={[styles.container, StyleSheet.absoluteFill]}>
        <ImageBackground
          imageStyle={[styles.bgStyle, StyleSheet.absoluteFill]}
          resizeMode="contain"
          source={require('../assets/images/splash.png')}
        >
          <View style={{ height: '100%' }} />
        </ImageBackground>
      </View>
    );
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
            href: null, // This hides the tab
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
            href: !isAdmin ? null : undefined, // This will hide the tab when not admin
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bgStyle: {
    flex: 1,
  },
});
