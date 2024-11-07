import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Challenge, Post } from '../types';

export const useFetchHomeData = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveChallenge = async () => {
      const { data, error } = await supabase
        .from('challenges_status')
        .select('challenge_id, challenges(*)')
        .eq('is_active', true)
        .single();
      if (error) console.error('Error fetching active challenge:', error);
      else if (data && data.challenges) setActiveChallenge(data.challenges);
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

      if (error) console.error('Error fetching posts:', error);
      else if (data) {
        const BASE_URL = 'https://kiplxlahalqyahstmmjg.supabase.co/storage/v1/object/public/challenge-uploads';
        const formattedPosts = data.map(post => ({
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

  return { activeChallenge, posts, loading };
};
