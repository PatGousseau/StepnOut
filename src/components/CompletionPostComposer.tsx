import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { useMediaUpload } from "../hooks/useMediaUpload";
import { ComfortSlider } from "./ComfortSlider";
import { MediaSelectionResult } from "../utils/handleMediaUpload";
import { FeatureActionButton } from "./FeatureActionButton";
import { captureEvent } from "../lib/posthog";
import { CHALLENGE_EVENTS } from "../constants/analyticsEvents";

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
      headerAccentColor: colors.light.primary,
      headerBackgroundColor: colors.light.accent3,
      headerBorderColor: colors.light.accent2,
      headerTintColor: "rgba(103, 109, 160, 0.22)",
      headerRingColor: "rgba(77, 83, 130, 0.14)",
      headerFillColor: "rgba(77, 83, 130, 0.09)",
      actionBackgroundColor: colors.light.accent3,
      actionBorderColor: colors.light.accent2,
      tone: "indigo" as const,
    },
    quest: {
      completedLabelKey: "Quest completed!",
      ctaLabelKey: "Mark as complete",
      modalSubtitleKey: "Share how you completed the quest",
      placeholderTextKey: "Just completed this quest!",
      unauthenticatedMessageKey: "You must be logged in to submit a quest.",
      successMessageKey: "Quest completed successfully!",
      sliderAccentColor: colors.sideQuest.base,
      sliderLabelColor: colors.light.text,
      sliderValueColor: colors.sideQuest.text,
      headerAccentColor: colors.sideQuest.text,
      headerBackgroundColor: colors.sideQuest.highlightSoft,
      headerBorderColor: colors.sideQuest.bgBorder,
      headerTintColor: colors.sideQuest.tint,
      headerRingColor: colors.sideQuest.border,
      headerFillColor: colors.sideQuest.fill,
      actionBackgroundColor: colors.sideQuest.highlightSoft,
      actionBorderColor: colors.sideQuest.bgBorder,
      tone: "coral" as const,
    },
  }[variant];

  const {
    selectedMedia,
    postText,
    setPostText,
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
    if (variant === "challenge") {
      captureEvent(CHALLENGE_EVENTS.SUBMISSION_STARTED);
    }
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
      <FeatureActionButton
        completed={completed}
        disabled={completed || checkingCompletion}
        onPress={fadeIn}
        showIcon={false}
        title={t(completed ? config.completedLabelKey : config.ctaLabelKey)}
        tone={config.tone}
      />

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
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View
                  style={[
                    styles.modalHeader,
                    {
                      backgroundColor: config.headerBackgroundColor,
                      borderBottomColor: config.headerBorderColor,
                    },
                  ]}
                >
                  <View style={[styles.headerGlow, { backgroundColor: config.headerTintColor }]} />
                  <View style={[styles.headerRing, { borderColor: config.headerRingColor }]} />
                  <View style={[styles.headerFill, { backgroundColor: config.headerFillColor }]} />
                  <Text style={[styles.modalTitle, { color: config.headerAccentColor }]}>
                    {t("How did it go?")}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: config.headerAccentColor }]}>
                    {t(config.modalSubtitleKey)}
                  </Text>
                  <TouchableOpacity onPress={fadeOut} style={styles.closeButton}>
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={colors.light.text}
                      style={styles.closeIcon}
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                >
                  <View style={styles.modalBody}>
                    {selectedMedia ? (
                      <TouchableOpacity
                        style={styles.mediaPreviewContainer}
                        onPress={() => setFullScreenPreview(true)}
                        disabled={false}
                        activeOpacity={0.92}
                      >
                        <Image
                          source={{ uri: selectedMedia.thumbnailUri || selectedMedia.previewUrl }}
                          style={styles.mediaPreview}
                          resizeMode="cover"
                        />
                        {selectedMedia.isVideo && (
                          <View style={styles.mediaPreviewPlayOverlay}>
                            <MaterialIcons name="play-circle-filled" size={26} color="white" />
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.removeMediaButton}
                          onPress={handleRemoveMedia}
                          disabled={false}
                        >
                          <MaterialIcons name="close" size={12} color="white" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ) : null}

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
                      style={styles.textInput}
                      multiline
                      scrollEnabled
                    autoFocus
                    placeholder={t(config.placeholderTextKey)}
                    placeholderTextColor="#999"
                    maxLength={1000}
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
                  </View>
                </ScrollView>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.mediaActionButton,
                      {
                        backgroundColor: config.actionBackgroundColor,
                        borderColor: config.actionBorderColor,
                      },
                      selectedMedia ? styles.mediaActionButtonDisabled : null,
                    ]}
                    onPress={handleMediaUpload}
                    disabled={!!selectedMedia}
                  >
                    <MaterialIcons
                      name="add-photo-alternate"
                      size={20}
                      color={selectedMedia ? colors.neutral.darkGrey : config.headerAccentColor}
                    />
                    <Text
                      style={[
                        styles.mediaActionText,
                        { color: selectedMedia ? colors.neutral.darkGrey : config.headerAccentColor },
                      ]}
                    >
                      {t("Add media")}
                    </Text>
                  </TouchableOpacity>

                  <FeatureActionButton
                    disabled={isSubmitting}
                    fullWidth={false}
                    onPress={onSubmit}
                    showIcon={false}
                    style={styles.submitButton}
                    title={t(isSubmitting ? "Submitting..." : "Submit")}
                    tone={config.tone}
                    variant="pill"
                  />
                </View>
              </View>
            </View>
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
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: -12,
    marginHorizontal: -20,
    marginTop: "auto",
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderColor: colors.light.accent2,
    borderRadius: 999,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    top: 18,
    width: 36,
  },
  closeIcon: {
    transform: [{ translateX: 0.5 }, { translateY: 0.5 }],
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
  mediaActionButton: {
    alignItems: "center",
    borderRadius: 48,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 1,
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  mediaActionButtonDisabled: {
    backgroundColor: "#F3F3F3",
    borderColor: "#DADADA",
  },
  mediaActionText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
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
  headerFill: {
    borderRadius: 999,
    height: 12,
    position: "absolute",
    right: 34,
    top: 36,
    transform: [{ rotate: "-18deg" }],
    width: 76,
  },
  headerGlow: {
    borderRadius: 999,
    height: 170,
    position: "absolute",
    right: -46,
    top: -60,
    width: 170,
  },
  headerRing: {
    borderRadius: 999,
    borderWidth: 1,
    height: 108,
    position: "absolute",
    right: -14,
    top: 22,
    transform: [{ rotate: "16deg" }],
    width: 108,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 20,
    marginHorizontal: -20,
    marginTop: -20,
    overflow: "hidden",
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    position: "relative",
  },
  modalOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    flex: 1,
  },
  modalBody: {
    flexGrow: 1,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "82%",
    opacity: 0.82,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 25,
    marginBottom: 6,
    maxWidth: "82%",
  },
  mediaPreview: {
    backgroundColor: colors.light.accent3,
    borderRadius: 18,
    height: "100%",
    width: "100%",
  },
  mediaPreviewContainer: {
    borderRadius: 18,
    height: 96,
    marginBottom: 4,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  mediaPreviewPlayOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 18,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
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
  removeMediaButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 18,
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
    alignSelf: "flex-end",
  },
  textInput: {
    backgroundColor: "#FCFBF9",
    borderColor: colors.light.accent2,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.light.text,
    flexGrow: 1,
    marginVertical: 10,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 130,
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: "top",
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
});
