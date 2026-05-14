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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { SideQuest } from "../types/sideQuests";
import { useMediaUpload } from "../hooks/useMediaUpload";
import { Loader } from "./Loader";
import { captureEvent } from "../lib/posthog";
import { SIDE_QUEST_EVENTS, USER_PROPERTIES } from "../constants/analyticsEvents";
import { setUserProperties } from "../lib/posthog";
import { supabase } from "../lib/supabase";

interface QuestCardProps {
  quest: SideQuest;
  tags?: string[];
}

interface ShareQuestExperienceProps {
  quest: SideQuest;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, tags }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.questPage}>
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <View style={styles.heroLineOne} />
        <View style={styles.heroLineTwo} />
        <View style={styles.heroLineThree} />

        <View style={styles.heroHeaderContent}>
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>{t("Today's quest")}</Text>
            <Text style={styles.heroTitle}>{quest.title}</Text>
            {!!quest.summary && <Text style={styles.heroSummary}>{quest.summary}</Text>}

            {tags && tags.length > 0 && (
              <View style={styles.heroPills}>
                {tags.slice(0, 2).map((tag) => (
                  <View key={tag} style={styles.heroPill}>
                    <Text style={styles.heroPillText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {!!quest.instructions && (
          <>
            <View style={styles.heroDivider} />
            <View style={styles.heroDetailSection}>
              <View style={styles.heroDetailHeader}>
                <View style={styles.heroDetailIcon}>
                  <MaterialCommunityIcons name="compass-outline" size={16} color={colors.sideQuest.text} />
                </View>
                <Text style={styles.heroDetailLabel}>{t("Try this")}</Text>
              </View>
              <Text style={styles.heroDetailText}>{quest.instructions}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export const ShareQuestExperience: React.FC<ShareQuestExperienceProps> = ({ quest }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [comfortRating, setComfortRating] = useState(3);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const questCompletionQuery = useQuery({
    queryKey: ["quest-completion", quest.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("post")
        .select("id")
        .eq("quest_id", quest.id)
        .eq("user_id", user.id)
        .limit(1);
      if (error) throw error;
      return !!data?.length;
    },
    enabled: !!user,
    staleTime: 30000,
  });

  const completed = questCompletionQuery.data ?? false;
  const checking = questCompletionQuery.isLoading;

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
      queryClient.setQueryData(["quest-completion", quest.id, user?.id], true);
      queryClient.invalidateQueries({ queryKey: ["home-posts"] });
      captureEvent(SIDE_QUEST_EVENTS.DAILY_QUEST_COMPLETED, {
        quest_id: quest.id,
        quest_title: quest.title,
        has_media: !!selectedMedia,
        is_video: selectedMedia?.isVideo || false,
        comfort_zone_rating: comfortRating,
      });
      setUserProperties({
        [USER_PROPERTIES.LAST_ACTIVE]: new Date().toISOString(),
      });
    },
    successMessage: t("Quest completed successfully!"),
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
    }).start(() => setModalVisible(false));
  };

  const onSubmit = async () => {
    if (!user) {
      alert(t("You must be logged in to submit a quest."));
      return;
    }

    const placeholderText = t("Just completed today's quest!");
    const textToSubmit = postText && postText.trim() ? postText : placeholderText;

    await handleSubmit(
      {
        user_id: user.id,
        quest_id: quest.id,
        comfort_zone_rating: comfortRating,
      },
      textToSubmit
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.ctaButton, completed && styles.completedButton]}
        onPress={fadeIn}
        disabled={completed || checking}
      >
        <View style={styles.ctaButtonContent}>
          {completed && (
            <MaterialIcons name="check-circle" size={20} color={colors.sideQuest.textStrong} style={styles.checkIcon} />
          )}
          <Text style={[styles.ctaButtonText, completed && styles.completedButtonText]}>
            {completed ? t("Quest completed!") : t("Mark as complete")}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} onRequestClose={fadeOut} statusBarTranslucent>
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.modalOverlay, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={fadeOut}>
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t("How did it go?")}</Text>
                  <Text style={styles.modalSubtitle}>{t("Share how you completed the quest")}</Text>
                  <TouchableOpacity onPress={fadeOut} style={styles.closeButton}>
                    <MaterialIcons name="close" size={20} color={colors.light.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.mediaUploadButton} onPress={handleMediaUpload}>
                  {selectedMedia ? (
                    <View style={styles.mediaSelectedRow}>
                      <Image
                        source={{ uri: selectedMedia.thumbnailUri || selectedMedia.previewUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                      <View style={styles.mediaSelectedTextContainer}>
                        <Text style={styles.mediaSelectedTitle}>
                          {t(selectedMedia.isVideo ? "Video attached" : "Photo attached")}
                        </Text>
                        <Text style={styles.mediaSelectedSubtitle}>{t("Tap to change")}</Text>
                      </View>
                      <TouchableOpacity style={styles.removeButtonInline} onPress={handleRemoveMedia} disabled={isUploading}>
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
                            <MaterialCommunityIcons name="video" size={18} color={colors.neutral.darkGrey} />
                          </View>
                          <Text style={styles.uploadButtonText}>{t("Add photo/video (optional)")}</Text>
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
                      <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                    </View>
                  </View>
                )}

                <TextInput
                  style={styles.textInput}
                  multiline
                  scrollEnabled
                  autoFocus
                  placeholder={t("Just completed today's quest!")}
                  placeholderTextColor="#999"
                  onChangeText={setPostText}
                />

                <View style={styles.comfortRow}>
                  <Text style={styles.comfortLabel}>{t("How far out of your comfort zone was this?")}</Text>
                  <View style={styles.comfortButtons}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[styles.comfortButton, comfortRating === value && styles.comfortButtonActive]}
                        onPress={() => setComfortRating(value)}
                      >
                        <Text style={[styles.comfortButtonText, comfortRating === value && styles.comfortButtonTextActive]}>
                          {value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, (isUploading || isSubmitting) && styles.submitButtonDisabled]}
                  onPress={onSubmit}
                  disabled={isUploading || isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {t(isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  comfortButton: {
    alignItems: "center",
    borderColor: "#E7BE8D",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  comfortButtonActive: {
    backgroundColor: colors.sideQuest.base,
    borderColor: colors.sideQuest.base,
  },
  comfortButtonText: {
    color: colors.sideQuest.text,
    fontSize: 13,
    fontWeight: "700",
  },
  comfortButtonTextActive: {
    color: colors.neutral.white,
  },
  comfortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  comfortLabel: {
    color: colors.light.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  comfortRow: {
    marginBottom: 18,
  },
  completedButton: {
    backgroundColor: colors.sideQuest.bgMuted,
  },
  completedButtonText: {
    color: colors.sideQuest.textStrong,
  },
  checkIcon: {
    marginRight: 8,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  ctaButton: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 10,
    padding: 14,
    width: "100%",
  },
  ctaButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  ctaButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: "700",
  },
  heroDetailHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  heroDetailIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroDetailLabel: {
    color: colors.sideQuest.text,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroDetailSection: {
    backgroundColor: "#FCF1E6",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
  },
  heroDetailText: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 23,
  },
  heroDivider: {
    backgroundColor: colors.sideQuest.border,
    height: 1,
  },
  heroCard: {
    backgroundColor: "#F7E4CC",
    borderColor: "#E2BA8D",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    overflow: "hidden",
    position: "relative",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
  },
  heroHeaderContent: {
    padding: 22,
  },
  heroEyebrow: {
    color: colors.sideQuest.text,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  heroGlow: {
    backgroundColor: "rgba(228, 169, 103, 0.34)",
    borderRadius: 999,
    height: 160,
    position: "absolute",
    right: -34,
    top: -46,
    width: 160,
  },
  heroLineOne: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 110,
    position: "absolute",
    right: -18,
    top: 18,
    transform: [{ rotate: "14deg" }],
    width: 110,
  },
  heroLineThree: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 86,
    position: "absolute",
    right: 18,
    top: 54,
    transform: [{ rotate: "-10deg" }],
    width: 86,
  },
  heroLineTwo: {
    backgroundColor: colors.sideQuest.fill,
    borderRadius: 999,
    height: 10,
    position: "absolute",
    right: 26,
    top: 32,
    transform: [{ rotate: "-18deg" }],
    width: 74,
  },
  heroPill: {
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroPillText: {
    color: colors.light.text,
    fontSize: 12,
    fontWeight: "600",
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 18,
  },
  heroSummary: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  heroTitle: {
    color: colors.light.text,
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 31,
  },
  keyboardView: {
    flex: 1,
  },
  mediaEmptyRow: {
    minHeight: 72,
    justifyContent: "center",
  },
  mediaIconsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  mediaSelectedRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  mediaSelectedSubtitle: {
    color: colors.light.lightText,
    fontSize: 13,
  },
  mediaSelectedTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  mediaSelectedTitle: {
    color: colors.light.text,
    fontSize: 14,
    fontWeight: "600",
  },
  mediaUploadButton: {
    borderColor: colors.neutral.grey2,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 14,
    position: "relative",
  },
  modalOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSubtitle: {
    color: colors.light.lightText,
    fontSize: 14,
    marginTop: 4,
  },
  modalTitle: {
    color: colors.light.text,
    fontSize: 20,
    fontWeight: "700",
  },
  progressBarContainer: {
    backgroundColor: colors.neutral.grey2,
    borderRadius: 999,
    height: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    backgroundColor: colors.sideQuest.base,
    height: "100%",
  },
  questPage: {
    paddingHorizontal: 4,
  },
  removeButtonInline: {
    padding: 4,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.sideQuest.base,
    borderRadius: 12,
    padding: 14,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.neutral.white,
    fontSize: 15,
    fontWeight: "700",
  },
  textInput: {
    borderColor: colors.neutral.grey2,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.light.text,
    fontSize: 14,
    marginBottom: 14,
    maxHeight: 120,
    minHeight: 110,
    padding: 14,
    textAlignVertical: "top",
  },
  thumbnail: {
    borderRadius: 10,
    height: 56,
    width: 56,
  },
  uploadButtonText: {
    color: colors.light.text,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadMediaContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  uploadProgressContainer: {
    marginBottom: 14,
  },
  uploadProgressText: {
    color: colors.light.lightText,
    fontSize: 12,
    marginBottom: 6,
  },
});
