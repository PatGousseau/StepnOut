import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Keyboard,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import { FeatureActionButton } from '../../components/FeatureActionButton';
import { useAuth } from '../../contexts/AuthContext';
import { Text } from '../../components/StyledText';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

const IOS_CLIENT_ID = '881483240750-cc4pm3i893ov879f0s98hgqmb5j9mbu8.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '881483240750-jp0mujvlvrf8sl3is67b9hcokge2s3qf.apps.googleusercontent.com';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLanguage();

  // Google Auth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response.authentication?.idToken);
    }
  }, [handleGoogleSignIn, response]);

  const handleSocialSignIn = useCallback(async (provider: 'google' | 'apple', token: string) => {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider,
      token,
    });

    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error(t('Login failed'));

    // Check if profile exists (new user vs returning user)
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_login, eula_accepted, username')
      .eq('id', userId)
      .single();

    // If no username, this is a new user - send to profile setup
    if (!profile?.username) {
      router.replace(`/(auth)/register-profile?isSocialUser=true`);
      return;
    }

    if (profile?.first_login) {
      await supabase
        .from('profiles')
        .update({ first_login: false })
        .eq('id', userId);
    }

    if (!profile?.eula_accepted) {
      router.replace(profile?.first_login
        ? '/(auth)/eula?firstTime=true'
        : '/(auth)/eula');
    } else if (profile?.first_login) {
      router.replace('/(auth)/notifications-prime?firstTime=true');
    } else {
      router.replace('/(tabs)');
    }
  }, [t]);

  const handleGoogleSignIn = useCallback(async (idToken: string | undefined) => {
    if (!idToken) {
      Alert.alert(t('Error'), t('Failed to get Google credentials'));
      return;
    }

    try {
      setGoogleLoading(true);
      await handleSocialSignIn('google', idToken);
    } catch (error) {
      Alert.alert(t('Error'), (error as Error).message);
    } finally {
      setGoogleLoading(false);
    }
  }, [handleSocialSignIn, t]);

  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error(t('Failed to get Apple credentials'));
      }

      await handleSocialSignIn('apple', credential.identityToken);
    } catch (error: unknown) {
      // Don't show error if user cancelled
      if ((error as { code?: string })?.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      Alert.alert(t('Error'), (error as Error).message);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('Error'), t('Please fill in all fields'));
      return;
    }
    try {
      setLoading(true);
      await signIn(email, password);

      // Get the current session to get user info
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error(t('Login failed'));

      // Check if this is their first login after verification
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_login, eula_accepted, username')
        .eq('id', session.user.id)
        .single();

      // If no username, this is a new user - send to profile setup
      if (!profile?.username) {
        router.replace(`/(auth)/register-profile`);
        return;
      }

      if (profile?.first_login) {
        await supabase
          .from('profiles')
          .update({ first_login: false })
          .eq('id', session.user.id);
      }

      if (!profile?.eula_accepted) {
        router.replace(profile?.first_login
          ? '/(auth)/eula?firstTime=true'
          : '/(auth)/eula');
      } else if (profile?.first_login) {
        router.replace('/(auth)/notifications-prime?firstTime=true');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert(t('Error'), (error as Error).message);
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
          <Text style={styles.stepnOut}>{t('Stepn Out')}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder={t('Email')}
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder={t('Password')}
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <Text style={styles.forgotPasswordText}>{t('Forgot password?')}</Text>
        </TouchableOpacity>

        <FeatureActionButton
          disabled={loading}
          onPress={handleLogin}
          showIcon={false}
          title={loading ? t('Logging in...') : t('Log In')}
          tone="indigo"
          variant="pill"
        />

        {Platform.OS !== 'android' && (
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.divider} />
          </View>
        )}

        {Platform.OS !== 'android' && (
          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={() => promptAsync()}
            disabled={!request || googleLoading}
          >
            <Image
              source={require('../../assets/images/google.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>
              {googleLoading ? t('Signing in...') : t('Continue with Google')}
            </Text>
          </TouchableOpacity>
        )}

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={5}
            style={[styles.appleButton, appleLoading && styles.buttonDisabled]}
            onPress={handleAppleSignIn}
          />
        )}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.linkText}>{t("Don't have an account? Register")}</Text>
        </TouchableOpacity>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.7,
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  divider: {
    backgroundColor: '#ddd',
    flex: 1,
    height: 1,
  },
  dividerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 20,
  },
  dividerText: {
    color: '#666',
    marginHorizontal: 10,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  googleIcon: {
    height: 20,
    marginRight: 10,
    width: 20,
  },
  appleButton: {
    height: 50,
    marginTop: 10,
    width: '100%',
  },
  input: {
    borderColor: '#ddd',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 15,
    padding: 15,
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginBottom: 15,
    marginTop: -5,
  },
  forgotPasswordText: {
    color: colors.light.primary,
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
