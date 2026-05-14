import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { postService } from "../services/postService";
import { Post, Comment, LikeableItem } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { captureEvent } from "../lib/posthog";
import { POST_EVENTS, COMMENT_EVENTS } from "../constants/analyticsEvents";

interface LikesContextType {
  likedPosts: { [postId: number]: boolean };
  likedComments: { [commentId: number]: boolean };
  likeCounts: { [postId: number]: number };
  commentLikeCounts: { [commentId: number]: number };
  togglePostLike: (postId: number, userId: string, postUserId: string) => Promise<void>;
  toggleCommentLike: (
    commentId: number,
    postId: number,
    userId: string,
    commentUserId: string
  ) => Promise<void>;
  initializePostLikes: (
    posts: Post[],
    seedLikedMap?: { [postId: number]: boolean }
  ) => Promise<void>;
  initializeCommentLikes: (comments: Comment[]) => Promise<void>;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export const LikesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedPosts, setLikedPosts] = useState<{ [postId: number]: boolean }>({});
  const [likedComments, setLikedComments] = useState<{ [commentId: number]: boolean }>({});
  const [postLikeCounts, setPostLikeCounts] = useState<{ [postId: number]: number }>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<{ [commentId: number]: number }>({});
  const [pendingLikes, setPendingLikes] = useState<{ [id: number]: boolean }>({});
  const { user } = useAuth();

  const initializeLikes = useCallback(async (
    items: (Post | Comment)[],
    type: "post" | "comment",
    seedLikedMap?: { [id: number]: boolean }
  ) => {
    const ids = items.map((item) => item.id);

    const setLikedItems = type === "post" ? setLikedPosts : setLikedComments;
    const setItemCounts = type === "post" ? setPostLikeCounts : setCommentLikeCounts;

    // seed counts immediately from the data we already have to avoid a 0-likes flash
    setItemCounts((prev) => ({
      ...prev,
      ...Object.fromEntries(
        items
          .filter((item) => typeof item.likes_count === "number")
          .map((item) => [item.id, item.likes_count])
      ),
    }));

    // seed liked state synchronously. Prefer the pre-fetched seed map when provided.
    setLikedItems((prev) => ({
      ...prev,
      ...Object.fromEntries(
        items.map((item) => [
          item.id,
          seedLikedMap ? !!seedLikedMap[item.id] : (item.liked ?? false),
        ])
      ),
    }));

    // Caller already has authoritative liked data — skip the redundant network round-trip
    // that would otherwise cause hearts to lag behind the rest of the feed.
    if (seedLikedMap) return;

    const [likesMap, countsMap] = await Promise.all([
      type === "post"
        ? postService.fetchPostsLikes(ids, user?.id)
        : postService.fetchCommentsLikes(ids, user?.id),
      type === "post"
        ? postService.fetchPostLikesCounts(ids)
        : postService.fetchCommentLikesCounts(ids),
    ]);

    setLikedItems((prev) => ({
      ...prev,
      ...Object.fromEntries(ids.map((id) => [id, likesMap[id]?.isLiked || false])),
    }));

    setItemCounts((prev) => ({
      ...prev,
      ...countsMap,
    }));
  }, [user?.id]);

  const toggleLike = useCallback(async (item: LikeableItem, userId: string, targetUserId: string) => {
    const { id, type, parentId } = item;
    const isPost = type === "post";

    // Prevent double-tap race conditions
    if (pendingLikes[id]) {
      return;
    }

    const likedItems = isPost ? likedPosts : likedComments;
    const setLikedItems = isPost ? setLikedPosts : setLikedComments;
    const setItemCounts = isPost ? setPostLikeCounts : setCommentLikeCounts;

    const isCurrentlyLiked = likedItems[id];
    const notificationTitle = isPost
      ? "(username) ha messo mi piace al tuo post!"
      : "(username) ha messo mi piace al tuo commento!";

    // Mark as pending and do optimistic update
    setPendingLikes((prev) => ({ ...prev, [id]: true }));
    setLikedItems((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));
    setItemCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const result = isPost
        ? await postService.togglePostLike(id, userId, targetUserId, {
            title: notificationTitle,
            body: "Dai un'occhiata ora.",
          })
        : await postService.toggleCommentLike(id, parentId!, userId, targetUserId, {
            title: notificationTitle,
            body: "Dai un'occhiata ora.",
          });

      if (result === null) {
        // Revert on failure
        setLikedItems((prev) => ({ ...prev, [id]: isCurrentlyLiked }));
        setItemCounts((prev) => ({
          ...prev,
          [id]: (prev[id] || 0) + (isCurrentlyLiked ? 1 : -1),
        }));
      } else {
        // Track like/unlike event on success
        const eventName = isPost
          ? (isCurrentlyLiked ? POST_EVENTS.UNLIKED : POST_EVENTS.LIKED)
          : (isCurrentlyLiked ? COMMENT_EVENTS.UNLIKED : COMMENT_EVENTS.LIKED);

        captureEvent(eventName, {
          [`${type}_id`]: id,
          target_user_id: targetUserId,
          ...(parentId && { post_id: parentId }),
        });
      }
    } catch (error) {
      console.error(`Error toggling ${type} like:`, error);
      // Revert on error
      setLikedItems((prev) => ({ ...prev, [id]: isCurrentlyLiked }));
      setItemCounts((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + (isCurrentlyLiked ? 1 : -1),
      }));
    } finally {
      // Clear pending state
      setPendingLikes((prev) => ({ ...prev, [id]: false }));
    }
  }, [likedComments, likedPosts, pendingLikes]);

  const initializePostLikes = useCallback(
    (posts: Post[], seedLikedMap?: { [postId: number]: boolean }) =>
      initializeLikes(posts, "post", seedLikedMap),
    [initializeLikes]
  );
  const initializeCommentLikes = useCallback(
    (comments: Comment[]) => initializeLikes(comments, "comment"),
    [initializeLikes]
  );
  const togglePostLike = useCallback(
    (postId: number, userId: string, postUserId: string) =>
      toggleLike({ id: postId, type: "post" }, userId, postUserId),
    [toggleLike]
  );
  const toggleCommentLike = useCallback(
    (commentId: number, postId: number, userId: string, commentUserId: string) =>
      toggleLike({ id: commentId, type: "comment", parentId: postId }, userId, commentUserId),
    [toggleLike]
  );

  const value = useMemo(
    () => ({
      likedPosts,
      likedComments,
      likeCounts: postLikeCounts,
      commentLikeCounts,
      togglePostLike,
      toggleCommentLike,
      initializePostLikes,
      initializeCommentLikes,
    }),
    [
      commentLikeCounts,
      initializeCommentLikes,
      initializePostLikes,
      likedComments,
      likedPosts,
      postLikeCounts,
      toggleCommentLike,
      togglePostLike,
    ]
  );

  return (
    <LikesContext.Provider value={value}>{children}</LikesContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error("useLikes must be used within a LikesProvider");
  }
  return context;
};
