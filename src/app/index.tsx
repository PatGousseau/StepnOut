import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Post from '../components/Post';
import ProfilePic from '../assets/images/profile-pic.png';
import ImagePost from '../assets/images/adaptive-icon.png';
import TakeChallenge from '../components/TakeChallenge';
import { supabase } from '../lib/supabase';
import { Challenge } from '../types';

const Home = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchActiveChallenge = async () => {
      const { data, error } = await supabase
        .from('challenges_status')
        .select('challenge_id, challenges(*)')
        .eq('is_active', true)
        .single();
  
      if (error) {
        console.error('Error fetching active challenge:', error);
      } else if (data && data.challenges) {
        setActiveChallenge(data.challenges);
      }
      setLoading(false);
    };
  
    fetchActiveChallenge();
  }, []);
  

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; 
  }

  return (
    <ScrollView>
      <View style={{ padding: 16 }}>
        {activeChallenge ? (
        <TakeChallenge
          title={activeChallenge.title}
          description={activeChallenge.description}
        />
          ) : null}
        <Post
          profilePicture={ProfilePic}
          name="Patrizio"
          text="Hey Challengers! This week, we're spreading positivity by complimenting strangers. Watch how I approached this challenge, and remember: a kind word can brighten someone's day. You've got this!"
          image={ImagePost}
          likes={109} comments={19}
        />
        <Post
          profilePicture={ProfilePic}
          name="Eshaq"
          text="I complimented a stranger on their unique style today. Their surprised smile made my heart warm. Small act, big impact! #ComfortZoneChallenge"
          likes={30} comments={3}
        />
        <Post
          profilePicture={ProfilePic}
          name="Zach"
          text="I did it! Gave a compliment to a stranger at the coffee shop. Their smile made my day!"
          likes={67} comments={7}
        />
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
