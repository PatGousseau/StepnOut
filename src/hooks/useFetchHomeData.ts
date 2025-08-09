import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Post } from "../types";
import { User } from "../models/User";
import { useAuth } from "../contexts/AuthContext";
import { useLikes } from "../contexts/LikesContext";
import { imageService } from "../services/imageService";

interface UserMap {
  [key: string]: User;
}

interface PostLikes {
  [postId: number]: boolean;
}

interface CommentLikes {
  [commentId: number]: boolean;
}

interface CommentCount {
  post_id: number;
  count: string;
}

export const useFetchHomeData = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 10;
  const [hasMore, setHasMore] = useState(true);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<PostLikes>({});
  const [likedComments, setLikedComments] = useState<CommentLikes>({});
  const { user } = useAuth();
  const { initializePostLikes } = useLikes();

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

    return {
      ...post,
      ...(urls ? { media: { file_path: urls.fullUrl } } : {}),
      likes_count: post.likes?.count ?? 0,
      comments_count: commentCount ?? 0,
      liked: likedPosts[post.id] ?? false,
      challenge_id: post.challenge_id,
      challenge_title: (post as any).challenge_title, // preserved when we add it below
    };
  };

  const fetchAllData = useCallback(
    async (pageNumber = 1, isLoadMore = false) => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Reset pagination state when starting fresh (not loading more)
      if (!isLoadMore) {
        setPage(1);
        setHasMore(true);
      }

      setLoading(true);
      try {
        // First, get the list of blocked user IDs
        const { data: blockedUsers, error: blockError } = await supabase
          .from("blocks")
          .select("blocked_id")
          .eq("blocker_id", user.id);

        if (blockError) throw blockError;

        // Create array of blocked user IDs
        const blockedUserIds = blockedUsers?.map((block) => block.blocked_id) || [];

        // Query for challenge posts
        let challengeQuery = supabase
          .from("post")
          .select(
            `
            *,
            challenges!inner (
              title
            ),
            media (
              file_path,
              upload_status
            ),
            likes:likes(count)
          `
          )
          .not("challenge_id", "is", null)
          .not("media.upload_status", "in", '("failed","pending")')
          .order("created_at", { ascending: false });

        // Query for discussion posts
        let discussionQuery = supabase
          .from("post")
          .select(
            `
            *,
            media (
              file_path,
              upload_status
            ),
            likes:likes(count)
          `
          )
          .is("challenge_id", null)
          .not("media.upload_status", "in", '("failed","pending")')
          .order("created_at", { ascending: false });

        // Add blocked users filter if needed (quote UUIDs)
        if (blockedUserIds.length > 0) {
          const quotedList = `(${blockedUserIds.map((id) => `"${id}"`).join(",")})`;
          challengeQuery = challengeQuery.not("user_id", "in", quotedList);
          discussionQuery = discussionQuery.not("user_id", "in", quotedList);
        }

        // Add pagination (offset-based)
        const start = (pageNumber - 1) * POSTS_PER_PAGE;
        const end = pageNumber * POSTS_PER_PAGE - 1;
        challengeQuery = challengeQuery.range(start, end);
        discussionQuery = discussionQuery.range(start, end);

        // Execute both queries
        const [challengeResponse, discussionResponse] = await Promise.all([
          challengeQuery,
          discussionQuery,
        ]);

        if (challengeResponse.error) throw challengeResponse.error;
        if (discussionResponse.error) throw discussionResponse.error;

        // Process challenge posts (attach title)
        const challengePosts = (challengeResponse.data ?? []).map((post: any) => ({
          ...post,
          challenge_title: post.challenges?.title,
        }));

        // Process discussion posts
        const discussionPosts = discussionResponse.data ?? [];

        // Combine & enforce global ordering (newest first)
        const postData = [...challengePosts, ...discussionPosts].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // ✅ Correct hasMore: true if EITHER bucket filled its page
        setHasMore(
          (challengePosts.length === POSTS_PER_PAGE) ||
          (discussionPosts.length === POSTS_PER_PAGE)
        );

        // Batch comment counts
        const postIds = postData.map((post) => post.id.toString());
        const commentCountsResponse = await supabase.rpc("get_comment_counts", {
          post_ids: postIds,
        });

        const commentCountMap = new Map<number, number>();
        commentCountsResponse.data?.forEach((row: CommentCount) => {
          commentCountMap.set(row.post_id, parseInt(row.count, 10));
        });

        // Fetch unique users
        const uniqueUserIds = [...new Set(postData.map((post) => post.user_id))];
        const users = await Promise.all(
          uniqueUserIds.map((userId) => User.getUser(userId))
        );

        const newUserMap = users.reduce((acc, u) => {
          if (u) acc[u.id] = u;
          return acc;
        }, {} as UserMap);

        // Format posts (image URLs, counts, liked state)
        const formattedPosts = await Promise.all(
          postData.map((post) => formatPost(post, commentCountMap))
        );

        // Initialize likes for all new posts, regardless of page
        initializePostLikes(formattedPosts);

        setPosts((prev) => (isLoadMore ? [...prev, ...formattedPosts] : formattedPosts));
        setUserMap((prev) => ({ ...prev, ...newUserMap }));
      } catch (error) {
        console.error("Error fetching posts and users:", error);
      } finally {
        setLoading(false);
      }
    },
    [POSTS_PER_PAGE, user?.id, initializePostLikes] // keep deps tight
  );

  const formatComment = async (comment: any): Promise<any> => {
    return {
      ...comment,
      likes_count: comment.likes?.count ?? 0,
      liked: likedComments[comment.id] ?? false,
    };
  };

  const addComment = async (postId: number, userId: string, body: string) => {
    const { data, error } = await supabase
      .from("comments")
      .insert([{ post_id: postId, user_id: userId, body }])
      .select(
        `
        *,
        likes:likes(count)
      `
      );

    if (error) {
      console.error("Error adding comment:", error);
      return null;
    }

    if (data?.[0]) {
      const formattedComment = await formatComment(data[0]);
      return {
        id: formattedComment.id,
        text: formattedComment.body,
        userId: formattedComment.user_id,
        created_at: formattedComment.created_at,
        likes_count: formattedComment.likes_count,
        liked: formattedComment.liked,
      };
    }
    return null;
  };

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllData(nextPage, true);
    }
  }, [loading, hasMore, page, fetchAllData]);

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

      const postWithChallenge = {
        ...post,
        challenge_title: (post as any).challenges?.title,
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
    loading,
    fetchAllData,
    addComment,
    loadMorePosts,
    hasMore,
    fetchPost,
    likedPosts,
    likedComments,
  };
};
