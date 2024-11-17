import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export default function RegisterProfileScreen() {
  const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const [profileMediaId, setProfileMediaId] = useState<number | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
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
        Alert.alert('Error', 'Failed to upload profile image');
      }
    }
  };

  const handleRegister = async () => {
    if (!username || !displayName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, username, displayName, profileMediaId);
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account.'
      );
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
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
        <Text style={styles.requiredText}>Step 2: Profile Details</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Username*"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Display Name*"
          placeholderTextColor="#666"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
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
        padding: 15,
        marginBottom: 15,
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
      linkButton: {
        marginTop: 15,
        alignItems: 'center',
      },
      linkText: {
        color: colors.light.primary,
      },
      buttonDisabled: {
        opacity: 0.7,
      },
      requiredText: {
        color: '#666',
        marginBottom: 15,
        fontSize: 14,
        textAlign: 'center',
      },
      inputError: {
        borderColor: '#ff0000',
        borderWidth: 1,
      },
      errorText: {
        color: '#ff0000',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 5,
      },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
});
