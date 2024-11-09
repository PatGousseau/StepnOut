import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import UserProgress from '../components/UserProgress';
import Post from '../components/Post';
import ProfilePic from '../assets/images/profile-pic.png';
import ImagePost from '../assets/images/adaptive-icon.png';
import useUserProgress from '../hooks/useUserProgress';

const ProfileScreen: React.FC = () => {
  const { data, loading, error } = useUserProgress();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={ProfilePic} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>Jane Doe</Text>
          <Text style={styles.userTitle}>Comfort Zone Challenger</Text>
        </View>
      </View>
      {data && <UserProgress challengeData={data.challengeData} weekData={data.weekData} />}
      <Text style={styles.pastChallengesTitle}>Your Past Challenges</Text>
      <Post
        profilePicture={ProfilePic}
        name="Patrizio"
        text="Hey Challengers! This week, we're spreading positivity by complimenting strangers. Watch how I approached this challenge, and remember: a kind word can brighten someone's day. You've got this!"
        image={ImagePost}
        likes={109}
        comments={19}
      />
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
