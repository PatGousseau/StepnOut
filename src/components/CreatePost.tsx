import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { colors } from '../constants/Colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { supabase } from '../lib/supabase';
import { Text } from './StyledText';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia } from '../utils/handleMediaUpload';
import { useLanguage } from '../contexts/LanguageContext';
import { isVideo as isVideoUtil } from '../utils/utils';
import { Loader } from './Loader';
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
      if (result) {
        setUploadedMediaId(result.mediaId);
        setMediaPreview(result.mediaUrl);
        setIsVideo(isVideoUtil(result.mediaUrl));
        setVideoThumbnail(result.videoThumbnail);
      }
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
                    <Loader />
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelText: {
    color: colors.light.accent,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  disabledButtonText: {
    color: '#666666',
  },
  headerButton: {
    padding: 8,
  },
  inputAccessory: {
    backgroundColor: '#f1f1f1',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
  },
  keyboardButton: {
    marginRight: 8,
    padding: 4,
  },
  keyboardButtonText: {
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  keyboardView: {
    flex: 1,
  },
  mediaPreview: {
    alignItems: 'center',
    aspectRatio: 1.5,
    borderRadius: 8,
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  mediaPreviewContainer: {
    aspectRatio: 1.5,
    marginVertical: 10,
    marginBottom: 20,
    position: 'relative',
    width: '100%',
  },
  mediaUploadIcon: {
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 20,
    padding: 20,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalScroll: {
    maxHeight: '100%',
    width: '100%',
  },
  removeMediaButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: '5%',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.light.accent,
    borderRadius: 48,
    padding: 12,
  },
  textInput: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    height: 130,
    marginVertical: 0,
    padding: 10,
    textAlignVertical: 'top',
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: colors.light.accent,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  uploadingText: {
    color: colors.light.accent,
    fontSize: 14,
    marginRight: 10,
  },
});

export default CreatePost;
