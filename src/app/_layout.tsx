import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Stack, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { MenuProvider } from 'react-native-popup-menu';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import * as SplashScreen from 'expo-splash-screen';
import NotificationSidebar from '../components/NotificationSidebar';
import MenuSidebar from '../components/MenuSidebar';
import FeedbackModal from '../components/FeedbackModal';
import { useNotifications } from '../hooks/useNotifications';
import { usePathname } from 'expo-router';
import { LikesProvider } from '../contexts/LikesContext';
import { ReactionsProvider } from '../contexts/ReactionsContext';
import { UploadProgressProvider } from '../contexts/UploadProgressContext';
import RecentlyActiveBanner from '../components/RecentlyActiveBanner';
import UpdateAvailableBanner from '../components/UpdateAvailableBanner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-react-native';
import { captureScreen, captureEvent } from '../lib/posthog';
import { UI_EVENTS } from '../constants/analyticsEvents';
import { supabase } from '../lib/supabase';

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

// Create a QueryClient instance with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2, // Retry failed requests 2 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      // Prevent infinite loading by setting a timeout
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes (formerly cacheTime)
    },
  },
});

function RootLayoutNav() {
  const { t } = useLanguage();
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

  // hide logo on auth screens
  const hideLogo = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';

  // hide recently active banner on onboarding
  const hideRecentlyActive = pathname === '/(auth)/onboarding' || pathname === '/onboarding';

  // Track screen views when pathname changes
  useEffect(() => {
    const requestUsernameIfMissing = async () => {
      // Only check if we have a session and are not on auth routes
      if (!session || loading) return;

      const isAuthRoute =
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password' ||
        pathname === '/reset-password' ||
        pathname === '/(auth)/onboarding' ||
        pathname === '/onboarding' ||
        pathname === '/(auth)/register-profile' ||
        pathname === '/register-profile';
      if (isAuthRoute) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        // If no username, redirect to profile setup
        if (!profile?.username) {
          router.replace('/(auth)/register-profile?isIncompleteProfile=true');
        }
      } catch (error) {
        console.error('Error checking username:', error);
      }
    };
    if (pathname) {
      captureScreen(pathname, {
        is_detail_page: isDetailPage,
        is_auth_screen: hideLogo,
      });
    }
    requestUsernameIfMissing();
  }, [pathname, isDetailPage, hideLogo]);

  // Simplified onLayoutRootView
  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync();
    }
  }, [loading]);

  // Allow unauthenticated users on auth-related routes, redirect others to login
  useEffect(() => {
    const isAuthRoute =
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password' ||
      pathname === '/(auth)/onboarding' ||
      pathname === '/onboarding';

    if (!loading && !session && !isAuthRoute) {
      router.replace('/(auth)/login');
    }
  }, [session, loading, pathname]);

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

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      try {
        const data = (response?.notification?.request?.content?.data ?? {}) as Record<string, unknown>;

        // support both new (type/postId) and legacy (postId) payloads
        const postId = data['postId'] ?? data['post_id'];
        const challengeId = data['challengeId'] ?? data['challenge_id'];

        if (typeof postId === 'string' || typeof postId === 'number') {
          const postIdStr = String(postId);
          if (postIdStr.length > 0) {
            router.push(`/post/${postIdStr}`);
            return;
          }
        }

        if (typeof challengeId === 'string' || typeof challengeId === 'number') {
          const challengeIdStr = String(challengeId);
          if (challengeIdStr.length > 0) {
            router.push(`/challenge/${challengeIdStr}`);
            return;
          }
        }

        console.log('Notification tapped (no navigable data):', data);
      } catch (e) {
        console.error('Error handling notification tap:', e);
      }
    };

    // handle the "cold start" case (app launched from a notification)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleNotificationResponse(response);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const handleNotificationPress = () => {
    markAllAsRead();
    setShowNotifications(true);
    captureEvent(UI_EVENTS.NOTIFICATIONS_OPENED, {
      unread_count: unreadCount,
    });
  };

  const handleMenuPress = () => {
    setShowMenu(true);
    captureEvent(UI_EVENTS.MENU_OPENED);
  };

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.light.background }}
      edges={['top', 'left', 'right']}
      onLayout={onLayoutRootView}
    >
      <StatusBar backgroundColor={colors.light.background} style="dark" />
      <Header
        onNotificationPress={handleNotificationPress}
        onMenuPress={handleMenuPress}
        onFeedbackPress={() => setShowFeedback(true)}
        unreadCount={unreadCount}
        isDetailPage={isDetailPage}
        hideLogo={hideLogo}
      />
      {!hideLogo && !isDetailPage && <UpdateAvailableBanner />}
      {!hideLogo && !isDetailPage && !hideRecentlyActive && <RecentlyActiveBanner />}
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
  );
}

export default function Layout() {
  // Get API key from environment variable
  const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
  const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
  const isPostHogDisabled = process.env.EXPO_PUBLIC_POSTHOG_DISABLED === 'true' || !posthogApiKey;

  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <PostHogProvider
            apiKey={posthogApiKey || 'placeholder'}
            options={{
              host: posthogHost,
              disabled: isPostHogDisabled,
              debug: __DEV__,
              // Enable session recordings (free tier: 5,000/month)
              enableSessionReplay: true,
              // Capture app lifecycle events
              captureAppLifecycleEvents: true,
              // Flush settings
              flushAt: 20,
              flushInterval: 10000,
              sessionExpirationTimeSeconds: 1800,
            }}
            autocapture={{
              captureScreens: false, // We're handling screen tracking manually for expo-router
              captureTouches: false,
            }}
          >
            <MenuProvider>
              <LikesProvider>
                <ReactionsProvider>
                  <UploadProgressProvider>
                    <RootLayoutNav />
                  </UploadProgressProvider>
                </ReactionsProvider>
              </LikesProvider>
            </MenuProvider>
          </PostHogProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}