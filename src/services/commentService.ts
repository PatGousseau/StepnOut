import { supabase } from "../lib/supabase";
import { imageService } from "./imageService";
import { shouldFallbackToLegacyMedia } from "./mediaJoinTableSupport";
import { Comment, CommentRecord } from "../types";
import { MediaSelectionResult } from "../utils/handleMediaUpload";

type CommentMediaRow = {
  comment_id: number;
  media_id: number;
  position: number;
  media: {
    file_path: string | null;
    upload_status?: string | null;
  } | null;
};

function resolveMediaUrl(filePath?: string | null): string | null {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;

  if (/\.(mp4|mov|avi|wmv)$/i.test(filePath)) {
    return imageService.getPublicMediaUrlSync(filePath);
  }

  return imageService.getPostImageUrlSync(filePath);
}

function normalizeMediaItems(comment: CommentRecord): Comment["media_items"] {
  const mediaUrl = resolveMediaUrl(comment.media?.file_path);
  const mediaItems = (comment.comment_media || [])
    .filter(
      (item) =>
        item.media?.file_path &&
        item.media.upload_status !== "failed" &&
        item.media.upload_status !== "pending"
    )
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      media_id: item.media_id,
      file_path: resolveMediaUrl(item.media?.file_path) || item.media?.file_path || null,
      position: item.position,
      is_video: !!item.media?.file_path && /\.(mp4|mov|avi|wmv)$/i.test(item.media.file_path),
    }));

  return mediaItems.length > 0
    ? mediaItems
    : mediaUrl || comment.media?.file_path
      ? [
          {
            media_id: comment.media_id || 0,
            file_path: mediaUrl || comment.media?.file_path || null,
            position: 0,
            is_video: !!(comment.media?.file_path && /\.(mp4|mov|avi|wmv)$/i.test(comment.media.file_path)),
          },
        ]
      : undefined;
}

function formatComment(comment: CommentRecord): Comment {
  const mediaUrl = resolveMediaUrl(comment.media?.file_path);
  const mediaItems = normalizeMediaItems(comment);
  const rawText = comment.body || "";
  const text = rawText === "🖼️" && (mediaItems?.length ?? 0) > 0 ? "" : rawText;

  return {
    id: comment.id,
    text,
    userId: comment.user_id,
    post_id: comment.post_id,
    parent_comment_id: comment.parent_comment_id,
    created_at: comment.created_at,
    media_id: comment.media_id ?? undefined,
    media: mediaUrl ? { file_path: mediaUrl } : comment.media ? { file_path: comment.media.file_path } : undefined,
    media_items: mediaItems,
    likes_count: comment.likes?.[0]?.count ?? 0,
    liked: false,
  };
}

export const commentService = {
  async hydrateCommentMedia(comments: CommentRecord[]): Promise<CommentRecord[]> {
    const commentIds = comments.map((comment) => comment.id);
    if (commentIds.length === 0) return comments;

    try {
      const { data, error } = await supabase
        .from("comment_media_items")
        .select("comment_id, media_id, position, media (file_path, upload_status)")
        .in("comment_id", commentIds);

      if (error) throw error;

      const mediaByCommentId = new Map<number, CommentRecord["comment_media"]>();
      for (const row of (data || []) as unknown as CommentMediaRow[]) {
        const items = mediaByCommentId.get(row.comment_id) || [];
        items.push({
          media_id: row.media_id,
          position: row.position,
          media: row.media,
        });
        mediaByCommentId.set(row.comment_id, items);
      }

      return comments.map((comment) => ({
        ...comment,
        comment_media: mediaByCommentId.get(comment.id)?.sort((a, b) => a.position - b.position),
      }));
    } catch (error) {
      console.warn("Comment media hydration skipped:", error);
      return comments;
    }
  },

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
          post_id,
          created_at,
          parent_comment_id,
          media_id,
          media:media!comments_media_id_fkey (
            file_path,
            upload_status
          ),
          likes:likes(count)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const hydratedComments = await this.hydrateCommentMedia((data || []) as CommentRecord[]);
      return hydratedComments.map(formatComment);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error; // Re-throw for React Query to handle
    }
  },

  async createComment(args: {
    postId: number;
    userId: string;
    body: string;
    parentCommentId?: number | null;
    mediaItems?: MediaSelectionResult[];
  }): Promise<Comment> {
    const { postId, userId, body, parentCommentId, mediaItems = [] } = args;
    const trimmed = body.trim();
    const normalizedBody = trimmed || (mediaItems.length > 0 ? "🖼️" : trimmed);

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: postId,
          user_id: userId,
          body: normalizedBody,
          parent_comment_id: parentCommentId ?? null,
          media_id: mediaItems[0]?.mediaId || null,
        },
      ])
      .select(`
        id,
        user_id,
        body,
        post_id,
        created_at,
        parent_comment_id,
        media_id,
        media:media!comments_media_id_fkey (
          file_path,
          upload_status
        ),
        likes:likes(count)
      `)
      .single();

    if (error) throw error;

    let fellBackToLegacyMedia = false;

    if (mediaItems.length > 0) {
      const { error: commentMediaError } = await supabase
        .from("comment_media_items")
        .insert(
          mediaItems.map((item, index) => ({
            comment_id: data.id,
            media_id: item.mediaId,
            position: index,
          }))
        );

      if (commentMediaError) {
        if (shouldFallbackToLegacyMedia(commentMediaError, mediaItems.length)) {
          fellBackToLegacyMedia = true;
          console.warn('comment_media unavailable, falling back to legacy comments.media_id support');
        } else {
          await supabase.from("comments").delete().eq("id", data.id);
          throw commentMediaError;
        }
      }
    }

    const comment = formatComment(data as CommentRecord);
    if (mediaItems.length === 0) return comment;

    const resolvedMediaItems = fellBackToLegacyMedia
      ? mediaItems.slice(0, 1)
      : mediaItems;

    return {
      ...comment,
      media_items: resolvedMediaItems.map((item, index) => ({
        media_id: item.mediaId,
        file_path: item.isVideo ? item.pendingUpload.originalUri : item.previewUrl,
        preview_path: item.thumbnailUri || item.previewUrl,
        position: index,
        is_video: item.isVideo,
      })),
    };
  },
};
