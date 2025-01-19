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
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { CommentsModal } from "./Comments";
import { colors } from "../constants/Colors";
import { VideoView, useVideoPlayer } from "expo-video";
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
import { useEvent } from "expo";
import { useLikes } from "../contexts/LikesContext";

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
  const { likedPosts, likeCounts, toggleLike } = useLikes();
  const { user } = useAuth();

  if (!post) return null;

  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const {
    comments: commentList,
    loading: commentsLoading,
    fetchComments,
  } = useFetchComments(post.id);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (postUser?.profileImageUrl) {
        try {
          const filePath = postUser.profileImageUrl;
          const relativePath = filePath.includes("challenge-uploads/")
            ? filePath.split("challenge-uploads/")[1].split("?")[0]
            : filePath;

          const { data } = await supabase.storage
            .from("challenge-uploads")
            .getPublicUrl(relativePath, {
              transform: {
                quality: 100,
                width: 100,
                height: 100,
              },
            });
          setProfileImageUrl(data.publicUrl);
        } catch (transformError) {
          console.error("Transform error:", transformError);
          const { data } = await supabase.storage
            .from("challenge-uploads")
            .getPublicUrl(postUser.profileImageUrl);
          setProfileImageUrl(data.publicUrl);
        }
      }
    };

    loadProfileImage();
  }, [postUser?.profileImageUrl]);

  useEffect(() => {
    const initializeLikes = async () => {
      const likes = await postService.fetchLikes(post.id);
      setLiked(likes.some((like) => like.user_id === user?.id));
      setLikeCount(likes.length);
    };

    if (post.id) {
      initializeLikes();
    }
  }, [post.id]);

  useEffect(() => {
    setCommentCount(post.comments_count);
  }, [post.comments_count]);

  const updateParentCounts = useCallback(
    (newLikeCount: number, newCommentCount: number) => {
      if (setPostCounts) {
        setPostCounts((prevCounts) => ({
          ...prevCounts,
          [post.id]: {
            likes: newLikeCount,
            comments: newCommentCount,
          },
        }));
      }
    },
    [post.id, setPostCounts]
  );

  const handleLikePress = async () => {
    if (!user) return;
    await toggleLike(post.id, user.id, post.user_id);
  };

  const handleCommentAdded = (increment: number) => {
    const newCommentCount = commentCount + increment;
    setCommentCount(newCommentCount);
    updateParentCounts(likeCount, newCommentCount);
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

  const renderMedia = () => {
    if (!post.media?.file_path) return null;

    if (isVideo(post.media?.file_path)) {
      const player = useVideoPlayer(post.media?.file_path);
      const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });

      return (
        <View style={styles.mediaContainer}>
          <VideoView
            player={player}
            style={styles.mediaContent}
            contentFit="cover"
            nativeControls={false}
          />
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              onPress={() => {
                if (isPlaying) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
              style={styles.playButton}
            >
              <Icon name={isPlaying ? "pause" : "play"} size={20} color={colors.neutral.grey1} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <TouchableOpacity onPress={handleMediaPress} activeOpacity={1}>
        <Image
          source={{ uri: post.media?.file_path }}
          style={styles.mediaContent}
          cachePolicy="memory-disk"
          contentFit="cover"
          transition={200}
        />
      </TouchableOpacity>
    );
  };

  const handleOpenComments = () => {
    setShowComments(true);
    fetchComments();
  };

  const handlePostPress = (e: GestureResponderEvent) => {
    if (e.target === e.currentTarget) {
      router.push(`/post/${post.id}`);
    }
  };

  const handleProfilePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push(`/profile/${postUser.id}`);
  };

  const handleReportPost = () => {
    Alert.alert(t("Report Post"), t("Are you sure you want to report this post?"), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Report"),
        style: "destructive",
        onPress: async () => {
          if (!user?.id) return;

          await postService.reportPost(post.id, user.id, post.user_id);
        },
      },
    ]);
  };

  const handleBlockUser = () => {
    Alert.alert(t("Block User"), t("Are you sure you want to block this user?"), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Block"),
        style: "destructive",
        onPress: async () => {
          if (!user?.id) return;

          await postService.blockUser(user.id, post.user_id);
        },
      },
    ]);
  };

  const handleDeletePost = async () => {
    Alert.alert(t("Delete Post"), t("Are you sure you want to delete this post?"), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Delete"),
        style: "destructive",
        onPress: async () => {
          await postService.deletePost(post.id);
        },
      },
    ]);
  };

  const handleChallengePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (post.challenge_id) {
      router.push(`/challenge/${post.challenge_id}`);
    }
  };

  const getOriginalImageUrl = (filePath: string) => {
    if (filePath.startsWith("http") && filePath.includes("challenge-uploads/")) {
      const relativePath = filePath.split("challenge-uploads/")[1].split("?")[0];
      const { data } = supabase.storage.from("challenge-uploads").getPublicUrl(relativePath);
      return data.publicUrl;
    }
    return filePath;
  };

  const handleImageLongPress = async () => {
    try {
      const imageUrl = getOriginalImageUrl(post.media?.file_path || "");

      // Download the image first
      const response = await fetch(imageUrl);
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
          message: imageUrl, // il va falloir voir si ca marche sur android
          url: imageUrl,
        });
      }
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

  return (
    <Pressable
      onPress={handlePostPress}
      style={[styles.container, post.challenge_id ? styles.challengeContainer : null]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={
              profileImageUrl
                ? { uri: profileImageUrl }
                : require("../assets/images/default-pfp.png")
            }
            style={styles.profilePicture}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfilePress} style={styles.nameContainer}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{postUser?.name || t("Unknown")}</Text>
            <Text style={styles.username}>@{postUser?.username || t("unknown")}</Text>
          </View>
        </TouchableOpacity>
        <Menu style={styles.menuContainer}>
          <MenuTrigger style={{ padding: 8 }}>
            <Icon name="ellipsis-h" size={16} color={colors.neutral.grey1} />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            {user?.id === post.user_id ? (
              <MenuOption onSelect={handleDeletePost}>
                <Text style={[styles.menuOptionText, { color: "red" }]}>{t("Delete Post")}</Text>
              </MenuOption>
            ) : (
              <>
                <MenuOption onSelect={handleReportPost}>
                  <Text style={styles.menuOptionText}>{t("Report Post")}</Text>
                </MenuOption>
                <MenuOption onSelect={handleBlockUser}>
                  <Text style={styles.menuOptionText}>{t("Block User")}</Text>
                </MenuOption>
              </>
            )}
          </MenuOptions>
        </Menu>
      </View>
      {post.challenge_id && (
        <TouchableOpacity onPress={handleChallengePress}>
          <View style={styles.challengeBox}>
            <Text style={styles.challengeTitle} numberOfLines={1} ellipsizeMode="tail">
              <Text style={{ fontWeight: "bold" }}>{t("Challenge:")}</Text> {post.challenge_title}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      {post.body && <Text style={styles.text}>{post.body}</Text>}
      {renderMedia()}
      <View>
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLikePress}>
            <View style={styles.iconContainer}>
              <Icon
                name={likedPosts[post.id] ? "heart" : "heart-o"}
                size={16}
                color={likedPosts[post.id] ? "#eb656b" : colors.neutral.grey1}
              />
              <Text style={styles.iconText}>{likeCounts[post.id] || 0}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenComments}>
            <View style={styles.iconContainer}>
              <Icon name="comment-o" size={16} color={colors.neutral.grey1} />
              <Text style={styles.iconText}>{commentCount.toString()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={showComments}
          onRequestClose={() => setShowComments(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
              <View style={styles.modalBackground} />
            </TouchableWithoutFeedback>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
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
          <View style={styles.fullScreenContainer}>
            <View style={styles.fullScreenHeader}>
              <Menu>
                <MenuTrigger style={styles.fullScreenMenuTrigger}>
                  <Icon name="ellipsis-h" size={20} color="white" />
                </MenuTrigger>
                <MenuOptions customStyles={optionsStyles}>
                  <MenuOption onSelect={handleImageLongPress}>
                    <Text style={styles.menuOptionText}>{t("Save Image")}</Text>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
            <ImageViewer
              imageUrls={[
                {
                  url: getOriginalImageUrl(post.media?.file_path || ""),
                },
              ]}
              enableSwipeDown
              onSwipeDown={() => setShowFullScreenImage(false)}
              renderIndicator={() => null}
              onLongPress={handleImageLongPress}
              saveToLocalByLongPress={false}
              enablePreload={true}
              style={styles.fullScreenImage}
            />
          </View>
        </Modal>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  challengeBox: {
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
  },
  challengeContainer: {
    // backgroundColor: '#ffeecc',
    // borderWidth: 1,
  },
  challengeTitle: {
    color: colors.light.primary,
    fontSize: 13,
  },
  closeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
    padding: 5,
    position: "absolute",
    right: 10,
    top: 10,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
    padding: 10,
    paddingBottom: 16,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 5,
    marginTop: 10,
  },
  fullScreenContainer: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    flex: 1,
    justifyContent: "center",
  },
  fullScreenHeader: {
    padding: 16,
    position: "absolute",
    right: 0,
    top: 40,
    zIndex: 9999,
  },
  fullScreenImage: {
    height: "100%",
    width: "100%",
  },
  fullScreenImageWrapper: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  fullScreenMenuTrigger: {
    padding: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  iconContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginRight: 32,
  },
  iconText: {
    color: "#5A5A5A",
    fontSize: 14,
    marginLeft: 4,
  },
  mediaContent: {
    aspectRatio: 1,
    borderRadius: 8,
    height: undefined,
    marginTop: 8,
    width: "100%",
  },
  menuContainer: {
    marginLeft: "auto",
    padding: 8,
  },
  menuOptionText: {
    fontSize: 16,
    padding: 10,
  },
  modalBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  modalContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    maxHeight: "75%",
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  nameContainer: {
    flex: 1,
  },
  profilePicture: {
    borderRadius: 20,
    height: 40,
    marginRight: 10,
    width: 40,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
  userInfoContainer: {
    flexDirection: "column",
  },
  username: {
    color: "#666",
    fontSize: 12,
  },
  mediaContainer: {
    position: "relative",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 25, // Make container perfectly round
    width: 50, // Fixed width
    height: 50, // Fixed height to match width
  },
  playButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center", // Center the icon
  },
});

const optionsStyles = {
  optionsContainer: {
    borderRadius: 10,
    padding: 5,
    width: 150,
    backgroundColor: "white",
    zIndex: 9999,
    marginTop: 45,
  },
};

export default Post;
