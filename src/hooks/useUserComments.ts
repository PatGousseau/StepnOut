import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Comment, Post } from "../types";

type CommentWithPost = Comment & {
  post?: Pick<Post, "id" | "body" | "created_at" | "challenge_title">;
  liked: boolean;
  likes_count: number;
};

const COMMENTS_PER_PAGE = 15;

const useUserComments = (targetUserId: string) => {
  const { user } = useAuth();
  const [userComments, setUserComments] = useState<CommentWithPost[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  const fetchUserComments = async (page = 1, isLoadMore = false) => {
    setCommentsLoading(true);
    try {
      const { data: comments, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          user_id,
          body,
          created_at,
          post_id,
          parent_comment_id,
          likes:likes(count),
          post:post_id (
            id,
            body,
            created_at,
            challenges (title)
          )
        `
        )
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .range((page - 1) * COMMENTS_PER_PAGE, page * COMMENTS_PER_PAGE - 1);

      if (error) throw error;

      const likedCommentIds = new Set<number>();
      if (comments.length > 0 && user?.id) {
        const { data: likedComments } = await supabase
          .from("likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in(
            "comment_id",
            comments.map((c) => c.id)
          );

        likedComments?.forEach((like) => {
          if (like.comment_id) likedCommentIds.add(like.comment_id);
        });
      }

      const formatted: CommentWithPost[] = comments.map((comment) => ({
        id: comment.id,
        text: comment.body,
        userId: comment.user_id,
        created_at: comment.created_at,
        post_id: comment.post_id,
        parent_comment_id: comment.parent_comment_id,
        liked: likedCommentIds.has(comment.id),
        likes_count: comment.likes?.count || 0,
        post: comment.post
          ? {
              id: comment.post.id,
              body: comment.post.body,
              created_at: comment.post.created_at,
              challenge_title: comment.post.challenges?.title,
            }
          : undefined,
      }));

      setUserComments((prev) => (isLoadMore ? [...prev, ...formatted] : formatted));
      setHasMoreComments(comments.length === COMMENTS_PER_PAGE);
    } catch (err) {
      console.error("Error fetching user comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId) fetchUserComments(1);
  }, [targetUserId]);

  return {
    userComments,
    commentsLoading,
    hasMoreComments,
    fetchUserComments,
  };
};

export default useUserComments;
