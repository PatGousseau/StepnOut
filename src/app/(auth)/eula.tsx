import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '../../components/StyledText';
import { colors } from '../../constants/Colors';
import { EULA, EULA_IT } from '../../constants/EULA';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { captureEvent } from '../../lib/posthog';
import { UI_EVENTS } from '../../constants/analyticsEvents';

export default function EulaScreen() {
  const { firstTime } = useLocalSearchParams<{ firstTime?: string }>();
  const { t, language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    captureEvent(UI_EVENTS.EULA_SHOWN);
  }, []);

  const handleAccept = async () => {
    if (submitting) return;
    setSubmitting(true);
    captureEvent(UI_EVENTS.EULA_ACCEPTED);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      router.replace('/(auth)/login');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ eula_accepted: true })
      .eq('id', user.id);

    if (error) {
      setSubmitting(false);
      Alert.alert(t('Error'), error.message);
      return;
    }

    if (firstTime === 'true') {
      router.replace('/(auth)/notifications-prime?firstTime=true');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('End User License Agreement')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.body}>{language === 'it' ? EULA_IT : EULA}</Text>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.acceptButton, submitting && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={submitting}
        >
          <Text style={styles.acceptButtonText}>
            {submitting ? t('Saving...') : t('Accept')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.text,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.light.text,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    alignItems: 'center',
    gap: 14,
  },
  acceptButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
