import { supabase } from "../lib/supabase";
import { Comment } from "../types";

export const commentService = {
  async fetchComments(postId: number): Promise<Comment[]> {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          user_id,
          body,
          created_at,
          parent_comment_id,
          likes:likes(count)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Transform the data to match the Comment interface
      const formattedComments =
        data?.map((comment) => ({
          id: comment.id,
          text: comment.body,
          userId: comment.user_id,
          post_id: postId,
          parent_comment_id: comment.parent_comment_id,
          created_at: comment.created_at,
          likes_count: comment.likes?.count || 0,
          liked: false, // This will be updated by initializeCommentLikes
        })) || [];

      return formattedComments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error; // Re-throw for React Query to handle
    }
  },
};
