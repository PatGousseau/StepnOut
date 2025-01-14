import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Stack, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { MenuProvider } from 'react-native-popup-menu';
import { LanguageProvider } from '../contexts/LanguageContext';
import * as SplashScreen from 'expo-splash-screen';
import NotificationSidebar from '../components/NotificationSidebar';
import MenuSidebar from '../components/MenuSidebar';
import FeedbackModal from '../components/FeedbackModal';
import { useNotifications } from '../hooks/useNotifications';
import { usePathname } from 'expo-router';
import { LikesProvider } from '../contexts/LikesContext';

// Set up notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();


function RootLayoutNav() {
  const { session, loading } = useAuth();
  const { markAllAsRead, notifications, unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();

  // Check if we're on a detail page
  const isDetailPage = pathname.includes('/post/') || 
                      pathname.includes('/profile/') || 
                      pathname.includes('/challenge/');

  // Simplified onLayoutRootView
  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync();
    }
  }, [loading]);

  // Simplified auth check effect
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

  const handleNotificationPress = () => {
    markAllAsRead();
    setShowNotifications(true);
  };

  if (loading) {
    return null;
  }

  return (
    <MenuProvider>
      <LanguageProvider>
        <SafeAreaView 
          style={{ flex: 1, backgroundColor: colors.light.background }}
          edges={['top', 'left', 'right']}
          onLayout={onLayoutRootView}
        >
          <StatusBar backgroundColor={colors.light.background} style="dark" />
          <Header 
            onNotificationPress={handleNotificationPress}
            onMenuPress={() => setShowMenu(true)}
            onFeedbackPress={() => setShowFeedback(true)}
            unreadCount={unreadCount}
            isDetailPage={isDetailPage}
          />
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              fullScreenGestureEnabled: true,
              presentation: 'card'
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

          <NotificationSidebar 
            visible={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
          />
          <MenuSidebar 
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            enableSwiping={!isDetailPage}
          />
          <FeedbackModal 
            isVisible={showFeedback}
            onClose={() => setShowFeedback(false)}
          />
        </SafeAreaView>
      </LanguageProvider>
    </MenuProvider>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <LikesProvider>
      <RootLayoutNav />
      </LikesProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});