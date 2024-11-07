import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import Post from '../components/Post';
import TakeChallenge from '../components/TakeChallenge';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { colors } from '../constants/Colors';

const Home = () => {
  const { activeChallenge, posts, loading } = useFetchHomeData();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={{ backgroundColor: colors.light.background }}>
      <View style={{ padding: 16 }}>
        {activeChallenge && (
          <TakeChallenge title={activeChallenge.title} description={activeChallenge.description} />
        )}
        {posts.map(post => (
          <Post
            key={post.id}
            profilePicture={require('../assets/images/profile-pic.png')}
            name="User Name"
            text={post.body}
            image={post.media_file_path ? { uri: post.media_file_path } : undefined}
            likes={Math.floor(Math.random() * 100)}
            comments={Math.floor(Math.random() * 20)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default Home;
