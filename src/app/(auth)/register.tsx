import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import { Text } from '../../components/StyledText';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setIsEmailValid(text === '' || isValidEmail(text));
  };

  const handleNextStep = async () => {
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError(t('Please fill in all fields'));
      return;
    }

    if (!isValidEmail(email)) {
      setError(t('Please enter a valid email address'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('Passwords do not match'));
      return;
    }

    try {
      setLoading(true);

      // Attempt to create auth user to check if email already exists
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.log("Supabase signup error:", signUpError.message);
        // Check for duplicate email error
        if (signUpError.message?.toLowerCase().includes("already registered") ||
            signUpError.message?.toLowerCase().includes("already been registered")) {
          setError(t("An account with this email already exists"));
        } else {
          setError(t(signUpError.message));
        }
        return;
      }

      if (!user) {
        setError(t("Registration failed. Please try again."));
        return;
      }

      // Navigate to next step
      router.push('/(auth)/register-profile');
    } catch (err) {
      setError(t((err as Error).message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Pressable style={styles.form} onPress={Keyboard.dismiss}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.stepnOut}>Stepn Out</Text>
        </View>
        
        <TextInput
          style={[styles.input, !isEmailValid && styles.inputError]}
          placeholder="Email*"
          placeholderTextColor="#666"
          value={email}
          onChangeText={handleEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {!isEmailValid && email !== '' && (
          <Text style={styles.errorText}>{t('Please enter a valid email address')}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder={t("Password*")}
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder={t("Confirm Password*")}
          placeholderTextColor="#666"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {error && (
          <Text style={styles.formErrorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleNextStep}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? t('Checking...') : t('Next')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.linkText}>{t('Already have an account? Log in')}</Text>
        </TouchableOpacity>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
    marginTop: -10,
  },
  formErrorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderColor: '#ddd',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 15,
    padding: 15,
  },
  inputError: {
    borderColor: '#ff0000',
    borderWidth: 1,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: colors.light.primary,
  },
  logo: {
    height: 60,
    marginBottom: 10,
    width: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepnOut: {
    color: colors.light.primary,
    fontFamily: 'PingFangSC-Medium',
    fontSize: 24,
  },
});
