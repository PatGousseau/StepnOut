import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { FeatureActionButton } from '../../components/FeatureActionButton';
import { Text } from '../../components/StyledText';
import { colors } from '../../constants/Colors';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  requestNotificationPermission,
  registerPushTokenIfGranted,
} from '../../lib/notifications';
import { captureEvent } from '../../lib/posthog';
import { UI_EVENTS } from '../../constants/analyticsEvents';

export default function NotificationsPrimeScreen() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    captureEvent(UI_EVENTS.NOTIFICATIONS_PRIME_SHOWN);
  }, []);

  const goNext = () => {
    router.replace('/(tabs)?firstTime=true');
  };

  const handleEnable = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const status = await requestNotificationPermission();
      captureEvent(UI_EVENTS.NOTIFICATIONS_PRIME_CTA_CLICKED, {
        permission_status: status,
      });

      const userId = session?.user?.id;
      if (status === 'granted' && userId) {
        await registerPushTokenIfGranted(userId);
      }
    } catch (error) {
      console.error('notifications-prime: enable failed', error);
    } finally {
      goNext();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          {t('A new challenge drops every Monday.')}
        </Text>
        <Text style={styles.subtitle}>
          {t("Turn on notifications so you don't miss it.")}
        </Text>
      </View>

      <View style={styles.actions}>
        <FeatureActionButton
          disabled={submitting}
          onPress={handleEnable}
          showIcon={false}
          title={t('Turn on notifications')}
          tone="indigo"
          variant="pill"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: colors.light.lightText,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
