import React, { createContext, useContext, useState } from "react";
import { postService } from "../services/postService";
import { Post, Comment, LikeableItem } from "../types";
import { useAuth } from "../contexts/AuthContext";

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
  initializePostLikes: (posts: Post[]) => Promise<void>;
  initializeCommentLikes: (comments: Comment[]) => Promise<void>;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export const LikesProvider = ({ children }: { children: React.ReactNode }) => {
  const [likedPosts, setLikedPosts] = useState<{ [postId: number]: boolean }>({});
  const [likedComments, setLikedComments] = useState<{ [commentId: number]: boolean }>({});
  const [postLikeCounts, setPostLikeCounts] = useState<{ [postId: number]: number }>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<{ [commentId: number]: number }>({});
  const { user } = useAuth();

  const initializeLikes = async (items: (Post | Comment)[], type: "post" | "comment") => {
    const ids = items.map((item) => item.id);

    const [likesMap, countsMap] = await Promise.all([
      type === "post"
        ? postService.fetchPostsLikes(ids, user?.id)
        : postService.fetchCommentsLikes(ids, user?.id),
      type === "post"
        ? postService.fetchPostLikesCounts(ids)
        : postService.fetchCommentLikesCounts(ids),
    ]);

    const setLikedItems = type === "post" ? setLikedPosts : setLikedComments;
    const setItemCounts = type === "post" ? setPostLikeCounts : setCommentLikeCounts;

    setLikedItems((prev) => ({
      ...prev,
      ...Object.fromEntries(ids.map((id) => [id, likesMap[id]?.isLiked || false])),
    }));

    setItemCounts((prev) => ({
      ...prev,
      ...countsMap,
    }));
  };

  const toggleLike = async (item: LikeableItem, userId: string, targetUserId: string) => {
    const { id, type, parentId } = item;
    const isPost = type === "post";

    const likedItems = isPost ? likedPosts : likedComments;
    const setLikedItems = isPost ? setLikedPosts : setLikedComments;
    const setItemCounts = isPost ? setPostLikeCounts : setCommentLikeCounts;

    const isCurrentlyLiked = likedItems[id];
    const notificationBody = isPost ? "liked your post" : "liked your comment";

    // Optimistic update
    setLikedItems((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));
    setItemCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const result = isPost
        ? await postService.togglePostLike(id, userId, targetUserId, {
            title: "(username)",
            body: notificationBody,
          })
        : await postService.toggleCommentLike(id, parentId!, userId, targetUserId, {
            title: "(username)",
            body: notificationBody,
          });

      if (result === null) {
        // Revert on failure
        setLikedItems((prev) => ({ ...prev, [id]: isCurrentlyLiked }));
        setItemCounts((prev) => ({
          ...prev,
          [id]: (prev[id] || 0) + (isCurrentlyLiked ? 1 : -1),
        }));
      }
    } catch (error) {
      console.error(`Error toggling ${type} like:`, error);
      // Revert on error
      setLikedItems((prev) => ({ ...prev, [id]: isCurrentlyLiked }));
      setItemCounts((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + (isCurrentlyLiked ? 1 : -1),
      }));
    }
  };

  return (
    <LikesContext.Provider
      value={{
        likedPosts,
        likedComments,
        likeCounts: postLikeCounts,
        commentLikeCounts,
        togglePostLike: (postId, userId, postUserId) =>
          toggleLike({ id: postId, type: "post" }, userId, postUserId),
        toggleCommentLike: (commentId, postId, userId, commentUserId) =>
          toggleLike({ id: commentId, type: "comment", parentId: postId }, userId, commentUserId),
        initializePostLikes: (posts) => initializeLikes(posts, "post"),
        initializeCommentLikes: (comments) => initializeLikes(comments, "comment"),
      }}
    >
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error("useLikes must be used within a LikesProvider");
  }
  return context;
};
