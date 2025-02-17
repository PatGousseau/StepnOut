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
  ActivityIndicator,
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

export interface Comment {
  id: number;
  text: string;
  userId: string;
  created_at: string;
}

interface CommentsProps {
  initialComments: Comment[];
  onClose: () => void;
  loading?: boolean;
  postId: number;
  postUserId: string;
  onCommentAdded?: (newCount: number) => void;
}

interface CommentsListProps {
  comments: Comment[];
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
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    setComments(initialComments);
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
              created_at: savedComment.created_at,
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
                  title: t("(username) commented on your post!"),
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
        <ActivityIndicator size="large" color={colors.light.primary} />
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
  );
};

interface CommentProps {
  id: number;
  userId: string;
  text: string;
  created_at: string;
  onCommentDeleted?: () => void;
}

const Comment: React.FC<CommentProps> = ({ id, userId, text, created_at, onCommentDeleted }) => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const { onClose } = useContext(CommentsContext);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    User.getUser(userId).then(setUser);
  }, [userId]);

  if (!user) return null;

  const imageSource = user.profileImageUrl.startsWith("http")
    ? {
        uri: supabase.storage
          .from("challenge-uploads")
          .getPublicUrl(user.profileImageUrl.split("challenge-uploads/")[1].split("?")[0], {
            transform: {
              quality: 100,
              width: 60,
              height: 60,
            },
          }).data.publicUrl,
      }
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
          try {
            // First delete associated notifications
            const { error: notificationError } = await supabase
              .from("notifications")
              .delete()
              .eq("comment_id", id);

            if (notificationError) throw notificationError;

            // Then delete the comment
            const { error: commentError } = await supabase.from("comments").delete().eq("id", id);

            if (commentError) throw commentError;

            onCommentDeleted?.();
          } catch (error) {
            console.error("Error deleting comment:", error);
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
          {currentUser?.id === userId && (
            <TouchableOpacity onPress={handleDeleteComment} style={styles.deleteButton}>
              <Icon name="trash-o" size={14} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.commentText}>{text}</Text>
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
});
