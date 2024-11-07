import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Post from '../components/Post';
import TakeChallenge from '../components/TakeChallenge';
import { supabase } from '../lib/supabase';
import { Challenge } from '../types';

interface PostData {
  id: number;
  user_id: string;
  media_id?: number;
  created_at: string;
  featured: boolean;
  body: string;
  media_file_path?: string;
}

const Home = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
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
    };

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('post')
        .select(`
          id, 
          user_id, 
          created_at, 
          featured, 
          body, 
          media_id, 
          media (
            file_path
          )
        `)
        .order('created_at', { ascending: false });
    
      if (error) {
        console.error('Error fetching posts:', error);
      } else if (data) {
        const BASE_URL = 'https://kiplxlahalqyahstmmjg.supabase.co/storage/v1/object/public/challenge-uploads';
    
        const formattedPosts = data.map((post) => ({
          ...post,
          media_file_path: post.media ? `${BASE_URL}/${post.media.file_path}` : null,
        }));

        setPosts(formattedPosts);
      }
      setLoading(false);
    };
    
    

    fetchActiveChallenge();
    fetchPosts();
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
        {posts.map((post) => (
          <Post
            key={post.id}
            profilePicture={require('../assets/images/profile-pic.png')}
            name="User Name"  // Replace this with actual username if available
            text={post.body}
            image={post.media_file_path ? { uri: post.media_file_path } : undefined}
            likes={Math.floor(Math.random() * 100)}  // Replace with actual likes data if available
            comments={Math.floor(Math.random() * 20)} // Replace with actual comments data if available
          />
        ))}
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
