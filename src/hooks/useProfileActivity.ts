import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase, supabaseStorageUrl } from "../lib/supabase";
import { Comment, Post } from "../types";

type CommentWithPost = Comment & {
  post?: Pick<Post, "id" | "body" | "created_at" | "challenge_title">;
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
  post: any;
  comment: any;
};

const PAGE_SIZE = 20;

export const useProfileActivity = (targetUserId: string) => {
  useAuth();

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

        const nextItems: ActivityItem[] = hydrated
          .map((r) => {
            if (r.item_type === "post") {
              const post = r.post;
              if (!post) return null;

              const mediaPath = post.media?.file_path;
              const media = {
                file_path: mediaPath ? `${supabaseStorageUrl}/${mediaPath}` : null,
              };

              return {
                type: "post" as const,
                createdAt: r.created_at,
                post: {
                  ...post,
                  media,
                  comment_previews:
                    Array.isArray(post.comment_previews) && post.comment_previews.length > 0
                      ? post.comment_previews
                      : undefined,
                },
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
    setItems([]);
    setHasMore(true);
    fetchNextPage(true);
  }, [targetUserId]);

  return {
    activityItems: items,
    loading,
    hasMore,
    fetchNextPage,
    refresh: () => fetchNextPage(true),
  };
};
