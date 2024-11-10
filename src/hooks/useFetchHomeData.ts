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

  // Fetch likes for a specific post
  const fetchLikes = async (postId: number) => {
    const { data, error } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
    return data || [];
  };

  // Toggle like for a specific post
  const toggleLike = async (postId, userId) => {
    try {
      // Step 1: Check if the user has already liked the post
      const { data, count, error } = await supabase
        .from('likes')
        .select('id', { count: 'exact' })
        .eq('post_id', postId)
        .eq('user_id', userId)
        .is('comment_id', null);
  
      if (error) {
        console.error('Error checking for existing like:', error);
        return;
      }
  
      if (count > 0 && data && data.length > 0) {
        // Step 2: Like exists, so remove it
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', data[0].id); // Delete by ID to ensure exact match
  
        if (deleteError) console.error('Error removing like:', deleteError);
        else return { liked: false };
      } else {
        // Step 3: Like does not exist, so add it
        const { data: insertData, error: insertError } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: userId, comment_id: null }]);
  
        if (insertError) console.error('Error adding like:', insertError);
        else return { liked: true };
      }
    } catch (err) {
      console.error("Unexpected error in toggleLike:", err);
    }
  };
  
  

  // Fetch comments for a specific post
  const fetchComments = async (postId: number) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        body,
        created_at
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    return data || [];
  };

  // Add a new comment to a specific post
  const addComment = async (postId: number, userId: string, body: string) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, user_id: userId, body }]);

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }
    return data ? data[0] : null;
  };

  return {
    activeChallenge,
    posts,
    loading,
    fetchLikes,
    toggleLike,
    fetchComments,
    addComment
  };
};
