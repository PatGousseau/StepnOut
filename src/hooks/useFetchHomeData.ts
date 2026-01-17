import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Post } from "../types";
import { User, UserProfile } from "../models/User";
import { useAuth } from "../contexts/AuthContext";
import { useLikes } from "../contexts/LikesContext";
import { imageService } from "../services/imageService";
import { useQuery, useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { postService } from "../services/postService";
import { profileService } from "../services/profileService";

interface UserMap {
  [key: string]: User | UserProfile;
}

interface CommentCount {
  post_id: number;
  count: string;
}

export const useFetchHomeData = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const POSTS_PER_PAGE = 20;
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { initializePostLikes } = useLikes();

  // Fetch blocked users with React Query
  const { data: blockedUsers } = useQuery({
    queryKey: ["blocked-users", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("blocks")
        .select("blocked_id")
        .eq("blocker_id", user.id);
      if (error) throw error;
      return data?.map((block) => block.blocked_id) || [];
    },
    enabled: !!user?.id,
    staleTime: 30000, // Cache for 30 seconds
  });

  const blockedUserIds = blockedUsers || [];

  // Fetch posts with React Query infinite query
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: ["home-posts", blockedUserIds],
    queryFn: async ({ pageParam = 1 }) => {
      return postService.fetchHomePosts(pageParam, blockedUserIds, POSTS_PER_PAGE);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!user && blockedUserIds !== undefined, // Wait for blocked users to load
    staleTime: 30000,
  });

  // Flatten pages into single posts array
  const rawPosts = useMemo(() => {
    return postsData?.pages.flatMap((page) => page.posts) ?? [];
  }, [postsData]);

  // Extract unique user IDs from posts
  const uniqueUserIds = useMemo(() => {
    return [...new Set(rawPosts.map((post) => post.user_id))];
  }, [rawPosts]);

  // Fetch users in parallel using useQueries
  const userQueries = useQueries({
    queries: uniqueUserIds.map((userId) => ({
      queryKey: ["user", userId],
      queryFn: () => profileService.fetchProfileById(userId),
      enabled: !!userId && rawPosts.length > 0,
      staleTime: 30000,
    })),
  });

  // Track which user IDs we've already merged to prevent infinite loops
  const mergedUserIdsRef = useRef<Set<string>>(new Set());

  // Create a stable string representation of user IDs that have data
  const loadedUserIds = useMemo(() => {
    return userQueries
      .map((query, index) => (query.data ? uniqueUserIds[index] : null))
      .filter((id): id is string => id !== null)
      .sort()
      .join(',');
  }, [userQueries, uniqueUserIds]);

  // Update userMap state when queries complete (only when new users are loaded)
  useEffect(() => {
    if (!loadedUserIds) return;
    
    // Build userMap directly from queries
    const newUserMap: UserMap = {};
    const newUserIds = new Set<string>();
    
    userQueries.forEach((query, index) => {
      const userId = uniqueUserIds[index];
      if (query.data && userId) {
        newUserMap[userId] = query.data;
        newUserIds.add(userId);
      }
    });

    // Only update if there are users we haven't merged yet
    const hasNewUsers = Array.from(newUserIds).some(
      (userId) => !mergedUserIdsRef.current.has(userId)
    );

    if (hasNewUsers && Object.keys(newUserMap).length > 0) {
      // Update the ref to track merged users
      newUserIds.forEach((id) => mergedUserIdsRef.current.add(id));
      
      setUserMap((prev) => ({ ...prev, ...newUserMap }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedUserIds]); // Only depend on loadedUserIds string, not the objects

  // Reset merged users when uniqueUserIds change (new posts loaded)
  useEffect(() => {
    mergedUserIdsRef.current.clear();
  }, [uniqueUserIds.length]); // Reset when number of unique users changes

  // Check if all users are loaded
  const usersLoading = userQueries.some((query) => query.isLoading);
  const allUsersLoaded = uniqueUserIds.length > 0 && userQueries.every((query) => !query.isLoading && (query.data || query.error));

  // Format posts when rawPosts changes and users are loaded (add comment counts, image URLs, like state)
  useEffect(() => {
    if (rawPosts.length === 0) {
      setPosts([]);
      return;
    }

    // Wait for users to load before formatting posts
    if (!allUsersLoaded) {
      return;
    }

    const formatPosts = async () => {
      setLoading(true);
      try {
        // Batch comment counts
        const postIds = rawPosts.map((post) => post.id.toString());
        const commentCountsResponse = await supabase.rpc("get_comment_counts", {
          post_ids: postIds,
        });

        const commentCountMap = new Map<number, number>();
        commentCountsResponse.data?.forEach((row: CommentCount) => {
          commentCountMap.set(row.post_id, parseInt(row.count, 10));
        });

        // Format posts (image URLs, counts, liked state)
        const formattedPosts = await Promise.all(
          rawPosts.map((post) => formatPost(post, commentCountMap))
        );

        // Initialize likes for all posts
        initializePostLikes(formattedPosts);

        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error formatting posts:", error);
      } finally {
        setLoading(false);
      }
    };

    formatPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPosts, allUsersLoaded]); // Wait for users to load before formatting

  const formatPost = async (post: Post, commentCountMap?: Map<number, number>): Promise<Post> => {
    // If we don't have a pre-fetched comment count, fetch it individually
    let commentCount = commentCountMap?.get(post.id);
    if (commentCount === undefined) {
      const commentCountResponse = await supabase.rpc("get_comment_counts", {
        post_ids: [post.id.toString()],
      });
      commentCount = commentCountResponse.data?.[0]?.count ?? 0;
    }

    let urls = null;
    if (post.media?.file_path) {
      urls = await imageService.getPostImageUrl(post.media.file_path);
    }

    // Handle likes - can be array (from aggregate) or object
    const likesCount = Array.isArray(post.likes)
      ? post.likes[0]?.count ?? 0
      : post.likes?.count ?? 0;

    return {
      ...post,
      ...(urls ? { media: { file_path: urls.fullUrl } } : {}),
      likes_count: likesCount,
      comments_count: commentCount ?? 0,
      liked: false, // Actual liked state is managed by LikesContext
      challenge_id: post.challenge_id,
      challenge_title: post.challenge_title,
    };
  };

  const loadMorePosts = useCallback(() => {
    if (!postsLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [postsLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const fetchPost = async (postId: number): Promise<Post | null> => {
    try {
      const { data: post, error } = await supabase
        .from("post")
        .select(
          `
          *,
          challenges:challenge_id (title),
          media (file_path),
          likes:likes(count)
        `
        )
        .eq("id", postId)
        .single();

      if (error) throw error;

      // Add challenge title from joined data
      const postWithChallenge: Post = {
        ...post,
        challenge_title: (post as Post).challenges?.title,
      };

      const formattedPost = await formatPost(postWithChallenge);

      // Fetch the user data if not already in userMap
      if (post && !userMap[post.user_id]) {
        const u = await User.getUser(post.user_id);
        if (u) {
          setUserMap((prev) => ({
            ...prev,
            [u.id]: u,
          }));
        }
      }

      return formattedPost;
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  };

  return {
    posts,
    userMap,
    loading: loading || postsLoading || usersLoading, // Combine all loading states
    loadMorePosts,
    hasMore: hasNextPage ?? false, // Use React Query's hasNextPage
    isFetchingNextPage, // Expose for loading indicator when loading more
    fetchPost,
    refetchPosts: refetchPosts, // Expose refetch for refresh
  };
};
