import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Post from '../components/Post';
import TakeChallenge from '../components/TakeChallenge';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const { activeChallenge, posts, userMap, loading, fetchAllData, loadMorePosts, hasMore  } = useFetchHomeData();
  const [postCounts, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const counts = posts.reduce((acc, post) => ({
      ...acc,
      [post.id]: {
        likes: post.likes_count,
        comments: post.comments_count,
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
        {activeChallenge && (
          <TakeChallenge 
            title={activeChallenge.title} 
            description={activeChallenge.description} 
          />
        )}
        {posts.map(post => {
          const userData = userMap[post.user_id];

          const userMetadata = userData || { username: 'Unknown', name: 'Unknown' };
          return (
            <Post
              key={post.id}
              profilePicture={require('../assets/images/profile-pic.png')}
              name={userMetadata.name}
              username={userMetadata.username}
              text={post.body}
              likes={postCounts[post.id]?.likes ?? 0}
              comments={postCounts[post.id]?.comments ?? 0}
              postId={post.id}
              userId={user?.id}
              setPostCounts={setPostCounts}
              media={post.media_file_path ? { uri: post.media_file_path } : undefined}
              userMap={userMap} 
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
  );
};

export default Home;
