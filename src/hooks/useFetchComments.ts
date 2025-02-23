import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Comment } from "../types";
import { User } from "../models/User";

export const useFetchComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          user_id,
          body,
          created_at,
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
          created_at: comment.created_at,
          likes_count: comment.likes?.count || 0,
          liked: false, // This will be updated by initializeCommentLikes
        })) || [];

      // Fetch users for all comments
      const uniqueUserIds = [...new Set(formattedComments.map((comment) => comment.userId))];
      await Promise.all(uniqueUserIds.map((userId) => User.getUser(userId)));

      setComments(formattedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (userId: string, body: string) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([{ post_id: postId, user_id: userId, body }]).select(`
          *,
          likes:likes(count)
        `);

      if (error) throw error;

      const newComment = data?.[0]
        ? {
            id: data[0].id,
            text: data[0].body,
            userId: data[0].user_id,
            post_id: postId,
            created_at: data[0].created_at,
            likes_count: data[0].likes?.count || 0,
            liked: false,
          }
        : null;

      if (newComment) {
        setComments((prev) => [...prev, newComment]);
      }

      return newComment;
    } catch (error) {
      console.error("Error adding comment:", error);
      return null;
    }
  };

  return {
    comments,
    loading,
    fetchComments,
    addComment,
  };
};
