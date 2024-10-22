import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Post from '../components/Post';
import ProfilePic from '../assets/images/profile-pic.png';
import ImagePost from '../assets/images/adaptive-icon.png';
import TakeChallenge from '../components/TakeChallenge';

const Home = () => {
  const handleTakeChallenge = () => {
    alert('Challenge taken!');
  };

  return (
    <ScrollView>
      <View style={{ padding: 16 }}>
        <TakeChallenge
          title="Compliment a Stranger"
          description="This week we're challenging you to **give a stranger a compliment**. It could be about their style, their smile, or just the positive energy they bring into a room."

          onTakeChallenge={handleTakeChallenge}
        />
        <Post
          profilePicture={ProfilePic}
          name="Patrizio"
          text="Hey Challengers! This week, we're spreading positivity by complimenting strangers. Watch how I approached this challenge, and remember: a kind word can brighten someone's day. You've got this!"
          image={ImagePost}
          likes={109} comments={19} />
        <Post
          profilePicture={ProfilePic}
          name="Eshaq"
          text="I complimented a stranger on their unique style today. Their surprised smile made my heart warm. Small act, big impact! #ComfortZoneChallenge" likes={30} comments={3} />
        <Post
          profilePicture={ProfilePic}
          name="Zach"
          text="I did it! Gave a compliment to a stranger at the coffee shop. Their smile made my day!" likes={67} comments={7} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Home;
