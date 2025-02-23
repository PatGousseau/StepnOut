import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  Alert,
  Share,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CommentsModal } from "./Comments";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { Image } from "expo-image";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../models/User";
import { useFetchComments } from "../hooks/useFetchComments";
import { router } from "expo-router";
import { Menu, MenuTrigger, MenuOptions, MenuOption } from "react-native-popup-menu";
import { Post as PostType } from "../types";
import { postService } from "../services/postService";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import ImageViewer from "react-native-image-zoom-viewer";
import { useLikes } from "../contexts/LikesContext";
import { Loader } from "./Loader";
import Icon from "react-native-vector-icons/FontAwesome";
import VideoPlayer from "./VideoPlayer";
import { Video } from "expo-av";
import { formatRelativeTime } from "../utils/time";
import { imageService } from "../services/imageService";
import { ActionsMenu } from "./ActionsMenu";

interface PostProps {
  post: PostType;
  postUser: User;
  setPostCounts?: React.Dispatch<
    React.SetStateAction<{ [key: number]: { likes: number; comments: number } }>
  >;
  isPostPage?: boolean;
  onPostDeleted?: () => void;
}

const Post: React.FC<PostProps> = ({ post, postUser, setPostCounts, isPostPage = false }) => {
  const { t } = useLanguage();
  const { likedPosts, likeCounts, togglePostLike } = useLikes();
  const { user } = useAuth();

  if (!post) return null;

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const {
    comments: commentList,
    loading: commentsLoading,
    fetchComments,
  } = useFetchComments(post.id);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (postUser?.profileImageUrl) {
        try {
          const urls = await imageService.getProfileImageUrl(postUser.profileImageUrl, "small");
          setProfileImageUrl(urls.fullUrl);
        } catch (error) {
          console.error("Error loading profile image:", error);
        }
      }
    };

    loadProfileImage();
  }, [postUser?.profileImageUrl]);

  const updateParentCounts = useCallback(
    (newCommentCount: number) => {
      if (setPostCounts) {
        setPostCounts((prevCounts) => ({
          ...prevCounts,
          [post.id]: {
            likes: likeCounts[post.id] || 0,
            comments: newCommentCount,
          },
        }));
      }
    },
    [post.id, setPostCounts, likeCounts]
  );

  const handleLikePress = async () => {
    if (!user) return;
    await togglePostLike(post.id, user.id, post.user_id);
  };

  const handleCommentAdded = (increment: number) => {
    const newCommentCount = commentCount + increment;
    setCommentCount(newCommentCount);
    updateParentCounts(newCommentCount);
  };

  const isVideo = (source: string) => {
    return source.match(/\.(mp4|mov|avi|wmv)$/i);
  };

  const handleMediaPress = () => {
    if (post.media?.file_path && isVideo(post.media.file_path)) {
      return;
    }

    setShowFullScreenImage(true);
  };

  const handleOpenComments = () => {
    setShowComments(true);
    fetchComments();
  };

  const handleProfilePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push(`/profile/${postUser.id}`);
  };

  const handleChallengePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (post.challenge_id) {
      router.push(`/challenge/${post.challenge_id}`);
    }
  };

  const handleImageLongPress = async () => {
    try {
      const urls = await imageService.getPostImageUrl(post.media?.file_path || "", "original");

      // Download the image first
      const response = await fetch(urls.fullUrl);
      const blob = await response.blob();
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      });

      if (Platform.OS === "ios") {
        await Share.share({
          url: base64Data as string,
        });
      } else {
        await Share.share({
          message: urls.fullUrl,
          url: urls.fullUrl,
        });
      }
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

  const renderMedia = () => {
    if (!post.media?.file_path) return null;

    if (isVideo(post.media?.file_path)) {
      return (
        <>
          <TouchableOpacity onPress={() => setShowVideoModal(true)} activeOpacity={0.9}>
            <Video
              source={{ uri: post.media?.file_path }}
              style={contentStyle}
              resizeMode="cover"
              shouldPlay={false}
              isMuted={true}
              isLooping={false}
              useNativeControls={false}
              posterSource={{ uri: post.media?.file_path }}
              posterStyle={mediaContentStyle}
            />
            <View style={videoOverlayStyle}>
              <Icon name="play-circle" size={48} color="white" />
            </View>
          </TouchableOpacity>
          <VideoPlayer
            videoUri={post.media?.file_path}
            visible={showVideoModal}
            onClose={() => setShowVideoModal(false)}
          />
        </>
      );
    }
    return (
      <TouchableOpacity onPress={handleMediaPress} activeOpacity={1}>
        <Image
          source={{ uri: post.media?.file_path }}
          style={mediaContentStyle}
          cachePolicy="memory-disk"
          contentFit="cover"
          transition={200}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Pressable
      // onPress={handlePostPress}
      style={[containerStyle, post.challenge_id ? challengeContainerStyle : null]}
    >
      <View style={headerStyle}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={
              profileImageUrl
                ? { uri: profileImageUrl }
                : require("../assets/images/default-pfp.png")
            }
            style={profilePictureStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfilePress} style={nameContainerStyle}>
          <View style={userInfoContainerStyle}>
            <Text style={nameStyle}>{postUser?.name || t("Unknown")}</Text>
            <Text style={usernameStyle}>@{postUser?.username || t("unknown")}</Text>
          </View>
        </TouchableOpacity>
        <Text style={timestampStyle}>{formatRelativeTime(post.created_at)}</Text>
        <ActionsMenu
          type="post"
          contentId={post.id}
          contentUserId={post.user_id}
          onDelete={() => {
            if (isPostPage) {
              router.back();
            }
          }}
        >
          <Icon name="ellipsis-h" size={16} color={colors.neutral.grey1} />
        </ActionsMenu>
      </View>
      {post.challenge_id && (
        <TouchableOpacity onPress={handleChallengePress}>
          <View style={challengeBoxStyle}>
            <Text style={challengeTitleStyle} numberOfLines={1} ellipsizeMode="tail">
              <Text style={{ fontWeight: "bold" }}>{t("Challenge:")}</Text> {post.challenge_title}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      {post.body && <Text style={textStyle}>{post.body}</Text>}
      {renderMedia()}
      <View>
        <View style={footerStyle}>
          <TouchableOpacity onPress={handleLikePress}>
            <View style={iconContainerStyle}>
              <Icon
                name={likedPosts[post.id] ? "heart" : "heart-o"}
                size={16}
                color={likedPosts[post.id] ? "#eb656b" : colors.neutral.grey1}
              />
              <Text style={iconTextStyle}>{likeCounts[post.id] || 0}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenComments}>
            <View style={iconContainerStyle}>
              <Icon name="comment-o" size={16} color={colors.neutral.grey1} />
              <Text style={iconTextStyle}>{commentCount.toString()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={showComments}
          onRequestClose={() => setShowComments(false)}
        >
          <View style={modalOverlayStyle}>
            <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
              <View style={modalBackgroundStyle} />
            </TouchableWithoutFeedback>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={modalContainerStyle}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
            >
              <CommentsModal
                initialComments={commentList}
                onClose={() => setShowComments(false)}
                loading={commentsLoading}
                postId={post.id}
                postUserId={postUser.id}
                onCommentAdded={handleCommentAdded}
              />
            </KeyboardAvoidingView>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent
          visible={showFullScreenImage}
          onRequestClose={() => setShowFullScreenImage(false)}
        >
          <View style={fullScreenContainerStyle}>
            <View style={fullScreenHeaderStyle}>
              <TouchableOpacity
                style={closeFullScreenButtonStyle}
                onPress={() => setShowFullScreenImage(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={saveButtonStyle} onPress={handleImageLongPress}>
                <MaterialCommunityIcons
                  name="send"
                  size={24}
                  color="white"
                  style={{ transform: [{ rotate: "-45deg" }] }}
                />
              </TouchableOpacity>
            </View>
            <ImageViewer
              imageUrls={[{ url: post.media?.file_path || "" }]}
              enableSwipeDown
              onSwipeDown={() => setShowFullScreenImage(false)}
              renderIndicator={() => <></>}
              onLongPress={handleImageLongPress}
              saveToLocalByLongPress={false}
              enablePreload={true}
              style={{ width: "100%", height: "100%" } as ViewStyle}
              onClick={() => setShowFullScreenImage(false)}
              loadingRender={() => <Loader />}
              backgroundColor="rgba(0, 0, 0, 0.9)"
            />
          </View>
        </Modal>
      </View>
    </Pressable>
  );
};

const challengeBoxStyle: ViewStyle = {
  alignSelf: "flex-start",
  backgroundColor: colors.light.accent2,
  borderColor: colors.light.primary,
  borderRadius: 8,
  borderWidth: 1.25,
  marginBottom: 4,
  marginTop: 4,
  paddingHorizontal: 16,
  paddingVertical: 4,
  width: "100%",
};

const challengeContainerStyle: ViewStyle = {
  // backgroundColor: '#ffeecc',
  // borderWidth: 1,
};

const challengeTitleStyle: TextStyle = {
  color: colors.light.primary,
  fontSize: 13,
};

const containerStyle: ViewStyle = {
  borderBottomColor: "#ccc",
  borderBottomWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  marginBottom: 8,
  padding: 10,
  paddingBottom: 16,
};

const footerStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  marginLeft: 5,
  marginTop: 10,
};

const fullScreenContainerStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  flex: 1,
  justifyContent: "center",
};

const fullScreenHeaderStyle: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  position: "absolute",
  top: 40,
  right: 0,
  left: 0,
  padding: 16,
  zIndex: 9999,
};

const fullScreenImageStyle: ImageStyle = {
  height: "100%",
  width: "100%",
};

const headerStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  marginBottom: 8,
};

const iconContainerStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  marginRight: 32,
};

const iconTextStyle: TextStyle = {
  color: "#5A5A5A",
  fontSize: 14,
  marginLeft: 4,
};

const contentStyle: ViewStyle = {
  aspectRatio: 1,
  borderRadius: 8,
  height: undefined,
  marginTop: 8,
  width: "100%",
};

const mediaContentStyle: ImageStyle = {
  aspectRatio: 1,
  borderRadius: 8,
  height: undefined,
  marginTop: 8,
  width: "100%",
};

const modalBackgroundStyle: ViewStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  bottom: 0,
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
};

const modalContainerStyle: ViewStyle = {
  flex: 1,
  height: "100%",
  justifyContent: "flex-end",
  maxHeight: "75%",
  width: "100%",
};

const modalOverlayStyle: ViewStyle = {
  flex: 1,
  height: "100%",
  justifyContent: "flex-end",
};

const nameStyle: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
};

const nameContainerStyle: ViewStyle = {
  flex: 1,
  justifyContent: "center",
};

const profilePictureStyle: ImageStyle = {
  borderRadius: 20,
  height: 40,
  marginRight: 10,
  width: 40,
};

const textStyle: TextStyle = {
  fontSize: 14,
  marginBottom: 8,
};

const userInfoContainerStyle: ViewStyle = {
  flexDirection: "column",
};

const usernameStyle: TextStyle = {
  color: "#666",
  fontSize: 12,
};

const closeFullScreenButtonStyle: ViewStyle = {
  padding: 8,
};

const saveButtonStyle: ViewStyle = {
  padding: 8,
};

const videoOverlayStyle: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0)",
};

const timestampStyle: TextStyle = {
  color: "#666",
  fontSize: 11,
  marginLeft: 5,
};

export default Post;
