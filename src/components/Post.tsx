import { useFetchHomeData } from '../hooks/useFetchHomeData';
import React, { useState, useEffect } from 'react';
import { View, 
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import Comments from './Comments'; 
import { colors } from '../constants/Colors';
import { Video } from 'expo-av';
import { ResizeMode } from 'expo-av';
import { Text } from './StyledText';

interface PostProps {
  profilePicture: any; 
  name: string;        
  username: string;
  text?: string;      
  media?: { uri: string } | undefined;     
  likes: number;
  comments: number;
  postId: number;
  userId: string;
  setPostCounts: React.Dispatch<React.SetStateAction<{ [key: number]: { likes: number; comments: number } }>>;
}

const Post: React.FC<PostProps> = ({ profilePicture, name, username, text, media, likes, comments, postId, userId, setPostCounts  }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentList, setCommentList] = useState<{ id: number; text: string; userName: string }[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments); 
  const { toggleLike, fetchLikes, fetchComments, addComment } = useFetchHomeData();

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
    const fetchCommentCount = async () => {
      const commentsData = await fetchComments(postId);
      setCommentList(commentsData.map(comment => ({
        id: comment.id,
        text: comment.body,
        userName: comment.user_id,
      })));
      setCommentCount(commentsData.length); // Set comment count directly
    };
    
    if (postId) {
      fetchCommentCount();
    }
  }, [postId]);

  const handleLikeToggle = async () => {
    if (!postId || !userId) {
        console.error("postId or userId is undefined", { postId, userId });
        return;
    }

    // Optimistically update the UI
    setLiked(prevLiked => !prevLiked);
    setLikeCount(prevCount => liked ? prevCount - 1 : prevCount + 1);

    // Attempt to update the database
    const result = await toggleLike(postId, userId);

    // Revert the UI update if there was an error
    if (!result) {
        setLiked(prevLiked => !prevLiked);  // Revert liked state
        setLikeCount(prevCount => liked ? prevCount + 1 : prevCount - 1);  // Revert like count
    }
};


  const handleAddComment = async (comment: { text: string; userName: string }) => {
    if (comment.text.trim()) {
      // Immediately update the UI with the new comment
      setCommentList(prevComments => [
        ...prevComments,
        { id: Date.now(), text: comment.text, userName: comment.userName }, // Use a temp id until it's saved
      ]);
      setCommentCount(prevCount => prevCount + 1); // Optimistically update the comment count

      // Add the comment to the database
      const newComment = await addComment(postId, userId, comment.text);

      if (newComment) {
        // Replace temp id with actual id from the database
        setCommentList(prevComments =>
          prevComments.map(c => (c.id === Date.now() ? { ...c, id: newComment.id } : c))
        );

        // Update global postCounts state if needed
        setPostCounts(prevCounts => ({
          ...prevCounts,
          [postId]: {
            ...prevCounts[postId],
            comments: (prevCounts[postId]?.comments || 0) + 1,
          },
        }));
      }
    }
  };

  const isVideo = (source: any) => {
    return source?.uri?.match(/\.(mp4|mov|avi|wmv)$/i);
  };

  const renderMedia = () => {
    if (!media) return null;
    
    if (isVideo(media)) {
      return (
        <Video
          source={media}
          style={styles.mediaContent}
          resizeMode={ResizeMode.COVER}
          useNativeControls={true}
          shouldPlay={false}
          isMuted={false}
          volume={1.0}
          isLooping={false}
          onError={(error) => {
            console.log('Video Error:', error);
          }}
        />
      );
    }
    
    return <Image source={media} style={styles.mediaContent} />;
  };

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
        transparent={true}
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
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
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
    height: 200,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark transparent background
  },
  modalContainer: {
    justifyContent: 'flex-end',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "black"
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
});

export default Post;
