import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { colors } from '../constants/Colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { supabase } from '../lib/supabase';
import { Text } from './StyledText';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia } from '../utils/handleMediaUpload';

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
    try {
      const result = await uploadMedia({ allowVideo: true });
      setUploadedMediaId(result.mediaId);
      setMediaPreview(result.mediaPreview);
      setIsVideo(result.isVideo);
      setVideoThumbnail(result.videoThumbnail);
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
    paddingBottom: 4,
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
    marginTop: 15,
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
