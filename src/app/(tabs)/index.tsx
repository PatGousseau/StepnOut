import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView,  RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import Post from '../../components/Post';
import { useFetchHomeData } from '../../hooks/useFetchHomeData';
import { colors } from '../../constants/Colors';
import CreatePost from '../../components/CreatePost';
import { User } from '../../models/User';
import { Loader } from '@/src/components/Loader';

const Home = () => {
  const { posts, userMap, loading, fetchAllData, loadMorePosts, hasMore  } = useFetchHomeData();
  const [postCounts, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const counts = posts.reduce((acc, post) => ({
      ...acc,
      [post.id]: {
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
      }
    }), {});
    setPostCounts(counts);
  }, [posts]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  const handlePostDeleted = useCallback(() => {
    // Refresh the posts list
    fetchAllData();
  }, [fetchAllData]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      <ScrollView 
        style={{ backgroundColor: colors.light.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom && !loading && hasMore) {
            loadMorePosts();
          }
        }}
        scrollEventThrottle={400}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ padding: 16 }}>
          {posts.map(post => {
            const postUser = userMap[post.user_id] as User;
            return (
              <Post
                key={post.id}
                post={post}  // Pass the entire post object
                postUser={postUser}
                setPostCounts={setPostCounts}
                onPostDeleted={handlePostDeleted}
              />
            );
          })}
        </View>
        
        {loading && (
            <Loader />
        )}
      </ScrollView>

      <View style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        elevation: 5, // for Android
        shadowColor: '#000', // for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}>
        <CreatePost />
      </View>
    </KeyboardAvoidingView>
  );
};

export default Home;
