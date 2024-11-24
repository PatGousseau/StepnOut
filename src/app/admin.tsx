import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';


const ChallengeCreation: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<number>(1);
  const [openDifficulty, setOpenDifficulty] = useState<boolean>(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [imageMediaId, setImageMediaId] = useState<number | null>(null);

  const { user } = useAuth();

  const handleMediaUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload media!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setMediaPreview(file.uri);

        const fileName = `image/${Date.now()}.jpg`;
        
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('challenge-uploads')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        const { data: mediaData, error: dbError } = await supabase
          .from('media')
          .insert([{ file_path: fileName }])
          .select('id')
          .single();

        if (dbError) throw dbError;

        setImageMediaId(mediaData.id);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const createChallengeInDatabase = async () => {
    try {
      const newChallenge = {
        title, 
        description, 
        difficulty, 
        created_by: user?.id,
        created_at: new Date().toISOString().split('T')[0], 
        updated_at: new Date().toISOString().split('T')[0], 
        duration, 
        image_media_id: imageMediaId,
      };
  
      const { error } = await supabase.from('challenges').insert([newChallenge]);
  
      if (error) {
        console.error('Error inserting data:', error);
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Challenge created successfully!');
        setTitle('');
        setDescription('');
        setDifficulty('easy');
        setDuration(1);
        setOpenDifficulty(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCreateChallenge = () => {
    if (!title || !description || !difficulty || !duration) {
      Alert.alert('Error', 'All fields must be filled out.');
      return;
    }
    createChallengeInDatabase();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput 
        style={styles.input} 
        value={title} 
        onChangeText={setTitle} 
        placeholder="Enter title" 
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />

      <Text style={styles.label}>Difficulty</Text>
      <DropDownPicker
        open={openDifficulty}
        value={difficulty}
        items={[
          { label: 'Easy', value: 'easy' },
          { label: 'Medium', value: 'medium' },
          { label: 'Hard', value: 'hard' },
        ]}
        setOpen={setOpenDifficulty}
        setValue={setDifficulty}
        placeholder="Select difficulty"
        style={styles.dropdown}
      />

      <Text style={styles.label}>Duration (in days)</Text>
      <TextInput
        style={styles.input}
        value={duration.toString()}
        onChangeText={(text) => setDuration(Number(text))}
        placeholder="Enter duration in days"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Challenge Image</Text>
      <TouchableOpacity style={styles.mediaUploadButton} onPress={handleMediaUpload}>
        {mediaPreview ? (
          <View style={styles.mediaPreviewContainer}>
            <Image source={{ uri: mediaPreview }} style={styles.mediaPreview} />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => {
                setMediaPreview(null);
                setImageMediaId(null);
              }}
            >
              <MaterialIcons name="close" size={12} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <MaterialIcons name="image" size={24} color="#666" />
            <Text style={styles.uploadButtonText}>Tap to upload image</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.createChallengeButton} onPress={handleCreateChallenge}>
        <Text style={styles.buttonText}>Create Challenge</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.light.background,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  dropdown: {
    marginTop: 8,
    zIndex: 1,
  },
  createChallengeButton: {
    backgroundColor: colors.light.secondary,
    width: 160,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaUploadButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height: 120,
  },
  uploadButtonText: {
    color: '#666',
    marginTop: 8,
  },
  mediaPreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
});

export default ChallengeCreation;
