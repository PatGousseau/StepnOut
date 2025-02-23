import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  Animated,
  PanResponder,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../models/User";
import { sendCommentNotification } from "../lib/notificationsService";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { useLanguage } from "../contexts/LanguageContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { formatRelativeTime } from "../utils/time";
import { Loader } from "./Loader";
import { Comment as CommentType } from "../types"; // todo: rename one of the Comment types
import { useLikes } from "../contexts/LikesContext";
import { postService } from "../services/postService";
import { OptionsMenu } from "./OptionsMenu";
import { MenuProvider } from "react-native-popup-menu";

interface CommentsProps {
  initialComments: CommentType[];
  onClose: () => void;
  loading?: boolean;
  postId: number;
  postUserId: string;
  onCommentAdded?: (newCount: number) => void;
}

interface CommentsListProps {
  comments: CommentType[];
  loading?: boolean;
  flatListRef?: React.RefObject<FlatList>;
  onClose?: () => void;
  postId: number;
  postUserId: string;
  onCommentAdded?: (newCount: number) => void;
}

const CommentsContext = React.createContext<{ onClose?: () => void }>({});

export const CommentsList: React.FC<CommentsListProps> = ({
  comments: initialComments,
  loading = false,
  flatListRef,
  onClose,
  postId,
  postUserId,
  onCommentAdded,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { initializeCommentLikes } = useLikes();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    setComments(initialComments);
    // Initialize likes for the comments
    if (initialComments.length > 0) {
      initializeCommentLikes(initialComments);
    }
  }, [initialComments]);

  const handleAddComment = async () => {
    if (newComment.trim() && user) {
      const commentText = newComment.trim();

      try {
        const { data: savedComment, error } = await supabase
          .from("comments")
          .insert({
            user_id: user.id,
            post_id: postId,
            body: commentText,
          })
          .select("*")
          .single();

        if (error) throw error;

        if (savedComment) {
          setComments((prevComments) => [
            ...prevComments,
            {
              id: savedComment.id,
              text: savedComment.body,
              userId: savedComment.user_id,
              post_id: postId,
              created_at: savedComment.created_at,
              likes_count: 0,
              liked: false,
            },
          ]);

          setNewComment("");

          if (user.id !== postUserId) {
            try {
              await sendCommentNotification(
                user.id,
                user.user_metadata?.username,
                postUserId,
                postId.toString(),
                commentText,
                savedComment.id.toString(),
                {
                  title: t("(username) commented"),
                  body: t("Check it out now."),
                }
              );
            } catch (error) {
              console.error("Failed to send comment notification:", error);
            }
          }

          onCommentAdded?.(1);
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleCommentDeleted = (commentId: number) => {
    setComments((prevComments) => {
      const newComments = prevComments.filter((comment) => comment.id !== commentId);
      onCommentAdded?.(-1);
      return newComments;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

  return (
    <CommentsContext.Provider value={{ onClose }}>
      <View style={styles.commentsWrapper}>
        <FlatList
          ref={flatListRef}
          style={styles.commentsList}
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Comment
              id={item.id}
              userId={item.userId}
              text={item.text}
              created_at={item.created_at}
              post_id={item.post_id}
              onCommentDeleted={() => handleCommentDeleted(item.id)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("No comments yet!")}</Text>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder={t("Add a comment...")}
            placeholderTextColor="#888"
            style={styles.input}
            multiline
            textAlignVertical="top"
            maxHeight={100}
          />
          <Pressable
            onPress={handleAddComment}
            style={({ pressed }) => [
              styles.postButton,
              !user && styles.postButtonDisabled,
              pressed && styles.postButtonPressed,
            ]}
            disabled={!user}
          >
            <Text style={styles.postButtonText}>{t("Post")}</Text>
          </Pressable>
        </View>
      </View>
    </CommentsContext.Provider>
  );
};

// Rename the main component to CommentsModal
export const CommentsModal: React.FC<CommentsProps> = ({
  initialComments,
  onClose,
  loading = false,
  postId,
  postUserId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState(initialComments);
  const flatListRef = useRef<FlatList>(null);
  const translateY = new Animated.Value(0);

  // responder for dragging the comments up and down
  // closes the modal if dragged down far enough or if its dragged fast enough
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 0; // only respond to downward drags
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100 || gestureState.vy > 0.5) {
        Animated.timing(translateY, {
          toValue: 500,
          duration: 200,
          useNativeDriver: true,
        }).start(onClose);
      } else {
        // reset to fully open if not dragged enough
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 12,
        }).start();
      }
    },
  });

  useEffect(() => {
    setComments(initialComments);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [initialComments]);

  return (
    <MenuProvider>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View {...panResponder.panHandlers} style={styles.dragHandle}>
            <View style={styles.dragIndicator} />
          </View>

          <CommentsList
            comments={comments}
            loading={loading}
            flatListRef={flatListRef}
            onClose={onClose}
            postId={postId}
            postUserId={postUserId}
            onCommentAdded={onCommentAdded}
          />
        </SafeAreaView>
      </Animated.View>
    </MenuProvider>
  );
};

interface CommentProps {
  id: number;
  userId: string;
  text: string;
  created_at: string;
  onCommentDeleted?: () => void;
  post_id: number;
}

const Comment: React.FC<CommentProps> = ({
  id,
  userId,
  text,
  created_at,
  onCommentDeleted,
  post_id,
}) => {
  const { onClose } = useContext(CommentsContext);
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { likedComments, commentLikeCounts, toggleCommentLike } = useLikes();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await User.getUser(userId);
      setUser(userData);
    };

    loadUser();
  }, [userId]);

  if (!user) {
    return null;
  }

  const imageSource = user.profileImageUrl
    ? { uri: user.profileImageUrl }
    : require("../assets/images/default-pfp.png");

  const handleProfilePress = () => {
    onClose?.();
    router.push(`/profile/${userId}`);
  };

  const handleDeleteComment = () => {
    Alert.alert(t("Delete Comment"), t("Are you sure you want to delete this comment?"), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Delete"),
        style: "destructive",
        onPress: async () => {
          const success = await postService.deleteComment(id);
          if (success) {
            onCommentDeleted?.();
          }
        },
      },
    ]);
  };

  const handleLikePress = async () => {
    if (!currentUser) return;
    await toggleCommentLike(id, post_id, currentUser.id, userId);
  };

  const handleReportComment = () => {
    if (!currentUser) return;

    Alert.alert(t("Report Comment"), t("Are you sure you want to report this comment?"), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Report"),
        style: "destructive",
        onPress: async () => {
          const success = await postService.reportComment(id, currentUser.id, userId);
          if (success) {
            Alert.alert(t("Report Submitted"), t("Thank you for your report."));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.commentContainer}>
      <TouchableOpacity onPress={handleProfilePress}>
        <Image source={imageSource} style={styles.commentAvatar} />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity onPress={handleProfilePress}>
            <View style={styles.nameContainer}>
              <Text style={styles.displayName}>{user.name}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.timestamp}>{formatRelativeTime(created_at)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.commentText}>{text}</Text>
      </View>
      <View style={styles.commentFooter}>
        <TouchableOpacity onPress={handleLikePress}>
          <View style={styles.iconContainer}>
            <Icon
              name={likedComments[id] ? "heart" : "heart-o"}
              size={14}
              color={likedComments[id] ? "#eb656b" : colors.neutral.grey1}
            />
            <Text style={styles.iconText}>{commentLikeCounts[id] || 0}</Text>
          </View>
        </TouchableOpacity>
        <OptionsMenu
          options={
            currentUser?.id === userId
              ? [
                  {
                    text: t("Delete Comment"),
                    onSelect: handleDeleteComment,
                    isDestructive: true,
                  },
                ]
              : currentUser
              ? [
                  {
                    text: t("Report Comment"),
                    onSelect: handleReportComment,
                  },
                ]
              : []
          }
        >
          <Icon name="ellipsis-h" size={14} color={colors.neutral.grey1} />
        </OptionsMenu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentAvatar: {
    borderRadius: 15,
    height: 30,
    marginRight: 10,
    width: 30,
  },
  commentContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    color: "#333",
    fontSize: 14,
  },
  commentsList: {
    flexGrow: 1,
  },
  commentsWrapper: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.light.background,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flex: 1,
    padding: 10,
  },
  displayName: {
    color: "#333",
    fontWeight: "bold",
  },
  dragHandle: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    marginBottom: 5,
  },
  dragIndicator: {
    backgroundColor: "#DDDDDD",
    borderRadius: 3,
    height: 5,
    width: 40,
  },
  emptyContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    padding: 10,
    minHeight: 40,
    maxHeight: 100,
  },
  inputContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  nameContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  postButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  postButtonDisabled: {
    backgroundColor: colors.light.primary + "80",
  },
  postButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  safeArea: {
    flex: 1,
  },
  timestamp: {
    color: "#666",
    fontSize: 12,
    marginLeft: 5,
  },
  username: {
    color: "#666",
    fontSize: 12,
  },
  postButtonPressed: {
    opacity: 0.7,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  deleteButton: {
    padding: 8,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingLeft: 4,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 12,
    color: colors.neutral.grey1,
    marginLeft: 4,
  },
});
