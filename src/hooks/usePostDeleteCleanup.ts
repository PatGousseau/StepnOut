import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Post as PostType } from "../types";

type FeedPage = { posts: PostType[]; hasMore: boolean };
type FeedData = { pages: FeedPage[]; pageParams: number[] };

export const usePostDeleteCleanup = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (post: PostType) => {
      const stripPost = (oldData: FeedData | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((p) => p.id !== post.id),
          })),
        };
      };

      queryClient.setQueriesData<FeedData>({ queryKey: ["home-posts"] }, stripPost);
      queryClient.setQueriesData<FeedData>({ queryKey: ["challenge-posts"] }, stripPost);

      if (post.challenge_id) {
        queryClient.invalidateQueries({ queryKey: ["challenge-completion", post.challenge_id] });
      }
      if (post.quest_id) {
        queryClient.invalidateQueries({ queryKey: ["quest-completion", post.quest_id] });
      }
    },
    [queryClient]
  );
};
