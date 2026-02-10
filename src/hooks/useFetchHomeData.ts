import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Post, FeedSort } from "../types";
import { User, UserProfile } from "../models/User";
import { useAuth } from "../contexts/AuthContext";
import { useLikes } from "../contexts/LikesContext";
import { imageService } from "../services/imageService";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "../services/postService";
import { captureEvent } from "../lib/posthog";
import { FEED_EVENTS } from "../constants/analyticsEvents";

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

interface CommentRow {
  body: string;
  profiles: { username: string } | null;
}

function formatPosts(posts: any[], likedPosts: PostLikes): { posts: Post[]; userMap: UserMap } {
  const extractedUserMap: UserMap = {};

  const formattedPosts = posts.map((post: any) => {
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
      profiles: undefined,
    } as Post;
  });

  return { posts: formattedPosts, userMap: extractedUserMap };
}

export const useFetchHomeData = (
  submissionSort: FeedSort = "recent",
  discussionSort: FeedSort = "recent"
) => {
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

  const startSlowLoadingTimer = useCallback(() => {
    if (slowLoadingTimerRef.current) return;

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

  useEffect(() => {
    const status = blockedUsersLoading ? 'loading' : (blockedUsersError ? 'error' : 'success');
    updateDiagnostics({
      blockedUsersStatus: status,
      blockedUsersCount: blockedUserIds.length,
      stage: blockedUsersLoading ? 'blocked_users_loading' : 'blocked_users_complete',
      ...(blockedUsersError ? { errors: [...diagnosticsRef.current.errors, `BlockedUsers: ${(blockedUsersError as Error).message}`] } : {}),
    });
  }, [blockedUsersLoading, blockedUsersError, blockedUserIds.length, updateDiagnostics]);

  const fetchFeedPage = useCallback(
    (feedType: "challenge" | "discussion", sort: FeedSort) =>
      async ({ pageParam = 1 }: { pageParam?: number }) => {
        if (sort === "popular") {
          return postService.fetchPopularPosts(feedType, pageParam, blockedUserIds, POSTS_PER_PAGE);
        }
        return postService.fetchRecentPosts(feedType, pageParam, blockedUserIds, POSTS_PER_PAGE);
      },
    [blockedUserIds]
  );

  const enabled = !!user && blockedUsers !== undefined;

  const {
    data: challengeData,
    fetchNextPage: fetchNextChallengePage,
    hasNextPage: hasMoreChallenges,
    isFetchingNextPage: isFetchingNextChallengePage,
    isLoading: challengeLoading,
    isRefetching: challengeRefetching,
    isError: challengeError,
    refetch: refetchChallenges,
  } = useInfiniteQuery({
    queryKey: ["home-posts", "challenge", submissionSort, blockedUserIds],
    queryFn: fetchFeedPage("challenge", submissionSort),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const {
    data: discussionData,
    fetchNextPage: fetchNextDiscussionPage,
    hasNextPage: hasMoreDiscussions,
    isFetchingNextPage: isFetchingNextDiscussionPage,
    isLoading: discussionLoading,
    isRefetching: discussionRefetching,
    isError: discussionError,
    refetch: refetchDiscussions,
  } = useInfiniteQuery({
    queryKey: ["home-posts", "discussion", discussionSort, blockedUserIds],
    queryFn: fetchFeedPage("discussion", discussionSort),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const postsLoading = challengeLoading || discussionLoading;
  const postsError = challengeError || discussionError;

  useEffect(() => {
    const status = postsLoading ? 'loading' : (postsError ? 'error' : 'success');
    updateDiagnostics({
      postsQueryStatus: status,
      isRefetching: challengeRefetching || discussionRefetching,
      stage: postsLoading ? 'posts_loading' : 'posts_complete',
    });
  }, [postsLoading, postsError, challengeRefetching, discussionRefetching, updateDiagnostics]);

  const { posts: challengePosts, userMap: challengeUserMap } = useMemo(() => {
    const pages = challengeData?.pages.flatMap((page) => page.posts) ?? [];
    return formatPosts(pages, likedPosts);
  }, [challengeData, likedPosts]);

  const { posts: discussionPosts, userMap: discussionUserMap } = useMemo(() => {
    const pages = discussionData?.pages.flatMap((page) => page.posts) ?? [];
    return formatPosts(pages, likedPosts);
  }, [discussionData, likedPosts]);

  const userMap = useMemo(
    () => ({ ...challengeUserMap, ...discussionUserMap }),
    [challengeUserMap, discussionUserMap]
  );

  const allPosts = useMemo(
    () => [...challengePosts, ...discussionPosts],
    [challengePosts, discussionPosts]
  );

  useEffect(() => {
    updateDiagnostics({
      rawPostsCount: allPosts.length,
      userMapSize: Object.keys(userMap).length,
      formattedPostsCount: allPosts.length,
    });
  }, [allPosts.length, userMap, updateDiagnostics]);

  // Initialize likes when posts change
  useEffect(() => {
    if (allPosts.length > 0) {
      initializePostLikes(allPosts);
    }
  }, [allPosts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMoreChallenges = useCallback(() => {
    if (!challengeLoading && !isFetchingNextChallengePage && hasMoreChallenges) {
      fetchNextChallengePage();
    }
  }, [challengeLoading, isFetchingNextChallengePage, hasMoreChallenges, fetchNextChallengePage]);

  const loadMoreDiscussions = useCallback(() => {
    if (!discussionLoading && !isFetchingNextDiscussionPage && hasMoreDiscussions) {
      fetchNextDiscussionPage();
    }
  }, [discussionLoading, isFetchingNextDiscussionPage, hasMoreDiscussions, fetchNextDiscussionPage]);

  const refetchPosts = useCallback(async () => {
    await Promise.all([refetchChallenges(), refetchDiscussions()]);
  }, [refetchChallenges, refetchDiscussions]);

  const fetchPost = async (postId: number): Promise<Post | null> => {
    try {
      const { data, error } = await supabase
        .from("post")
        .select(`
          *,
          challenges:challenge_id (title),
          media (file_path),
          likes:likes(count),
          comments (id, body, profiles:user_id (username))
        `)
        .eq("id", postId)
        .single();

      if (error) throw error;

      const comments = (data.comments ?? []) as CommentRow[];
      const commentPreviews = comments
        .slice(0, 3)
        .filter((c) => c.profiles?.username && c.body)
        .map((c) => ({ username: c.profiles!.username, text: c.body }));

      let mediaUrl = data.media?.file_path;
      if (mediaUrl && !mediaUrl.startsWith('http')) {
        mediaUrl = imageService.getPostImageUrlSync(mediaUrl);
      }

      return {
        ...data,
        media: mediaUrl ? { file_path: mediaUrl } : data.media,
        challenge_title: data.challenges?.title,
        likes_count: data.likes?.[0]?.count ?? 0,
        comments_count: comments.length,
        liked: likedPosts[data.id] ?? false,
        comment_previews: commentPreviews.length > 0 ? commentPreviews : undefined,
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
    // legacy/compat: some screens expect a single combined list
    posts: allPosts,
    challengePosts,
    discussionPosts,
    userMap,
    loading: postsLoading,
    error: postsError,
    loadMoreChallenges,
    loadMoreDiscussions,
    hasMoreChallenges: hasMoreChallenges ?? false,
    hasMoreDiscussions: hasMoreDiscussions ?? false,
    isFetchingNextChallengePage,
    isFetchingNextDiscussionPage,
    fetchPost,
    likedPosts,
    refetchPosts,
  };
};
