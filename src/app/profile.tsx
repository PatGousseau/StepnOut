import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import UserProgress from '../components/UserProgress';
import Post from '../components/Post';
import ProfilePic from '../assets/images/profile-pic.png';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import useUserProgress from '../hooks/useUserProgress';

const HARDCODED_USER_ID = '4e723784-b86d-44a2-9ff3-912115398421';

const ProfileScreen: React.FC = () => {
  const { data, loading: progressLoading, error } = useUserProgress();
  const { posts, userMap, loading: postsLoading } = useFetchHomeData();
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const loadUserPosts = () => {
      const filteredPosts = posts.filter(post => post.user_id === HARDCODED_USER_ID);
      setUserPosts(filteredPosts);
    };
    loadUserPosts();
  }, [posts]);

  if (progressLoading || postsLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  const user = userMap[HARDCODED_USER_ID] || { username: 'Unknown User', name: 'Unknown' };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={ProfilePic} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user.name}</Text>
          <Text style={styles.userTitle}>Comfort Zone Challenger</Text>
        </View>
      </View>
      {data && <UserProgress challengeData={data.challengeData} weekData={data.weekData} />}
      <Text style={styles.pastChallengesTitle}>Your Past Challenges</Text>
      {userPosts.map((post) => (
        <Post
          key={post.id}
          profilePicture={ProfilePic}
          name={user.name}
          username={user.username}
          text={post.body}
          media={post.media_file_path ? { uri: post.media_file_path } : undefined}
          likes={post.likes || 0}
          comments={post.comments || 0}
          postId={post.id}
          userId={HARDCODED_USER_ID}
          setPostCounts={() => {}}
          userMap={userMap}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D1B1E',
  },
  userTitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  pastChallengesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#0D1B1E',
  },
});

export default ProfileScreen;
