import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseStorageUrl } from '../lib/supabase';
import { Challenge, Post } from '../types';

const userCache: { [key: string]: { username: string; name: string; profile_media?: { file_path: string } } } = {};

interface UserMap {
  [key: string]: {
    username: string;
    name: string;
    profile_media?: {
      file_path: string;
    };
  }
}

export const useFetchHomeData = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 10;
  const [hasMore, setHasMore] = useState(true);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);

  const fetchAllData = async (pageNumber = 1, isLoadMore = false) => {
    setLoading(true);
    try {

      const [postResponse, likesResponse, challengeResponse] = await Promise.all([
        supabase
          .from('post')
          .select(`
            id, 
            user_id, 
            created_at, 
            featured, 
            body, 
            media_id, 
            media (file_path),
            likes:likes(count),
            comments:comments(
              id,
              user_id,
              body,
              created_at
            )
          `)
          .order('created_at', { ascending: false })
          .range((pageNumber - 1) * POSTS_PER_PAGE, pageNumber * POSTS_PER_PAGE - 1),

        supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', "4e723784-b86d-44a2-9ff3-912115398421"),

        supabase
          .from('challenges_status')
          .select('challenge_id, challenges(*)')
          .eq('is_active', true)
          .single()
      ]);

      const [postData, postError] = [postResponse.data, postResponse.error];
      const [userLikes, likesError] = [likesResponse.data, likesResponse.error];
      const [challengeData, challengeError] = [challengeResponse.data, challengeResponse.error];

      if (postError) throw postError;
      if (likesError) throw likesError;
      if (challengeError) console.error('Error fetching active challenge:', challengeError);
      else if (challengeData && challengeData.challenges) setActiveChallenge(challengeData.challenges);
      console.log('challengeData', challengeData);

      // Process all data before updating state
      const likedPostIds = new Set(userLikes?.map(like => like.post_id));
      const uniqueUserIds = [...new Set(postData.map(post => post.user_id))];
      const uncachedUserIds = uniqueUserIds.filter(id => !userCache[id]);

      // Fetch any uncached users
      if (uncachedUserIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select(`
            id, 
            username, 
            name,
            profile_media_id,
            profile_media:media!profiles_profile_media_id_fkey (
              file_path
            )
          `)
          .in('id', uncachedUserIds);

        if (userError) throw userError;

        userData?.forEach(user => {
          userCache[user.id] = { 
            username: user.username, 
            name: user.name,
            profile_media: user.profile_media,
            profileImageUrl: user.profile_media?.file_path 
              ? `${supabaseStorageUrl}/${user.profile_media.file_path}`
              : null
          };
        });
        
        const newUserMap = userData.reduce((acc, user) => {
          acc[user.id] = {
            username: user.username || 'Unknown',
            name: user.name || 'Unknown',
            profile_media: user.profile_media
          };
          return acc;
        }, {} as UserMap);

        setUserMap(prev => ({ ...prev, ...newUserMap }));
      }

      // Prepare all data before any state updates
      const userMap = uniqueUserIds.reduce((acc, userId) => {
        acc[userId] = userCache[userId] || { username: 'Unknown', name: 'Unknown' };
        return acc;
      }, {} as UserMap);

      const formattedPosts = postData.map(post => ({
        ...post,
        media_file_path: post.media ? `${supabaseStorageUrl}/${post.media.file_path}` : null,
        likes_count: post.likes?.[0]?.count ?? 0,
        comments_count: post.comments?.length ?? 0,
        liked: likedPostIds.has(post.id),
        latest_comments: post.comments?.slice(0, 3).map(comment => ({
          id: comment.id,
          text: comment.body,
          userId: comment.user_id,
          created_at: comment.created_at
        })) ?? []
      }));

      // Batch state updates
      setHasMore(postData.length === POSTS_PER_PAGE);
      setPosts(prev => isLoadMore ? [...prev, ...formattedPosts] : formattedPosts);
      setUserMap(prev => ({ ...prev, ...userMap }));

    } catch (error) {
      console.error('Error fetching posts and users:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllData(nextPage, true);
    }
  }, [loading, hasMore, page]);

  const memoizedFormatPosts = useCallback((postData, likedPostIds) => {
    return postData.map(post => ({
      ...post,
      media_file_path: post.media ? `${supabaseStorageUrl}/${post.media.file_path}` : null,
      likes_count: post.likes?.[0]?.count ?? 0,
      comments_count: post.comments?.length ?? 0,
      liked: likedPostIds.has(post.id),
      latest_comments: post.comments?.slice(0, 3).map(comment => ({
        id: comment.id,
        text: comment.body,
        userId: comment.user_id,
        created_at: comment.created_at
      })) ?? []
    }));
  }, []);

  return {
    activeChallenge,
    posts,
    userMap,
    loading,
    fetchAllData,
    fetchLikes,
    toggleLike,
    fetchComments,
    addComment,
    loadMorePosts,
    hasMore,
  };
};
