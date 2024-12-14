import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { Text } from '../../components/StyledText';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function RegisterProfileScreen() {
  const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const [profileMediaId, setProfileMediaId] = useState<number | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const { t } = useLanguage();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        setImageUploading(true);
        const file = result.assets[0];
        const fileName = `profile/${Date.now()}.jpg`;
        
        // Create form data for upload
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: 'image/jpeg',
        } as any);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('challenge-uploads')
          .upload(fileName, formData, {
            contentType: 'multipart/form-data',
          });

        if (uploadError) throw uploadError;

        // Insert into media table
        const { data: mediaData, error: dbError } = await supabase
          .from('media')
          .insert([{ file_path: fileName }])
          .select('id')
          .single();

        if (dbError) throw dbError;

        setProfileMediaId(mediaData.id);
        setProfileImage(file.uri);
      } catch (error) {
        console.error('Error uploading profile image:', error);
        Alert.alert(t('Error'), t('Failed to upload profile image'));
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleRegister = async () => {
    if (!username || !displayName) {
      Alert.alert(t('Error'), t('Please fill in all required fields'));
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, username, displayName, profileMediaId);
      Alert.alert(
        t('Registration Successful'),
        t('Please check your email to verify your account. After verification, you can log in to continue.'),
        [
          {
            text: t('OK'),
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
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

        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.imageContainer} 
            onPress={pickImage}
            disabled={imageUploading}
          >
            {imageUploading ? (
              <View style={styles.placeholderImage}>
                <ActivityIndicator size="large" color={colors.light.primary} />
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>{t('Add Photo')}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('Username*')}
              placeholderTextColor="#666"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder={t('Display Name*')}
              placeholderTextColor="#666"
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, (loading || imageUploading) && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading || imageUploading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('Creating Account...') : t('Complete Registration')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
      },
      form: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      },
      input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        marginBottom: 12,
        borderRadius: 5,
      },
      button: {
        backgroundColor: colors.light.primary,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      buttonDisabled: {
        opacity: 0.7,
      },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  stepnOut: {
    fontSize: 24,
    fontFamily: 'PingFangSC-Medium',
    color: colors.light.primary,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  imageContainer: {
    marginBottom: 10,
    marginRight: 5,
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
