import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  Share,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Animated,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CommentsModal } from "./Comments";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { Image } from "expo-image";
import { useAuth } from "../contexts/AuthContext";
import { User, UserProfile } from "../models/User";
import { useFetchComments } from "../hooks/useFetchComments";
import { router } from "expo-router";
import { Post as PostType } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import ImageViewer from "react-native-image-zoom-viewer";
import { useLikes } from "../contexts/LikesContext";
import { Loader } from "./Loader";
import Icon from "react-native-vector-icons/FontAwesome";
import VideoPlayer from "./VideoPlayer";
import { Video, ResizeMode } from "expo-av";
import { formatRelativeTime } from "../utils/time";
import { imageService } from "../services/imageService";
import { ActionsMenu } from "./ActionsMenu";
import { captureEvent } from "../lib/posthog";
import { POST_EVENTS } from "../constants/analyticsEvents";
import { translationService } from "../services/translationService";

interface PostProps {
  post: PostType;
  postUser: User | UserProfile;
  isPostPage?: boolean;
  onPostDeleted?: () => void;
}

const Post: React.FC<PostProps> = ({ post, postUser, isPostPage = false, onPostDeleted }) => {
  const { t } = useLanguage();
  const { likedPosts, likeCounts, togglePostLike } = useLikes();
  const { user, isAdmin } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const {
    comments: commentList,
    loading: commentsLoading,
    fetchComments,
    addComment: addCommentMutation,
    isAddingComment,
  } = useFetchComments(post.id);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const lastTapTime = useRef<number>(0);
  const singleTapTimer = useRef<NodeJS.Timeout | null>(null);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
      }
    };
  }, []);

  const handleLikePress = async () => {
    if (!user) return;
    await togglePostLike(post.id, user.id, post.user_id);
  };

  const handleCommentAdded = (increment: number) => {
    setCommentCount(commentCount + increment);
  };

  const handleTranslate = async () => {
    if (!post.body || isTranslating) return;

    setIsTranslating(true);
    const result = await translationService.translateToEnglish(post.body);
    setIsTranslating(false);

    if (result.translatedText) {
      setTranslatedText(result.translatedText);
    } else if (result.error) {
      console.error('Translation error:', result.error);
    }
  };

  const isVideo = (source: string) => {
    return source.match(/\.(mp4|mov|avi|wmv)$/i);
  };

  const showHeartAnimation = () => {
    // Reset animation values
    heartScale.setValue(0);
    heartOpacity.setValue(0);

    // Animate heart appearing
    Animated.parallel([
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1.0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(heartScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTapTime.current && now - lastTapTime.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
        singleTapTimer.current = null;
      }
      handleLikePress();
      showHeartAnimation();
      lastTapTime.current = 0;
    } else {
      // First tap - wait for potential second tap
      lastTapTime.current = now;
      singleTapTimer.current = setTimeout(() => {
        // Single tap - open fullscreen/modal only if there's media
        if (post.media?.file_path) {
          if (isVideo(post.media.file_path)) {
            setShowVideoModal(true);
            captureEvent(POST_EVENTS.VIDEO_PLAYED, {
              post_id: post.id,
              is_challenge_post: !!post.challenge_id,
            });
          } else {
            setShowFullScreenImage(true);
            captureEvent(POST_EVENTS.MEDIA_VIEWED, {
              post_id: post.id,
              is_challenge_post: !!post.challenge_id,
            });
          }
        }
        lastTapTime.current = 0;
        singleTapTimer.current = null;
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const handleOpenComments = () => {
    setShowComments(true);
    // React Query automatically fetches comments, but we can refetch to ensure fresh data
    fetchComments();
    captureEvent(POST_EVENTS.COMMENTS_OPENED, {
      post_id: post.id,
      comment_count: commentCount,
      is_challenge_post: !!post.challenge_id,
    });
  };

  const handleProfilePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push(`/profile/${postUser.id}`);
    captureEvent(POST_EVENTS.PROFILE_CLICKED, {
      post_id: post.id,
      target_user_id: postUser.id,
    });
  };

  const handleChallengePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (post.challenge_id) {
      router.push(`/challenge/${post.challenge_id}`);
      captureEvent(POST_EVENTS.CHALLENGE_CLICKED, {
        post_id: post.id,
        challenge_id: post.challenge_id,
      });
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
      captureEvent(POST_EVENTS.SHARED, {
        post_id: post.id,
        is_challenge_post: !!post.challenge_id,
      });
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

  const renderMedia = () => {
    if (!post.media?.file_path) return null;

    const heartAnimationStyle = {
      transform: [{ scale: heartScale }],
      opacity: heartOpacity,
    };

    if (isVideo(post.media?.file_path)) {
      return (
        <>
          <Pressable onPress={handleDoubleTap} style={{ position: "relative" }}>
            <Video
              source={{ uri: post.media?.file_path }}
              style={contentStyle}
              resizeMode={ResizeMode.COVER}
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
            <Animated.View style={[heartOverlayStyle, heartAnimationStyle]} pointerEvents="none">
              <Icon name="heart" size={64} color="#eb656b" />
            </Animated.View>
          </Pressable>
          <VideoPlayer
            videoUri={post.media?.file_path}
            visible={showVideoModal}
            onClose={() => setShowVideoModal(false)}
          />
        </>
      );
    }
    return (
      <Pressable onPress={handleDoubleTap} style={{ position: "relative" }}>
        <Image
          source={{ uri: post.media?.file_path }}
          style={mediaContentStyle}
          cachePolicy="memory-disk"
          contentFit="cover"
          transition={200}
        />
        <Animated.View style={[heartOverlayStyle, heartAnimationStyle]} pointerEvents="none">
          <Icon name="heart" size={64} color="#eb656b" />
        </Animated.View>
      </Pressable>
    );
  };

  // welcome posts are rendered differently
  if (post.is_welcome) {
    const goToProfile = () => {
      if (postUser?.id) {
        router.push(`/profile/${postUser.id}`);
      }
    };

    return (
      <View style={welcomePostStyle}>
        <Text style={{ fontSize: 14 }}>👋</Text>
        <Text style={welcomeTextStyle}>
          {t("hi")}{" "}
          <Text style={welcomeUsernameStyle} onPress={goToProfile}>
            {postUser?.name || t("Someone")}
          </Text>
          {t(", welcome to the StepnOut community!")}
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      // onPress={handlePostPress}
      style={[containerStyle, post.challenge_id ? challengeContainerStyle : null, { position: "relative" }]}
    >
      <View style={headerStyle}>
        <TouchableOpacity onPress={handleProfilePress}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={profilePictureStyle} />
          ) : (
            <View style={defaultProfilePictureStyle}>
              <MaterialCommunityIcons name="account-circle" size={40} color="#e1e1e1" />
            </View>
          )}
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
            onPostDeleted?.();
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
      {post.body && !post.media?.file_path ? (
        <Pressable onPress={handleDoubleTap}>
          <Text style={textStyle}>{post.body}</Text>
          {translatedText && (
            <View style={translationContainerStyle}>
              <Text style={translationLabelStyle}>Translation:</Text>
              <Text style={translationTextStyle}>{translatedText}</Text>
            </View>
          )}
        </Pressable>
      ) : (
        <>
          {post.body && <Text style={textStyle}>{post.body}</Text>}
          {translatedText && (
            <View style={translationContainerStyle}>
              <Text style={translationLabelStyle}>Translation:</Text>
              <Text style={translationTextStyle}>{translatedText}</Text>
            </View>
          )}
          {renderMedia()}
        </>
      )}
      {!post.media?.file_path && (
        <Animated.View
          style={[
            heartOverlayStyle,
            {
              transform: [{ scale: heartScale }],
              opacity: heartOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <Icon name="heart" size={64} color="#eb656b" />
        </Animated.View>
      )}
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
          {isAdmin && post.body && (
            <TouchableOpacity onPress={handleTranslate} disabled={isTranslating}>
              <View style={iconContainerStyle}>
                <Icon
                  name="language"
                  size={16}
                  color={translatedText ? colors.light.primary : colors.neutral.grey1}
                />
                <Text style={iconTextStyle}>
                  {isTranslating ? "..." : translatedText ? "Translated" : "Translate"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
              behavior="padding"
              style={modalContainerStyle}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
              <CommentsModal
                initialComments={commentList}
                onClose={() => setShowComments(false)}
                loading={commentsLoading}
                postId={post.id}
                postUserId={postUser.id}
                onCommentAdded={handleCommentAdded}
                addComment={addCommentMutation}
                isAddingComment={isAddingComment}
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

const defaultProfilePictureStyle: ViewStyle = {
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

const heartOverlayStyle: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  pointerEvents: "none",
};

const timestampStyle: TextStyle = {
  color: "#666",
  fontSize: 11,
  marginLeft: 5,
};

const welcomePostStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 8,
  gap: 6,
};

const welcomeTextStyle: TextStyle = {
  color: colors.neutral.grey3,
  fontSize: 13,
};

const welcomeUsernameStyle: TextStyle = {
  fontWeight: "600",
  color: colors.light.text,
};

const translationContainerStyle: ViewStyle = {
  backgroundColor: colors.light.accent2,
  borderLeftWidth: 3,
  borderLeftColor: colors.light.primary,
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginTop: 8,
  borderRadius: 4,
};

const translationLabelStyle: TextStyle = {
  fontSize: 11,
  color: colors.light.primary,
  fontWeight: "600",
  marginBottom: 4,
};

const translationTextStyle: TextStyle = {
  fontSize: 14,
  color: colors.light.text,
};

export default Post;
