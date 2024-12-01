import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Modal, TextInput, KeyboardAvoidingView, Platform, Image, ScrollView, InputAccessoryView } from 'react-native';
import { colors } from '../constants/Colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Text } from './StyledText';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useAuth } from '../contexts/AuthContext';
import { Keyboard } from 'react-native';

const CreatePost = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(null);
  const [postText, setPostText] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const inputAccessoryViewID = 'uniqueID';

  const handleSubmit = async () => {
    if (!user) {
      alert('You must be logged in to submit a post.');
      return;
    }

    try {
      await supabase
        .from('post')
        .insert([{
          user_id: user.id,
          media_id: uploadedMediaId,
          body: postText,
          featured: false
        }]);

      setPostText('');
      setUploadedMediaId(null);
      setMediaPreview(null);
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error submitting post.');
    }
  };

  const handleMediaUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload media!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const isVideoFile = file.type === 'video';
        setIsVideo(isVideoFile);

        if (isVideoFile) {
          const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, {
            time: 0,
            quality: 0.5,
          });
          setVideoThumbnail(uri);
          setMediaPreview(uri);
        } else {
          setMediaPreview(file.uri);
        }

        const mediaType = file.type || 'image';
        const fileExtension = mediaType === 'video' ? '.mp4' : '.jpg';
        const fileName = `${mediaType}/${Date.now()}${fileExtension}`;
        
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        } as any);

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('challenge-uploads')
          .upload(fileName, formData, {
            contentType: 'multipart/form-data',
          });

        if (uploadError) throw uploadError;

        // Insert into media table and get the ID
        const { data: mediaData, error: dbError } = await supabase
          .from('media')
          .insert([
            { 
              file_path: fileName,
            }
          ])
          .select('id')
          .single();

        if (dbError) throw dbError;

        setUploadedMediaId(mediaData.id);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
        >
          <View style={styles.modalContainer}>
            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    style={styles.headerButton} 
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.headerButton, styles.submitButton]} 
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.textInput}
                  multiline
                  scrollEnabled={true}
                  textAlignVertical="top"
                  placeholder="Share your thoughts, start a discussion, or share an achievement..."
                  placeholderTextColor="#999"
                  value={postText}
                  onChangeText={setPostText}
                  inputAccessoryViewID={inputAccessoryViewID}
                />

                {mediaPreview ? (
                  <Image 
                    source={{ uri: isVideo ? videoThumbnail || mediaPreview : mediaPreview }} 
                    style={styles.mediaPreview} 
                    resizeMode="cover"
                  />
                ) : (
                  <TouchableOpacity 
                    style={styles.mediaUploadIcon} 
                    onPress={handleMediaUpload}
                  >
                    <MaterialIcons name="add-photo-alternate" size={24} color={colors.light.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScroll: {
    width: '100%',
    maxHeight: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: '5%',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginVertical: 20,
  },
  mediaUploadIcon: {
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  mediaPreview: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 8,
    marginVertical: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 0,
    height: 130,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.light.accent,
    borderRadius: 48,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: colors.light.accent,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerButton: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: colors.light.accent,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cancelText: {
    color: colors.light.accent,
    fontWeight: 'bold',
  },
  inputAccessory: {
    backgroundColor: '#f1f1f1',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  keyboardButton: {
    padding: 4,
    marginRight: 8,
  },
  keyboardButtonText: {
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CreatePost;
