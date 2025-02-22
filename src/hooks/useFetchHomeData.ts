import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { User } from '../models/User';
import { useAuth } from '../contexts/AuthContext';
import { isVideo } from '../utils/utils';
import { useLikes } from '../contexts/LikesContext';

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
  const { initializeLikes } = useLikes();

  const formatPost = async (post: Post, commentCountMap?: Map<number, number>): Promise<Post> => {
    // If we don't have a pre-fetched comment count, fetch it individually
    let commentCount = commentCountMap?.get(post.id);
    if (commentCount === undefined) {
      const commentCountResponse = await supabase
        .rpc('get_comment_counts', { post_ids: [post.id.toString()] });
      commentCount = commentCountResponse.data?.[0]?.count ?? 0;
    }
    
    let mediaUrl = null;
    if (post.media?.file_path) {
      const transformMediaResponse = !isVideo(post.media.file_path)
        ? await supabase.storage.from('challenge-uploads').getPublicUrl(post.media.file_path, {
            transform: {
              quality: 20,
              width: 1000,
              height: 1000,
            },
          })
        : await supabase.storage.from('challenge-uploads').getPublicUrl(post.media.file_path);

      mediaUrl = transformMediaResponse.data.publicUrl;
    }

    return {
      ...post,
      ...(mediaUrl ? { media: { file_path: mediaUrl } } : {}),
      likes_count: post.likes?.count ?? 0,
      comments_count: commentCount ?? 0,
      liked: likedPosts[post.id] ?? false,
      challenge_id: post.challenge_id,
      challenge_title: post.challenge_title
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
      const postData = postResponse.data.map(post => ({
        ...post,
        challenge_title: post.challenges?.title
      }));

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

      // Initialize likes for all new posts, regardless of page
      initializeLikes(formattedPosts);

      setHasMore(postData.length === POSTS_PER_PAGE);
      setPosts(prev => isLoadMore ? [...prev, ...formattedPosts] : formattedPosts);
      setUserMap(prev => ({ ...prev, ...newUserMap }));

    } catch (error) {
      console.error('Error fetching posts and users:', error);
    } finally {
      setLoading(false);
    }
  }, [POSTS_PER_PAGE, user?.id]);

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

      const postWithChallenge = {
        ...post,
        challenge_title: post.challenges?.title
      };

      const formattedPost = await formatPost(postWithChallenge);
      
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
    addComment,
    loadMorePosts,
    hasMore,
    fetchPost,
    likedPosts,
  };
};
