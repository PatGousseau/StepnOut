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
import { LanguageProvider } from '../contexts/LanguageContext';
import * as SplashScreen from 'expo-splash-screen';
import NotificationSidebar from '../components/NotificationSidebar';
import MenuSidebar from '../components/MenuSidebar';
import FeedbackModal from '../components/FeedbackModal';
import { useNotifications } from '../hooks/useNotifications';
import { usePathname } from 'expo-router';
import { LikesProvider } from '../contexts/LikesContext';
import { UploadProgressProvider } from '../contexts/UploadProgressContext';
import RecentlyActiveBanner from '../components/RecentlyActiveBanner';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-react-native';
import { captureScreen, captureEvent } from '../lib/posthog';
import { UI_EVENTS } from '../constants/analyticsEvents';
import { supabase } from '../lib/supabase';
import { challengeService } from '../services/challengeService';
import { profileService } from '../services/profileService';

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
  const { session, loading } = useAuth();
  const { markAllAsRead, notifications, unreadCount } = useNotifications();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();

  // Check if we're on a detail page
  const isDetailPage = pathname.includes('/post/') || 
                      pathname.includes('/profile/') || 
                      pathname.includes('/challenge/');

  // hide logo on auth screens
  const hideLogo = pathname === '/login' || pathname === '/register';
  
  // hide recently active banner on onboarding
  const hideRecentlyActive = pathname === '/(auth)/onboarding' || pathname === '/onboarding';

  // Track screen views when pathname changes
  useEffect(() => {
    if (pathname) {
      captureScreen(pathname, {
        is_detail_page: isDetailPage,
        is_auth_screen: hideLogo,
      });
    }
  }, [pathname, isDetailPage, hideLogo]);

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

  // lightweight prefetching: warm supabase-backed screens so taps feel instant.
  // keep it simple: only prefetch the currently relevant user + active challenge.
  useEffect(() => {
    let cancelled = false;

    const prefetch = async () => {
      const userId = session?.user?.id;
      if (!userId) return;

      // 1) profile (react-query already powers this)
      queryClient.prefetchQuery({
        queryKey: ["profile", userId],
        queryFn: () => profileService.fetchProfileById(userId),
        staleTime: 120_000,
      });

      // 2) active challenge + challenge details
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('id')
          .eq('is_active', true)
          .single();

        if (cancelled) return;
        if (error || !data?.id) return;

        queryClient.prefetchQuery({
          queryKey: ["challenge", data.id],
          queryFn: () => challengeService.fetchChallengeById(data.id),
          staleTime: 120_000,
        });
      } catch {
        // ignore – this is best-effort warmup
      }
    };

    prefetch();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, queryClient]);

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
    <MenuProvider>
      <LanguageProvider>
        <LikesProvider>
          <UploadProgressProvider>
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
          </UploadProgressProvider>
        </LikesProvider>
      </LanguageProvider>
    </MenuProvider>
  );
}

export default function Layout() {
  // Get API key from environment variable
  const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
  const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
  const isPostHogDisabled = process.env.EXPO_PUBLIC_POSTHOG_DISABLED === 'true' || !posthogApiKey;

  return (
    <AuthProvider>
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
          <RootLayoutNav />
        </PostHogProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}