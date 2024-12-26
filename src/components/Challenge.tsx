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
        alert('You must be logged in to submit a challenge.');
        return;
      }

      if (isUploading) {
        alert('Please wait for media upload to complete.');
        return;
      }

      if (mediaPreview && !uploadedMediaId) {
        alert('Media is still uploading. Please wait.');
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
        alert('Error submitting challenge.');
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
        alert('Error uploading file');
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
                      {t('Share your experience with the community')}
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
                    style={shareStyles.textInput}
                    multiline
                    placeholder={t('Write about your experience...')}
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
  challengeImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    width: '100%',
  },
  challengeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light.primary,
    marginBottom: 10,
    flex: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  difficultyBadgeContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  difficultyBadgeText: {
    fontSize: 12,
    color: colors.light.text,
  },
  description: {
    fontSize: 14,
    color: colors.light.text,
    marginBottom: 15,
  },
});

const patrizioStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  mediaPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.light.lightText,
  },
  chevron: {
    fontSize: 24,
    color: colors.light.primary,
  },
  mediaContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    marginRight: 15,
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const shareStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.light.accent,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.light.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    padding: 8,
  },
  mediaUploadButton: {
    backgroundColor: colors.neutral.grey2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 2,
    width: '100%',
    overflow: 'hidden',
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
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    minHeight: 80,
    minWidth: '100%',
    textAlignVertical: 'top',
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
    marginTop: 16,
  },
  notification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.light.accent,
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  mediaPreviewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoPreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 2,
  },
  disabledButton: {
    backgroundColor: colors.neutral.grey2,
    opacity: 0.7,
  },
  disabledButtonText: {
    color: colors.neutral.darkGrey,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

const screenStyles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.light.cardBg,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.light.primary,

  },
  endsIn: {
    fontSize: 14,
    color: colors.light.lightText,
    marginBottom: 20,
  },
});