import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, TextInput, Pressable, StyleSheet, FlatList, Image, Animated, PanResponder, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../models/User';
import { sendCommentNotification } from '../lib/notificationsService';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';

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
  onCommentAdded 
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleAddComment = async () => {
    if (newComment.trim() && user) {
      const commentText = newComment.trim();
      
      try {
        const { data: savedComment, error } = await supabase
          .from('comments')
          .insert({
            user_id: user.id,
            post_id: postId,
            body: commentText,
          })
          .select('*')
          .single();

        if (error) throw error;

        if (savedComment) {
          setComments(prevComments => [...prevComments, {
            id: savedComment.id,
            text: savedComment.body,
            userId: savedComment.user_id,
            created_at: savedComment.created_at
          }]);
          
          setNewComment('');
          
          if (user.id !== postUserId) {
            try {
              await sendCommentNotification(
                user.id,
                user.user_metadata?.username,
                postUserId,
                postId.toString(),
                commentText
              );
            } catch (error) {
              console.error('Failed to send comment notification:', error);
            }
          }

          onCommentAdded?.(1);
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
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
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <Comment userId={item.userId} text={item.text} created_at={item.created_at} />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('No comments yet!')}</Text>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder={t('Add a comment...')}
            placeholderTextColor="#888"
            style={styles.input}
          />
          <Pressable 
            onPress={handleAddComment} 
            style={[styles.postButton, !user && styles.postButtonDisabled]}
            disabled={!user}
          >
            <Text style={styles.postButtonText}>{t('Post')}</Text>
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
      style={[styles.container, { 
        transform: [{ translateY }],
      }]}
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
  userId: string;
  text: string;
  created_at: string;
}

const Comment: React.FC<CommentProps> = ({ userId, text, created_at }) => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const { onClose } = useContext(CommentsContext);

  useEffect(() => {
    User.getUser(userId).then(setUser);
  }, [userId]);

  if (!user) return null;

  const imageSource = user.profileImageUrl.startsWith('http') 
    ? { uri: user.profileImageUrl }
    : require('../assets/images/default-pfp.png');

  const handleProfilePress = () => {
    onClose?.();
    router.push(`/profile/${userId}`);
  };

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
    
    if (diffInSeconds < 60) return t('just now');
    if (diffInSeconds < 3600) return t('(count)m', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('(count)h', { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t('(count)d', { count: Math.floor(diffInSeconds / 86400) });
    
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
      <TouchableOpacity onPress={handleProfilePress}>
        <Image source={imageSource} style={styles.commentAvatar} />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <TouchableOpacity onPress={handleProfilePress}>
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>{user.name}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.timestamp}>{formatRelativeTime(created_at)}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.commentText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
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
  safeArea: {
    flex: 1,
  },
});
