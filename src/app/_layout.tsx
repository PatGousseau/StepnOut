import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { MenuProvider } from 'react-native-popup-menu';

// Set up notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootLayoutNav() {
  const { session, loading } = useAuth();

  // Auth check effect
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/login');
    }
  }, [session, loading]);

  // Notification setup effects
  useEffect(() => {
    const setupPushNotifications = async () => {
      const userId = session?.user.id;
      if (userId) {
        await registerForPushNotificationsAsync(userId);
      }
    };
    setupPushNotifications();
  }, [session]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // Loading screen
  if (loading) {
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

  return (
    <MenuProvider>
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: colors.light.background }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar backgroundColor={colors.light.background} style="dark" />
      <Header />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="post/[id]" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="profile/[id]" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="challenge/[id]" 
          options={{ headerShown: false }}
        />
      </Stack>
    </SafeAreaView>
    </MenuProvider>
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