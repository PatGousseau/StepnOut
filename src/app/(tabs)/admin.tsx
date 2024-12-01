import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { sendNewChallengeNotificationToAll } from '../../lib/notificationsService';
import { uploadMedia } from '../../utils/handleMediaUpload';

type Challenge = {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  image_media_id: number | null;
  is_active: boolean | null;
};

const ChallengeCreation: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [openDifficulty, setOpenDifficulty] = useState<boolean>(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [imageMediaId, setImageMediaId] = useState<number | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      Alert.alert('Error', 'Failed to load challenges');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchChallenges();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleMediaUpload = async () => {
    try {
      const result = await uploadMedia({ 
        allowVideo: false,
        allowsEditing: true 
      });
      setMediaPreview(result.mediaPreview);
      setImageMediaId(result.mediaId);
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
        setMediaPreview(null);
        setImageMediaId(null);
        fetchChallenges();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCreateChallenge = () => {
    if (!title || !description || !difficulty) {
      Alert.alert('Error', 'All fields must be filled out.');
      return;
    }
    createChallengeInDatabase();
  };

  const handleActivateChallenge = async (challengeId: number) => {
    try {
      // First, deactivate all challenges
      const { error: deactivateError } = await supabase
        .from('challenges')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString().split('T')[0]
        })
        .neq('id', 0);

      if (deactivateError) throw deactivateError;

      // Then, activate the selected challenge
      const { error: activateError } = await supabase
        .from('challenges')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString().split('T')[0]
        })
        .eq('id', challengeId);

      if (activateError) throw activateError;

      // Refresh the challenges list
      await fetchChallenges();
      Alert.alert('Success', 'Challenge activated!');
    } catch (error) {
      console.error('Error activating challenge:', error);
      Alert.alert('Error', 'Failed to activate challenge');
    }
  };

  const handleSendNotifications = async (challengeId: number, challengeTitle: string) => {
    try {
      await sendNewChallengeNotificationToAll(challengeId.toString(), challengeTitle);
      Alert.alert('Success', 'Notifications sent to all users!');
    } catch (error) {
      console.error('Error sending notifications:', error);
      Alert.alert('Error', 'Failed to send notifications');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Create New Challenge</Text>
        
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

        <View style={styles.dropdownContainer}>
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
            zIndex={1000}
          />
        </View>

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

        <Text style={styles.sectionTitle}>Existing Challenges</Text>
        {challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            {challenge.image_media_id && (
              <Image
                source={{
                  uri: `${supabase.storage.from('challenge-uploads').getPublicUrl(
                    `image/${challenge.image_media_id}.jpg`
                  ).data.publicUrl}`
                }}
                style={styles.challengeImage}
              />
            )}
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDifficulty}>
                Difficulty: {challenge.difficulty}
              </Text>
              <Text numberOfLines={2} style={styles.challengeDescription}>
                {challenge.description}
              </Text>
              <Text style={styles.challengeDate}>
                Created: {new Date(challenge.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.challengeActions}>
                <TouchableOpacity
                  style={[
                    styles.activateButton,
                    challenge.is_active && styles.activeButton
                  ]}
                  onPress={() => handleActivateChallenge(challenge.id)}
                  disabled={challenge.is_active}
                >
                  <Text style={styles.buttonText}>
                    {challenge.is_active ? 'Active' : 'Activate'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.notifyButton}
                  onPress={() => handleSendNotifications(challenge.id, challenge.title)}
                >
                  <Text style={styles.buttonText}>Notify All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  dropdownContainer: {
    zIndex: 1000, // Ensure dropdown appears above other elements
    marginBottom: 60, // Add space for the dropdown options
  },
  dropdown: {
    marginTop: 8,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: colors.light.text,
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeDifficulty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  challengeDate: {
    fontSize: 12,
    color: '#888',
  },
  challengeActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  activateButton: {
    backgroundColor: colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: colors.light.primary,
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  notifyButton: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
});

export default ChallengeCreation;
