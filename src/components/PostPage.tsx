import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import Post from './Post';
import { useLocalSearchParams } from 'expo-router';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { Text } from './StyledText';
import { CommentsList } from './Comments';
import { useFetchComments } from '../hooks/useFetchComments';
import { colors } from '../constants/Colors';

const PostPage = () => {
  const params = useLocalSearchParams();
  const postId = typeof params.id === 'string' ? parseInt(params.id) : params.id;
  
  const { userMap, fetchPost } = useFetchHomeData();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const { comments, loading: commentsLoading, fetchComments, addComment } = useFetchComments(postId);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        if (!postId) {
          console.error('No id available:', params);
          return;
        }
        const fetchedPost = await fetchPost(postId);
        setPost(fetchedPost);
        fetchComments();
      } catch (error) {
        console.error('Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (!post || !userMap[post.user_id]) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Post
          postUser={userMap[post.user_id]}
          text={post.body}
          likes={post.likes_count || 0}
          comments_count={post.comments_count || 0}
          postId={post.id}
          userId={post.user_id}
          setPostCounts={() => {}}
          media={post.media_file_path ? { uri: post.media_file_path } : undefined}
          isPostPage={true}
        />
        <View style={styles.commentsSection}>
          <CommentsList
            comments={comments}
            loading={commentsLoading}
            onClose={() => {}}
            postId={post.id}
            postUserId={post.user_id}
            onCommentAdded={(count) => {
              // Optionally handle comment count updates
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsSection: {
    flex: 1,
    backgroundColor: colors.light.background,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 16,
  },
});

export default PostPage;
