import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import Post from '../components/Post';
import TakeChallenge from '../components/TakeChallenge';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import { colors } from '../constants/Colors';

const Home = () => {
  const { activeChallenge, posts, fetchLikes, fetchComments, loading } = useFetchHomeData();
  const [postCounts, setPostCounts] = useState<{ [key: number]: { likes: number; comments: number } }>({});

  useEffect(() => {
    const loadCounts = async () => {
      const counts: { [key: number]: { likes: number; comments: number } } = {};
      for (const post of posts) {
        const [likesData, commentsData] = await Promise.all([fetchLikes(post.id), fetchComments(post.id)]);
        counts[post.id] = {
          likes: likesData.length,
          comments: commentsData.length,
        };
      }
      setPostCounts(counts);
    };

    if (posts.length > 0) {
      loadCounts(); // Trigger immediately when posts are fetched
    }
  }, [posts]);

  // allows audio to play
  useEffect(() => {
    const configureAudio = async () => {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,  // maybe not
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    };

    configureAudio();
  }, []);

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
            likes={postCounts[post.id]?.likes || 0}
            comments={postCounts[post.id]?.comments || 0}
            postId={post.id}
            userId="4e723784-b86d-44a2-9ff3-912115398421"
            setPostCounts={setPostCounts}
            media={post.media_file_path ? { uri: post.media_file_path } : undefined}
            likes={Math.floor(Math.random() * 100)}
            comments={Math.floor(Math.random() * 20)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default Home;
