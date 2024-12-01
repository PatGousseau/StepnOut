import { useFetchHomeData } from '../hooks/useFetchHomeData';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
  Animated,
  GestureResponderEvent,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { CommentsModal, Comment } from './Comments'; 
import { colors } from '../constants/Colors';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Text } from './StyledText';
import { Image } from 'expo-image';
import { sendLikeNotification, sendCommentNotification } from '../lib/notificationsService';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../models/User';
import { useFetchComments } from '../hooks/useFetchComments';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

interface PostProps {
  postUser: User;
  text?: string;
  media?: { uri: string } | undefined;
  likes: number;
  comments_count: number;
  postId: number;
  userId: string;
  setPostCounts?: React.Dispatch<React.SetStateAction<{ [key: number]: { likes: number; comments: number } }>>;
  isPostPage?: boolean;
}

const Post: React.FC<PostProps> = ({ 
  postUser, 
  text, 
  media, 
  likes, 
  comments_count,
  postId, 
  userId, 
  setPostCounts,
  isPostPage = false,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments_count || 0);
  const { toggleLike, fetchLikes } = useFetchHomeData();
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [animationState, setAnimationState] = useState<{
    translateY: Animated.Value;
    opacity: Animated.Value;
  } | null>(null);
  const { user } = useAuth();
  const { comments: commentList, loading: commentsLoading, fetchComments, addComment } = useFetchComments(postId);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const initializeLikes = async () => {
      const likes = await fetchLikes(postId);
      setLiked(likes.some((like) => like.user_id === userId));
      setLikeCount(likes.length);
    };

    if (postId) {
      initializeLikes();
    }
  }, [postId]);

  useEffect(() => {
    if (showFullScreenImage) {
      setAnimationState({
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
      });
    } else {
      setAnimationState(null);
    }
  }, [showFullScreenImage]);

  useEffect(() => {
    setCommentCount(comments_count);
  }, [comments_count]);

  const updateParentCounts = useCallback((newLikeCount: number, newCommentCount: number) => {
    if (setPostCounts) {
      setPostCounts(prevCounts => ({
        ...prevCounts,
        [postId]: {
          likes: newLikeCount,
          comments: newCommentCount,
        },
      }));
    }
  }, [postId, setPostCounts]);

  const handleLikeToggle = async () => {
    if (!postId || !userId) {
      console.error("postId or userId is undefined", { postId, userId });
      return;
    }

    const isLiking = !liked;
    setLiked(isLiking);
    const newLikeCount = isLiking ? likeCount + 1 : likeCount - 1;
    setLikeCount(newLikeCount);
    updateParentCounts(newLikeCount, commentCount);

    const result = await toggleLike(postId, userId);
    if (result && isLiking && user?.id !== userId) {
      try {
        await sendLikeNotification(user?.id, user?.user_metadata?.username, userId, postId.toString());
      } catch (error) {
        console.error('Failed to send like notification:', error);
      }
    }

    if (!result) {
      setLiked(!isLiking);
      setLikeCount(prevCount => isLiking ? prevCount - 1 : prevCount + 1);
    }
  };

  const handleAddComment = async (comment: { text: string; userId: string }) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    if (comment.text.trim()) {
      const newComment = await addComment(user.id, comment.text);

      if (newComment) {
        const newCommentCount = commentCount + 1;
        setCommentCount(newCommentCount);
        updateParentCounts(likeCount, newCommentCount);

        if (user.id !== userId) {
          try {
            await sendCommentNotification(user?.id, user?.user_metadata?.username, userId, postId.toString(), comment.text);
          } catch (error) {
            console.error('Failed to send comment notification:', error);
          }
        }

        return true;
      }
    }
    return false;
  };

  const isVideo = (source: any) => {
    return source?.uri?.match(/\.(mp4|mov|avi|wmv)$/i);
  };

  const handleMediaPress = () => {
    if (media && isVideo(media)) {
      return;
    }

    if (isPostPage) {
      setShowFullScreenImage(true);
    } else {
      handlePostPress();
    }
  };

  const renderMedia = () => {
    if (!media) return null;
    
    if (isVideo(media)) {
      const player = useVideoPlayer(media.uri);
      
      return (
        <TouchableOpacity 
          onPress={handleMediaPress}
          activeOpacity={1}
        >
          <VideoView
            player={player}
            style={styles.mediaContent}
            contentFit="cover"
            nativeControls
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        onPress={handleMediaPress}
        activeOpacity={1}
      >
        <Image
          source={{ uri: media.uri }}
          style={styles.mediaContent}
          cachePolicy="memory-disk" 
          contentFit="cover"
          transition={200}
        />
      </TouchableOpacity>
    );
  };

  const panResponder = useMemo(() => {
    if (!animationState) return PanResponder.create({ onStartShouldSetPanResponder: () => false });

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        animationState.translateY.setValue(gestureState.dy);
        animationState.opacity.setValue(1 - Math.abs(gestureState.dy) / (screenHeight / 2));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > 150) {
          Animated.parallel([
            Animated.timing(animationState.translateY, {
              toValue: gestureState.dy > 0 ? screenHeight : -screenHeight,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(animationState.opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => setShowFullScreenImage(false));
        } else {
          Animated.parallel([
            Animated.spring(animationState.translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(animationState.opacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    });
  }, [animationState]);

  const handleOpenComments = () => {
    setShowComments(true);
    fetchComments();
  };

  const handlePostPress = () => {
    router.push(`/post/${postId}`);
  };

  const handleProfilePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push(`/profile/${postUser.id}`);
  }
  
  const handleReport = async () => {
    Alert.alert(
      "Report Post",
      "Are you sure you want to report this post?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('reports')
                .insert([
                  {
                    post_id: postId,
                    reporter_id: user?.id,
                    reported_user_id: userId,
                    status: 'pending'
                  }
                ]);

              if (error) throw error;

              Alert.alert(
                "Thank you",
                "Your report has been submitted and will be reviewed by our team."
              );
            } catch (error) {
              console.error('Error submitting report:', error);
              Alert.alert(
                "Error",
                "Failed to submit report. Please try again later."
              );
            }
          }
        }
      ]
    );
  };

  const handleBlock = async () => {
    Alert.alert(
      "Block User",
      "Are you sure you want to block this user?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('blocks')
                .insert([
                  {
                    blocker_id: user?.id,
                    blocked_id: postUser.id
                  }
                ]);

              if (error) throw error;

              Alert.alert(
                "Success",
                "User has been blocked successfully."
              );
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert(
                "Error",
                "Failed to block user. Please try again later."
              );
            }
          }
        }
      ]
    );
  };

  return (
    <Pressable onPress={handlePostPress} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image 
            source={
              postUser?.profileImageUrl?.startsWith('http')
                ? { uri: postUser?.profileImageUrl }
                : require('../assets/images/default-pfp.png')
            }
            style={styles.profilePicture} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfilePress} style={styles.nameContainer}>
          <Text style={styles.name}>{postUser?.name || 'Unknown'}</Text>
          <Text style={styles.username}>@{postUser?.username || 'unknown'}</Text>
        </TouchableOpacity>
        <Menu style={styles.menuContainer}>
          <MenuTrigger>
            <Icon name="ellipsis-h" size={16} color={colors.neutral.grey1} />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            <MenuOption onSelect={handleReport}>
              <Text style={styles.menuOptionText}>Report Post</Text>
            </MenuOption>
            <MenuOption onSelect={handleBlock}>
              <Text style={styles.menuOptionText}>Block User</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
      {text && <Text style={styles.text}>{text}</Text>}
      {renderMedia()}
      <View>
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLikeToggle}>
          <View style={styles.iconContainer}>
            <Icon name={liked ? "heart" : "heart-o"} size={16} color={liked ? "#eb656b" : colors.neutral.grey1} />
            <Text style={styles.iconText}>{likeCount.toString()}</Text>
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
          >
            <CommentsModal
              initialComments={commentList}
              onAddComment={handleAddComment}
              onClose={() => setShowComments(false)}
              loading={commentsLoading}
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
          {animationState && (
            <Animated.View
              style={[
                styles.fullScreenImageWrapper,
                {
                  transform: [{ translateY: animationState.translateY }],
                  opacity: animationState.opacity,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Image
                source={{ uri: media?.uri }}
                style={{
                  width: screenWidth,
                  height: screenHeight,
                }}
                contentFit="contain"
                transition={200}
              />
            </Animated.View>
          )}
        </View>
      </Modal>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    padding: 10,
    paddingBottom: 16,
    // backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: 'column',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    fontSize: 12,
    color: '#666',
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
  mediaContent: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 32, 
  },
  iconText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#5A5A5A',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    height: '100%',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '75%',
    height: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    marginLeft: 'auto',
    padding: 8,
  },
  menuOptionText: {
    fontSize: 16,
    padding: 10,
  },
});

const optionsStyles = {
  optionsContainer: {
    borderRadius: 10,
    padding: 5,
    width: 150,
  },
};

export default Post;
