import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Comment } from "../types";
import { commentService } from "../services/commentService";
import { MediaSelectionResult } from "../utils/handleMediaUpload";

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
    enabled: !!postId,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({
      userId,
      body,
      parentCommentId,
      media,
    }: {
      userId: string;
      body: string;
      parentCommentId?: number | null;
      media?: MediaSelectionResult | null;
    }) => {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            user_id: userId,
            body,
            parent_comment_id: parentCommentId ?? null,
            media_id: media?.mediaId ?? null,
          },
        ])
        .select(`
          *,
          media (
            file_path,
            upload_status
          ),
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
            media_id: data[0].media_id,
            media: media ? { file_path: media.previewUrl } : undefined,
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

  const addComment = async (
    userId: string,
    body: string,
    parentCommentId?: number | null,
    media?: MediaSelectionResult | null
  ) => {
    return addCommentMutation.mutateAsync({ userId, body, parentCommentId, media });
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
