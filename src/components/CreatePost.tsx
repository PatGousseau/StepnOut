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
import { supabase } from "../lib/supabase";
import { Text } from "./StyledText";
import { useAuth } from "../contexts/AuthContext";
import { uploadMedia } from "../utils/handleMediaUpload";
import { useLanguage } from "../contexts/LanguageContext";
import { isVideo as isVideoUtil } from "../utils/utils";
import { Loader } from "./Loader";

const CreatePost = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(null);
  const [postText, setPostText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputAccessoryViewID = "uniqueID";
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!user) {
      alert(t("You must be logged in to submit a post."));
      return;
    }

    try {
      await supabase.from("post").insert([
        {
          user_id: user.id,
          media_id: uploadedMediaId,
          body: postText,
          featured: false,
        },
      ]);

      setPostText("");
      setUploadedMediaId(null);
      setMediaPreview(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert(t("Error submitting post."));
    }
  };

  const handleMediaUpload = async () => {
    try {
      setIsUploading(true);
      const result = await uploadMedia({ allowVideo: true });
      if (result) {
        setUploadedMediaId(result.mediaId);
        setMediaPreview(result.mediaUrl);
        setIsVideo(isVideoUtil(result.mediaUrl));
        setVideoThumbnail(result.videoThumbnail);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(t("Error uploading file"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setUploadedMediaId(null);
    setMediaPreview(null);
    setIsVideo(false);
    setVideoThumbnail(null);
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
                ) : mediaPreview ? (
                  <View style={mediaPreviewContainerStyle}>
                    <Image
                      source={{ uri: isVideo ? videoThumbnail || mediaPreview : mediaPreview }}
                      style={mediaPreviewStyle}
                      resizeMode="contain"
                    />
                    <TouchableOpacity style={removeMediaButtonStyle} onPress={handleRemoveMedia}>
                      <MaterialIcons name="close" size={12} color="white" />
                    </TouchableOpacity>
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
                  value={postText}
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
                    onPress={handleSubmit}
                    disabled={isUploading}
                  >
                    <Text style={[buttonTextStyle, isUploading && disabledButtonTextStyle]}>
                      {t("Submit")}
                    </Text>
                  </TouchableOpacity>
                </View>
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

export default CreatePost;
