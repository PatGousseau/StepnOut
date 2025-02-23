import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  TextInput,
  Pressable,
  FlatList,
  Image,
  Animated,
  PanResponder,
  SafeAreaView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Dimensions,
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
import { ActionsMenu } from "./ActionsMenu";
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
      <View style={loadingContainerStyle}>
        <Loader />
      </View>
    );
  }

  return (
    <CommentsContext.Provider value={{ onClose }}>
      <View style={commentsWrapperStyle}>
        <FlatList
          ref={flatListRef}
          style={commentsListStyle}
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
            <View style={emptyContainerStyle}>
              <Text style={emptyTextStyle}>{t("No comments yet!")}</Text>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />

        <View style={inputContainerStyle}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder={t("Add a comment...")}
            placeholderTextColor="#888"
            style={inputStyle}
            multiline
            textAlignVertical="top"
            maxHeight={100}
          />
          <Pressable
            onPress={handleAddComment}
            style={({ pressed }) => [
              postButtonStyle,
              !user && postButtonDisabledStyle,
              pressed && postButtonPressedStyle,
            ]}
            disabled={!user}
          >
            <Text style={postButtonTextStyle}>{t("Post")}</Text>
          </Pressable>
        </View>
      </View>
    </CommentsContext.Provider>
  );
};

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
    <MenuProvider skipInstanceCheck>
      <Animated.View
        style={[
          containerStyle,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <SafeAreaView style={safeAreaStyle}>
          <View {...panResponder.panHandlers} style={dragHandleStyle}>
            <View style={dragIndicatorStyle} />
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

  const handleLikePress = async () => {
    if (!currentUser) return;
    await toggleCommentLike(id, post_id, currentUser.id, userId);
  };

  return (
    <View style={commentContainerStyle}>
      <TouchableOpacity onPress={handleProfilePress}>
        <Image source={imageSource} style={commentAvatarStyle} />
      </TouchableOpacity>
      <View style={commentContentStyle}>
        <View style={commentHeaderStyle}>
          <TouchableOpacity onPress={handleProfilePress}>
            <View style={nameContainerStyle}>
              <Text style={displayNameStyle}>{user.name}</Text>
              <Text style={usernameStyle}>@{user.username}</Text>
              <Text style={timestampStyle}>{formatRelativeTime(created_at)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={commentTextStyle}>{text}</Text>
      </View>
      <View style={commentFooterStyle}>
        <TouchableOpacity onPress={handleLikePress}>
          <View style={iconContainerStyle}>
            <Icon
              name={likedComments[id] ? "heart" : "heart-o"}
              size={14}
              color={likedComments[id] ? "#eb656b" : colors.neutral.grey1}
            />
            <Text style={iconTextStyle}>{commentLikeCounts[id] || 0}</Text>
          </View>
        </TouchableOpacity>
        <ActionsMenu
          type="comment"
          contentId={id}
          contentUserId={userId}
          onDelete={onCommentDeleted}
          menuOffset={-Dimensions.get("window").height * 0.25 +20}
        >
          <Icon name="ellipsis-h" size={14} color={colors.neutral.grey1} />
        </ActionsMenu>
      </View>
    </View>
  );
};

const commentAvatarStyle: ImageStyle = {
  borderRadius: 15,
  height: 30,
  marginRight: 10,
  width: 30,
};

const commentContainerStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  marginBottom: 10,
};

const commentContentStyle: ViewStyle = {
  flex: 1,
};

const commentTextStyle: TextStyle = {
  color: "#333",
  fontSize: 14,
};

const commentsListStyle: ViewStyle = {
  flexGrow: 1,
};

const commentsWrapperStyle: ViewStyle = {
  flex: 1,
};

const containerStyle: ViewStyle = {
  backgroundColor: colors.light.background,
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  flex: 1,
  padding: 10,
};

const displayNameStyle: TextStyle = {
  color: "#333",
  fontWeight: "bold",
};

const dragHandleStyle: ViewStyle = {
  alignItems: "center",
  height: 30,
  justifyContent: "center",
  marginBottom: 5,
};

const dragIndicatorStyle: ViewStyle = {
  backgroundColor: "#DDDDDD",
  borderRadius: 3,
  height: 5,
  width: 40,
};

const emptyContainerStyle: ViewStyle = {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  paddingVertical: 20,
};

const emptyTextStyle: TextStyle = {
  color: "#666",
  fontSize: 16,
};

const inputStyle: TextStyle = {
  backgroundColor: "#f0f0f0",
  borderColor: "#ccc",
  borderRadius: 5,
  borderWidth: 1,
  flex: 1,
  marginRight: 10,
  padding: 10,
  minHeight: 40,
  maxHeight: 100,
};

const inputContainerStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  marginBottom: 8,
  marginTop: 10,
  paddingHorizontal: 8,
};

const loadingContainerStyle: ViewStyle = {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
};

const nameContainerStyle: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  gap: 4,
};

const postButtonStyle: ViewStyle = {
  backgroundColor: colors.light.primary,
  borderRadius: 5,
  paddingHorizontal: 15,
  paddingVertical: 10,
  alignSelf: "flex-start",
};

const postButtonDisabledStyle: ViewStyle = {
  backgroundColor: colors.light.primary + "80",
};

const postButtonTextStyle: TextStyle = {
  color: "#ffffff",
  fontWeight: "bold",
};

const safeAreaStyle: ViewStyle = {
  flex: 1,
};

const timestampStyle: TextStyle = {
  color: "#666",
  fontSize: 12,
  marginLeft: 5,
};

const usernameStyle: TextStyle = {
  color: "#666",
  fontSize: 12,
};

const postButtonPressedStyle: ViewStyle = {
  opacity: 0.7,
};

const commentHeaderStyle: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
};

const commentFooterStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
  paddingLeft: 4,
};

const iconContainerStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginRight: 16,
};

const iconTextStyle: TextStyle = {
  fontSize: 12,
  color: colors.neutral.grey1,
  marginLeft: 4,
};
