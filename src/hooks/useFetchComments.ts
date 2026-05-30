import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment } from "../types";
import { commentService } from "../services/commentService";
import { MediaSelectionResult } from "../utils/handleMediaUpload";
import { backgroundUploadService } from "../services/backgroundUploadService";

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
      mediaItems,
    }: {
      userId: string;
      body: string;
      parentCommentId?: number | null;
      mediaItems?: MediaSelectionResult[];
    }) => {
      const newComment = await commentService.createComment({
        postId,
        userId,
        body,
        parentCommentId,
        mediaItems,
      });

      if (mediaItems && mediaItems.length > 0) {
        let completedUploads = 0;

        mediaItems.forEach((item) => {
          backgroundUploadService.addToQueue(
            item.mediaId,
            item.pendingUpload,
            postId,
            undefined,
            () => {
              completedUploads += 1;
              if (completedUploads < mediaItems.length) return;

              queryClient.invalidateQueries({ queryKey: ["comments", postId] });
              queryClient.invalidateQueries({ queryKey: ["home-posts"] });
            }
          );
        });
      }

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
    mediaItems?: MediaSelectionResult[]
  ) => {
    return addCommentMutation.mutateAsync({ userId, body, parentCommentId, mediaItems });
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
