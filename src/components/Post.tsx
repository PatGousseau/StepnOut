import { useFetchHomeData } from '../hooks/useFetchHomeData';
import React, { useState, useEffect, useMemo } from 'react';
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
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import Comments from './Comments'; 
import { colors } from '../constants/Colors';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Text } from './StyledText';
import { Image } from 'expo-image';
import { sendLikeNotification, sendCommentNotification } from '../lib/notificationsService';
import { useAuth } from '../contexts/AuthContext';

interface UserMap {
  [key: string]: {
    username: string;
    name: string;
  }
}

interface PostProps {
  profilePicture: any;
  username: string;
  name: string;
  text?: string;
  media?: { uri: string } | undefined;
  likes: number;
  comments: number;
  postId: number;
  userId: string | undefined;
  setPostCounts: React.Dispatch<React.SetStateAction<{ [key: number]: { likes: number; comments: number } }>>;
  userMap: UserMap;
}

const Post: React.FC<PostProps> = ({ profilePicture, username, name, text, media, likes, comments, postId, userId, setPostCounts, userMap }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentList, setCommentList] = useState<{ id: number; text: string; userId: string }[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments); 
  const { toggleLike, fetchLikes, fetchComments, addComment } = useFetchHomeData();
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [animationState, setAnimationState] = useState<{
    translateY: Animated.Value;
    opacity: Animated.Value;
  } | null>(null);
  const { user } = useAuth();

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
    const fetchCommentData = async () => {
      const commentsData = await fetchComments(postId);
      setCommentList(
        commentsData.map(comment => ({
          id: comment.id,
          text: comment.body,
          userId: comment.user_id,
        }))
      );
      setCommentCount(commentsData.length);
    };

    if (postId) {
      fetchCommentData();
    }
  }, [postId, userMap]);

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

  const handleLikeToggle = async () => {
    if (!postId || !userId) {
      console.error("postId or userId is undefined", { postId, userId });
      return;
    }

    const isLiking = !liked;
    setLiked(isLiking);
    setLikeCount(prevCount => isLiking ? prevCount + 1 : prevCount - 1);

    const result = await toggleLike(postId, userId);

    if (result && isLiking) {
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
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    if (comment.text.trim()) {
      setCommentList(prevComments => [
        ...prevComments,
        { id: Date.now(), text: comment.text, userId },
      ]);
      setCommentCount(prevCount => prevCount + 1);

      const newComment = await addComment(postId, userId, comment.text);

      if (newComment) {
        setCommentList(prevComments =>
          prevComments.map(c => (c.id === Date.now() ? { ...c, id: newComment.id } : c))
        );

        setPostCounts(prevCounts => ({
          ...prevCounts,
          [postId]: {
            ...prevCounts[postId],
            comments: (prevCounts[postId]?.comments || 0) + 1,
          },
        }));

        try {
          await sendCommentNotification(user?.id, user?.user_metadata?.username, userId, postId.toString(), comment.text);
        } catch (error) {
          console.error('Failed to send comment notification:', error);
        }

        return true;
      }
    }
    return false;
  };

  const isVideo = (source: any) => {
    return source?.uri?.match(/\.(mp4|mov|avi|wmv)$/i);
  };

  const renderMedia = () => {
    if (!media) return null;
    

    if (isVideo(media)) {
      const player = useVideoPlayer(media.uri);
      
      return (
        <VideoView
          player={player}
          style={styles.mediaContent}
          contentFit="cover"
          nativeControls
        />
      );
    }

    return (
      <TouchableOpacity 
        onPress={() => setShowFullScreenImage(true)}
        activeOpacity={1}
      >
        <Image
          source={{ uri: media.uri }}
          style={styles.mediaContent}
          cachePolicy="memory-disk" 
          contentFit="contain"
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={profilePicture} style={styles.profilePicture} />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>@{username}</Text>
        </View>
      </View>
      {text && <Text style={styles.text}>{text}</Text>}
      {renderMedia()}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLikeToggle}>
          <View style={styles.iconContainer}>
            <Icon name={liked ? "heart" : "heart-o"} size={16} color={liked ? "#eb656b" : colors.neutral.grey1} />
            <Text style={styles.iconText}>{likeCount.toString()}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowComments(true)}>
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
        <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Pressable onPress={() => setShowComments(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
            <Comments
              initialComments={commentList}
              onAddComment={handleAddComment}
              userMap={userMap}
            />
          </View>
        </KeyboardAvoidingView>
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    justifyContent: 'flex-end',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'black',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    fontSize: 14,
    color: colors.light.primary,
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
});

export default Post;
