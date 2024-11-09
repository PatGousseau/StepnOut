import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
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
        const likesData = await fetchLikes(post.id);
        const commentsData = await fetchComments(post.id);
        counts[post.id] = {
          likes: likesData.length,
          comments: commentsData.length,
        };
      }
      setPostCounts(counts);
    };

    if (posts.length > 0) {
      loadCounts();
    }
  }, [posts, fetchLikes, fetchComments]);

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
              likes={postCounts[post.id]?.likes || 0}
              comments={postCounts[post.id]?.comments || 0}
              postId={post.id} // Add this line
              userId="4e723784-b86d-44a2-9ff3-912115398421" // Replace with the actual user ID
            />
          ))}

      </View>
    </ScrollView>
  );
};

export default Home;
