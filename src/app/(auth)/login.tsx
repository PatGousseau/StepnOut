import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { Text } from '../../components/StyledText';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { EULA_IT, EULA } from '../../constants/EULA';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t, language } = useLanguage();

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
      <View style={styles.form}>
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
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.linkText}>{t("Don't have an account? Register")}</Text>
        </TouchableOpacity>
      </View>
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
