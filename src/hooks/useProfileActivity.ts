import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Comment, Post, PostRecord } from "../types";
import { formatPosts, hydratePostMedia } from "../services/postService";

type CommentWithPost = Comment & {
  post?: Pick<Post, "id" | "body" | "created_at" | "challenge_title" | "quest_id" | "quest_title">;
  liked: boolean;
  likes_count: number;
};

type ActivityItem =
  | {
      type: "post";
      createdAt: string;
      post: Post;
    }
  | {
      type: "comment";
      createdAt: string;
      comment: CommentWithPost;
    };

type HydratedRow = {
  item_type: "post" | "comment";
  item_id: number;
  created_at: string;
  post: (Post & {
    media?: { file_path?: string | null } | null;
  }) | null;
  comment: CommentWithPost | null;
};

const PAGE_SIZE = 20;

export const useProfileActivity = (targetUserId: string) => {
  useAuth();

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const fetchNextPageRef = useRef<(reset?: boolean) => Promise<void>>(async () => {});

  const lastCursor = useMemo(() => {
    if (items.length === 0) return null;

    const last = items[items.length - 1];
    return {
      created_at: last.createdAt,
      item_type: last.type,
      item_id: last.type === "post" ? last.post.id : last.comment.id,
    };
  }, [items]);

  const fetchNextPage = useCallback(
    async (reset = false) => {
      if (!targetUserId) return;
      if (!hasMore && !reset) return;

      setLoading(true);
      try {
        const before = reset ? null : lastCursor;

        const { data: rows, error } = await supabase.rpc("get_profile_activity_hydrated", {
          p_user_id: targetUserId,
          p_limit: PAGE_SIZE,
          p_before_created_at: before?.created_at || null,
          p_before_type: before?.item_type || null,
          p_before_id: before?.item_id || null,
        });

        if (error) throw error;

        const hydrated = (rows || []) as HydratedRow[];
        if (hydrated.length === 0) {
          setHasMore(false);
          if (reset) setItems([]);
          return;
        }

        const hydratedPosts = await hydratePostMedia(
          hydrated
            .filter((r): r is HydratedRow & { item_type: "post"; post: NonNullable<HydratedRow["post"]> } =>
              r.item_type === "post" && !!r.post
            )
            .map((r) => r.post as PostRecord)
        );
        const formattedPosts = formatPosts(hydratedPosts);
        const formattedPostMap = new Map(formattedPosts.map((post) => [post.id, post]));

        const nextItems: ActivityItem[] = hydrated
          .map((r) => {
            if (r.item_type === "post") {
              const post = r.post;
              if (!post) return null;

              const formattedPost = formattedPostMap.get(post.id);
              if (!formattedPost) return null;

              return {
                type: "post" as const,
                createdAt: r.created_at,
                post: formattedPost,
              };
            }

            const comment = r.comment;
            if (!comment) return null;

            return {
              type: "comment" as const,
              createdAt: r.created_at,
              comment,
            };
          })
          .filter(Boolean) as ActivityItem[];

        setItems((prev) => (reset ? nextItems : [...prev, ...nextItems]));
        setHasMore(hydrated.length === PAGE_SIZE);
      } catch (err) {
        console.error("Error fetching profile activity:", err);
      } finally {
        setLoading(false);
      }
    },
    [hasMore, lastCursor, targetUserId]
  );

  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage;
  }, [fetchNextPage]);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
    fetchNextPageRef.current(true);
  }, [targetUserId]);

  const removePost = useCallback((postId: number) => {
    setItems((prev) =>
      prev.filter((item) => !(item.type === "post" && item.post.id === postId))
    );
  }, []);

  return {
    activityItems: items,
    loading,
    hasMore,
    fetchNextPage,
    refresh: () => fetchNextPage(true),
    removePost,
  };
};
