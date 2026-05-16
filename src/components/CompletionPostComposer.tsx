import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { useMediaUpload } from "../hooks/useMediaUpload";
import { Loader } from "./Loader";
import { ComfortSlider } from "./ComfortSlider";
import { MediaSelectionResult } from "../utils/handleMediaUpload";

type CompletionPostComposerVariant = "challenge" | "quest";

interface CompletionPostComposerProps {
  variant: CompletionPostComposerVariant;
  completed: boolean;
  checkingCompletion: boolean;
  buildSubmitData: (args: { userId: string; comfortRating: number | null }) => Record<string, unknown>;
  onCompleted: (args: {
    selectedMedia: MediaSelectionResult | null;
    submittedText: string;
    comfortRating: number | null;
  }) => void;
}

const discomfortLabels = ["Chill", "Uneasy", "Nervous", "Scary", "Way out there"];

export const CompletionPostComposer: React.FC<CompletionPostComposerProps> = ({
  variant,
  completed,
  checkingCompletion,
  buildSubmitData,
  onCompleted,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [comfortRating, setComfortRating] = useState(3);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const submittedTextRef = useRef("");
  const showComfortSlider = variant === "challenge";
  const isQuestVariant = variant === "quest";

  const config = {
    challenge: {
      completedLabelKey: "Challenge completed!",
      ctaLabelKey: "Mark as complete",
      modalSubtitleKey: "Share how you completed the challenge",
      placeholderTextKey: "Just completed this week's challenge!",
      unauthenticatedMessageKey: "You must be logged in to submit a challenge.",
      successMessageKey: "Challenge completed successfully!",
      sliderAccentColor: colors.light.accent,
      sliderLabelColor: colors.light.text,
      sliderValueColor: colors.light.accent,
      completedBackgroundColor: colors.light.easyGreen,
      completedTextColor: "#2D5016",
      completedCheckColor: "#2D5016",
    },
    quest: {
      completedLabelKey: "Quest completed!",
      ctaLabelKey: "Mark as complete",
      modalSubtitleKey: "Share how you completed the quest",
      placeholderTextKey: "Just completed today's quest!",
      unauthenticatedMessageKey: "You must be logged in to submit a quest.",
      successMessageKey: "Quest completed successfully!",
      sliderAccentColor: colors.sideQuest.base,
      sliderLabelColor: colors.light.text,
      sliderValueColor: colors.sideQuest.text,
      completedBackgroundColor: colors.light.easyGreen,
      completedTextColor: "#2D5016",
      completedCheckColor: "#2D5016",
    },
  }[variant];

  const {
    selectedMedia,
    postText,
    setPostText,
    isUploading,
    isSubmitting,
    uploadProgress,
    handleMediaUpload,
    handleRemoveMedia,
    handleSubmit,
  } = useMediaUpload({
    onUploadComplete: () => {
      setModalVisible(false);
      onCompleted({
        selectedMedia,
        submittedText: submittedTextRef.current || t(config.placeholderTextKey),
        comfortRating: showComfortSlider ? comfortRating : null,
      });
    },
    successMessage: t(config.successMessageKey),
  });

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

  const onSubmit = async () => {
    if (!user) {
      alert(t(config.unauthenticatedMessageKey));
      return;
    }

    const placeholderText = t(config.placeholderTextKey);
    const textToSubmit = postText && postText.trim() ? postText : placeholderText;
    submittedTextRef.current = textToSubmit.trim();

    await handleSubmit(
      buildSubmitData({
        userId: user.id,
        comfortRating: showComfortSlider ? comfortRating : null,
      }),
      textToSubmit
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          isQuestVariant && styles.questButton,
          completed && { backgroundColor: config.completedBackgroundColor },
          isQuestVariant && completed && styles.questButtonCompleted,
          checkingCompletion && styles.buttonDisabledState,
        ]}
        onPress={fadeIn}
        disabled={completed || checkingCompletion}
      >
        {isQuestVariant ? (
          <>
            <View style={styles.questButtonGlow} />
            <View style={styles.questButtonOrbit} />
            <View style={styles.questButtonContent}>
              <View style={[styles.questArrowChip, completed && styles.questArrowChipCompleted]}>
                <MaterialCommunityIcons
                  name={completed ? "check" : "arrow-top-right"}
                  size={18}
                  color={completed ? config.completedCheckColor : colors.neutral.white}
                />
              </View>
              <View style={styles.questButtonRow}>
                <View style={styles.questButtonTextWrap}>
                  <Text
                    style={[
                      styles.questButtonTitle,
                      completed && { color: config.completedTextColor },
                    ]}
                  >
                    {t(completed ? config.completedLabelKey : config.ctaLabelKey)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.buttonContent}>
            {completed && (
              <MaterialIcons
                name="check-circle"
                size={20}
                color={config.completedCheckColor}
                style={styles.checkIcon}
              />
            )}
            <Text
              style={[styles.buttonText, completed && { color: config.completedTextColor, fontWeight: "600" }]}
            >
              {completed ? t(config.completedLabelKey) : t(config.ctaLabelKey)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={fadeOut}
        statusBarTranslucent={true}
      >
        <Animated.View
          style={[StyleSheet.absoluteFillObject, styles.modalOverlay, { opacity: fadeAnim }]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={fadeOut}
            >
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t("How did it go?")}</Text>
                  <Text style={styles.modalSubtitle}>{t(config.modalSubtitleKey)}</Text>
                  <TouchableOpacity onPress={fadeOut} style={styles.closeButton}>
                    <MaterialIcons name="close" size={20} color={colors.light.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.mediaUploadButton} onPress={handleMediaUpload}>
                  {selectedMedia ? (
                    <View style={styles.mediaSelectedRow}>
                      <TouchableOpacity
                        style={styles.thumbnailWrapper}
                        onPress={() => setFullScreenPreview(true)}
                        disabled={isUploading}
                      >
                        <Image
                          source={{ uri: selectedMedia.thumbnailUri || selectedMedia.previewUrl }}
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                        {selectedMedia.isVideo && (
                          <View style={styles.thumbnailPlayOverlay}>
                            <MaterialIcons name="play-circle-filled" size={26} color="white" />
                          </View>
                        )}
                        {isUploading && (
                          <View style={styles.uploadingOverlay}>
                            <Loader />
                          </View>
                        )}
                      </TouchableOpacity>

                      <View style={styles.mediaSelectedTextContainer}>
                        <Text style={styles.mediaSelectedTitle}>
                          {t(selectedMedia.isVideo ? "Video attached" : "Photo attached")}
                        </Text>
                        <Text style={styles.mediaSelectedSubtitle}>{t("Tap to change")}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.removeButtonInline}
                        onPress={handleRemoveMedia}
                        disabled={isUploading}
                      >
                        <MaterialIcons name="close" size={18} color={colors.neutral.darkGrey} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.mediaEmptyRow}>
                      {isUploading ? (
                        <Loader />
                      ) : (
                        <View style={styles.uploadMediaContainer}>
                          <View style={styles.mediaIconsContainer}>
                            <MaterialIcons name="image" size={18} color={colors.neutral.darkGrey} />
                            <MaterialCommunityIcons
                              name="video"
                              size={18}
                              color={colors.neutral.darkGrey}
                            />
                          </View>
                          <Text style={styles.uploadButtonText}>
                            {t("Add photo/video (optional)")}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>

                {uploadProgress !== null && (
                  <View style={styles.uploadProgressContainer}>
                    <Text style={styles.uploadProgressText}>
                      {t("Uploading media...")} {Math.round(uploadProgress)}%
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${uploadProgress}%` },
                        ]}
                      />
                    </View>
                  </View>
                )}

                <TextInput
                  style={[styles.textInput, { fontSize: 13 }]}
                  multiline
                  scrollEnabled
                  autoFocus
                  placeholder={t(config.placeholderTextKey)}
                  placeholderTextColor="#999"
                  onChangeText={setPostText}
                />

                {showComfortSlider && (
                  <View style={styles.sliderSection}>
                    <View style={styles.sliderHeader}>
                      <Text style={[styles.sliderLabel, { color: config.sliderLabelColor }]}>
                        {t("How far out of your comfort zone was this?")}
                      </Text>
                    </View>
                    <ComfortSlider
                      value={comfortRating}
                      onValueChange={setComfortRating}
                      minimumValue={1}
                      maximumValue={5}
                      minimumTrackTintColor={config.sliderAccentColor}
                      maximumTrackTintColor={colors.neutral.grey2}
                      thumbTintColor={config.sliderAccentColor}
                      thumbSize={18}
                    />
                    <Text style={[styles.sliderEndLabel, { color: config.sliderValueColor }]}>
                      {t(discomfortLabels[comfortRating - 1])}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.submitButton,
                    (isUploading || isSubmitting) && styles.disabledButton,
                  ]}
                  onPress={onSubmit}
                  disabled={isUploading || isSubmitting}
                >
                  <Text
                    style={[styles.buttonText, (isUploading || isSubmitting) && styles.disabledButtonText]}
                  >
                    {t(isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit")}
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
          style={styles.fullScreenOverlay}
          activeOpacity={1}
          onPress={() => setFullScreenPreview(false)}
        >
          <View style={styles.fullScreenImageWrapper}>
            <Image
              source={{ uri: selectedMedia?.previewUrl || "" }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.light.accent,
    borderRadius: 8,
    overflow: "hidden",
    padding: 14,
    position: "relative",
    width: "100%",
  },
  buttonDisabledState: {
    opacity: 0.7,
  },
  buttonContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkIcon: {
    marginRight: 8,
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
  fullScreenImageWrapper: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
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
  mediaSelectedSubtitle: {
    color: colors.neutral.darkGrey,
    fontSize: 12,
    marginTop: 2,
  },
  mediaSelectedTextContainer: {
    flex: 1,
  },
  mediaSelectedTitle: {
    color: colors.neutral.black,
    fontSize: 14,
    fontWeight: "600",
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
  questArrowChip: {
    alignItems: "center",
    backgroundColor: "rgba(115, 54, 38, 0.92)",
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    width: 28,
  },
  questArrowChipCompleted: {
    backgroundColor: "rgba(45, 80, 22, 0.14)",
  },
  questButton: {
    backgroundColor: colors.sideQuest.base,
    borderColor: colors.sideQuest.text,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: colors.sideQuest.textStrong,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  questButtonCompleted: {
    borderColor: "rgba(45, 80, 22, 0.18)",
  },
  questButtonContent: {
    justifyContent: "center",
    position: "relative",
    width: "100%",
    zIndex: 1,
  },
  questButtonGlow: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    height: 82,
    position: "absolute",
    right: -8,
    top: -22,
    width: 82,
  },
  questButtonOrbit: {
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    borderWidth: 1,
    height: 54,
    position: "absolute",
    right: 10,
    top: 10,
    transform: [{ rotate: "-14deg" }],
    width: 54,
  },
  questButtonTextWrap: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 36,
  },
  questButtonTitle: {
    color: colors.neutral.white,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 17,
    textAlign: "left",
  },
  questButtonRow: {
    justifyContent: "center",
    minHeight: 38,
  },
  removeButtonInline: {
    alignItems: "center",
    backgroundColor: colors.neutral.grey2,
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  sliderEndLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  sliderHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  sliderSection: {
    marginVertical: 10,
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
  uploadMediaContainer: {
    alignItems: "center",
    flexDirection: "column",
    gap: 8,
    justifyContent: "center",
    width: "100%",
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
  uploadButtonText: {
    color: colors.neutral.darkGrey,
    flex: 1,
    fontSize: 14,
  },
});
