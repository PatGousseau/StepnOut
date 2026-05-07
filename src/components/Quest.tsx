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
import { LinearGradient } from "expo-linear-gradient";
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
        <LinearGradient
          colors={["#EE944F", "#C77A3C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

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

      <View style={styles.detailSection}>
        <View style={styles.detailHeader}>
          <View style={styles.detailIcon}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color="#B86A20" />
          </View>
          <Text style={styles.detailLabel}>{t("Why this works")}</Text>
        </View>
        <Text style={styles.detailText}>{quest.why_it_hits}</Text>
      </View>

      <View style={styles.detailDivider} />

      <View style={styles.detailSection}>
        <View style={styles.detailHeader}>
          <View style={styles.detailIcon}>
            <MaterialCommunityIcons name="compass-outline" size={16} color="#B86A20" />
          </View>
          <Text style={styles.detailLabel}>{t("Try it like this")}</Text>
        </View>
        <Text style={styles.detailText}>{quest.instructions}</Text>
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
            <MaterialIcons name="check-circle" size={20} color="#7C4A14" style={styles.checkIcon} />
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
    backgroundColor: "#E78945",
    borderColor: "#E78945",
  },
  comfortButtonText: {
    color: "#B86A20",
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
    backgroundColor: "#F5D1A9",
  },
  completedButtonText: {
    color: "#7C4A14",
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
    backgroundColor: "#E78945",
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
  detailDivider: {
    backgroundColor: "rgba(184, 106, 32, 0.18)",
    height: 1,
    marginVertical: 22,
  },
  detailHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  detailIcon: {
    alignItems: "center",
    backgroundColor: "#FFE7CE",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  detailLabel: {
    color: "#B86A20",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  detailSection: {
    paddingHorizontal: 4,
  },
  detailText: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 23,
  },
  heroCard: {
    borderRadius: 20,
    marginBottom: 22,
    overflow: "hidden",
    padding: 22,
  },
  heroEyebrow: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  heroPill: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroPillText: {
    color: "#FFFFFF",
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
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  heroTitle: {
    color: "#FFFFFF",
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
    backgroundColor: "#E78945",
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
    backgroundColor: "#E78945",
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
