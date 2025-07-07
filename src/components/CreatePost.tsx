import React, { useState } from "react";
import {
  View,
  StyleSheet,
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

const CreatePost = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useLanguage();
  const inputAccessoryViewID = "uniqueID";

  const {
    selectedMedia,
    setPostText,
    isUploading,
    uploadProgress,
    handleMediaUpload,
    handleRemoveMedia,
    handleSubmit,
  } = useMediaUpload({
    onUploadComplete: () => setModalVisible(false),
    successMessage: t("Post sent successfully!"),
  });

  const onSubmit = async () => {
    if (!user) {
      alert(t("You must be logged in to submit a post."));
      return;
    }

    await handleSubmit({ user_id: user.id });
  };

  return (
    <>
      <TouchableOpacity style={uploadButtonStyle} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        transparent={true}
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
            >
              <View style={modalContentStyle}>
                <View style={modalHeaderStyle}>
                  <TouchableOpacity style={closeButtonStyle} onPress={() => setModalVisible(false)}>
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
                          : selectedMedia.previewUrl 
                      }}
                      style={mediaPreviewStyle}
                      resizeMode="contain"
                    />
                    <TouchableOpacity style={removeMediaButtonStyle} onPress={handleRemoveMedia}>
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
                  scrollEnabled={true}
                  textAlignVertical="top"
                  placeholder={t(
                    "Share your thoughts, start a discussion, or share an achievement..."
                  )}
                  placeholderTextColor="#999"
                  onChangeText={setPostText}
                  inputAccessoryViewID={inputAccessoryViewID}
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
                    <Text style={[buttonTextStyle, isUploading && disabledButtonTextStyle]}>
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
                        style={[
                          progressBarFillStyle, 
                          { width: `${uploadProgress}%` }
                        ]} 
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

const mediaUploadContainerStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 12,
};

const buttonTextStyle: TextStyle = {
  color: "white",
  fontWeight: "bold",
};

const disabledButtonStyle: ViewStyle = {
  backgroundColor: "#cccccc",
};

const disabledButtonTextStyle: TextStyle = {
  color: "#666666",
};

const keyboardViewStyle: ViewStyle = {
  flex: 1,
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

const mediaUploadIconStyle: ViewStyle = {
  alignItems: "flex-start",
  paddingBottom: 4,
};

const modalContainerStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  flex: 1,
  justifyContent: "center",
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
  marginBottom: 20,
};

const closeButtonStyle: ViewStyle = {
  padding: 8,
  position: "absolute",
  right: -15,
  top: -15,
};

const modalScrollStyle: ViewStyle = {
  maxHeight: "100%",
  width: "100%",
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

const scrollContentStyle: ViewStyle = {
  flexGrow: 1,
  justifyContent: "center",
  paddingHorizontal: "5%",
};

const submitButtonStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: colors.light.accent,
  borderRadius: 48,
  padding: 8,
  alignSelf: "flex-end",
  paddingHorizontal: 20,
};

const textInputStyle: TextStyle = {
  borderColor: "#ccc",
  borderRadius: 8,
  borderWidth: 1,
  height: 130,
  marginTop: 14,
  marginBottom: 4,
  padding: 10,
  textAlignVertical: "top",
};

const uploadButtonStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: colors.light.accent,
  borderRadius: 28,
  height: 56,
  justifyContent: "center",
  width: 56,
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

export default CreatePost;
