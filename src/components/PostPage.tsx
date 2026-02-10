import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView
} from 'react-native';
import Post from './Post';
import { useLocalSearchParams } from 'expo-router';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { Text } from './StyledText';
import { profileService } from '../services/profileService';
import { colors } from '../constants/Colors';
import { Post as PostType } from '../types';  // todo: rename one of the Post types
import { Loader } from './Loader';
const PostPage = () => {
  const params = useLocalSearchParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const postId = idParam ? parseInt(idParam) : null;
  
  const { posts, userMap, loading, fetchPost } = useFetchHomeData();
  const [post, setPost] = useState<PostType | null>(null);
  const [fetchingPost, setFetchingPost] = useState(false);
  const [fetchedPostUser, setFetchedPostUser] = useState<unknown>(null);

  useEffect(() => {
    if (!postId) {
      console.error('[post page] no id available', params);
      return;
    }

    const cachedPost = posts?.find(p => p.id === postId);
    if (cachedPost) {
      setPost(cachedPost);
      return;
    }

    // if not already loaded, load it.
    const loadPost = async () => {
      setFetchingPost(true);
      try {
        const fetchedPost = await fetchPost(postId);
        setPost(fetchedPost);
      } catch (error) {
        console.error('[post page] error loading post', error);
      } finally {
        setFetchingPost(false);
      }
    };

    loadPost();
  }, [postId, posts]);

  useEffect(() => {
    const loadPostUser = async () => {
      if (!post?.user_id) return;
      if (userMap?.[post.user_id]) return;
      try {
        const profile = await profileService.fetchProfileById(post.user_id);
        setFetchedPostUser(profile);
      } catch (e) {
        console.error('[post page] error fetching post user profile', e);
      }
    };

    loadPostUser();
  }, [post?.user_id, userMap]);

  if (loading || fetchingPost) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Loader />
      </View>
    );
  }

  const postUser = post ? (userMap?.[post.user_id] ?? fetchedPostUser) : null;

  if (!post || !postUser) {
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
      >
        <Post
          post={post}
          postUser={postUser}
          setPostCounts={() => {}}
          isPostPage={true}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});

export default PostPage;
