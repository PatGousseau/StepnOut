import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Post from '../components/Post';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import CreatePost from '../components/CreatePost';
import { User } from '../models/User';

const Home = () => {
  const { user } = useAuth();
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

  return (
    <View style={{ flex: 1 }}>
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
      >
        <View style={{ padding: 16 }}>
          {posts.map(post => {
            const postUser = userMap[post.user_id] as User;
            return (
              <Post
                key={post.id}
                postUser={postUser}
                text={post.body}
                likes={postCounts[post.id]?.likes ?? 0}
                comments_count={postCounts[post.id]?.comments ?? 0}
                postId={post.id}
                userId={post.user_id}
                setPostCounts={setPostCounts}
                media={post.media_file_path ? { uri: post.media_file_path } : undefined}
              />
            );
          })}
        </View>
        
        {loading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
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
    </View>
  );
};

export default Home;
