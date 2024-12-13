import { useState, useCallback } from 'react';
import { supabase, supabaseStorageUrl } from '../lib/supabase';
import { Post } from '../types';
import { User } from '../models/User';
import { useAuth } from '../contexts/AuthContext';

interface UserMap {
  [key: string]: User;
}

interface PostLikes {
  [postId: number]: boolean;
}

export const useFetchHomeData = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 10;
  const [hasMore, setHasMore] = useState(true);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<PostLikes>({});
  const { user } = useAuth();

  const formatPost = async (post: Partial<Post>, commentCountMap?: Map<number, number>): Promise<Post> => {
    // If we don't have a pre-fetched comment count, fetch it individually
    let commentCount = commentCountMap?.get(post.id);
    if (commentCount === undefined) {
      const commentCountResponse = await supabase
        .rpc('get_comment_counts', { post_ids: [post.id.toString()] });
      commentCount = commentCountResponse.data?.[0]?.count ?? 0;
    }

    return {
      ...post,
      media_file_path: post.media ? `${supabaseStorageUrl}/${post.media.file_path}` : null,
      likes_count: post.likes?.[0]?.count ?? 0,
      comments_count: commentCount ?? 0,
      liked: likedPosts[post.id] ?? false,
      challenge_id: post.challenge_id,
      challenge_title: post.challenges?.title
    };
  };

  const fetchAllData = useCallback(async (pageNumber = 1, isLoadMore = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First, get the list of blocked user IDs
      const { data: blockedUsers, error: blockError } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', user?.id);

      if (blockError) throw blockError;

      // Create array of blocked user IDs
      const blockedUserIds = blockedUsers?.map(block => block.blocked_id) || [];

      let query = supabase
        .from('post')
        .select(`
          id, 
          user_id, 
          created_at, 
          featured, 
          body, 
          media_id, 
          challenge_id,
          media (file_path),
          likes:likes(count),
          challenges:challenge_id (title)
        `)
        .order('created_at', { ascending: false });

      // Add the blocked users filter only if there are blocked users
      if (blockedUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${blockedUserIds.join(',')})`);
      }

      // Add the range filter
      const postResponse = await query
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

      const formattedPosts = await Promise.all(
        postData.map(post => formatPost(post, commentCountMap))
      );

      setHasMore(postData.length === POSTS_PER_PAGE);
      setPosts(prev => isLoadMore ? [...prev, ...formattedPosts] : formattedPosts);
      setUserMap(prev => ({ ...prev, ...newUserMap }));

    } catch (error) {
      console.error('Error fetching posts and users:', error);
    } finally {
      setLoading(false);
    }
  }, [POSTS_PER_PAGE, user?.id]);

  const fetchLikes = async (postId: number, userId?: string) => {
    const { data, error } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching likes:', error);
      return [];
    }

    if (userId) {
      const isLiked = data?.some(like => like.user_id === userId) ?? false;
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
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
        else {
          setLikedPosts(prev => ({ ...prev, [postId]: false }));
          return { liked: false };
        }
      } else {
        const { error: insertError } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: userId, comment_id: null }]);

        if (insertError) {
          console.error('Error adding like:', insertError);
        } else {
          setLikedPosts(prev => ({ ...prev, [postId]: true }));
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

  const fetchPost = async (postId: number): Promise<Post | null> => {
    try {
      const { data: post, error } = await supabase
        .from('post')
        .select(`
          *,
          challenges:challenge_id (title),
          media (file_path),
          likes:likes(count)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      const formattedPost = await formatPost(post);
      
      // Fetch the user data if not already in userMap
      if (post && !userMap[post.user_id]) {
        const user = await User.getUser(post.user_id);
        if (user) {
          setUserMap(prev => ({
            ...prev,
            [user.id]: user
          }));
        }
      }

      return formattedPost;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  };

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
    fetchPost,
    likedPosts,
  };
};
