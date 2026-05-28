import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Modal,
} from "react-native";
import { colors } from "../constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AnimatedSendButton } from "./AnimatedSendButton";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Loader } from "./Loader";
import { useMediaUpload } from "../hooks/useMediaUpload";
import ImageViewer from "react-native-image-zoom-viewer";
import { MediaGrid } from "./MediaGrid";

const POST_PROMPT_KEYS = [
  "What made you step outside your comfort zone today?",
  "Share a small win from pushing your boundaries...",
  "What's something you've been avoiding but want to try?",
  "Describe a moment you surprised yourself recently...",
  "Share a lesson from a time you felt uncomfortable...",
  "What would you do if fear wasn't holding you back?",
  "Tell us about an unexpected conversation you had...",
  "What's one thing that scared you but was worth it?",
  "Reflect on a time you grew from discomfort...",
];

interface InlineCreatePostProps {
  onPostCreated?: () => void;
  refreshKey?: number;
}

const InlineCreatePost = ({ onPostCreated, refreshKey = 0 }: InlineCreatePostProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [inputText, setInputText] = useState("");
  
  // Pick a random prompt when refreshKey changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const placeholderKey = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * POST_PROMPT_KEYS.length);
    return POST_PROMPT_KEYS[randomIndex];
  }, [refreshKey]);
  
  const placeholder = t(placeholderKey);
  const [isFocused, setIsFocused] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);

  const {
    selectedMedia,
    selectedMediaItems,
    isUploading,
    handleMediaUpload,
    handleRemoveMedia,
    handleSubmit,
    setPostText,
  } = useMediaUpload({
    onUploadComplete: () => {
      setInputText("");
      if (onPostCreated) {
        onPostCreated();
      }
    },
    successMessage: t("Post sent successfully!"),
  });

  const onSubmit = async () => {
    if (!user) {
      alert(t("You must be logged in to submit a post."));
      return;
    }

    await handleSubmit({ user_id: user.id }, inputText);
    setInputText("");
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    setPostText(text);
  };

  const hasContent = inputText.trim().length > 0 || selectedMediaItems.length > 0;

  return (
    <View style={containerStyle}>
      {/* Media preview if selected */}
      {isUploading ? (
        <View style={mediaPreviewContainerStyle}>
          <Loader />
        </View>
      ) : selectedMediaItems.length > 0 ? (
        <MediaGrid
          items={selectedMediaItems.map((item) => ({
            uri: item.thumbnailUri || item.previewUrl,
            isVideo: item.isVideo,
            useImageForVideo: true,
          }))}
          onPress={() => setShowFullScreenImage(true)}
          onRemove={handleRemoveMedia}
          height={160}
          style={mediaPreviewContainerStyle}
        />
      ) : null}

      {/* Input row */}
      <View style={inputRowStyle}>
        <TextInput
          style={[textInputStyle, isFocused && textInputFocusedStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.light.lightText}
          value={inputText}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          maxLength={500}
        />
      </View>

      {/* Actions row */}
      <View style={actionsRowStyle}>
        <TouchableOpacity style={mediaButtonStyle} onPress={handleMediaUpload}>
          <MaterialIcons name="add-photo-alternate" size={20} color={colors.light.primary} />
        </TouchableOpacity>

        <AnimatedSendButton
          hasContent={!!hasContent}
          onPress={onSubmit}
          disabled={isUploading}
          size="medium"
        />
      </View>

      {/* Full screen image modal */}
      <Modal
        animationType="fade"
        transparent
        visible={showFullScreenImage}
        onRequestClose={() => setShowFullScreenImage(false)}
      >
        <View style={fullScreenContainerStyle}>
          <TouchableOpacity
            style={closeFullScreenButtonStyle}
            onPress={() => setShowFullScreenImage(false)}
          >
            <MaterialIcons name="close" size={28} color="white" />
          </TouchableOpacity>
          <ImageViewer
            imageUrls={[{ url: selectedMedia?.previewUrl || "" }]}
            enableSwipeDown
            onSwipeDown={() => setShowFullScreenImage(false)}
            renderIndicator={() => <></>}
            backgroundColor="rgba(0, 0, 0, 0.95)"
            onClick={() => setShowFullScreenImage(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const containerStyle: ViewStyle = {
  backgroundColor: colors.neutral.white,
  borderRadius: 12,
  padding: 10,
  marginBottom: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 1,
};

const inputRowStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
};

const textInputStyle: TextStyle = {
  flex: 1,
  fontSize: 14,
  color: colors.light.text,
  paddingVertical: 8,
  paddingHorizontal: 4,
  minHeight: 40,
  maxHeight: 100,
  textAlignVertical: "top",
};

const textInputFocusedStyle: TextStyle = {
  borderColor: colors.light.primary,
};

const actionsRowStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 4,
  paddingTop: 4,
  borderTopWidth: 1,
  borderTopColor: colors.neutral.grey2,
};

const mediaButtonStyle: ViewStyle = {
  padding: 2,
};


const mediaPreviewContainerStyle: ViewStyle = {
  width: "100%",
  marginBottom: 8,
};

const fullScreenContainerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.95)",
};

const closeFullScreenButtonStyle: ViewStyle = {
  position: "absolute",
  top: 50,
  right: 16,
  zIndex: 10,
  padding: 8,
};

export default InlineCreatePost;
