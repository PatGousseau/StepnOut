import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Post } from "../types";
import { User, UserProfile } from "../models/User";
import { useAuth } from "../contexts/AuthContext";
import { useLikes } from "../contexts/LikesContext";
import { imageService } from "../services/imageService";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "../services/postService";
import { captureEvent } from "../lib/posthog";
import { FEED_EVENTS } from "../constants/analyticsEvents";

// Types for loading stage tracking
type LoadingStage = 
  | 'idle'
  | 'blocked_users_loading'
  | 'blocked_users_complete'
  | 'posts_loading'
  | 'posts_complete'
  | 'complete';

interface LoadingDiagnostics {
  stage: LoadingStage;
  timestamp: number;
  blockedUsersStatus: 'pending' | 'loading' | 'success' | 'error';
  blockedUsersCount: number;
  postsQueryStatus: 'pending' | 'loading' | 'success' | 'error';
  rawPostsCount: number;
  userMapSize: number;
  formattedPostsCount: number;
  isRefetching: boolean;
  errors: string[];
}

const SLOW_LOADING_THRESHOLD_MS = 10000; // 10 seconds

interface UserMap {
  [key: string]: User | UserProfile;
}

interface PostLikes {
  [postId: number]: boolean;
}

export const useFetchHomeData = () => {
  const [likedPosts, setLikedPosts] = useState<PostLikes>({});
  const { user } = useAuth();
  const { initializePostLikes } = useLikes();
  const POSTS_PER_PAGE = 20;

  // Loading diagnostics tracking
  const loadingStartTimeRef = useRef<number | null>(null);
  const slowLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const diagnosticsRef = useRef<LoadingDiagnostics>({
    stage: 'idle',
    timestamp: Date.now(),
    blockedUsersStatus: 'pending',
    blockedUsersCount: 0,
    postsQueryStatus: 'pending',
    rawPostsCount: 0,
    userMapSize: 0,
    formattedPostsCount: 0,
    isRefetching: false,
    errors: [],
  });
  const hasLoggedSlowLoadingRef = useRef(false);

  // Helper to update diagnostics
  const updateDiagnostics = useCallback((updates: Partial<LoadingDiagnostics>) => {
    diagnosticsRef.current = {
      ...diagnosticsRef.current,
      ...updates,
      timestamp: Date.now(),
    };
  }, []);

  // Helper to send slow loading log to PostHog
  const sendSlowLoadingLog = useCallback(() => {
    if (hasLoggedSlowLoadingRef.current) return;
    hasLoggedSlowLoadingRef.current = true;

    const diagnostics = diagnosticsRef.current;
    const loadingDuration = loadingStartTimeRef.current 
      ? Date.now() - loadingStartTimeRef.current 
      : 0;

    captureEvent(FEED_EVENTS.LOADING_SLOW, {
      loading_duration_ms: loadingDuration,
      current_stage: diagnostics.stage,
      blocked_users_status: diagnostics.blockedUsersStatus,
      blocked_users_count: diagnostics.blockedUsersCount,
      posts_query_status: diagnostics.postsQueryStatus,
      raw_posts_count: diagnostics.rawPostsCount,
      user_map_size: diagnostics.userMapSize,
      formatted_posts_count: diagnostics.formattedPostsCount,
      is_refetching: diagnostics.isRefetching,
      errors: diagnostics.errors,
      user_id: user?.id,
    });

    console.warn('[Feed Debug] Slow loading detected', {
      duration: loadingDuration,
      diagnostics,
    });
  }, [user?.id]);

  // Start/stop slow loading timer based on loading state
  const startSlowLoadingTimer = useCallback(() => {
    if (slowLoadingTimerRef.current) return; // Already running
    
    loadingStartTimeRef.current = Date.now();
    hasLoggedSlowLoadingRef.current = false;
    updateDiagnostics({ stage: 'blocked_users_loading' });

    slowLoadingTimerRef.current = setTimeout(() => {
      sendSlowLoadingLog();
    }, SLOW_LOADING_THRESHOLD_MS);
  }, [sendSlowLoadingLog, updateDiagnostics]);

  const stopSlowLoadingTimer = useCallback(() => {
    if (slowLoadingTimerRef.current) {
      clearTimeout(slowLoadingTimerRef.current);
      slowLoadingTimerRef.current = null;
    }
    loadingStartTimeRef.current = null;
    updateDiagnostics({ stage: 'complete' });
  }, [updateDiagnostics]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (slowLoadingTimerRef.current) {
        clearTimeout(slowLoadingTimerRef.current);
      }
    };
  }, []);

  // Fetch blocked users
  const { data: blockedUsers, isLoading: blockedUsersLoading, error: blockedUsersError } = useQuery({
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
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const blockedUserIds = blockedUsers ?? [];

  // Track blocked users query status
  useEffect(() => {
    const status = blockedUsersLoading ? 'loading' : (blockedUsersError ? 'error' : 'success');
    updateDiagnostics({
      blockedUsersStatus: status,
      blockedUsersCount: blockedUserIds.length,
      stage: blockedUsersLoading ? 'blocked_users_loading' : 'blocked_users_complete',
      ...(blockedUsersError ? { errors: [...diagnosticsRef.current.errors, `BlockedUsers: ${(blockedUsersError as Error).message}`] } : {}),
    });
  }, [blockedUsersLoading, blockedUsersError, blockedUserIds.length, updateDiagnostics]);

  // Fetch posts (now includes user profiles via foreign key join!)
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    isRefetching: postsRefetching,
    isError: postsError,
    error: postsErrorDetails,
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
    enabled: !!user && blockedUsers !== undefined,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Track posts query status
  useEffect(() => {
    const status = postsLoading ? 'loading' : (postsError ? 'error' : 'success');
    updateDiagnostics({
      postsQueryStatus: status,
      isRefetching: postsRefetching,
      stage: postsLoading ? 'posts_loading' : 'posts_complete',
      ...(postsErrorDetails ? { errors: [...diagnosticsRef.current.errors, `PostsQuery: ${(postsErrorDetails as Error).message}`] } : {}),
    });
  }, [postsLoading, postsError, postsErrorDetails, postsRefetching, updateDiagnostics]);

  // Flatten posts and extract user profiles from the joined data
  const { posts, userMap } = useMemo(() => {
    const rawPosts = postsData?.pages.flatMap((page) => page.posts) ?? [];
    const extractedUserMap: UserMap = {};

    const formattedPosts = rawPosts.map((post: any) => {
      // Extract user profile from joined data
      if (post.profiles) {
        const profile = post.profiles;
        extractedUserMap[post.user_id] = {
          id: profile.id,
          username: profile.username,
          name: profile.name,
          profileImageUrl: profile.profile_media?.file_path
            ? imageService.getProfileImageUrlSync(profile.profile_media.file_path)
            : null,
        } as UserProfile;
      }

      // Format post with image URL
      let mediaUrl = post.media?.file_path;
      if (mediaUrl && !mediaUrl.startsWith('http')) {
        mediaUrl = imageService.getPostImageUrlSync(mediaUrl);
      }

      return {
        ...post,
        media: mediaUrl ? { file_path: mediaUrl } : post.media,
        likes_count: post.likes?.[0]?.count ?? 0,
        comments_count: post.comments?.length ?? 0,
        liked: likedPosts[post.id] ?? false,
        challenge_title: post.challenges?.title,
        profiles: undefined, // Remove joined profile data from post object
      } as Post;
    });

    return { posts: formattedPosts, userMap: extractedUserMap };
  }, [postsData, likedPosts]);

  // Track posts and userMap for diagnostics
  useEffect(() => {
    updateDiagnostics({
      rawPostsCount: posts.length,
      userMapSize: Object.keys(userMap).length,
      formattedPostsCount: posts.length,
    });
  }, [posts.length, userMap, updateDiagnostics]);

  // Initialize likes when posts change
  useEffect(() => {
    if (posts.length > 0) {
      initializePostLikes(posts);
    }
  }, [posts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMorePosts = useCallback(() => {
    if (!postsLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [postsLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const fetchPost = async (postId: number): Promise<Post | null> => {
    try {
      const { data: post, error } = await supabase
        .from("post")
        .select(`
          *,
          challenges:challenge_id (title),
          media (file_path),
          likes:likes(count)
        `)
        .eq("id", postId)
        .single();

      if (error) throw error;

      return {
        ...post,
        challenge_title: (post as any).challenges?.title,
        likes_count: post.likes?.[0]?.count ?? 0,
        comments_count: 0,
        liked: likedPosts[post.id] ?? false,
      } as Post;
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  };

  // Start/stop slow loading timer based on loading state
  useEffect(() => {
    if (postsLoading) {
      startSlowLoadingTimer();
    } else {
      stopSlowLoadingTimer();
    }
  }, [postsLoading, startSlowLoadingTimer, stopSlowLoadingTimer]);

  return {
    posts,
    userMap,
    loading: postsLoading,
    error: postsError,
    loadMorePosts,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    fetchPost,
    likedPosts,
    refetchPosts,
  };
};
