import PostHog from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
const IS_DISABLED = process.env.EXPO_PUBLIC_POSTHOG_DISABLED === 'true' || !POSTHOG_API_KEY;

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

let posthogInstance: PostHog | null = null;

if (!IS_DISABLED && POSTHOG_API_KEY) {
  posthogInstance = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    enableSessionReplay: true,
    captureAppLifecycleEvents: true,
    flushAt: 20,
    flushInterval: 10000,
    sessionExpirationTimeSeconds: 1800,
  });
}

export const identifyUser = (userId: string, properties?: AnalyticsProperties) => {
  if (posthogInstance && !IS_DISABLED) {
    posthogInstance.identify(userId, properties);
  }
};

export const captureEvent = (eventName: string, properties?: AnalyticsProperties) => {
  if (posthogInstance && !IS_DISABLED) {
    posthogInstance.capture(eventName, properties);
  }
};

export const captureScreen = (screenName: string, properties?: AnalyticsProperties) => {
  if (posthogInstance && !IS_DISABLED) {
    posthogInstance.screen(screenName, properties);
  }
};

export const resetPostHog = () => {
  if (posthogInstance && !IS_DISABLED) {
    posthogInstance.reset();
  }
};

export const setUserProperties = (properties: AnalyticsProperties) => {
  if (posthogInstance && !IS_DISABLED) {
    const distinctId = posthogInstance.getDistinctId();
    if (distinctId) {
      posthogInstance.identify(distinctId, {
        $set: properties,
      });
    }
  }
};

// Export instance for direct access if needed
export const posthog = posthogInstance;
export default posthogInstance;
