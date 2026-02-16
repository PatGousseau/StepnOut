import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  TextInput,
  Pressable,
  FlatList,
  Image,
  Animated,
  PanResponder,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../models/User";
import { sendCommentNotification } from "../lib/notificationsService";
import { router } from "expo-router";
import { useLanguage } from "../contexts/LanguageContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { formatRelativeTime } from "../utils/time";
import { CommentsListSkeleton, CommentSkeleton } from "./Skeleton";
import { Comment as CommentType } from "../types"; // todo: rename one of the Comment types
import { useLikes } from "../contexts/LikesContext";
import { useReactions } from "../contexts/ReactionsContext";
import { ReactionsBar } from "./ReactionsBar";
import { ActionsMenu } from "./ActionsMenu";
import { MenuProvider } from "react-native-popup-menu";
import { captureEvent } from "../lib/posthog";
import { COMMENT_EVENTS } from "../constants/analyticsEvents";
import { translationService } from "../services/translationService";

interface CommentsProps {
  initialComments: CommentType[];
  onClose: () => void;
  loading?: boolean;
  postId: number;
  postUserId: string;
  onCommentAdded?: (newCount: number) => void;
  addComment: (userId: string, body: string, parentCommentId?: number | null) => Promise<CommentType | null>;
  isAddingComment?: boolean;
}

interface CommentsListProps {
  comments: CommentType[];
  loading?: boolean;
  flatListRef?: React.RefObject<FlatList>;
  onClose?: () => void;
  postId: number;
  postUserId: string;
  onCommentAdded?: (newCount: number) => void;
  addComment: (userId: string, body: string, parentCommentId?: number | null) => Promise<CommentType | null>;
  isAddingComment?: boolean;
}

const CommentsContext = React.createContext<{ onClose?: () => void }>({});

type DisplayComment = CommentType & {
  indentLevel: number;
  isLastReply?: boolean;
  replyToUserId?: string;
};

const getRootCommentId = (commentsById: Map<number, CommentType>, comment: CommentType) => {
  const visited = new Set<number>();
  let current: CommentType | undefined = comment;

  while (current?.parent_comment_id) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    current = commentsById.get(current.parent_comment_id);
  }

  return current?.id ?? comment.id;
};

const buildDisplayComments = (comments: CommentType[]): DisplayComment[] => {
  const commentsById = new Map<number, CommentType>();
  for (const c of comments) commentsById.set(c.id, c);

  const topLevel = comments
    .filter((c) => !c.parent_comment_id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const repliesByRoot = new Map<number, CommentType[]>();
  for (const c of comments) {
    if (!c.parent_comment_id) continue;
    const rootId = getRootCommentId(commentsById, c);
    const existing = repliesByRoot.get(rootId) || [];
    existing.push(c);
    repliesByRoot.set(rootId, existing);
  }

  for (const [rootId, replies] of repliesByRoot.entries()) {
    repliesByRoot.set(
      rootId,
      replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    );
  }

  const out: DisplayComment[] = [];
  for (const root of topLevel) {
    out.push({ ...root, indentLevel: 0 });

    const replies = repliesByRoot.get(root.id) || [];
    for (let i = 0; i < replies.length; i++) {
      const r = replies[i];
      const replyToComment = r.parent_comment_id ? commentsById.get(r.parent_comment_id) : null;
      out.push({
        ...r,
        indentLevel: 1,
        isLastReply: i === replies.length - 1,
        replyToUserId: replyToComment?.userId || root.userId,
      });
    }
  }

  return out;
};

export const CommentsList: React.FC<CommentsListProps> = ({
  comments: initialComments,
  loading = false,
  flatListRef,
  onClose,
  postId,
  postUserId,
  onCommentAdded,
  addComment,
  isAddingComment = false,
}) => {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { initializeCommentLikes } = useLikes();
  const { initializeCommentReactions } = useReactions();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ commentId: number; userId: string; username: string } | null>(null);
  const [comments, setComments] = useState(initialComments);
  const [translateOutgoing, setTranslateOutgoing] = useState(true);

  useEffect(() => {
    setComments(initialComments);
    // Initialize likes for the comments
    if (initialComments.length > 0) {
      initializeCommentLikes(initialComments);
      initializeCommentReactions(initialComments);
    }
  }, [initialComments]);

  const handleAddComment = async () => {
    if (newComment.trim() && user) {
      let commentText = newComment.trim();

      try {
        if (isAdmin && translateOutgoing) {
          const result = await translationService.translateToItalian(commentText);
          if (!result.translatedText) {
            Alert.alert('Translation failed', result.error || 'Could not translate');
            return;
          }
          commentText = result.translatedText;
        }

        const parentCommentId = replyTo?.commentId ?? null;
        const newCommentData = await addComment(user.id, commentText, parentCommentId);

        if (newCommentData) {
          setNewComment("");
          setReplyTo(null);

          setComments((prevComments) => [...prevComments, newCommentData]);

          const senderUsername = user.user_metadata?.username;

          if (senderUsername) {
            const recipients = new Set<string>();

            const allComments = [...comments, newCommentData];
            const commentsById = new Map<number, CommentType>();
            for (const c of allComments) commentsById.set(c.id, c);

            const rootId = parentCommentId
              ? getRootCommentId(commentsById, { ...newCommentData, parent_comment_id: parentCommentId })
              : newCommentData.id;

            const threadComments = allComments.filter((c) => {
              if (!c.parent_comment_id) return c.id === rootId;
              return getRootCommentId(commentsById, c) === rootId;
            });

            for (const c of threadComments) recipients.add(c.userId);
            recipients.add(postUserId);

            recipients.delete(user.id);

            await Promise.all(
              Array.from(recipients).map((recipientId) =>
                sendCommentNotification(
                  user.id,
                  senderUsername,
                  recipientId,
                  postId.toString(),
                  commentText,
                  newCommentData.id.toString(),
                  {
                    title: t("(username) commented"),
                    body: t("Check it out now."),
                  }
                )
              )
            );
          }

          onCommentAdded?.(1);

          captureEvent(COMMENT_EVENTS.CREATED, {
            post_id: postId,
            comment_id: newCommentData.id,
            comment_length: commentText.length,
            is_reply: !!parentCommentId,
          });
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
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["home-posts"] }); // Refresh comment counts on home page
      queryClient.invalidateQueries({ queryKey: ["comments", postId] }); // Refresh comments list
      
      return newComments;
    });
  };

  if (loading) {
    return (
      <View style={loadingContainerStyle}>
        <CommentsListSkeleton count={4} />
      </View>
    );
  }

  return (
    <CommentsContext.Provider value={{ onClose }}>
      <View style={commentsWrapperStyle}>
        <FlatList
          ref={flatListRef}
          style={commentsListStyle}
          data={buildDisplayComments(comments)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Comment
              id={item.id}
              userId={item.userId}
              text={item.text}
              created_at={item.created_at}
              post_id={item.post_id}
              indentLevel={item.indentLevel}
              isLastReply={item.isLastReply}
              replyToUserId={item.replyToUserId}
              onReply={(username) => setReplyTo({ commentId: item.id, userId: item.userId, username })}
              onCommentDeleted={() => handleCommentDeleted(item.id)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={emptyContainerStyle}>
              <Text style={emptyTextStyle}>{t("No comments yet!")}</Text>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        <View style={inputWrapperStyle}>
          {replyTo ? (
            <View style={replyToContainerStyle}>
              <Text style={replyToTextStyle}>{t("Replying to")} @{replyTo.username}</Text>
              <TouchableOpacity onPress={() => setReplyTo(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="times" size={14} color={colors.neutral.grey1} />
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={inputContainerStyle}>
            <View style={inputInnerContainerStyle}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder={replyTo ? `${t("Reply to")} @${replyTo.username}...` : t("Add a comment...")}
                placeholderTextColor="#888"
                style={inputStyle}
                multiline
                textAlignVertical="top"
              />
            </View>

            {isAdmin ? (
              <TouchableOpacity
                onPress={() => setTranslateOutgoing((v) => !v)}
                style={[translatePillStyle, translateOutgoing ? translatePillOnStyle : null]}
                activeOpacity={0.8}
              >
                <Text style={[translatePillTextStyle, translateOutgoing ? translatePillTextOnStyle : null]}>
                  EN→IT
                </Text>
              </TouchableOpacity>
            ) : null}

            <Pressable
              onPress={handleAddComment}
              style={({ pressed }) => [
                postButtonStyle,
                (!user || isAddingComment) && postButtonDisabledStyle,
                pressed && postButtonPressedStyle,
              ]}
              disabled={!user || isAddingComment}
            >
              <Text style={postButtonTextStyle}>
                {isAddingComment ? t("Posting...") : t("Post")}
              </Text>
            </Pressable>
          </View>
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
  addComment,
  isAddingComment,
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
            addComment={addComment}
            isAddingComment={isAddingComment}
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
  post_id: number;
  indentLevel?: number;
  isLastReply?: boolean;
  replyToUserId?: string;
  onReply?: (username: string) => void;
  onCommentDeleted?: () => void;
}

const Comment: React.FC<CommentProps> = ({
  id,
  userId,
  text,
  created_at,
  post_id,
  indentLevel = 0,
  isLastReply = false,
  replyToUserId,
  onReply,
  onCommentDeleted,
}) => {
  const { onClose } = useContext(CommentsContext);
  const { user: currentUser, isAdmin } = useAuth();
  const { likedComments, commentLikeCounts, toggleCommentLike } = useLikes();
  const { commentReactions, toggleCommentReaction } = useReactions();

  const [user, setUser] = useState<User | null>(null);
  const [replyToUser, setReplyToUser] = useState<User | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await User.getUser(userId);
      setUser(userData);
    };

    loadUser();
  }, [userId]);

  useEffect(() => {
    const loadReplyToUser = async () => {
      if (!replyToUserId) {
        setReplyToUser(null);
        return;
      }
      const userData = await User.getUser(replyToUserId);
      setReplyToUser(userData);
    };

    loadReplyToUser();
  }, [replyToUserId]);

  if (!user || !user.profile) {
    return <CommentSkeleton />;
  }

  const handleProfilePress = () => {
    onClose?.();
    router.push(`/profile/${userId}`);
    captureEvent(COMMENT_EVENTS.PROFILE_CLICKED, {
      comment_id: id,
      target_user_id: userId,
      post_id: post_id,
    });
  };

  const handleTranslate = async () => {
    if (!text || isTranslating) return;

    setIsTranslating(true);
    const result = await translationService.translateToEnglish(text);
    setIsTranslating(false);

    if (result.translatedText) {
      setTranslatedText(result.translatedText);
    } else if (result.error) {
      console.error('Translation error:', result.error);
    }
  };

  return (
    <View style={commentContainerStyle}>
      {indentLevel ? (
        <View style={replyBranchStyle}>
          <View style={[replyTrunkStyle, isLastReply ? replyTrunkLastStyle : null]} />
          <View style={replyConnectorStyle} />
        </View>
      ) : null}
      <TouchableOpacity onPress={handleProfilePress}>
        {user.profileImageUrl ? (
          <Image source={{ uri: user.profileImageUrl }} style={commentAvatarStyle} />
        ) : (
          <View style={defaultCommentAvatarStyle}>
            <MaterialCommunityIcons name="account-circle" size={30} color="#e1e1e1" />
          </View>
        )}
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
          <View style={commentFooterStyle}>
            {onReply ? (
              <TouchableOpacity
                onPress={() => (user?.username ? onReply(user.username) : null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={iconContainerStyle}>
                  <Icon name="reply" size={14} color={colors.neutral.grey1} />
                </View>
              </TouchableOpacity>
            ) : null}
            {isAdmin && text && (
              <TouchableOpacity onPress={handleTranslate} disabled={isTranslating} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {isTranslating ? (
                  <ActivityIndicator size={14} color={colors.neutral.grey1} />
                ) : (
                  <Icon
                    name="language"
                    size={14}
                    color={translatedText ? colors.light.primary : colors.neutral.grey1}
                  />
                )}
              </TouchableOpacity>
            )}
            <ActionsMenu
              type="comment"
              contentId={id}
              contentUserId={userId}
              onDelete={onCommentDeleted}
              menuOffset={-Dimensions.get("window").height * 0.25 + 20}
            >
              <Icon name="ellipsis-h" size={14} color={colors.neutral.grey1} />
            </ActionsMenu>
          </View>
        </View>
        <View style={commentTextContainerStyle}>
          <Text style={commentTextStyle}>
            {indentLevel && replyToUser?.username ? (
              <Text style={replyToUsernameStyle}>@{replyToUser.username} </Text>
            ) : null}
            {text}
          </Text>
          {translatedText && (
            <View style={translationContainerStyle}>
              <Text style={translationLabelStyle}>Translation:</Text>
              <Text style={translationTextStyle}>{translatedText}</Text>
            </View>
          )}

          <ReactionsBar
            reactions={commentReactions[id] || []}
            onToggle={(emoji) => {
              if (!currentUser) return;
              toggleCommentReaction(id, post_id, currentUser.id, userId, emoji);
            }}
            isLiked={!!likedComments[id]}
            likeCount={commentLikeCounts[id] || 0}
            onLikeToggle={() => {
              if (!currentUser) return;
              toggleCommentLike(id, post_id, currentUser.id, userId);
            }}
          />
        </View>
      </View>
    </View>
  );
};

const commentAvatarStyle: ImageStyle = {
  borderRadius: 15,
  height: 30,
  marginRight: 10,
  marginTop: 2,
  width: 30,
};

const defaultCommentAvatarStyle: ViewStyle = {
  borderRadius: 15,
  height: 30,
  marginRight: 10,
  marginTop: 2,
  width: 30,
};

const commentContainerStyle: ViewStyle = {
  alignItems: "flex-start",
  flexDirection: "row",
  marginBottom: 10,
};

const replyBranchStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 6,
  marginRight: 10,
  alignSelf: "stretch",
};

const replyTrunkStyle: ViewStyle = {
  width: 2,
  backgroundColor: colors.neutral.grey2,
  alignSelf: "stretch",
  marginBottom: -10, // Extend through the gap to next reply
};

const replyTrunkLastStyle: ViewStyle = {
  height: "50%",
  alignSelf: "flex-start",
  marginBottom: 0, // Don't extend past the last reply
};

const replyConnectorStyle: ViewStyle = {
  width: 12,
  height: 2,
  backgroundColor: colors.neutral.grey2,
  marginLeft: 0,
  marginRight: 0,
};

const commentContentStyle: ViewStyle = {
  flex: 1,
};

const commentTextStyle: TextStyle = {
  color: "#333",
  fontSize: 14,
};

const replyToUsernameStyle: TextStyle = {
  color: colors.neutral.grey1,
  fontWeight: "600",
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

const inputWrapperStyle: ViewStyle = {
  marginBottom: 8,
  marginTop: 10,
  paddingHorizontal: 8,
};

const inputContainerStyle: ViewStyle = {
  display: "flex",
  alignItems: "flex-end",
  flexDirection: "row",
};

const inputInnerContainerStyle: ViewStyle = {
  flex: 1,
  marginRight: 10,
};

const replyToContainerStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 6,
};

const replyToTextStyle: TextStyle = {
  color: colors.neutral.grey1,
  fontSize: 12,
};

const loadingContainerStyle: ViewStyle = {
  flex: 1,
  paddingTop: 8,
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
  alignSelf: "flex-end",
};

const translatePillStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.neutral.grey2,
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 6,
  marginRight: 10,
  alignSelf: "flex-end",
};

const translatePillOnStyle: ViewStyle = {
  backgroundColor: colors.light.primary,
  borderColor: colors.light.primary,
};

const translatePillTextStyle: TextStyle = {
  color: colors.neutral.grey1,
  fontSize: 12,
  fontWeight: "700",
};

const translatePillTextOnStyle: TextStyle = {
  color: "#ffffff",
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
};

const commentTextContainerStyle: ViewStyle = {
  width: "100%",
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

const translationContainerStyle: ViewStyle = {
  backgroundColor: colors.light.accent2,
  borderLeftWidth: 3,
  borderLeftColor: colors.light.primary,
  paddingHorizontal: 10,
  paddingVertical: 6,
  marginTop: 6,
  borderRadius: 4,
};

const translationLabelStyle: TextStyle = {
  fontSize: 10,
  color: colors.light.primary,
  fontWeight: "600",
  marginBottom: 2,
};

const translationTextStyle: TextStyle = {
  fontSize: 13,
  color: colors.light.text,
};
