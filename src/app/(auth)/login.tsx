import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { Text } from '../../components/StyledText';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { EULA_IT, EULA } from '../../constants/EULA';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const IOS_CLIENT_ID = '881483240750-cc4pm3i893ov879f0s98hgqmb5j9mbu8.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '881483240750-jp0mujvlvrf8sl3is67b9hcokge2s3qf.apps.googleusercontent.com';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn } = useAuth();
  const { t, language } = useLanguage();

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
  }, [response]);

  const handleGoogleSignIn = async (idToken: string | undefined) => {
    if (!idToken) {
      Alert.alert(t('Error'), t('Failed to get Google credentials'));
      return;
    }

    try {
      setGoogleLoading(true);

      // Sign in to Supabase with the Google token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
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

      // If no username, this is a new Google user - send to profile setup
      if (!profile?.username) {
        router.replace('/(auth)/register-profile?isGoogleUser=true');
        return;
      }

      // Handle EULA
      if (!profile?.eula_accepted) {
        Alert.alert(t('End User License Agreement'), language === 'it' ? EULA_IT : EULA, [
          { text: t('Accept'), onPress: async () => {
            await supabase
              .from('profiles')
              .update({ eula_accepted: true })
              .eq('id', userId);
          } },
          {
            text: t('Decline'),
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace('/(auth)/login');
            }
          }
        ]);
      }

      // Handle first login / onboarding
      if (profile?.first_login) {
        await supabase
          .from('profiles')
          .update({ first_login: false })
          .eq('id', userId);
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert(t('Error'), (error as Error).message);
    } finally {
      setGoogleLoading(false);
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
        .select('first_login, eula_accepted')
        .eq('id', session.user.id)
        .single();

      if (!profile?.eula_accepted) {
        Alert.alert(t('End User License Agreement'), language === 'it' ? EULA_IT : EULA, [
          { text: t('Accept'), onPress: async () => {
            await supabase
              .from('profiles')
              .update({ eula_accepted: true })
              .eq('id', session.user.id);
          } },
          {
            text: t('Decline'),
            onPress: () => router.replace('/(auth)/login')
          }
        ]);
      }

      if (profile?.first_login) {
        await supabase
          .from('profiles')
          .update({ first_login: false })
          .eq('id', session.user.id);
        
        router.replace('/(auth)/onboarding');
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
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('Logging in...') : t('Log In')}
          </Text>
        </TouchableOpacity>

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
