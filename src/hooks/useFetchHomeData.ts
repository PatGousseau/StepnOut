import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Post } from "../types";
import { User, UserProfile } from "../models/User";
import { useAuth } from "../contexts/AuthContext";
import { useLikes } from "../contexts/LikesContext";
import { imageService } from "../services/imageService";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "../services/postService";

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

  // Fetch blocked users
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

  // Fetch posts (now includes user profiles via foreign key join!)
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    isError: postsError,
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
