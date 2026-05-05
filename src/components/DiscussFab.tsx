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
  TextStyle,
  ViewStyle,
  ImageStyle,
} from "react-native";
import { colors } from "../constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text } from "./StyledText";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Loader } from "./Loader";
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
    isUploading,
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
      <TouchableOpacity
        style={[fabStyle, { bottom: bottomOffset }]}
        onPress={handleOpen}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("Start a discussion")}
      >
        <MaterialIcons name="chat-bubble-outline" size={18} color="white" />
        <Text style={fabLabelStyle}>{t("Discuss")}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
                  <Text style={modalTitleStyle}>{t("Start a discussion")}</Text>
                  <TouchableOpacity
                    style={closeButtonStyle}
                    onPress={() => setModalVisible(false)}
                  >
                    <MaterialIcons name="close" size={20} color={colors.light.text} />
                  </TouchableOpacity>
                </View>

                {isUploading ? (
                  <View style={mediaPreviewContainerStyle}>
                    <Loader />
                  </View>
                ) : selectedMedia ? (
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
                  onChangeText={setPostText}
                />

                <View style={mediaUploadContainerStyle}>
                  <TouchableOpacity style={mediaUploadIconStyle} onPress={handleMediaUpload}>
                    <MaterialIcons
                      name="add-photo-alternate"
                      size={24}
                      color={colors.light.primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[submitButtonStyle, isUploading && disabledButtonStyle]}
                    onPress={onSubmit}
                    disabled={isUploading}
                  >
                    <Text style={[submitTextStyle, isUploading && disabledButtonTextStyle]}>
                      {t("Submit")}
                    </Text>
                  </TouchableOpacity>
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
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  backgroundColor: colors.light.accent,
  borderRadius: 999,
  paddingHorizontal: 18,
  paddingVertical: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 6,
};

const fabLabelStyle: TextStyle = {
  color: "white",
  fontSize: 14,
  fontWeight: "700",
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
  borderRadius: 10,
  marginVertical: 20,
  padding: 20,
  width: "100%",
};

const modalHeaderStyle: ViewStyle = {
  position: "relative",
  marginBottom: 12,
};

const modalTitleStyle: TextStyle = {
  color: colors.light.text,
  fontSize: 18,
  fontWeight: "700",
};

const closeButtonStyle: ViewStyle = {
  padding: 8,
  position: "absolute",
  right: -12,
  top: -12,
};

const mediaPreviewContainerStyle: ViewStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: 1.5,
  borderRadius: 8,
  marginVertical: 10,
  overflow: "hidden",
};

const mediaPreviewStyle: ImageStyle = {
  width: "100%",
  height: "100%",
  borderRadius: 8,
  backgroundColor: "#f0f0f0",
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
  borderColor: "#ccc",
  borderRadius: 8,
  borderWidth: 1,
  height: 130,
  marginTop: 8,
  marginBottom: 4,
  padding: 10,
  textAlignVertical: "top",
};

const mediaUploadContainerStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 12,
};

const mediaUploadIconStyle: ViewStyle = {
  alignItems: "flex-start",
  paddingBottom: 4,
};

const submitButtonStyle: ViewStyle = {
  alignItems: "center",
  alignSelf: "flex-end",
  backgroundColor: colors.light.accent,
  borderRadius: 48,
  padding: 8,
  paddingHorizontal: 20,
};

const submitTextStyle: TextStyle = {
  color: "white",
  fontWeight: "bold",
};

const disabledButtonStyle: ViewStyle = {
  backgroundColor: "#cccccc",
};

const disabledButtonTextStyle: TextStyle = {
  color: "#666666",
};

const uploadProgressContainerStyle: ViewStyle = {
  marginTop: 10,
  padding: 10,
  backgroundColor: "#f5f5f5",
  borderRadius: 8,
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

export default DiscussFab;
