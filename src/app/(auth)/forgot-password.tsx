import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Pressable, Keyboard } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { colors } from '../../constants/Colors';
import { Text } from '../../components/StyledText';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSendReset = async () => {
    if (!email) {
      Alert.alert(t('Error'), t('Please enter your email'));
      return;
    }

    try {
      setLoading(true);

      const redirectTo = Linking.createURL('reset-password');
      console.log('[forgot-password] redirectTo:', redirectTo);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;

      Alert.alert(t('Success'), t('Password reset email sent'), [
        {
          text: t('OK'),
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    } catch (error) {
      Alert.alert(t('Error'), (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Pressable style={styles.form} onPress={Keyboard.dismiss}>
        <Text style={styles.title}>{t('Reset Password')}</Text>
        <Text style={styles.subtitle}>{t('Enter your email and we\'ll send you a reset link.')}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('Email')}
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? t('Sending...') : t('Send reset email')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
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
  button: {
    alignItems: 'center',
    backgroundColor: colors.light.primary,
    borderRadius: 5,
    padding: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: colors.light.primary,
  },
});
