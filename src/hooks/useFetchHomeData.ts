import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Challenge, Post } from '../types';

export const useFetchHomeData = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userMap, setUserMap] = useState<{ [key: string]: { username: string; name: string } }>({});
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

    const fetchPostsAndUsers = async () => {
      try {
        const { data: postData, error: postError } = await supabase
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
            ),
            likes:likes(count),
            comments:comments(count)
          `)
          .order('created_at', { ascending: false });

        if (postError) throw postError;

        const uniqueUserIds = [...new Set(postData.map(post => post.user_id))];
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, name')
          .in('id', uniqueUserIds);

        if (userError) throw userError;

        const userMap = userData.reduce((acc, user) => {
          acc[user.id] = { username: user.username, name: user.name };
          return acc;
        }, {});

        const BASE_URL = 'https://kiplxlahalqyahstmmjg.supabase.co/storage/v1/object/public/challenge-uploads';
        const formattedPosts = postData.map(post => ({
          ...post,
          media_file_path: post.media ? `${BASE_URL}/${post.media.file_path}` : null,
          likes_count: post.likes[0]?.count ?? 0,
          comments_count: post.comments[0]?.count ?? 0,
        }));

        setPosts(formattedPosts);
        setUserMap(userMap);
      } catch (error) {
        console.error('Error fetching posts and users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveChallenge();
    fetchPostsAndUsers();
  }, []);

  useEffect(() => {
    // Subscribe to likes and comments changes
    const subscription = supabase
      .channel('public:likes_comments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'likes' 
      }, payload => {
        // Update likes count
        handleLikesChange(payload);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments' 
      }, payload => {
        // Update comments count
        handleCommentsChange(payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const toggleLike = async (postId, userId) => {
    try {
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
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', data[0].id);

        if (deleteError) console.error('Error removing like:', deleteError);
        else return { liked: false };
      } else {
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
    userMap,
    loading,
    fetchLikes,
    toggleLike,
    fetchComments,
    addComment,
  };
};
