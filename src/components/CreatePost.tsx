import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Image, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../constants/Colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { supabase } from '../lib/supabase';
import { Text } from './StyledText';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia } from '../utils/handleMediaUpload';
import { useLanguage } from '../contexts/LanguageContext';

const CreatePost = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(null);
  const [postText, setPostText] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputAccessoryViewID = 'uniqueID';
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!user) {
      alert(t('You must be logged in to submit a post.'));
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
      alert(t('Error submitting post.'));
    }
  };

  const handleMediaUpload = async () => {
    try {
      setIsUploading(true);
      const result = await uploadMedia({ allowVideo: true });
      setUploadedMediaId(result.mediaId);
      setMediaPreview(result.mediaPreview);
      setIsVideo(result.isVideo);
      setVideoThumbnail(result.videoThumbnail);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(t('Error uploading file'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setUploadedMediaId(null);
    setMediaPreview(null);
    setIsVideo(false);
    setVideoThumbnail(null);
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
                {isUploading ? (
                  <View style={styles.mediaPreview}>
                    <ActivityIndicator size="large" color={colors.light.accent} />
                  </View>
                ) : mediaPreview ? (
                  <View style={styles.mediaPreviewContainer}>
                    <Image 
                      source={{ uri: isVideo ? videoThumbnail || mediaPreview : mediaPreview }} 
                      style={styles.mediaPreview} 
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.removeMediaButton}
                      onPress={handleRemoveMedia}
                    >
                      <MaterialIcons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
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
                  placeholder={t('Share your thoughts, start a discussion, or share an achievement...')}
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
                    <Text style={styles.cancelText}>{t('Cancel')}</Text>
                  </TouchableOpacity>
                  
                  {isUploading && (
                    <Text style={styles.uploadingText}>{t('Uploading...')}</Text>
                  )}
                  
                  <TouchableOpacity 
                    style={[
                      styles.headerButton, 
                      styles.submitButton,
                      isUploading && styles.disabledButton
                    ]} 
                    onPress={handleSubmit}
                    disabled={isUploading}
                  >
                    <Text style={[styles.buttonText, isUploading && styles.disabledButtonText]}>
                      {t('Submit')}
                    </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  disabledButtonText: {
    color: '#666666',
  },
  uploadingText: {
    color: colors.light.accent,
    fontSize: 14,
    marginRight: 10,
  },
  mediaPreviewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.5,
    marginVertical: 10,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePost;
