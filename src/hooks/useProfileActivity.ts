import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Comment, Post } from "../types";

type ActivityRow = {
  item_type: "post" | "comment";
  item_id: number;
  created_at: string;
};

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

const PAGE_SIZE = 20;

export const useProfileActivity = (targetUserId: string) => {
  const { user } = useAuth();

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

  const hydratePosts = useCallback(
    async (postIds: number[]) => {
      if (postIds.length === 0) return new Map<number, Post>();

      const { data: posts, error } = await supabase
        .from("post")
        .select(
          `
          id,
          user_id,
          created_at,
          featured,
          body,
          media_id,
          challenge_id,
          is_welcome,
          challenges (title),
          media (
            file_path,
            upload_status
          ),
          likes:likes(count),
          comments (id, body, created_at, parent_comment_id, profiles:user_id (username))
        `
        )
        .in("id", postIds);

      if (error) throw error;

      const transformedPosts = (posts || [])
        .map((post: any) => ({
          ...post,
          challenge_title: post.challenges?.title,
        }))
        .filter((post: any) => !post.is_welcome);

      const likedPostIds = new Set<number>();
      if (user?.id && transformedPosts.length > 0) {
        const { data: likedPosts } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in(
            "post_id",
            transformedPosts.map((p: any) => p.id)
          );

        likedPosts?.forEach((like) => {
          if (like.post_id) likedPostIds.add(Number(like.post_id));
        });
      }

      const getCommentPreviews = (post: any) => {
        if (!post.comments || post.comments.length === 0) return undefined;

        const sortedComments = [...post.comments].sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const commentUserMap = new Map<number, string>();
        for (const c of post.comments) {
          if (c?.id && c?.profiles?.username) {
            commentUserMap.set(c.id, c.profiles.username);
          }
        }

        const previews = sortedComments
          .slice(0, 3)
          .filter((c: any) => c?.body && c?.profiles?.username)
          .map((c: any) => ({
            username: c.profiles.username,
            text: c.body,
            replyToUsername: c.parent_comment_id ? commentUserMap.get(c.parent_comment_id) : undefined,
          }));

        return previews.length > 0 ? previews : undefined;
      };

      const out = new Map<number, Post>();
      for (const post of transformedPosts) {
        const formatted: Post = {
          ...post,
          media: {
            file_path: post.media?.file_path
              ? `${supabase.storageUrl}/object/public/challenge-uploads/${post.media.file_path}`
              : null,
          },
          likes_count: post.likes?.[0]?.count ?? 0,
          comments_count: post.comments?.length ?? 0,
          comment_previews: getCommentPreviews(post),
          challenge_title: post.challenge_title,
          liked: likedPostIds.has(post.id),
        };

        out.set(post.id, formatted);
      }

      return out;
    },
    [user?.id]
  );

  const hydrateComments = useCallback(
    async (commentIds: number[]) => {
      if (commentIds.length === 0) return new Map<number, CommentWithPost>();

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
        .in("id", commentIds);

      if (error) throw error;

      const likedCommentIds = new Set<number>();
      if (user?.id && (comments || []).length > 0) {
        const { data: likedComments } = await supabase
          .from("likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in(
            "comment_id",
            (comments || []).map((c) => c.id)
          );

        likedComments?.forEach((like) => {
          if (like.comment_id) likedCommentIds.add(Number(like.comment_id));
        });
      }

      const out = new Map<number, CommentWithPost>();
      for (const comment of comments || []) {
        out.set(comment.id, {
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
        });
      }

      return out;
    },
    [user?.id]
  );

  const fetchNextPage = useCallback(
    async (reset = false) => {
      if (!targetUserId) return;
      if (!hasMore && !reset) return;

      setLoading(true);
      try {
        const before = reset ? null : lastCursor;

        const { data: rows, error } = await supabase.rpc("get_profile_activity", {
          p_user_id: targetUserId,
          p_limit: PAGE_SIZE,
          p_before_created_at: before?.created_at || null,
          p_before_type: before?.item_type || null,
          p_before_id: before?.item_id || null,
        });

        if (error) throw error;

        const activityRows = (rows || []) as ActivityRow[];
        if (activityRows.length === 0) {
          setHasMore(false);
          if (reset) setItems([]);
          return;
        }

        const postIds = activityRows.filter((r) => r.item_type === "post").map((r) => r.item_id);
        const commentIds = activityRows
          .filter((r) => r.item_type === "comment")
          .map((r) => r.item_id);

        const [postsById, commentsById] = await Promise.all([
          hydratePosts(postIds),
          hydrateComments(commentIds),
        ]);

        const nextItems: ActivityItem[] = activityRows
          .map((r) => {
            if (r.item_type === "post") {
              const post = postsById.get(r.item_id);
              if (!post) return null;
              return {
                type: "post" as const,
                createdAt: r.created_at,
                post,
              };
            }

            const comment = commentsById.get(r.item_id);
            if (!comment) return null;
            return {
              type: "comment" as const,
              createdAt: r.created_at,
              comment,
            };
          })
          .filter(Boolean) as ActivityItem[];

        setItems((prev) => (reset ? nextItems : [...prev, ...nextItems]));
        setHasMore(activityRows.length === PAGE_SIZE);
      } catch (err) {
        console.error("Error fetching profile activity:", err);
      } finally {
        setLoading(false);
      }
    },
    [hasMore, hydrateComments, hydratePosts, lastCursor, targetUserId]
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
