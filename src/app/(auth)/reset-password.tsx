import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Pressable, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import { Text } from '../../components/StyledText';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert(t('Error'), t('Please fill in all fields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('Error'), t('Passwords do not match'));
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error(t('Auth session missing. Open the reset link again from your email.'));
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      Alert.alert(t('Success'), t('Password updated'), [
        {
          text: t('OK'),
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          },
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

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? t('Updating...') : t('Update password')}</Text>
        </TouchableOpacity>

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
