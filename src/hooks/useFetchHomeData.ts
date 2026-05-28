import { useCallback, useEffect, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Post, FeedSort, PostRecord } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useLikes } from "../contexts/LikesContext";
import { useReactions } from "../contexts/ReactionsContext";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  formatFeedPosts,
  formatSinglePost,
  hydrateSinglePostMedia,
  postService,
} from "../services/postService";
import { captureEvent } from "../lib/posthog";
import { FEED_EVENTS } from "../constants/analyticsEvents";

type LoadingStage = "idle" | "blocked_users_loading" | "blocked_users_complete" | "posts_loading" | "posts_complete" | "complete";

interface LoadingDiagnostics {
  stage: LoadingStage;
  timestamp: number;
  blockedUsersStatus: "pending" | "loading" | "success" | "error";
  blockedUsersCount: number;
  postsQueryStatus: "pending" | "loading" | "success" | "error";
  rawPostsCount: number;
  userMapSize: number;
  formattedPostsCount: number;
  isRefetching: boolean;
  errors: string[];
}

interface PostLikes {
  [postId: number]: boolean;
}

const POSTS_PER_PAGE = 20;
const SLOW_LOADING_THRESHOLD_MS = 10000;
const EMPTY_LIKED_POSTS: PostLikes = {};

export const useFetchHomeData = (sort: FeedSort = "recent") => {
  const { user } = useAuth();
  const { initializePostLikes } = useLikes();
  const { initializePostReactions } = useReactions();

  const loadingStartTimeRef = useRef<number | null>(null);
  const slowLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const diagnosticsRef = useRef<LoadingDiagnostics>({
    stage: "idle",
    timestamp: Date.now(),
    blockedUsersStatus: "pending",
    blockedUsersCount: 0,
    postsQueryStatus: "pending",
    rawPostsCount: 0,
    userMapSize: 0,
    formattedPostsCount: 0,
    isRefetching: false,
    errors: [],
  });
  const hasLoggedSlowLoadingRef = useRef(false);

  const updateDiagnostics = useCallback((updates: Partial<LoadingDiagnostics>) => {
    diagnosticsRef.current = {
      ...diagnosticsRef.current,
      ...updates,
      timestamp: Date.now(),
    };
  }, []);

  const sendSlowLoadingLog = useCallback(() => {
    if (hasLoggedSlowLoadingRef.current) return;
    hasLoggedSlowLoadingRef.current = true;

    const diagnostics = diagnosticsRef.current;
    const loadingDuration = loadingStartTimeRef.current ? Date.now() - loadingStartTimeRef.current : 0;

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
  }, [user?.id]);

  const startSlowLoadingTimer = useCallback(() => {
    if (slowLoadingTimerRef.current) return;

    loadingStartTimeRef.current = Date.now();
    hasLoggedSlowLoadingRef.current = false;
    updateDiagnostics({ stage: "blocked_users_loading" });

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
    updateDiagnostics({ stage: "complete" });
  }, [updateDiagnostics]);

  useEffect(() => {
    return () => {
      if (slowLoadingTimerRef.current) {
        clearTimeout(slowLoadingTimerRef.current);
      }
    };
  }, []);

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

  const blockedUserIds = useMemo(() => blockedUsers ?? [], [blockedUsers]);

  const { data: userLikedPostIds } = useQuery({
    queryKey: ["user-liked-posts", user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      const { data, error } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("emoji", ["❤️", "❤"])
        .not("post_id", "is", null);
      if (error) throw error;

      const likedMap: PostLikes = {};
      for (const row of data ?? []) {
        if (row.post_id != null) likedMap[row.post_id] = true;
      }
      return likedMap;
    },
    enabled: !!user?.id,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const likedPosts: PostLikes = userLikedPostIds ?? EMPTY_LIKED_POSTS;

  useEffect(() => {
    const status = blockedUsersLoading ? "loading" : blockedUsersError ? "error" : "success";
    updateDiagnostics({
      blockedUsersStatus: status,
      blockedUsersCount: blockedUserIds.length,
      stage: blockedUsersLoading ? "blocked_users_loading" : "blocked_users_complete",
      ...(blockedUsersError
        ? { errors: [...diagnosticsRef.current.errors, `BlockedUsers: ${(blockedUsersError as Error).message}`] }
        : {}),
    });
  }, [blockedUsersLoading, blockedUsersError, blockedUserIds.length, updateDiagnostics]);

  const fetchFeedPage = useCallback(
    async ({ pageParam = 1 }: { pageParam?: number }) => {
      if (sort === "popular") {
        return postService.fetchPopularPosts("all", pageParam, blockedUserIds, POSTS_PER_PAGE);
      }
      return postService.fetchRecentPosts("all", pageParam, blockedUserIds, POSTS_PER_PAGE);
    },
    [blockedUserIds, sort]
  );

  const enabled = !!user && blockedUsers !== undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["home-posts", "all", sort, blockedUserIds],
    queryFn: fetchFeedPage,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    initialPageParam: 1,
    enabled,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  useEffect(() => {
    const status = isLoading ? "loading" : isError ? "error" : "success";
    updateDiagnostics({
      postsQueryStatus: status,
      isRefetching,
      stage: isLoading ? "posts_loading" : "posts_complete",
    });
  }, [isLoading, isError, isRefetching, updateDiagnostics]);

  const rawPages = useMemo(
    () => (data?.pages.flatMap((page) => page.posts) ?? []) as PostRecord[],
    [data]
  );

  const { posts, userMap } = useMemo(() => formatFeedPosts(rawPages, likedPosts), [likedPosts, rawPages]);

  const { posts: postsForInitialization } = useMemo(() => formatFeedPosts(rawPages, EMPTY_LIKED_POSTS), [rawPages]);

  useEffect(() => {
    updateDiagnostics({
      rawPostsCount: posts.length,
      userMapSize: Object.keys(userMap).length,
      formattedPostsCount: posts.length,
    });
  }, [posts.length, userMap, updateDiagnostics]);

  // Initialize likes when posts change, and re-seed when the user's liked-post
  // pre-fetch resolves so the red heart paints in sync with everything else.
  useEffect(() => {
    if (postsForInitialization.length > 0) {
      initializePostLikes(postsForInitialization, userLikedPostIds);
      initializePostReactions(postsForInitialization);
    }
  }, [postsForInitialization, userLikedPostIds]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoading) {
      startSlowLoadingTimer();
    } else {
      stopSlowLoadingTimer();
    }
  }, [isLoading, startSlowLoadingTimer, stopSlowLoadingTimer]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  const refetchPosts = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const fetchPost = async (postId: number): Promise<Post | null> => {
    try {
      const { data, error } = await supabase
        .from("post")
        .select(`
          *,
          challenges:challenge_id (title),
          side_quests:quest_id (title),
          media:media!post_media_id_fkey (file_path),
          likes:likes(count),
          comments (id, body, created_at, user_id, parent_comment_id, profiles:user_id (username))
        `)
        .eq("id", postId)
        .single();

      if (error) throw error;

      const post = await hydrateSinglePostMedia(data as PostRecord);
      return formatSinglePost(post, likedPosts);
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  };

  return {
    posts,
    userMap,
    loading: isLoading,
    error: isError,
    loadMore,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    fetchPost,
    likedPosts,
    refetchPosts,
  };
};
