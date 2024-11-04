import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { colors } from '../constants/Colors';
import Markdown from 'react-native-markdown-display';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

interface ChallengeCardProps {
  title: string;
  description: string;
}

const markdownStyles = StyleSheet.create({
  body: {
    color: 'white',
  },
});

const ChallengeCard: React.FC<ChallengeCardProps> = ({ title, description }) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [uploadedMediaId, setUploadedMediaId] = React.useState<number | null>(null);
  const [postText, setPostText] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const notificationAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const showNotificationWithAnimation = () => {
    setShowNotification(true);
    Animated.sequence([
      Animated.timing(notificationAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2800), // 3000 - (2 * 100) to account for fade in/out
      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => setShowNotification(false));
  };

  const handleSubmit = async () => {
    try {
      const { error: postError } = await supabase
        .from('post')
        .insert([
          {
            user_id: '4e723784-b86d-44a2-9ff3-912115398421',
            media_id: uploadedMediaId,
            body: postText,
            featured: false
          }
        ]);

      if (postError) throw postError;

      // Clear form and close modal
      setPostText('');
      setUploadedMediaId(null);
      setMediaPreview(null);
      fadeOut();

      // Replace setShowNotification(true) with the new animation
      showNotificationWithAnimation();

    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post.');
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setMediaPreview(file.uri);
        
        const mediaType = file.type || 'image';
        const fileName = `${mediaType}/${Date.now()}.jpg`;
        
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: 'image/jpeg',
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
            { file_path: fileName }
          ])
          .select('id')
          .single();

        if (dbError) throw dbError;

        // Store the media ID
        setUploadedMediaId(mediaData.id);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, animation]);

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], 
  });

  return (
    <>
      {showNotification && (
        <Animated.View 
          style={[
            styles.notification,
            {
              opacity: notificationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.9]
              })
            }
          ]}
        >
          <Text style={styles.notificationText}>Your post has been submitted!</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.card]}>
        <TouchableOpacity style={styles.cardContent} onPress={toggleExpand} activeOpacity={1}>
          <View style={styles.topContainer}>
            <TouchableOpacity style={styles.accentButton} onPress={fadeIn}>
              <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
            <View style={styles.challengeText}>
              <Text style={styles.thisWeeksChallengeLabel}>This Week's Challenge</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
            <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={18} color="white" />
          </View>
          <Animated.View style={[styles.descriptionContainer, { height: animatedHeight }]}>
            <Markdown style={markdownStyles}>{description}</Markdown>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={fadeOut}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} 
              activeOpacity={1} 
              onPress={fadeOut}
            >
              <TouchableOpacity 
                activeOpacity={1} 
                onPress={e => e.stopPropagation()} 
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>How did it go?</Text>
                  <Text style={styles.modalSubtitle}>Share your experience with the community</Text>
                  <TouchableOpacity onPress={fadeOut} style={styles.closeButton}>
                    <MaterialIcons name="close" size={20} color={colors.light.text} />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.mediaUploadButton} onPress={handleMediaUpload}>
                  {mediaPreview ? (
                    <Image 
                      source={{ uri: mediaPreview }} 
                      style={styles.mediaPreview} 
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <View style={styles.mediaIconsContainer}>
                        <MaterialIcons name="image" size={24} color={colors.neutral.darkGrey} />
                        <MaterialIcons name="videocam" size={24} color={colors.neutral.darkGrey} />
                        <MaterialIcons name="mic" size={24} color={colors.neutral.darkGrey} />
                      </View>
                      <Text style={styles.uploadButtonText}>Tap to upload photo, video or audio</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.textInput}
                  multiline
                  placeholder="Write about your experience..."
                  placeholderTextColor="#999"
                  value={postText}
                  onChangeText={setPostText}
                />

                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]} 
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  thisWeeksChallengeLabel: {
    fontSize: 14,
    color: colors.dark.text,
    marginBottom: 4,
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.dark.tint, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  challengeText: {
    marginLeft: 12,
    padding: 0,
  },
  topContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  descriptionContainer: {
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark.text, 
    flex: 1,
  },
  button: {
    backgroundColor: colors.light.secondary, 
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  accentButton: {
    backgroundColor: colors.light.accent, 
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.light.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: colors.light.secondary,
    borderRadius: 48,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: colors.light.accent,
    marginHorizontal: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    minHeight: 100,
    minWidth: '100%',
    textAlignVertical: 'top',
  },
  mediaUploadButton: {
    backgroundColor: colors.neutral.grey2,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1.5,
    width: '100%',
  },
  mediaIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: colors.neutral.darkGrey,
    fontSize: 14,
    // fontWeight: '600',
    textAlign: 'center',
  },
  modalHeader: {
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    padding: 8,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  notification: {
    position: 'absolute',
    top: 5,
    alignSelf: 'center',
    backgroundColor: colors.light.accent,
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 1000,
  },
  notificationText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default ChallengeCard;
