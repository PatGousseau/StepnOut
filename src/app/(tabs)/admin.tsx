import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/Colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { sendNewChallengeNotificationToAll } from '../../lib/notificationsService';
import { uploadMedia } from '../../utils/handleMediaUpload';

type Challenge = {
  id: number;
  title: string;
  title_it: string;
  description: string;
  description_it: string;
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
  const [titleIt, setTitleIt] = useState<string>('');
  const [descriptionIt, setDescriptionIt] = useState<string>('');

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
        title_it: titleIt, 
        description,
        description_it: descriptionIt,
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

        <Text style={styles.label}>Italian Title</Text>
        <TextInput 
          style={styles.input} 
          value={titleIt} 
          onChangeText={setTitleIt} 
          placeholder="Enter Italian title" 
        />

        <Text style={styles.label}>Italian Description</Text>
        <TextInput
          style={styles.input}
          value={descriptionIt}
          onChangeText={setDescriptionIt}
          placeholder="Enter Italian description"
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
  activateButton: {
    backgroundColor: colors.light.secondary,
    borderRadius: 4,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeButton: {
    backgroundColor: colors.light.primary,
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  challengeActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeDate: {
    color: '#888',
    fontSize: 12,
  },
  challengeDescription: {
    color: '#444',
    fontSize: 14,
    marginBottom: 4,
  },
  challengeDifficulty: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  challengeImage: {
    borderRadius: 8,
    height: 80,
    marginRight: 16,
    width: 80,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  createChallengeButton: {
    alignItems: 'center',
    backgroundColor: colors.light.secondary,
    borderRadius: 8,
    elevation: 5,
    marginTop: 20,
    paddingVertical: 16,
    width: 160,
  },
  dropdown: {
    marginTop: 8,
  },
  dropdownContainer: {
    zIndex: 1000, // Ensure dropdown appears above other elements
    marginBottom: 60, // Add space for the dropdown options
  },
  input: {
    borderColor: '#ccc',
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 8,
    padding: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  mediaPreview: {
    borderRadius: 8,
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  mediaPreviewContainer: {
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  mediaUploadButton: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    marginTop: 8,
    padding: 16,
  },
  notifyButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 4,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
    position: 'absolute',
    right: 4,
    top: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: colors.light.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  uploadButtonText: {
    color: '#666',
    marginTop: 8,
  },
});

export default ChallengeCreation;
