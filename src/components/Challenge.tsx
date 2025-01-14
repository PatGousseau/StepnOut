import { Text } from '../components/StyledText';
import { colors } from '../constants/Colors';
import { TouchableOpacity, Image, Animated, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect, useCallback } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase, supabaseStorageUrl } from '../lib/supabase';
import { KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Challenge } from '../types';
import { Loader } from '../components/Loader';
import ShareChallenge from '../components/ShareChallenge';
import { View, StyleSheet } from 'react-native';
import { PATRIZIO_ID } from '../constants/Patrizio';
import { uploadMedia } from '../utils/handleMediaUpload';
import { useLanguage } from '../contexts/LanguageContext';
import { isVideo } from '../utils/utils';
import { router } from 'expo-router';

interface ChallengeCardProps {
    challenge: Challenge;
  }
  
  export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
    const { t } = useLanguage();
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty.toLowerCase()) {
        case 'easy':
          return colors.light.easyGreen;
        case 'medium':
          return colors.light.mediumYellow;
        case 'hard':
          return colors.light.hardRed;
        default:
          return colors.light.easyGreen;
      }
    };

    return (
      <>
        <Image 
          source={{ uri: `${supabaseStorageUrl}/${challenge.media.file_path}` }} 
          style={challengeStyles.challengeImage} 
        />
        
        <View style={challengeStyles.card}>
          <View style={challengeStyles.challengeHeader}>
            <Text style={challengeStyles.challengeName} numberOfLines={3}>
              {challenge.title}{' '}
              <View style={[
                challengeStyles.difficultyBadgeContainer,
                { backgroundColor: getDifficultyColor(challenge.difficulty) }
              ]}>
                <Text style={challengeStyles.difficultyBadgeText}>
                  {t(challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1))}
                </Text>
              </View>
            </Text>
          </View>
          
          <Text style={challengeStyles.description}>
            {challenge.description}
          </Text>
        </View>
      </>
    );
  };
  
interface PatrizioExampleProps {
    challenge: Challenge;
  }
  
  export const PatrizioExample: React.FC<PatrizioExampleProps> = ({ challenge }) => {
    const { t } = useLanguage();
    const [patrizioSubmission, setPatrizioSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isVideoSubmission, setIsVideoSubmission] = useState(false);

    useEffect(() => {
      const fetchPatrizioSubmission = async () => {
        try {
          const { data, error } = await supabase
            .from('post')
            .select(`
              *,
              media:media_id (
                file_path,
                thumbnail_path
              )
            `)
            .eq('challenge_id', challenge.id)
            .eq('user_id', PATRIZIO_ID)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          setPatrizioSubmission(data);

          if (data) {
            const isVideoFile = isVideo(data.media.file_path);
            setIsVideoSubmission(isVideoFile);
            
            const filePath = isVideoFile && data.media.thumbnail_path
              ? data.media.thumbnail_path
              : data.media.file_path;

            const { data: urlData } = await supabase.storage
              .from('challenge-uploads')
              .getPublicUrl(filePath);
            setImageUrl(urlData.publicUrl);
          }
        } catch (error) {
          console.error('Error fetching Patrizio\'s submission:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPatrizioSubmission();
    }, [challenge.id]);

    const handlePress = () => {
      if (patrizioSubmission) {
        router.push(`/post/${patrizioSubmission.id}`);
      }
    };

    if (loading || !patrizioSubmission) {
      return null;
    }

    return (
      <TouchableOpacity 
        style={patrizioStyles.card} 
        onPress={handlePress}
      >
        <View style={patrizioStyles.mediaContainer}>
          <Image 
            source={{ uri: imageUrl }}
            style={patrizioStyles.mediaPreview} 
          />
          {isVideoSubmission && (
            <View style={patrizioStyles.playIconOverlay}>
              <MaterialIcons name="play-circle-filled" size={24} color="white" />
            </View>
          )}
        </View>
        <View style={patrizioStyles.textContainer}>
          <Text style={patrizioStyles.title}>{t("Patrizio's submission")}</Text>
          <Text style={patrizioStyles.subtitle}>
            {t('Check out how Patrizio tackled this challenge!')}
          </Text>
        </View>
        <Text style={patrizioStyles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };
  
  interface ShareExperienceProps {
    challenge: Challenge;
  }
  
  export const ShareExperience: React.FC<ShareExperienceProps> = ({ challenge }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(null);
    const [postText, setPostText] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const notificationAnim = useRef(new Animated.Value(0)).current;
    const [isVideo, setIsVideo] = useState(false);
    const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
    const [fullScreenPreview, setFullScreenPreview] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async () => {
      if (!user) {
        alert(t('You must be logged in to submit a challenge.'));
        return;
      }

      if (isUploading) {
        alert(t('Please wait for media upload to complete.'));
        return;
      }

      if (!postText.trim() && !uploadedMediaId) {
        alert(t('Please add either a description or media to complete the challenge.'));
        return;
      }

      if (mediaPreview && !uploadedMediaId) {
        alert(t('Media is still uploading. Please wait.'));
        return;
      }

      try {
        const { error: postError } = await supabase
          .from('post')
          .insert([
            {
              user_id: user.id,
              challenge_id: challenge.id,
              media_id: uploadedMediaId,
              body: postText,
              featured: false
            }
          ])
          .select()
          .single();

        if (postError) throw postError;

        setModalVisible(false);
        setPostText('');
        setUploadedMediaId(null);
        setMediaPreview(null);
        setIsVideo(false);
        setVideoThumbnail(null);
        
        setTimeout(() => {
          setShowShareModal(true);
        }, 100);

      } catch (error) {
        console.error('Error creating submission:', error);
        alert(t('Error submitting challenge.'));
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
      setMediaPreview(null);
      setUploadedMediaId(null);
      setVideoThumbnail(null);
      setIsVideo(false);
    };

    // Add fadeIn/fadeOut functions
    const fadeIn = () => {
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const fadeOut = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    };

    return (
      <>
        {showNotification && (
          <Animated.View 
            style={[
              shareStyles.notification,
              {
                opacity: notificationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.9]
                })
              }
            ]}
          >
            <Text style={shareStyles.notificationText}>{t('Your post has been submitted!')}</Text>
          </Animated.View>
        )}

        <TouchableOpacity style={shareStyles.button} onPress={fadeIn}>
          <Text style={shareStyles.buttonText}>{t('Share my experience')}</Text>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={fadeOut}
          statusBarTranslucent={true}
        >
          <Animated.View 
            style={[
              StyleSheet.absoluteFillObject,
              shareStyles.modalOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={shareStyles.keyboardView}
            >
              <TouchableOpacity 
                style={shareStyles.modalContainer}
                activeOpacity={1} 
                onPress={fadeOut}
              >
                <View 
                  style={shareStyles.modalContent}
                  onStartShouldSetResponder={() => true}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <View style={shareStyles.modalHeader}>
                    <Text style={shareStyles.modalTitle}>{t('How did it go?')}</Text>
                    <Text style={shareStyles.modalSubtitle}>
                      {t('Share how you completed the challenge')}
                    </Text>
                    <TouchableOpacity onPress={fadeOut} style={shareStyles.closeButton}>
                      <MaterialIcons name="close" size={20} color={colors.light.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity style={shareStyles.mediaUploadButton} onPress={handleMediaUpload}>
                    {mediaPreview ? (
                      <View style={shareStyles.mediaPreviewContainer}>
                        {isUploading && (
                          <View style={shareStyles.uploadingOverlay}>
                            <Loader size="small" />
                          </View>
                        )}
                        <TouchableOpacity 
                          style={shareStyles.removeButton}
                          onPress={handleRemoveMedia}
                          disabled={isUploading}
                        >
                          <MaterialIcons name="close" size={12} color="white" />
                        </TouchableOpacity>
                        
                        {isVideo ? (
                          <View style={shareStyles.videoPreviewContainer}>
                            <TouchableOpacity onPress={() => setFullScreenPreview(true)}>
                              <Image 
                                source={{ uri: videoThumbnail || mediaPreview }} 
                                style={shareStyles.mediaPreview} 
                                resizeMode="cover"
                              />
                              <View style={shareStyles.playIconOverlay}>
                                <MaterialIcons name="play-circle-filled" size={40} color="white" />
                              </View>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity onPress={() => setFullScreenPreview(true)}>
                            <Image 
                              source={{ uri: mediaPreview }} 
                              style={shareStyles.mediaPreview} 
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      <>
                        {isUploading ? (
                          <Loader size="small" />
                        ) : (
                          <>
                            <View style={shareStyles.mediaIconsContainer}>
                              <MaterialIcons name="image" size={24} color={colors.neutral.darkGrey} />
                              <MaterialCommunityIcons name="video" size={24} color={colors.neutral.darkGrey} />
                            </View>
                            <Text style={shareStyles.uploadButtonText}>{t('Tap to upload photo or video')}</Text>
                          </>
                        )}
                      </>
                    )}
                  </TouchableOpacity>

                  <TextInput
                    style={[shareStyles.textInput, { fontSize: 13, fontStyle: 'italic' }]}
                    multiline
                    placeholder={t('How did it make you feel?\nWhat did you find difficult?')}
                    placeholderTextColor="#999"
                    value={postText}
                    onChangeText={setPostText}
                  />

                  <TouchableOpacity 
                    style={[
                      shareStyles.modalButton, 
                      shareStyles.submitButton,
                      isUploading && shareStyles.disabledButton
                    ]} 
                    onPress={handleSubmit}
                    disabled={isUploading}
                  >
                    <Text style={[
                      shareStyles.buttonText,
                      isUploading && shareStyles.disabledButtonText
                    ]}>
                      {t(isUploading ? 'Uploading...' : 'Submit')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </Animated.View>
        </Modal>

        <Modal
          transparent={true}
          visible={fullScreenPreview}
          onRequestClose={() => setFullScreenPreview(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity 
            style={shareStyles.fullScreenOverlay}
            activeOpacity={1}
            onPress={() => setFullScreenPreview(false)}
          >
            <Image 
              source={{ uri: mediaPreview || '' }} 
              style={shareStyles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>

        <ShareChallenge
          isVisible={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={challenge.title}
          challengeId={challenge.id}
          mediaPreview={mediaPreview}
          streakCount={1}
        />
      </>
    );
  };

const challengeStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    marginBottom: 10,
    padding: 20,
    width: '100%',
  },
  challengeHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  challengeImage: {
    alignSelf: 'center',
    height: 200,
    marginBottom: 20,
    width: 200,
  },
  challengeName: {
    color: colors.light.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: colors.light.text,
    fontSize: 14,
    marginBottom: 15,
  },
  difficultyBadgeContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  difficultyBadgeText: {
    color: colors.light.text,
    fontSize: 12,
  },
});

const patrizioStyles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
    width: '100%',
  },
  chevron: {
    color: colors.light.primary,
    fontSize: 24,
  },
  mediaContainer: {
    height: 50,
    marginRight: 15,
    position: 'relative',
    width: 50,
  },
  mediaPreview: {
    borderRadius: 8,
    height: 50,
    marginRight: 15,
    width: 50,
  },
  playIconOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  subtitle: {
    color: colors.light.lightText,
    fontSize: 13,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const shareStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.light.accent,
    borderRadius: 8,
    padding: 14,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    position: 'absolute',
    right: -15,
    top: -15,
  },
  disabledButton: {
    backgroundColor: colors.neutral.grey2,
    opacity: 0.7,
  },
  disabledButtonText: {
    color: colors.neutral.darkGrey,
  },
  fullScreenImage: {
    height: '100%',
    width: '100%',
  },
  fullScreenOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    flex: 1,
    justifyContent: 'center',
  },
  keyboardView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  mediaIconsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  mediaPreview: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  mediaPreviewContainer: {
    borderRadius: 8,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mediaUploadButton: {
    alignItems: 'center',
    aspectRatio: 2,
    backgroundColor: colors.neutral.grey2,
    borderRadius: 8,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  modalButton: {
    alignItems: 'center',
    backgroundColor: colors.light.secondary,
    borderRadius: 48,
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  modalContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '90%',
    padding: 20,
    width: '90%',
  },
  modalHeader: {
    position: 'relative',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
  },
  modalSubtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
  modalTitle: {
    color: colors.light.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notification: {
    backgroundColor: colors.light.accent,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    left: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  notificationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playIconOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  removeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    left: 6,
    padding: 2,
    position: 'absolute',
    top: 6,
    zIndex: 1,
  },
  submitButton: {
    backgroundColor: colors.light.accent,
    marginTop: 16,
  },
  textInput: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10,
    minHeight: 80,
    minWidth: '100%',
    padding: 10,
    textAlignVertical: 'top',
  },
  uploadButtonText: {
    color: colors.neutral.darkGrey,
    fontSize: 14,
    textAlign: 'center',
  },
  uploadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  videoPreviewContainer: {
    bottom: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
});