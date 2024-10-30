import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/Colors';
import { Challenge } from '../types';

const ChallengeCreation: React.FC = () => {
  const [title, setTitle] = useState<string>(''); 
  const [description, setDescription] = useState<string>(''); 
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy'); 
  const [startDate, setStartDate] = useState<Date>(new Date()); 
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 86400000)); 
  const [openDifficulty, setOpenDifficulty] = useState<boolean>(false);

  const createChallengeInDatabase = async () => {
    const newChallenge: Challenge = {
      title,
      description,
      difficulty,
      start_date: startDate,
      end_date: endDate,
      created_by: '4e723784-b86d-44a2-9ff3-912115398421',
      created_at: new Date(),
      updated_at: new Date(),
    };
  
    try {
      const { error } = await supabase.from('challenges').insert([newChallenge]);
  
      if (error) {
        console.log(error);
        throw error;
      }
  
      Alert.alert('Success', 'Challenge created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCreateChallenge = () => {
    if (!title || !description || !difficulty || !startDate || !endDate) {
      Alert.alert('Error', 'All fields must be filled out.');
      return;
    }
    createChallengeInDatabase();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter title" />

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

      <Text style={styles.label}>Start Date & Time</Text>
      <View style={styles.dateTimeContainer}>
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setStartDate((prev) => (prev ? new Date(selectedDate.setHours(prev.getHours(), prev.getMinutes())) : selectedDate));
            }
          }}
          style={styles.datePicker}
        />
        <DateTimePicker
          value={startDate || new Date()}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            if (selectedTime) setStartDate(new Date(startDate!.setHours(selectedTime.getHours(), selectedTime.getMinutes())));
          }}
          style={styles.datePicker}
        />
      </View>

      <Text style={styles.label}>End Date & Time</Text>
      <View style={styles.dateTimeContainer}>
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setEndDate((prev) => (prev ? new Date(selectedDate.setHours(prev.getHours(), prev.getMinutes())) : selectedDate));
            }
          }}
          style={styles.datePicker}
        />
        <DateTimePicker
          value={endDate || new Date()}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            if (selectedTime) setEndDate(new Date(endDate!.setHours(selectedTime.getHours(), selectedTime.getMinutes())));
          }}
          style={styles.datePicker}
        />
      </View>
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
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  datePicker: {
    marginHorizontal: 4,
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
