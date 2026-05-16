import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from "react-native";
import { colors } from "../constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text } from "./StyledText";
import { FeatureActionButton } from "./FeatureActionButton";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useMediaUpload } from "../hooks/useMediaUpload";
import { captureEvent } from "../lib/posthog";
import { POST_EVENTS } from "../constants/analyticsEvents";

interface DiscussFabProps {
  onPostCreated?: () => void;
  bottomOffset?: number;
}

const DiscussFab = ({ onPostCreated, bottomOffset = 24 }: DiscussFabProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    selectedMedia,
    setPostText,
    isSubmitting,
    uploadProgress,
    handleMediaUpload: baseHandleMediaUpload,
    handleRemoveMedia,
    handleSubmit,
  } = useMediaUpload({
    onUploadComplete: () => {
      setModalVisible(false);
      captureEvent(POST_EVENTS.CREATED, {
        has_media: !!selectedMedia,
        is_video: selectedMedia?.isVideo || false,
        source: "discuss_fab",
      });
      onPostCreated?.();
    },
    successMessage: t("Post sent successfully!"),
  });

  const handleOpen = () => {
    setModalVisible(true);
    captureEvent(POST_EVENTS.CREATE_MODAL_OPENED, { source: "discuss_fab" });
  };

  const handleMediaUpload = async () => {
    await baseHandleMediaUpload();
    captureEvent(POST_EVENTS.MEDIA_ATTACHED);
  };

  const onSubmit = async () => {
    if (!user) {
      alert(t("You must be logged in to submit a post."));
      return;
    }
    await handleSubmit({ user_id: user.id });
  };

  return (
    <>
      <FeatureActionButton
        fullWidth={false}
        icon={<MaterialIcons name="chat-bubble-outline" size={18} color="white" />}
        iconPosition="start"
        onPress={handleOpen}
        showIcon
        style={[fabStyle, { bottom: bottomOffset }]}
        title={t("Discuss")}
        tone="indigo"
        variant="pill"
      />

      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={keyboardViewStyle}
          keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
        >
          <View style={modalContainerStyle}>
            <ScrollView
              style={modalScrollStyle}
              contentContainerStyle={scrollContentStyle}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <View style={modalContentStyle}>
                <View style={modalHeaderStyle}>
                  <View style={headerGlowStyle} />
                  <View style={headerRingStyle} />
                  <View style={headerFillStyle} />
                  <Text style={modalTitleStyle}>{t("Start a discussion")}</Text>
                  <TouchableOpacity
                    style={closeButtonStyle}
                    onPress={() => setModalVisible(false)}
                  >
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={colors.light.text}
                      style={closeIconStyle}
                    />
                  </TouchableOpacity>
                </View>
                <View style={modalBodyStyle}>
                  {selectedMedia ? (
                    <View style={mediaPreviewContainerStyle}>
                      <Image
                        source={{
                          uri: selectedMedia.isVideo
                            ? selectedMedia.thumbnailUri || selectedMedia.previewUrl
                            : selectedMedia.previewUrl,
                        }}
                        style={mediaPreviewStyle}
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        style={removeMediaButtonStyle}
                        onPress={handleRemoveMedia}
                      >
                        <MaterialIcons name="close" size={12} color="white" />
                      </TouchableOpacity>
                      {selectedMedia.isVideo && (
                        <View style={videoIndicatorStyle}>
                          <MaterialIcons name="play-circle-filled" size={24} color="white" />
                        </View>
                      )}
                    </View>
                  ) : null}

                  <TextInput
                    style={textInputStyle}
                    multiline
                    scrollEnabled
                    textAlignVertical="top"
                    autoFocus
                  placeholder={t(
                    "Share your thoughts, start a discussion, or share an achievement..."
                  )}
                  placeholderTextColor="#999"
                  maxLength={1000}
                  onChangeText={setPostText}
                />

                  <View style={mediaUploadContainerStyle}>
                    <TouchableOpacity
                      style={[
                        mediaUploadButtonStyle,
                        selectedMedia ? mediaUploadButtonDisabledStyle : null,
                      ]}
                      onPress={handleMediaUpload}
                      disabled={!!selectedMedia}
                    >
                      <MaterialIcons
                        name="add-photo-alternate"
                        size={20}
                        color={selectedMedia ? colors.neutral.darkGrey : colors.light.primary}
                      />
                      <Text
                        style={[
                          mediaUploadTextStyle,
                          selectedMedia ? mediaUploadTextDisabledStyle : null,
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
                      style={submitButtonStyle}
                      title={t(isSubmitting ? "Submitting..." : "Submit")}
                      tone="indigo"
                      variant="pill"
                    />
                  </View>

                  {uploadProgress !== null && (
                    <View style={uploadProgressContainerStyle}>
                      <Text style={uploadProgressTextStyle}>
                        {t("Uploading media...")} {Math.round(uploadProgress)}%
                      </Text>
                      <View style={progressBarContainerStyle}>
                        <View
                          style={[progressBarFillStyle, { width: `${uploadProgress}%` }]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const fabStyle: ViewStyle = {
  position: "absolute",
  right: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 6,
};

const keyboardViewStyle: ViewStyle = {
  flex: 1,
};

const modalContainerStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  flex: 1,
  justifyContent: "center",
};

const modalScrollStyle: ViewStyle = {
  maxHeight: "100%",
  width: "100%",
};

const scrollContentStyle: ViewStyle = {
  flexGrow: 1,
  justifyContent: "center",
  paddingHorizontal: "5%",
};

const modalContentStyle: ViewStyle = {
  backgroundColor: "white",
  borderColor: colors.light.accent2,
  borderRadius: 26,
  borderWidth: 1,
  marginVertical: 20,
  overflow: "hidden",
  padding: 0,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.16,
  shadowRadius: 24,
  width: "100%",
  elevation: 8,
};

const modalHeaderStyle: ViewStyle = {
  position: "relative",
  backgroundColor: colors.light.accent3,
  borderBottomColor: colors.light.accent2,
  borderBottomWidth: 1,
  overflow: "hidden",
  paddingHorizontal: 20,
  paddingTop: 18,
  paddingBottom: 18,
};

const headerGlowStyle: ViewStyle = {
  backgroundColor: "rgba(103, 109, 160, 0.22)",
  borderRadius: 999,
  height: 160,
  position: "absolute",
  right: -42,
  top: -52,
  width: 160,
};

const headerRingStyle: ViewStyle = {
  borderColor: "rgba(77, 83, 130, 0.14)",
  borderRadius: 999,
  borderWidth: 1,
  height: 104,
  position: "absolute",
  right: -14,
  top: 18,
  transform: [{ rotate: "16deg" }],
  width: 104,
};

const headerFillStyle: ViewStyle = {
  backgroundColor: "rgba(77, 83, 130, 0.09)",
  borderRadius: 999,
  height: 12,
  position: "absolute",
  right: 28,
  top: 34,
  transform: [{ rotate: "-18deg" }],
  width: 74,
};

const modalTitleStyle: TextStyle = {
  color: colors.light.primary,
  fontSize: 21,
  fontWeight: "700",
  lineHeight: 25,
  maxWidth: "84%",
};

const closeButtonStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.82)",
  borderColor: colors.light.accent2,
  borderRadius: 999,
  borderWidth: 1,
  height: 36,
  justifyContent: "center",
  position: "absolute",
  right: 14,
  top: 14,
  width: 36,
};

const closeIconStyle: TextStyle = {
  transform: [{ translateX: 0.5 }, { translateY: 0.5 }],
};

const mediaPreviewContainerStyle: ViewStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: 1.5,
  borderRadius: 18,
  marginBottom: 14,
  overflow: "hidden",
};

const mediaPreviewStyle: ImageStyle = {
  width: "100%",
  height: "100%",
  borderRadius: 18,
  backgroundColor: colors.light.accent3,
};

const removeMediaButtonStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  borderRadius: 12,
  height: 18,
  justifyContent: "center",
  position: "absolute",
  right: 8,
  top: 8,
  width: 18,
};

const videoIndicatorStyle: ViewStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: [{ translateX: -12 }, { translateY: -12 }],
  backgroundColor: "rgba(0,0,0,0.5)",
  borderRadius: 12,
  padding: 4,
};

const textInputStyle: TextStyle = {
  backgroundColor: "#FCFBF9",
  borderColor: colors.light.accent2,
  borderRadius: 18,
  borderWidth: 1,
  height: 130,
  marginBottom: 6,
  paddingHorizontal: 14,
  paddingVertical: 14,
  textAlignVertical: "top",
  color: colors.light.text,
  fontSize: 15,
  lineHeight: 22,
};

const mediaUploadButtonStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: colors.light.accent3,
  borderColor: colors.light.accent2,
  borderRadius: 48,
  borderWidth: 1,
  flexShrink: 1,
  flexDirection: "row",
  gap: 8,
  justifyContent: "center",
  paddingHorizontal: 18,
  paddingVertical: 7,
};

const mediaUploadTextStyle: TextStyle = {
  color: colors.light.primary,
  flexShrink: 1,
  fontSize: 13,
  fontWeight: "600",
};

const mediaUploadTextDisabledStyle: TextStyle = {
  color: colors.neutral.darkGrey,
};

const mediaUploadButtonDisabledStyle: ViewStyle = {
  backgroundColor: "#F3F3F3",
  borderColor: "#DADADA",
};

const mediaUploadContainerStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 14,
};

const submitButtonStyle: ViewStyle = {
  alignSelf: "flex-end",
};

const uploadProgressContainerStyle: ViewStyle = {
  backgroundColor: colors.light.accent3,
  borderRadius: 14,
  marginTop: 14,
  padding: 12,
};

const uploadProgressTextStyle: TextStyle = {
  fontSize: 12,
  color: "#666",
  marginBottom: 5,
};

const progressBarContainerStyle: ViewStyle = {
  height: 4,
  backgroundColor: "#ddd",
  borderRadius: 2,
  overflow: "hidden",
};

const progressBarFillStyle: ViewStyle = {
  height: "100%",
  backgroundColor: colors.light.accent,
  borderRadius: 2,
};

const modalBodyStyle: ViewStyle = {
  padding: 20,
};

export default DiscussFab;
