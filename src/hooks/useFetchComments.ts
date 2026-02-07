import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Comment } from "../types";
import { commentService } from "../services/commentService";

export const useFetchComments = (postId: number) => {
  const queryClient = useQueryClient();

  // Fetch comments with React Query
  const {
    data: comments = [],
    isLoading: loading,
    error,
    refetch: fetchComments,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentService.fetchComments(postId),
    enabled: false, // Lazy-loaded: fetched on demand when comments modal opens
    staleTime: 30000, // Cache for 30 seconds
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({
      userId,
      body,
      parentCommentId,
    }: {
      userId: string;
      body: string;
      parentCommentId?: number | null;
    }) => {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            user_id: userId,
            body,
            parent_comment_id: parentCommentId ?? null,
          },
        ])
        .select(`
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
            parent_comment_id: data[0].parent_comment_id,
            created_at: data[0].created_at,
            likes_count: data[0].likes?.count || 0,
            liked: false,
          }
        : null;

      return newComment;
    },
    onSuccess: (newComment) => {
      if (newComment) {
        // Optimistically update the comments query
        queryClient.setQueryData<Comment[]>(["comments", postId], (old) => {
          return old ? [...old, newComment] : [newComment];
        });

        // Invalidate home posts to refresh comment counts
        queryClient.invalidateQueries({ queryKey: ["home-posts"] });
      }
    },
  });

  const addComment = async (userId: string, body: string, parentCommentId?: number | null) => {
    return addCommentMutation.mutateAsync({ userId, body, parentCommentId });
  };

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    isAddingComment: addCommentMutation.isPending,
  };
};
