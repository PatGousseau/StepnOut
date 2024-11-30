import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, StyleSheet, FlatList, Image, Animated, PanResponder, Platform, ActivityIndicator } from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../models/User';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface Comment {
  id: number;
  text: string;
  userId: string;
  created_at: string;
}

interface CommentsProps {
  initialComments: Comment[];
  onAddComment: (comment: { text: string; userId: string }) => void;
  onClose: () => void;
  loading?: boolean;
}

export const Comments: React.FC<CommentsProps> = ({ initialComments, onAddComment, onClose, loading = false }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(initialComments);
  const flatListRef = useRef<FlatList>(null);

  const translateY = new Animated.Value(0);
  const insets = useSafeAreaInsets();  // this is used for bottom padding on devices with curved corners
  
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
    // Scroll to end with a slight delay to ensure the list has rendered
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [initialComments]);

  const handleAddComment = async () => {
    if (newComment.trim() && user) {
      const newCommentObj = {
        id: Date.now(),
        text: newComment,
        userId: user.id
      };
      setComments(prevComments => [...prevComments, newCommentObj]);
      
      const result = await onAddComment(newCommentObj);
      
      if (result) {
        setNewComment('');
      }
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [{ translateY }],
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}
    >
      <View 
        {...panResponder.panHandlers}
        style={styles.dragHandle}
      >
        <View style={styles.dragIndicator} />
      </View>
      
      <View style={styles.commentsWrapper}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.light.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            style={styles.commentsList}
            data={comments}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <Comment userId={item.userId} text={item.text} created_at={item.created_at} />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No comments yet!</Text>
              </View>
            )}
          />
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor="#888"
          style={styles.input}
        />
        <Pressable 
          onPress={handleAddComment} 
          style={[
            styles.postButton,
            !user && styles.postButtonDisabled
          ]}
          disabled={!user}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

interface CommentProps {
  userId: string;
  text: string;
  created_at: string;
}

const Comment: React.FC<CommentProps> = ({ userId, text, created_at }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    User.getUser(userId).then(setUser);
  }, [userId]);

  if (!user) return null;

  const imageSource = user.profileImageUrl.startsWith('http') 
    ? { uri: user.profileImageUrl }
    : require('../assets/images/default-pfp.png');

  // relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString + 'Z'); // 'Z' to ensures UTC parsing
    const now = new Date();
    const nowUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    );
    
    const diffInSeconds = Math.floor((nowUTC - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    // Format date in UTC
    return date.toLocaleDateString(undefined, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.commentContainer}>
      <Image source={imageSource} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.nameContainer}>
          <Text style={styles.displayName}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.timestamp}>{formatRelativeTime(created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flex: 1,
  },
  dragHandle: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#DDDDDD',
    borderRadius: 3,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  postButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  postButtonDisabled: {
    backgroundColor: colors.light.primary + '80',
  },
  commentsWrapper: {
    flex: 1,
  },
  commentsList: {
    flexGrow: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
