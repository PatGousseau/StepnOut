import React from "react";
import { Text } from "../components/StyledText";
import { colors } from "../constants/Colors";
import { TouchableOpacity, Image, Animated, TextInput } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { supabase, supabaseStorageUrl } from "../lib/supabase";
import { KeyboardAvoidingView, Platform, Modal } from "react-native";
import { Challenge } from "../types";
import { Loader } from "../components/Loader";
import ShareChallenge from "../components/ShareChallenge";
import { View, StyleSheet } from "react-native";
import { PATRIZIO_ID } from "../constants/Patrizio";
import { useLanguage } from "../contexts/LanguageContext";
import { isVideo as isVideoUtil } from "../utils/utils";
import { router } from "expo-router";
import { imageService } from "../services/imageService";
import { useMediaUpload } from "../hooks/useMediaUpload";
import { captureEvent, setUserProperties } from "../lib/posthog";
import { CHALLENGE_EVENTS, USER_PROPERTIES } from "../constants/analyticsEvents";

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const { t } = useLanguage();
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return colors.light.easyGreen;
      case "medium":
        return colors.light.mediumYellow;
      case "hard":
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
            {challenge.title}{" "}
            <View
              style={[
                challengeStyles.difficultyBadgeContainer,
                { backgroundColor: getDifficultyColor(challenge.difficulty) },
              ]}
            >
              <Text style={challengeStyles.difficultyBadgeText}>
                {t(challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1))}
              </Text>
            </View>
          </Text>
        </View>

        <Text style={challengeStyles.description}>{challenge.description}</Text>
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
  const [imageUrls, setImageUrls] = useState<{ previewUrl: string; fullUrl: string }>({
    previewUrl: "",
    fullUrl: "",
  });
  const [isVideoSubmission, setIsVideoSubmission] = useState(false);

  useEffect(() => {
    const fetchPatrizioSubmission = async () => {
      try {
        const { data, error } = await supabase
          .from("post")
          .select(
            `
              *,
              media:media_id (
                file_path,
                thumbnail_path
              )
            `
          )
          .eq("challenge_id", challenge.id)
          .eq("user_id", PATRIZIO_ID)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        setPatrizioSubmission(data);

        if (data) {
          const isVideoFile = isVideoUtil(data.media.file_path);
          setIsVideoSubmission(isVideoFile);

          const filePath =
            isVideoFile && data.media.thumbnail_path
              ? data.media.thumbnail_path
              : data.media.file_path;

          const urls = await imageService.getPostImageUrl(filePath, "medium");
          setImageUrls(urls);
        }
      } catch (error) {
        console.error("Error fetching Patrizio's submission:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatrizioSubmission();
  }, [challenge.id]);

  const handlePress = () => {
    if (patrizioSubmission) {
      router.push(`/post/${patrizioSubmission.id}`);
      captureEvent(CHALLENGE_EVENTS.PATRIZIO_EXAMPLE_CLICKED, {
        challenge_id: challenge.id,
        post_id: patrizioSubmission.id,
      });
    }
  };

  if (loading || !patrizioSubmission) {
    return null;
  }

  return (
    <TouchableOpacity style={patrizioStyles.card} onPress={handlePress}>
      <View style={patrizioStyles.mediaContainer}>
        <Image source={{ uri: imageUrls.previewUrl }} style={patrizioStyles.mediaPreview} />
        {isVideoSubmission && (
          <View style={patrizioStyles.playIconOverlay}>
            <MaterialIcons name="play-circle-filled" size={24} color="white" />
          </View>
        )}
      </View>
      <View style={patrizioStyles.textContainer}>
        <Text style={patrizioStyles.title}>{t("Patrizio's submission")}</Text>
        <Text style={patrizioStyles.subtitle}>
          {t("Check out how Patrizio tackled this challenge!")}
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showNotification, setShowNotification] = useState(false);
  const notificationAnim = useRef(new Animated.Value(0)).current;
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const {
    selectedMedia,
    postText,
    setPostText,
    isUploading,
    uploadProgress,
    handleMediaUpload,
    handleRemoveMedia,
    handleSubmit,
  } = useMediaUpload({
    onUploadComplete: () => {
      setModalVisible(false);
      // Track challenge completed
      captureEvent(CHALLENGE_EVENTS.COMPLETED, {
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        challenge_difficulty: challenge.difficulty,
        has_media: !!selectedMedia,
        is_video: selectedMedia?.isVideo || false,
      });
      // Update user properties
      setUserProperties({
        [USER_PROPERTIES.LAST_ACTIVE]: new Date().toISOString(),
      });
      setTimeout(() => {
        setShowShareModal(true);
        captureEvent(CHALLENGE_EVENTS.SHARE_MODAL_OPENED, {
          challenge_id: challenge.id,
        });
      }, 100);
    },
    successMessage: t("Challenge completed successfully!"),
  });

  const onSubmit = async () => {
    if (!user) {
      alert(t("You must be logged in to submit a challenge."));
      return;
    }

    // Use placeholder text if user didn't input anything
    const placeholderText = t("Just completed this week's challenge!");
    const textToSubmit = postText && postText.trim() ? postText : placeholderText;

    await handleSubmit(
      {
        user_id: user.id,
        challenge_id: challenge.id,
      },
      textToSubmit
    );
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
                outputRange: [0, 0.9],
              }),
            },
          ]}
        >
          <Text style={shareStyles.notificationText}>{t("Your post has been submitted!")}</Text>
        </Animated.View>
      )}

      <TouchableOpacity style={shareStyles.button} onPress={fadeIn}>
        <Text style={shareStyles.buttonText}>{t("Mark as complete")}</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={fadeOut}
        statusBarTranslucent={true}
      >
        <Animated.View
          style={[StyleSheet.absoluteFillObject, shareStyles.modalOverlay, { opacity: fadeAnim }]}
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
                  <Text style={shareStyles.modalTitle}>{t("How did it go?")}</Text>
                  <Text style={shareStyles.modalSubtitle}>
                    {t("Share how you completed the challenge")}
                  </Text>
                  <TouchableOpacity onPress={fadeOut} style={shareStyles.closeButton}>
                    <MaterialIcons name="close" size={20} color={colors.light.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={shareStyles.mediaUploadButton} onPress={handleMediaUpload}>
                  {selectedMedia ? (
                    <View style={shareStyles.mediaSelectedRow}>
                      <TouchableOpacity
                        style={shareStyles.thumbnailWrapper}
                        onPress={() => setFullScreenPreview(true)}
                        disabled={isUploading}
                      >
                        <Image
                          source={{ uri: selectedMedia.thumbnailUri || selectedMedia.previewUrl }}
                          style={shareStyles.thumbnail}
                          resizeMode="cover"
                        />
                        {selectedMedia.isVideo && (
                          <View style={shareStyles.thumbnailPlayOverlay}>
                            <MaterialIcons name="play-circle-filled" size={26} color="white" />
                          </View>
                        )}
                        {isUploading && (
                          <View style={shareStyles.uploadingOverlay}>
                            <Loader />
                          </View>
                        )}
                      </TouchableOpacity>

                      <View style={shareStyles.mediaSelectedTextContainer}>
                        <Text style={shareStyles.mediaSelectedTitle}>
                          {t(selectedMedia.isVideo ? "Video attached" : "Photo attached")}
                        </Text>
                        <Text style={shareStyles.mediaSelectedSubtitle}>{t("Tap to change")}</Text>
                      </View>

                      <TouchableOpacity
                        style={shareStyles.removeButtonInline}
                        onPress={handleRemoveMedia}
                        disabled={isUploading}
                      >
                        <MaterialIcons name="close" size={18} color={colors.neutral.darkGrey} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={shareStyles.mediaEmptyRow}>
                      {isUploading ? (
                        <Loader />
                      ) : (
                        <View style={shareStyles.uploadMediaContainer}>
                          <View style={shareStyles.mediaIconsContainer}>
                            <MaterialIcons name="image" size={18} color={colors.neutral.darkGrey} />
                            <MaterialCommunityIcons
                              name="video"
                              size={18}
                              color={colors.neutral.darkGrey}
                            />
                          </View>
                          <Text style={shareStyles.uploadButtonText}>
                            {t("Add photo/video (optional)")}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>

                {uploadProgress !== null && (
                  <View style={shareStyles.uploadProgressContainer}>
                    <Text style={shareStyles.uploadProgressText}>
                      {t("Uploading media...")} {Math.round(uploadProgress)}%
                    </Text>
                    <View style={shareStyles.progressBarContainer}>
                      <View 
                        style={[
                          shareStyles.progressBarFill, 
                          { width: `${uploadProgress}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )}

                <TextInput
                  style={[shareStyles.textInput, { fontSize: 13, fontStyle: "italic" }]}
                  multiline
                  scrollEnabled
                  autoFocus
                  placeholder={t("Just completed this week's challenge!")}
                  placeholderTextColor="#999"
                  onChangeText={setPostText}
                />

                <TouchableOpacity
                  style={[
                    shareStyles.modalButton,
                    shareStyles.submitButton,
                    isUploading && shareStyles.disabledButton,
                  ]}
                  onPress={onSubmit}
                  disabled={isUploading}
                >
                  <Text
                    style={[shareStyles.buttonText, isUploading && shareStyles.disabledButtonText]}
                  >
                    {t(isUploading ? "Uploading..." : "Submit")}
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
          <View style={shareStyles.fullScreenImageWrapper}>
            <Image
              source={{ uri: selectedMedia?.previewUrl || "" }}
              style={shareStyles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <ShareChallenge
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={challenge.title}
        challengeId={challenge.id}
        mediaPreview={selectedMedia?.previewUrl || null}
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
    width: "100%",
  },
  challengeHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  challengeImage: {
    alignSelf: "center",
    height: 200,
    marginBottom: 20,
    width: 200,
  },
  challengeName: {
    color: colors.light.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
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
    alignItems: "center",
    backgroundColor: colors.light.background,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 10,
    padding: 15,
    width: "100%",
  },
  chevron: {
    color: colors.light.primary,
    fontSize: 24,
  },
  mediaContainer: {
    height: 50,
    marginRight: 15,
    position: "relative",
    width: 50,
  },
  mediaPreview: {
    borderRadius: 8,
    height: 50,
    marginRight: 15,
    width: 50,
  },
  playIconOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
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
    fontWeight: "bold",
  },
});

const shareStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.light.accent,
    borderRadius: 8,
    padding: 14,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    position: "absolute",
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
    height: "100%",
    width: "100%",
  },
  fullScreenOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
    flex: 1,
    justifyContent: "center",
  },
  keyboardView: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  mediaEmptyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-start",
    width: "100%",
  },
  mediaIconsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  mediaSelectedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  mediaSelectedTextContainer: {
    flex: 1,
  },
  mediaSelectedTitle: {
    color: colors.neutral.black,
    fontSize: 14,
    fontWeight: "600",
  },
  mediaSelectedSubtitle: {
    color: colors.neutral.darkGrey,
    fontSize: 12,
    marginTop: 2,
  },
  mediaUploadButton: {
    alignItems: "center",
    backgroundColor: colors.neutral.grey2,
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
  },
  uploadMediaContainer: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnail: {
    borderRadius: 10,
    height: 44,
    width: 44,
  },
  thumbnailPlayOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 10,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  thumbnailWrapper: {
    borderRadius: 10,
    position: "relative",
  },
  modalButton: {
    alignItems: "center",
    backgroundColor: colors.light.secondary,
    borderRadius: 48,
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  modalContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    marginTop: 60,
    padding: 20,
    width: "100%",
  },
  modalHeader: {
    position: "relative",
  },
  modalOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    flex: 1,
  },
  modalSubtitle: {
    color: "#666",
    fontSize: 14,
    marginBottom: 20,
  },
  modalTitle: {
    color: colors.light.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notification: {
    backgroundColor: colors.light.accent,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    left: 0,
    padding: 10,
    position: "absolute",
    right: 0,
    top: 0,
  },
  notificationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButtonInline: {
    alignItems: "center",
    backgroundColor: colors.neutral.grey2,
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  submitButton: {
    backgroundColor: colors.light.accent,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: colors.neutral.white,
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    color: colors.neutral.black,
    flex: 1,
    marginVertical: 10,
    padding: 10,
    textAlignVertical: "top",
  },
  uploadButtonText: {
    color: colors.neutral.darkGrey,
    flex: 1,
    fontSize: 14,
  },
  uploadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
  },
  fullScreenImageWrapper: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  uploadProgressContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginTop: 10,
    padding: 10,
  },
  uploadProgressText: {
    color: "#666",
    fontSize: 12,
    marginBottom: 5,
  },
  progressBarContainer: {
    backgroundColor: "#ddd",
    borderRadius: 2,
    height: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    backgroundColor: colors.light.accent,
    borderRadius: 2,
    height: "100%",
  },
});
