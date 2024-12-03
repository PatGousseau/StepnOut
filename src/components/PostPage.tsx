import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  FlatList 
} from 'react-native';
import Post from './Post';
import { useLocalSearchParams } from 'expo-router';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { Text } from './StyledText';
import { CommentsList } from './Comments';
import { useFetchComments } from '../hooks/useFetchComments';
import { colors } from '../constants/Colors';
import { Post as PostType } from '../types';  // todo: rename one of the Post types

const PostPage = () => {
  const params = useLocalSearchParams();
  const postId = typeof params.id === 'string' ? parseInt(params.id) : params.id;
  
  const { userMap, fetchPost } = useFetchHomeData();
  const [post, setPost] = useState<PostType | null>(null);
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      <FlatList
        ListHeaderComponent={() => (
          <Post
            post={post}
            postUser={userMap[post.user_id]}
            setPostCounts={() => {}}
            isPostPage={true}
          />
        )}
        data={[{ key: 'comments' }]}
        renderItem={() => (
          <View style={styles.commentsSection}>
            <CommentsList
              comments={comments}
              loading={commentsLoading}
              onClose={() => {}}
              postId={post.id}
              postUserId={post.user_id}
              onCommentAdded={(count) => {}}
            />
          </View>
        )}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      />
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
