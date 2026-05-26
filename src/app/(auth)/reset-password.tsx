import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Pressable, Keyboard } from 'react-native';
import { AppAlert } from '../../components/AppAlert';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import { FeatureActionButton } from '../../components/FeatureActionButton';
import { Text } from '../../components/StyledText';
import { useLanguage } from '../../contexts/LanguageContext';
import { getRecoveryTokens, clearRecoveryTokens } from '../../contexts/AuthContext';
import { captureEvent } from '../../lib/posthog';
import { AUTH_EVENTS } from '../../constants/analyticsEvents';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      AppAlert.show(t('Error'), t('Please fill in all fields'));
      return;
    }

    if (password !== confirmPassword) {
      AppAlert.show(t('Error'), t('Passwords do not match'));
      return;
    }

    try {
      setLoading(true);

      const tokens = getRecoveryTokens();
      if (!tokens) {
        throw new Error(t('Auth session missing. Open the reset link again from your email.'));
      }

      // Use direct API call to avoid Supabase client state issues with recovery tokens
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error_description || result.message || 'Failed to update password');
      }

      clearRecoveryTokens();
      captureEvent(AUTH_EVENTS.PASSWORD_RESET_COMPLETED);

      AppAlert.show(t('Success'), t('Password updated'), [
        {
          text: t('OK'),
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    } catch (error) {
      captureEvent(AUTH_EVENTS.PASSWORD_RESET_FAILED, { message: (error as Error).message });
      AppAlert.show(t('Error'), (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Pressable style={styles.form} onPress={Keyboard.dismiss}>
        <Text style={styles.title}>{t('Choose a new password')}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('New password')}
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder={t('Confirm password')}
          placeholderTextColor="#666"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <FeatureActionButton
          disabled={loading}
          onPress={handleUpdatePassword}
          showIcon={false}
          title={loading ? t('Updating...') : t('Update password')}
          tone="indigo"
          variant="pill"
        />

        <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.linkText}>{t('Back to login')}</Text>
        </TouchableOpacity>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ddd',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 15,
    padding: 15,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: colors.light.primary,
  },
});
