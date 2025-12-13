import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { colors } from "../constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Loader } from "./Loader";
import { useMediaUpload } from "../hooks/useMediaUpload";
import ImageViewer from "react-native-image-zoom-viewer";

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

  const hasContent = inputText.trim().length > 0 || selectedMedia;

  // Animated value for send button
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(buttonAnimation, {
      toValue: hasContent ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [hasContent, buttonAnimation]);

  const animatedButtonStyle = {
    backgroundColor: buttonAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.neutral.grey2, colors.light.accent],
    }),
    transform: [
      {
        scale: buttonAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };

  return (
    <View style={containerStyle}>
      {/* Media preview if selected */}
      {isUploading ? (
        <View style={mediaPreviewContainerStyle}>
          <Loader />
        </View>
      ) : selectedMedia ? (
        <Pressable style={mediaPreviewContainerStyle} onPress={() => setShowFullScreenImage(true)}>
          <Image
            source={{
              uri: selectedMedia.isVideo
                ? selectedMedia.thumbnailUri || selectedMedia.previewUrl
                : selectedMedia.previewUrl,
            }}
            style={mediaPreviewStyle}
            resizeMode="cover"
          />
          <TouchableOpacity style={removeMediaButtonStyle} onPress={handleRemoveMedia}>
            <MaterialIcons name="close" size={12} color="white" />
          </TouchableOpacity>
          {selectedMedia.isVideo && (
            <View style={videoIndicatorStyle}>
              <MaterialIcons name="play-circle-filled" size={20} color="white" />
            </View>
          )}
        </Pressable>
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

        <TouchableOpacity
          onPress={onSubmit}
          disabled={!hasContent || isUploading}
          activeOpacity={0.8}
        >
          <Animated.View style={[sendButtonStyle, animatedButtonStyle]}>
            <MaterialIcons
              name="send"
              size={16}
              color={hasContent ? "white" : colors.light.lightText}
            />
          </Animated.View>
        </TouchableOpacity>
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

const sendButtonStyle: ViewStyle = {
  backgroundColor: colors.light.accent,
  borderRadius: 14,
  padding: 6,
  alignItems: "center",
  justifyContent: "center",
};

const mediaPreviewContainerStyle: ViewStyle = {
  position: "relative",
  width: "100%",
  height: 100,
  borderRadius: 8,
  marginBottom: 8,
  overflow: "hidden",
  backgroundColor: colors.neutral.grey2,
};

const mediaPreviewStyle: ImageStyle = {
  width: "100%",
  height: "100%",
  borderRadius: 8,
};

const removeMediaButtonStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.6)",
  borderRadius: 10,
  height: 20,
  justifyContent: "center",
  position: "absolute",
  right: 6,
  top: 6,
  width: 20,
};

const videoIndicatorStyle: ViewStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: [{ translateX: -10 }, { translateY: -10 }],
  backgroundColor: "rgba(0,0,0,0.5)",
  borderRadius: 10,
  padding: 2,
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

