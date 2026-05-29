import React, { useEffect, useCallback, useState, useRef } from "react";
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
  TextInput,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MenuProvider } from "react-native-popup-menu";
import { AnimatedSendButton } from "./AnimatedSendButton";
import CommentPreviewRow from "./CommentPreviewRow";
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
import { useReactions } from "../contexts/ReactionsContext";
import { ReactionsBar } from "./ReactionsBar";
import { Loader } from "./Loader";
import Icon from "react-native-vector-icons/FontAwesome";
import VideoPlayer from "./VideoPlayer";
import { Video, ResizeMode } from "expo-av";
import { formatRelativeTime } from "../utils/time";
import { imageService } from "../services/imageService";
import { ActionsMenu } from "./ActionsMenu";
import { captureEvent } from "../lib/posthog";
import { POST_EVENTS, COMMENT_EVENTS } from "../constants/analyticsEvents";
import { sendCommentNotification } from "../lib/notificationsService";
import { translationService } from "../services/translationService";
import { useInstagramShare } from "../hooks/useInstagramShare";
import { usePostDeleteCleanup } from "../hooks/usePostDeleteCleanup";
import InstagramStoryCard from "./InstagramStoryCard";
import { MediaGrid } from "./MediaGrid";
import { useMediaSelection } from "../hooks/useMediaSelection";

interface PostProps {
  post: PostType;
  postUser: User | UserProfile;
  setPostCounts?: React.Dispatch<
    React.SetStateAction<{ [key: number]: { likes: number; comments: number } }>
  >;
  isPostPage?: boolean;
  onPostDeleted?: (post: PostType) => void;
}

const Post: React.FC<PostProps> = ({ post, postUser, setPostCounts, isPostPage = false, onPostDeleted }) => {
  const { t } = useLanguage();
  const { likedPosts, likeCounts, togglePostLike } = useLikes();
  const { postReactions, togglePostReaction } = useReactions();
  const { user, isAdmin, username: currentUserUsername } = useAuth();
  const cleanupAfterDelete = usePostDeleteCleanup();
  const [showComments, setShowComments] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const deleteProgress = useRef(new Animated.Value(1)).current;
  const [isDeleting, setIsDeleting] = useState(false);

  const animateDeletion = useCallback(() => {
    setIsDeleting(true);
    Animated.timing(deleteProgress, {
      toValue: 0,
      duration: 280,
      useNativeDriver: false,
    }).start(() => {
      cleanupAfterDelete(post);
      onPostDeleted?.(post);
      if (isPostPage) {
        router.back();
      }
    });
  }, [cleanupAfterDelete, deleteProgress, isPostPage, onPostDeleted, post]);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [selectedImageViewerIndex, setSelectedImageViewerIndex] = useState(0);
  const {
    comments: commentList,
    loading: commentsLoading,
    fetchComments,
    addComment: addCommentMutation,
    isAddingComment,
  } = useFetchComments(post.id);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [inlineComment, setInlineComment] = useState("");
  const [localPreviews, setLocalPreviews] = useState(post.comment_previews || []);
  const {
    selectedMediaItems: inlineCommentMediaItems,
    isUploading: isInlineCommentMediaUploading,
    handleMediaUpload: handleInlineCommentMediaUpload,
    handleRemoveMedia: handleRemoveInlineCommentMedia,
    clearMedia: clearInlineCommentMedia,
  } = useMediaSelection();
  const lastTapTime = useRef<number>(0);
  const singleTapTimer = useRef<number | null>(null);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const { storyCardRef, isSharing, completionCount, shareToInstagram } = useInstagramShare({
    postId: post.id,
    isChallengePost: !!post.challenge_id,
    challengeId: post.challenge_id ?? undefined,
    mediaUrl: post.media?.file_path ?? undefined,
  });

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

  const handleLikePress = async (disallowUnlike: boolean) => {
    if (!user) return;
    if (disallowUnlike && likedPosts[post.id]) return;
    await togglePostLike(post.id, user.id, post.user_id);
  };

  const handleCommentAdded = (increment: number) => {
    const newCommentCount = commentCount + increment;
    setCommentCount(newCommentCount);
    updateParentCounts(newCommentCount);
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

  const mediaItems = (post.media_items && post.media_items.length > 0)
    ? post.media_items
    : post.media?.file_path
      ? [{ media_id: post.media_id || 0, file_path: post.media.file_path, position: 0 }]
      : [];
  const imageViewerItems = mediaItems.filter((item) => item.file_path && !isVideo(item.file_path));

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

  const handleDoubleTap = (mediaIndex = 0) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTapTime.current && now - lastTapTime.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
        singleTapTimer.current = null;
      }
      handleLikePress(true);
      showHeartAnimation();
      lastTapTime.current = 0;
    } else {
      // First tap - wait for potential second tap
      lastTapTime.current = now;
      singleTapTimer.current = setTimeout(() => {
        // Single tap - open fullscreen/modal only if there's media
        const mediaItem = mediaItems[mediaIndex];
        if (mediaItem?.file_path) {
          setSelectedMediaIndex(mediaIndex);
          if (isVideo(mediaItem.file_path)) {
            setShowVideoModal(true);
            captureEvent(POST_EVENTS.VIDEO_PLAYED, {
              post_id: post.id,
              is_challenge_post: !!post.challenge_id,
            });
          } else {
            const imageIndex = mediaItems
              .slice(0, mediaIndex)
              .filter((item) => item.file_path && !isVideo(item.file_path))
              .length;
            setSelectedImageViewerIndex(imageIndex);
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

  const handleInlineComment = async () => {
    if ((!inlineComment.trim() && inlineCommentMediaItems.length === 0) || !user) return;

    const commentText = inlineComment.trim();
    setInlineComment("");

    try {
      const newComment = await addCommentMutation(
        user.id,
        commentText,
        null,
        inlineCommentMediaItems
      );
      if (newComment) {
        clearInlineCommentMedia();
        setCommentCount(prev => prev + 1);
        setLocalPreviews(prev => [...prev, {
          username: currentUserUsername || "unknown",
          text: commentText,
          has_media: inlineCommentMediaItems.length > 0,
        }]);

        if (user.id !== post.user_id) {
          sendCommentNotification(
            user.id,
            user.user_metadata?.username,
            post.user_id,
            post.id.toString(),
            commentText || t("Shared media"),
            newComment.id.toString(),
            {
              title: t("(username) commented"),
              body: t("Check it out now."),
            }
          );
        }

        captureEvent(COMMENT_EVENTS.CREATED, {
          post_id: post.id,
          comment_id: newComment.id,
          comment_length: commentText.length,
          source: "inline",
          media_count: inlineCommentMediaItems.length,
        });
      }
    } catch (error) {
      console.error("Error adding inline comment:", error);
    }
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

  const handleQuestPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (post.quest_id) {
      router.push(`/quest/${post.quest_id}`);
    }
  };

  const isChallengePost = !!post.challenge_id;
  const isQuestPost = !!post.quest_id;

  const handleImageLongPress = async () => {
    try {
      const selectedImage = imageViewerItems[selectedImageViewerIndex];
      const urls = await imageService.getPostImageUrl(selectedImage?.file_path || "", "original");

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
    if (mediaItems.length === 0) return null;

    const heartAnimationStyle = {
      transform: [{ scale: heartScale }],
      opacity: heartOpacity,
    };

    if (mediaItems.length === 1 && mediaItems[0].file_path && isVideo(mediaItems[0].file_path)) {
      return (
        <>
          <Pressable onPress={() => handleDoubleTap(0)} style={{ position: "relative" }}>
            <Video
              source={{ uri: mediaItems[0].file_path }}
              style={contentStyle}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isMuted={true}
              isLooping={false}
              useNativeControls={false}
              posterSource={{ uri: mediaItems[0].file_path }}
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
            videoUri={mediaItems[selectedMediaIndex]?.file_path || ""}
            visible={showVideoModal}
            onClose={() => setShowVideoModal(false)}
          />
        </>
      );
    }
    return (
      <>
        <View style={{ position: "relative" }}>
          <MediaGrid
            items={mediaItems
              .filter((item) => item.file_path)
              .map((item) => ({
                uri: item.file_path || "",
                isVideo: !!item.file_path && !!isVideo(item.file_path),
              }))}
            onPress={handleDoubleTap}
            height={260}
            style={mediaContentStyle}
          />
          <Animated.View style={[heartOverlayStyle, heartAnimationStyle]} pointerEvents="none">
            <Icon name="heart" size={64} color="#eb656b" />
          </Animated.View>
        </View>
        <VideoPlayer
          videoUri={mediaItems[selectedMediaIndex]?.file_path || ""}
          visible={showVideoModal}
          onClose={() => setShowVideoModal(false)}
        />
      </>
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

  const deleteAnimatedStyle = isDeleting
    ? {
        opacity: deleteProgress,
        transform: [
          {
            scale: deleteProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.94, 1],
            }),
          },
        ],
        height:
          containerHeight != null
            ? deleteProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, containerHeight],
              })
            : undefined,
        overflow: "hidden" as const,
      }
    : null;

  return (
    <Animated.View
      onLayout={(e) => {
        if (!isDeleting) {
          setContainerHeight(e.nativeEvent.layout.height);
        }
      }}
      style={deleteAnimatedStyle}
      pointerEvents={isDeleting ? "none" : "auto"}
    >
    <Pressable
      // onPress={handlePostPress}
      style={[
        containerStyle,
        (isChallengePost || isQuestPost) ? challengeContainerStyle : null,
        { position: "relative" },
      ]}
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
          onDelete={animateDeletion}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.neutral.grey1} />
        </ActionsMenu>
      </View>
      {isChallengePost && (
        <>
          <TouchableOpacity onPress={handleChallengePress}>
            <View style={challengeBoxStyle}>
              <View style={tagRowStyle}>
                <Ionicons name="trophy" size={14} color={colors.light.primary} />
                <Text style={challengeTitleStyle} numberOfLines={1} ellipsizeMode="tail">
                  <Text style={{ fontWeight: "bold" }}>{t("Challenge:")}</Text> {post.challenge_title}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          {post.comfort_zone_rating != null && (
            <View style={comfortRatingStyle}>
              <Text style={comfortRatingLabelStyle}>
                {t(discomfortLabels[post.comfort_zone_rating] ?? "Chill")}
              </Text>
              <View style={miniSliderRow}>
                <View style={miniSliderTrack}>
                  <View
                    style={[
                      miniSliderFill,
                      { width: `${((post.comfort_zone_rating - 1) / 4) * 100}%` },
                    ]}
                  />
                </View>
                <View style={miniSliderTickContainer}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      style={[
                        miniSliderTick,
                        {
                          backgroundColor:
                            i <= post.comfort_zone_rating!
                              ? colors.light.accent
                              : colors.neutral.grey2,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}
        </>
      )}
      {isQuestPost && (
        <TouchableOpacity onPress={handleQuestPress}>
          <View style={questBoxStyle}>
            <View style={tagRowStyle}>
              <Ionicons name="footsteps" size={14} color={colors.sideQuest.text} />
              <Text style={questTitleStyle} numberOfLines={1} ellipsizeMode="tail">
                <Text style={{ fontWeight: "bold" }}>{t("Quest:")}</Text> {post.quest_title}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      {post.body && mediaItems.length === 0 ? (
        <Pressable onPress={() => handleDoubleTap()}>
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
      {mediaItems.length === 0 && (
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
          <View style={{ flex: 1 }}>
            <ReactionsBar
              item={{ id: post.id, type: "post" }}
              reactions={postReactions[post.id] || []}
              onToggle={(emoji) => {
                if (!user) return;
                togglePostReaction(post.id, user.id, post.user_id, emoji);
              }}
              isLiked={likedPosts[post.id] ?? post.liked ?? false}
              likeCount={likeCounts[post.id] ?? post.likes_count ?? 0}
              onLikeToggle={() => handleLikePress(false)}
            />
          </View>
          {isAdmin && (
            <TouchableOpacity onPress={shareToInstagram} disabled={isSharing}>
              <View style={iconContainerStyle}>
                {isSharing ? (
                  <ActivityIndicator size="small" color={colors.neutral.grey1} />
                ) : (
                  <MaterialCommunityIcons name="instagram" size={18} color={colors.neutral.grey1} />
                )}
              </View>
            </TouchableOpacity>
          )}
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

        {/* Hidden Instagram Story Card for capture */}
        <InstagramStoryCard
          ref={storyCardRef}
          username={postUser?.username || "unknown"}
          challengeTitle={post.challenge_title}
          postText={post.body ?? undefined}
          profileImageUrl={profileImageUrl || undefined}
          completionCount={completionCount}
          variant="post"
        />

        {localPreviews.length > 0 && (
          <TouchableOpacity onPress={handleOpenComments} style={commentPreviewStyle}>
            {localPreviews.map((preview, index) => {
              const isLast = index === localPreviews.length - 1 && commentCount <= localPreviews.length;
              return (
                <CommentPreviewRow
                  key={index}
                  username={preview.username}
                  text={preview.text}
                  replyToUsername={preview.replyToUsername}
                  hasMedia={preview.has_media}
                  isLast={isLast}
                />
              );
            })}
            {commentCount > localPreviews.length && (
              <View style={commentRowStyle}>
                <View style={[commentTrunkStyle, commentTrunkLastStyle]} />
                <View style={commentConnectorStyle} />
                <Text style={viewAllCommentsStyle}>{t("View all (count) comments").replace("(count)", commentCount.toString())}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <View style={inlineCommentContainer}>
          {inlineCommentMediaItems.length > 0 ? (
            <MediaGrid
              items={inlineCommentMediaItems.map((item) => ({
                uri: item.thumbnailUri || item.previewUrl,
                isVideo: item.isVideo,
                useImageForVideo: true,
              }))}
              onRemove={handleRemoveInlineCommentMedia}
              height={120}
              style={inlineCommentMediaPreviewStyle}
            />
          ) : null}
          <View style={inlineCommentRowStyle}>
            <TouchableOpacity
              onPress={handleInlineCommentMediaUpload}
              disabled={inlineCommentMediaItems.length >= 4 || isInlineCommentMediaUploading || isAddingComment}
              style={[
                inlineCommentMediaButtonStyle,
                (inlineCommentMediaItems.length >= 4 || isInlineCommentMediaUploading) ? inlineCommentMediaButtonDisabledStyle : null,
              ]}
            >
              <MaterialIcons name="add-photo-alternate" size={18} color={colors.light.primary} />
            </TouchableOpacity>
          <TextInput
            style={inlineCommentInput}
            placeholder={t("Add a comment...")}
            placeholderTextColor={colors.neutral.grey1}
            value={inlineComment}
            onChangeText={setInlineComment}
            onSubmitEditing={handleInlineComment}
            returnKeyType="send"
            multiline
            textAlignVertical="top"
          />
          <AnimatedSendButton
            hasContent={inlineComment.trim().length > 0 || inlineCommentMediaItems.length > 0}
            onPress={handleInlineComment}
            disabled={isAddingComment || isInlineCommentMediaUploading}
            size="small"
          />
          </View>
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={showComments}
          onRequestClose={() => setShowComments(false)}
        >
          <MenuProvider skipInstanceCheck>
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
          </MenuProvider>
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
              imageUrls={imageViewerItems.map((item) => ({ url: item.file_path || "" }))}
              index={selectedImageViewerIndex}
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
    </Animated.View>
  );
};

const discomfortLabels: Record<number, string> = {
  1: "Chill",
  2: "Uneasy",
  3: "Nervous",
  4: "Scary",
  5: "Way out there",
};

const challengeBoxStyle: ViewStyle = {
  alignSelf: "flex-start",
  backgroundColor: "#EEEFFC",
  borderColor: "#B7BCE0",
  borderRadius: 999,
  borderWidth: 1,
  marginBottom: 4,
  marginTop: 4,
  paddingHorizontal: 14,
  paddingVertical: 6,
  width: "100%",
};

const questBoxStyle: ViewStyle = {
  alignSelf: "flex-start",
  backgroundColor: colors.sideQuest.highlightSoft,
  borderColor: colors.sideQuest.bgBorder,
  borderRadius: 999,
  borderWidth: 1,
  marginBottom: 8,
  marginTop: 4,
  paddingHorizontal: 14,
  paddingVertical: 6,
  width: "100%",
};

const comfortRatingStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  gap: 8,
  marginBottom: 4,
  marginTop: 4,
};

const tagRowStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  gap: 6,
};

const comfortRatingLabelStyle: TextStyle = {
  color: colors.light.accent,
  fontSize: 13,
  fontWeight: "600",
  width: 90,
};

const miniSliderRow: ViewStyle = {
  flex: 1,
  height: 8,
  justifyContent: "center",
};

const miniSliderTrack: ViewStyle = {
  backgroundColor: colors.neutral.grey2,
  borderRadius: 2,
  height: 3,
  width: "100%",
};

const miniSliderTickContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  left: 0,
  position: "absolute",
  right: 0,
};

const miniSliderTick: ViewStyle = {
  borderRadius: 1,
  height: 6,
  width: 2,
};

const miniSliderFill: ViewStyle = {
  backgroundColor: colors.light.accent,
  borderRadius: 2,
  height: 3,
  left: 0,
  position: "absolute",
  top: 0,
};



const challengeContainerStyle: ViewStyle = {
};

const challengeTitleStyle: TextStyle = {
  color: colors.light.primary,
  fontSize: 13,
};

const questTitleStyle: TextStyle = {
  color: colors.sideQuest.text,
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

const commentPreviewStyle: ViewStyle = {
  marginTop: 12,
  marginLeft: 8,
};

const commentRowStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  minHeight: 18,
};

const commentTrunkStyle: ViewStyle = {
  width: 2,
  backgroundColor: colors.neutral.grey2,
  alignSelf: "stretch",
  marginBottom: -4,
};

const commentTrunkLastStyle: ViewStyle = {
  height: "50%",
  alignSelf: "flex-start",
  marginBottom: 0,
};

const commentConnectorStyle: ViewStyle = {
  width: 10,
  height: 2,
  backgroundColor: colors.neutral.grey2,
  marginRight: 8,
};


const viewAllCommentsStyle: TextStyle = {
  color: colors.neutral.grey1,
  fontSize: 12,
};

const inlineCommentContainer: ViewStyle = {
  marginTop: 6,
  paddingHorizontal: 8,
  paddingVertical: 6,
  backgroundColor: colors.neutral.white,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.neutral.grey2,
};

const inlineCommentRowStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
};

const inlineCommentMediaPreviewStyle: ViewStyle = {
  marginBottom: 8,
  width: "100%",
};

const inlineCommentMediaButtonStyle: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 2,
};

const inlineCommentMediaButtonDisabledStyle: ViewStyle = {
  opacity: 0.45,
};

const inlineCommentInput: TextStyle = {
  flex: 1,
  fontSize: 12,
  color: colors.light.text,
  paddingVertical: 2,
  minHeight: 20,
  maxHeight: 100,
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
