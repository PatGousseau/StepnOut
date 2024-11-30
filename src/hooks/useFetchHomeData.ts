import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseStorageUrl } from '../lib/supabase';
import { Challenge, Post } from '../types';
import { User } from '../models/User';

interface UserMap {
  [key: string]: User;
}

export const useFetchHomeData = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 10;
  const [hasMore, setHasMore] = useState(true);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async (pageNumber = 1, isLoadMore = false) => {
    setLoading(true);
    try {

      const postResponse = await supabase
        .from('post')
        .select(`
          id, 
          user_id, 
          created_at, 
          featured, 
          body, 
          media_id, 
          media (file_path),
          likes:likes(count)
        `)
        .order('created_at', { ascending: false })
        .range((pageNumber - 1) * POSTS_PER_PAGE, pageNumber * POSTS_PER_PAGE - 1);

      if (postResponse.error) throw postResponse.error;
      const postData = postResponse.data;

      const postIds = postData.map(post => post.id.toString());
      const commentCountsResponse = await supabase
        .rpc('get_comment_counts', { post_ids: postIds });

      const commentCountMap = new Map();
      commentCountsResponse.data?.forEach(row => {
        commentCountMap.set(row.post_id, parseInt(row.count));
      });

      const uniqueUserIds = [...new Set(postData.map(post => post.user_id))];
      
      const users = await Promise.all(
        uniqueUserIds.map(userId => User.getUser(userId))
      );

      const newUserMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as UserMap);

      const formattedPosts = postData.map(post => ({
        ...post,
        media_file_path: post.media ? `${supabaseStorageUrl}/${post.media.file_path}` : null,
        likes_count: post.likes?.[0]?.count ?? 0,
        comments_count: commentCountMap.get(post.id) ?? 0,
        liked: false
      }));

      setHasMore(postData.length === POSTS_PER_PAGE);
      setPosts(prev => isLoadMore ? [...prev, ...formattedPosts] : formattedPosts);
      setUserMap(prev => ({ ...prev, ...newUserMap }));

    } catch (error) {
      console.error('Error fetching posts and users:', error);
    } finally {
      setLoading(false);
    }
  }, [POSTS_PER_PAGE]);

  const fetchLikes = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post?.likes) {
      return post.likes;
    }

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

  const toggleLike = async (postId: number, userId: string) => {
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

      // Get post owner's ID for notification
      const { data: postData, error: postError } = await supabase
        .from('post')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (postError) {
        console.error('Error fetching post data:', postError);
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
        const { error: insertError } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: userId, comment_id: null }]);

        if (insertError) {
          console.error('Error adding like:', insertError);
        } else {
          // Don't create notification if user likes their own post
          if (postData.user_id !== userId) {
            // Create notification for post owner
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert([{
                user_id: postData.user_id,
                trigger_user_id: userId,
                post_id: postId,
                action_type: 'like',
                is_read: false
              }]);

            if (notificationError) {
              console.error('Error creating notification:', notificationError);
            }
          }
          return { liked: true };
        }
      }
    } catch (err) {
      console.error("Unexpected error in toggleLike:", err);
    }
  };

  const addComment = async (postId: number, userId: string, body: string) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, user_id: userId, body }])
      .select();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    return data?.[0] ? {
      id: data[0].id,
      text: data[0].body,
      userId: data[0].user_id,
      created_at: data[0].created_at
    } : null;
  };

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllData(nextPage, true);
    }
  }, [loading, hasMore, page]);

  return {
    posts,
    userMap,
    loading,
    fetchAllData,
    fetchLikes,
    toggleLike,
    addComment,
    loadMorePosts,
    hasMore,
  };
};
