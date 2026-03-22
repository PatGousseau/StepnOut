import { useCallback, useEffect, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useLikes } from "../contexts/LikesContext";
import { useReactions } from "../contexts/ReactionsContext";
import { postService } from "../services/postService";
import { Post } from "../types";
import { User, UserProfile } from "../models/User";
import { imageService } from "../services/imageService";
import { isDefaultChallengePostBody } from "../constants/defaultChallengePostText";

interface UserMap {
  [key: string]: User | UserProfile;
}

interface PostLikes {
  [postId: number]: boolean;
}

const EMPTY_LIKED_POSTS: PostLikes = {};

function formatPosts(posts: unknown[], likedPosts: PostLikes): { posts: Post[]; userMap: UserMap } {
  const extractedUserMap: UserMap = {};

  const formattedPosts = (posts as Array<Record<string, unknown>>)
    .filter((post) => {
      const body = typeof post.body === "string" ? post.body.trim() : "";
      if (!body) return false;
      if (isDefaultChallengePostBody(body)) return false;
      return true;
    })
    .map((post) => {
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
      if (mediaUrl && !mediaUrl.startsWith("http")) {
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

export function useFetchChallengePosts(challengeId?: number) {
  const { user } = useAuth();
  const { initializePostLikes } = useLikes();
  const { initializePostReactions } = useReactions();
  const POSTS_PER_PAGE = 20;

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
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const blockedUserIds = blockedUsers ?? [];

  const { data: userLikedPostIds } = useQuery({
    queryKey: ["user-liked-posts", user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      const { data, error } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .eq("emoji", "❤️")
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

  const enabled = !!user && !!challengeId && blockedUsers !== undefined;

  const fetchPage = useCallback(
    async ({ pageParam = 1 }: { pageParam?: number }) => {
      if (!challengeId) return { posts: [], hasMore: false };
      return postService.fetchPostsForChallenge(challengeId, pageParam, blockedUserIds, POSTS_PER_PAGE);
    },
    [blockedUserIds, challengeId]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["challenge-posts", challengeId, blockedUserIds],
    queryFn: fetchPage,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    initialPageParam: 1,
    enabled,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { posts, userMap } = useMemo(() => {
    const pages = data?.pages.flatMap((p) => p.posts) ?? [];
    return formatPosts(pages, likedPosts);
  }, [data, likedPosts]);

  useEffect(() => {
    if (posts.length > 0) {
      initializePostLikes(posts);
      initializePostReactions(posts);
    }
    // note: keep deps minimal to avoid feedback loops from context updates
  }, [posts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (!isLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  return {
    posts,
    userMap,
    loading: isLoading,
    error: isError,
    loadMore,
    hasMore: hasNextPage ?? false,
    isFetchingNextPage,
    refetch,
    isRefetching,
  };
}
