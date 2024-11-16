import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Post from '../components/Post';
import TakeChallenge from '../components/TakeChallenge';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { colors } from '../constants/Colors';
import { Post as PostType, Challenge } from '../types';

type UserMap = Record<string, { username: string; name: string }>;

const Home = () => {
  const { 
    activeChallenge, 
    posts, 
    userMap, 
    loading, 
    fetchAllData 
  } = useFetchHomeData();
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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView 
      style={{ backgroundColor: colors.light.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={{ padding: 16 }}>
        {activeChallenge && (
          <TakeChallenge 
            title={activeChallenge.title} 
            description={activeChallenge.description} 
          />
        )}
        {posts.map(post => {
          const user = userMap[post.user_id] || { username: 'Unknown', name: 'Unknown' };
          return (
            <Post
              key={post.id}
              profilePicture={require('../assets/images/profile-pic.png')}
              name={user.name}
              username={user.username}
              text={post.body}
              likes={postCounts[post.id]?.likes ?? 0}
              comments={postCounts[post.id]?.comments ?? 0}
              postId={post.id}
              userId="4e723784-b86d-44a2-9ff3-912115398421"
              setPostCounts={setPostCounts}
              media={post.media_file_path ? { uri: post.media_file_path } : undefined}
              userMap={userMap} 
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

export default Home;
