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
import { Post as PostType } from '../types';
import { postService } from '../services/postService';

interface PostProps {
  post: PostType;
  postUser: User;
  setPostCounts?: React.Dispatch<React.SetStateAction<{ [key: number]: { likes: number; comments: number } }>>;
  isPostPage?: boolean;
  onPostDeleted?: () => void;
}

const Post: React.FC<PostProps> = ({ 
  post,
  postUser, 
  setPostCounts,
  isPostPage = false,
  onPostDeleted,
}) => {

  if (!post) return null;
  
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const { toggleLike, fetchLikes } = useFetchHomeData();
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [animationState, setAnimationState] = useState<{
    translateY: Animated.Value;
    opacity: Animated.Value;
  } | null>(null);
  const { user } = useAuth();
  const { comments: commentList, loading: commentsLoading, fetchComments, addComment } = useFetchComments(post.id);

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
    setCommentCount(post.comments_count);
  }, [post.comments_count]);

  const updateParentCounts = useCallback((newLikeCount: number, newCommentCount: number) => {
    if (setPostCounts) {
      setPostCounts(prevCounts => ({
        ...prevCounts,
        [post.id]: {
          likes: newLikeCount,
          comments: newCommentCount,
        },
      }));
    }
  }, [post.id, setPostCounts]);

  const handleLikeToggle = async () => {
    if (!post.id || !post.user_id || !user?.id) {
      console.error("Missing required data for like toggle");
      return;
    }

    const isLiking = !liked;
    setLiked(isLiking);
    const newLikeCount = isLiking ? likeCount + 1 : likeCount - 1;
    setLikeCount(newLikeCount);
    updateParentCounts(newLikeCount, commentCount);

    const result = await postService.toggleLike(post.id, user.id, post.user_id);
    
    if (result === null) {
      // Reset UI if operation failed
      setLiked(!isLiking);
      setLikeCount(prevCount => isLiking ? prevCount - 1 : prevCount + 1);
    }
  };

  const handleAddComment = async (comment: { text: string; userId: string }) => {
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    const newComment = await addComment(user.id, comment.text);
    return !!newComment;
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
    if (post.media_file_path && isVideo(post.media_file_path)) {
      return;
    }

    if (isPostPage) {
      setShowFullScreenImage(true);
    } else {
      handlePostPress();
    }
  };

  const renderMedia = () => {
    if (!post.media_file_path) return null;
    
    if (isVideo(post.media_file_path)) {
      const player = useVideoPlayer(post.media_file_path);
      
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
          source={{ uri: post.media_file_path }}
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
    router.push(`/post/${post.id}`);
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            if (!user?.id) return;
            
            const success = await postService.reportPost(post.id, user.id, post.user_id);
            if (success) {
              Alert.alert(
                "Thank you",
                "Your report has been submitted and will be reviewed by our team."
              );
            } else {
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            if (!user?.id) return;
            
            const success = await postService.blockUser(user.id, post.user_id);
            if (success) {
              Alert.alert("Success", "User has been blocked successfully.");
            } else {
              Alert.alert("Error", "Failed to block user. Please try again later.");
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('post')
                .delete()
                .eq('id', post.id);

              if (error) throw error;

              Alert.alert("Success", "Post deleted successfully");
              onPostDeleted?.();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert(
                "Error",
                "Failed to delete post. Please try again later."
              );
            }
          }
        }
      ]
    );
  };

  const handleChallengePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (post.challenge_id) {
      router.push(`/challenge/${post.challenge_id}`);
    }
  };

  return (
    <Pressable 
      onPress={handlePostPress} 
      style={[
        styles.container,
        post.challenge_id ? styles.challengeContainer : null
      ]}
    >
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
          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{postUser?.name || 'Unknown'}</Text>
            <Text style={styles.username}>@{postUser?.username || 'unknown'}</Text>
          </View>
        </TouchableOpacity>
        <Menu style={styles.menuContainer}>
          <MenuTrigger style={{ padding: 8 }}>
            <Icon name="ellipsis-h" size={16} color={colors.neutral.grey1} />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            {user?.id === post.user_id ? (
              <MenuOption onSelect={handleDelete}>
                <Text style={[styles.menuOptionText, { color: 'red' }]}>Delete Post</Text>
              </MenuOption>
            ) : (
              <>
                <MenuOption onSelect={handleReport}>
                  <Text style={styles.menuOptionText}>Report Post</Text>
                </MenuOption>
                <MenuOption onSelect={handleBlock}>
                  <Text style={styles.menuOptionText}>Block User</Text>
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
              <Text style={{ fontWeight: 'bold' }}>Challenge:</Text> {post.challenge_title}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      {post.body && <Text style={styles.text}>{post.body}</Text>}
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
                source={{ uri: post.media_file_path }}
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
    borderRadius: 8,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  challengeContainer: {
    // backgroundColor: '#ffeecc',
    // borderWidth: 1,
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
    flex: 1,
  },
  userInfoContainer: {
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
  challengeBox: {
    backgroundColor: colors.light.accent2,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.25,
    borderColor: colors.light.primary,
    marginBottom: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    width: '100%',
  },
  challengeTitle: {
    color: colors.light.primary,
    fontSize: 13,
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
