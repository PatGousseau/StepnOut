import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/Colors';

const ChallengeCreation: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<number>(1);
  const [openDifficulty, setOpenDifficulty] = useState<boolean>(false);

  const createChallengeInDatabase = async () => {
    try {
      const newChallenge = {
        title, 
        description, 
        difficulty, 
        created_by: '4e723784-b86d-44a2-9ff3-912115398421',
        created_at: new Date().toISOString().split('T')[0], 
        updated_at: new Date().toISOString().split('T')[0], 
        duration, 
      };
  
      const { error } = await supabase.from('challenges').insert([newChallenge]);
  
      if (error) {
        console.error('Error inserting data:', error);
        Alert.alert('Error', error.message);
      } else {
        console.log('Challenge created successfully');
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
    backgroundColor: '#fff',
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
});

export default ChallengeCreation;
