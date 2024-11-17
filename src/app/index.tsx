import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import Post from '../components/Post';
import TakeChallenge from '../components/TakeChallenge';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { colors } from '../constants/Colors';
import { Post as PostType, Challenge } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const { activeChallenge, posts, userMap, loading } = useFetchHomeData();
  const [postCounts, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>({});

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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={{ backgroundColor: colors.light.background }}>
      <View style={{ padding: 16 }}>
        {activeChallenge && (
          <TakeChallenge 
            title={activeChallenge.title} 
            description={activeChallenge.description} 
          />
        )}
        {posts.map(post => {
          const userData = userMap[post.user_id];
          console.log('userData!!', userData);
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
    </ScrollView>
  );
};

export default Home;
