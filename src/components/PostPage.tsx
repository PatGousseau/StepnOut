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
import { useReactions } from '../contexts/ReactionsContext';
import { Text } from './StyledText';
import { profileService } from '../services/profileService';
import { colors } from '../constants/Colors';
import { Post as PostType } from '../types';  // todo: rename one of the Post types
import { Loader } from './Loader';
import { useLikes } from '../contexts/LikesContext';
import { useQueryClient } from '@tanstack/react-query';
const PostPage = () => {
  const params = useLocalSearchParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const postId = idParam ? parseInt(idParam) : null;
  const queryClient = useQueryClient();
  
  const { posts, userMap, loading, fetchPost } = useFetchHomeData();
  const { initializePostReactions } = useReactions();
  const { initializePostLikes, likeCounts } = useLikes();
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
      initializePostReactions([cachedPost]);
      return;
    }

    // if not already loaded, load it.
    const loadPost = async () => {
      setFetchingPost(true);
      try {
        const fetchedPost = await fetchPost(postId);
        setPost(fetchedPost);
        if (fetchedPost) initializePostReactions([fetchedPost]);
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

  useEffect(() => {
    const initLikes = async () => {
      if (!post) return;
      if (likeCounts?.[post.id] !== undefined) return;
      try {
        await initializePostLikes([post]);
      } catch (e) {
        console.error('[post page] error initializing post likes', e);
      }
    };

    initLikes();
  }, [post, likeCounts, initializePostLikes]);

  const postUser = post ? (userMap?.[post.user_id] ?? fetchedPostUser) : null;

  const handlePostDeleted = (deletedPost: PostType) => {
    type PaginatedPostsPage = { posts: PostType[]; hasMore: boolean };
    type PaginatedPostsData = { pages: PaginatedPostsPage[]; pageParams: number[] };

    queryClient.setQueriesData<PaginatedPostsData>({ queryKey: ["home-posts"] }, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((pagePost) => pagePost.id !== deletedPost.id),
        })),
      };
    });

    queryClient.setQueriesData<PaginatedPostsData>({ queryKey: ["challenge-posts"] }, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((pagePost) => pagePost.id !== deletedPost.id),
        })),
      };
    });

    if (deletedPost.challenge_id) {
      queryClient.invalidateQueries({ queryKey: ["challenge-completion", deletedPost.challenge_id] });
    }

    if (deletedPost.quest_id) {
      queryClient.invalidateQueries({ queryKey: ["quest-completion", deletedPost.quest_id] });
    }
  };

  // avoid flashing "post not found" while we're still resolving data from a notification deep-link
  const isResolvingPost = !!postId && (!post || !postUser);

  if (loading || fetchingPost || isResolvingPost) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Loader />
      </View>
    );
  }

  if (!postId) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Post not found</Text>
      </View>
    );
  }

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
          onPostDeleted={handlePostDeleted}
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
