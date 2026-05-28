import { supabase } from "../lib/supabase";
import { sendLikeNotification, sendReactionNotification } from "../lib/notificationsService";
import { imageService } from "../services/imageService";
import { LikeableItem, Post, PostCommentRecord, PostRecord, ReactionSummary, ReactionUser } from "../types";
import { UserProfile } from "../models/User";

const BASE_SELECT = `
  *,
  profiles!post_user_id_profiles_fkey (
    id,
    username,
    name,
    profile_media:media!profiles_profile_media_id_fkey (
      file_path
    )
  ),
  media (
    file_path,
    upload_status
  ),
  post_media (
    position,
    media_id,
    media (
      file_path,
      upload_status
    )
  ),
  likes:likes(count),
  comments (
    id,
    body,
    created_at,
    user_id,
    parent_comment_id,
    profiles!comments_user_id_profiles_fkey (
      username
    )
  )
`;

function resolveMediaUrl(filePath?: string | null): string | null {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;

  if (/\.(mp4|mov|avi|wmv)$/i.test(filePath)) {
    return imageService.getPublicMediaUrlSync(filePath);
  }

  return imageService.getPostImageUrlSync(filePath);
}

function getCommentPreviews(post: PostRecord) {
  if (!post.comments || post.comments.length === 0) return undefined;

  const sortedComments = [...post.comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const commentUserMap = new Map<number, string>();
  for (const c of post.comments) {
    if (c.id && c.profiles?.username) {
      commentUserMap.set(c.id, c.profiles.username);
    }
  }
  const previews = sortedComments
    .slice(0, 3)
    .filter((c): c is PostCommentRecord & { profiles: { username: string } } =>
      !!c.body && !!c.profiles?.username
    )
    .map((c) => ({
      username: c.profiles.username,
      text: c.body,
      replyToUsername: c.parent_comment_id ? commentUserMap.get(c.parent_comment_id) : undefined,
    }));
  return previews.length > 0 ? previews : undefined;
}

function normalizePost(post: PostRecord, likedPosts: Record<number, boolean> = {}): Post {
  const mediaUrl = resolveMediaUrl(post.media?.file_path);
  const mediaItems = (post.post_media || [])
    .filter((item) => item.media?.file_path)
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      media_id: item.media_id,
      file_path: resolveMediaUrl(item.media?.file_path) || item.media?.file_path || null,
      position: item.position,
    }));
  const normalizedMediaItems = mediaItems.length > 0
    ? mediaItems
    : mediaUrl || post.media?.file_path
      ? [
          {
            media_id: post.media_id || 0,
            file_path: mediaUrl || post.media?.file_path || null,
            position: 0,
          },
        ]
      : undefined;
  const { comments, likes, challenges, side_quests } = post;

  return {
    id: post.id,
    user_id: post.user_id,
    body: post.body,
    media_id: post.media_id ?? undefined,
    media: mediaUrl ? { file_path: mediaUrl } : post.media ? { file_path: post.media.file_path } : undefined,
    media_items: normalizedMediaItems,
    created_at: post.created_at,
    featured: post.featured,
    challenge_id: post.challenge_id ?? null,
    quest_id: post.quest_id ?? null,
    comfort_zone_rating: post.comfort_zone_rating ?? null,
    likes_count: likes?.[0]?.count ?? 0,
    comments_count: comments?.length ?? 0,
    liked: likedPosts[post.id] ?? false,
    is_welcome: post.is_welcome ?? null,
    challenge_title: challenges?.title,
    quest_title: side_quests?.title,
    comment_previews: getCommentPreviews(post),
  };
}

export function formatFeedPosts(
  posts: PostRecord[],
  likedPosts: Record<number, boolean> = {}
): { posts: Post[]; userMap: Record<string, UserProfile> } {
  const userMap: Record<string, UserProfile> = {};

  const normalizedPosts = posts.map((post) => {
    if (post.profiles) {
      userMap[post.user_id] = {
        id: post.profiles.id,
        username: post.profiles.username,
        name: post.profiles.name,
        profileImageUrl: post.profiles.profile_media?.file_path
          ? imageService.getProfileImageUrlSync(post.profiles.profile_media.file_path)
          : null,
      };
    }

    return normalizePost(post, likedPosts);
  });

  return { posts: normalizedPosts, userMap };
}

export function formatSinglePost(post: PostRecord, likedPosts: Record<number, boolean> = {}): Post {
  return normalizePost(post, likedPosts);
}

function applyBlockedFilter<T extends { not: (column: string, operator: string, value: string) => T }>(
  query: T,
  blockedUserIds: string[]
) {
  if (blockedUserIds.length === 0) return query;
  const quotedList = `(${blockedUserIds.map((id) => `"${id}"`).join(",")})`;
  return query.not("user_id", "in", quotedList);
}

export const postService = {
  async fetchPostsForChallenge(
    challengeId: number,
    pageParam: number,
    blockedUserIds: string[],
    postsPerPage: number = 20
  ): Promise<{ posts: PostRecord[]; hasMore: boolean }> {
    const select = `${BASE_SELECT}, challenges!inner (title), side_quests:quest_id (title)`;

    let query = supabase
      .from("post")
      .select(select)
      .eq("challenge_id", challengeId)
      .not("body", "is", null)
      .not("media.upload_status", "in", '("failed","pending")')
      .order("created_at", { ascending: false });

    query = applyBlockedFilter(query, blockedUserIds);

    const start = (pageParam - 1) * postsPerPage;
    query = query.range(start, start + postsPerPage - 1);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as PostRecord[];
    return { posts: rows, hasMore: rows.length === postsPerPage };
  },

  async fetchLikes(ids: number[], type: LikeableItem["type"], userId?: string) {
    try {
      const idField = `${type}_id` as const;
      const { data, error } = await supabase
        .from("likes")
        .select(`${idField}, user_id`)
        .in("emoji", ["❤️", "❤"])
        .in(idField, ids);

      if (error) throw error;

      type LikeRow = {
        user_id: string;
        post_id: number | null;
        comment_id: number | null;
      };

      const rows = (data || []) as unknown as LikeRow[];
      const likesMap: { [id: number]: { count: number; isLiked: boolean } } = {};

      for (const id of ids) {
        likesMap[id] = { count: 0, isLiked: false };
      }

      for (const row of rows) {
        const itemId = idField === "post_id" ? row.post_id : row.comment_id;
        if (!itemId) continue;
        if (!likesMap[itemId]) likesMap[itemId] = { count: 0, isLiked: false };

        likesMap[itemId].count += 1;
        if (userId && row.user_id === userId) {
          likesMap[itemId].isLiked = true;
        }
      }

      return likesMap;
    } catch (error) {
      console.error(`Error fetching ${type} likes:`, error);
      return {};
    }
  },

  async fetchReactions(
    ids: number[],
    type: LikeableItem["type"],
    userId?: string
  ): Promise<{ [id: number]: ReactionSummary[] }> {
    type ReactionRow = {
      user_id: string;
      emoji: string;
      post_id: number | null;
      comment_id: number | null;
    };
    try {
      const idField = `${type}_id` as const;
      const { data, error } = await supabase
        .from("likes")
        .select(`${idField}, user_id, emoji`)
        .neq("emoji", "❤️")
        .in(idField, ids);

      if (error) throw error;

      const byId: { [id: number]: { [emoji: string]: { count: number; reacted: boolean } } } = {};

      const rows = (data || []) as unknown as ReactionRow[];

      for (const row of rows) {
        const itemId = idField === "post_id" ? row.post_id : row.comment_id;
        if (!itemId) continue;
        const emoji = row.emoji;
        if (!emoji) continue;

        if (!byId[itemId]) byId[itemId] = {};
        if (!byId[itemId][emoji]) {
          byId[itemId][emoji] = {
            count: 0,
            reacted: false,
          };
        }

        byId[itemId][emoji].count += 1;
        if (userId && row.user_id === userId) {
          byId[itemId][emoji].reacted = true;
        }
      }

      const result: { [id: number]: ReactionSummary[] } = {};
      for (const id of ids) {
        const map = byId[id] || {};
        result[id] = Object.entries(map)
          .map(([emoji, v]) => ({ emoji, count: v.count, reacted: v.reacted }))
          .sort((a, b) => {
            if (a.reacted !== b.reacted) return a.reacted ? -1 : 1;
            if (b.count !== a.count) return b.count - a.count;
            return a.emoji.localeCompare(b.emoji);
          });
      }

      return result;
    } catch (error) {
      console.error(`Error fetching ${type} reactions:`, error);
      return {};
    }
  },

  async fetchReactionUsersForItem(item: LikeableItem): Promise<Record<string, ReactionUser[]>> {
    const idField = `${item.type}_id` as const;

    const { data: likeRows, error: likesError } = await supabase
      .from("likes")
      .select("user_id, emoji, created_at")
      .eq(idField, item.id)
      .order("created_at", { ascending: false });

    if (likesError) throw likesError;

    type LikeRow = { user_id: string; emoji: string; created_at: string };
    const rows = (likeRows || []) as unknown as LikeRow[];

    const orderedUserIds = rows.map((r) => r.user_id).filter(Boolean);
    const uniqueUserIds = Array.from(new Set(orderedUserIds));

    if (uniqueUserIds.length === 0) return {};

    const { data: profileRows, error: profilesError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        username,
        name,
        profile_media:media!profiles_profile_media_id_fkey (
          file_path
        )
      `
      )
      .in("id", uniqueUserIds);

    if (profilesError) throw profilesError;

    type ProfileRow = {
      id: string;
      username: string;
      name: string;
      profile_media: { file_path: string } | null;
    };

    const profiles = (profileRows || []) as unknown as ProfileRow[];
    const profileMap = new Map(
      profiles.map((p) => [
        p.id,
        {
          id: p.id,
          username: p.username || "unknown",
          name: p.name || "Unknown",
          profileImageUrl: p.profile_media?.file_path
            ? imageService.getProfileImageUrlSync(p.profile_media.file_path, "small")
            : null,
        } satisfies ReactionUser,
      ])
    );

    const result: Record<string, ReactionUser[]> = {};
    for (const row of rows) {
      const emoji = row.emoji;
      if (!emoji) continue;
      const u = profileMap.get(row.user_id);
      if (!u) continue;
      if (!result[emoji]) result[emoji] = [];
      if (result[emoji].some((x) => x.id === u.id)) continue;
      result[emoji].push(u);
    }

    return result;
  },

  async toggleReaction(
    item: LikeableItem,
    userId: string,
    targetUserId: string,
    emoji: string,
    translations: { title: string; body: string },
    retryCount = 0
  ): Promise<boolean | null> {
    const MAX_RETRIES = 2;

    try {
      const { id, type, parentId } = item;
      const idField = `${type}_id` as const;

      const { data: existingRows } = await supabase
        .from("likes")
        .select("id")
        .eq(idField, id)
        .eq("user_id", userId)
        .eq("emoji", emoji);

      if (existingRows && existingRows.length > 0) {
        const { error } = await supabase.from("likes").delete().eq("id", existingRows[0].id);
        if (error) throw error;
        return false;
      }

      const { error } = await supabase
        .from("likes")
        .insert([{ [idField]: id, user_id: userId, emoji }]);

      if (error) throw error;

      if (userId !== targetUserId) {
        const { data: userData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .single();

        await sendReactionNotification(
          userId,
          userData?.username || "Someone",
          targetUserId,
          (parentId || id).toString(),
          emoji,
          translations,
          type === "comment" ? id.toString() : undefined
        );
      }

      return true;
    } catch (error) {
      console.error(`Error toggling ${item.type} reaction (attempt ${retryCount + 1}):`, error);

      if (retryCount < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (retryCount + 1)));
        return this.toggleReaction(item, userId, targetUserId, emoji, translations, retryCount + 1);
      }

      return null;
    }
  },

  async toggleLike(
    likeData: LikeableItem,
    userId: string,
    targetUserId: string,
    translations: { title: string; body: string },
    retryCount = 0
  ): Promise<boolean | null> {
    const MAX_RETRIES = 2;

    try {
      const { id, type, parentId } = likeData;
      const idField = `${type}_id` as const;

      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq(idField, id)
        .eq("user_id", userId)
        .in("emoji", ["❤️", "❤"])
        .limit(1)
        .maybeSingle();

      if (existingLike) {
        const { error } = await supabase.from("likes").delete().eq("id", existingLike.id);
        if (error) throw error;
        return false; // unliked
      } else {
        const { error } = await supabase
          .from("likes")
          .insert([{ [idField]: id, user_id: userId, emoji: "❤️" }]);

        if (error) throw error;

        // send notification only if the liker is not the item owner
        if (userId !== targetUserId) {
          const { data: userData } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", userId)
            .single();

          await sendLikeNotification(
            userId,
            userData?.username || "Someone",
            targetUserId,
            (parentId || id).toString(), // use parentId for comments, id for posts
            translations,
            type === "comment" ? id.toString() : undefined // pass comment_id for comment likes
          );
        }
        return true; // liked
      }
    } catch (error) {
      console.error(`Error toggling ${likeData.type} like (attempt ${retryCount + 1}):`, error);

      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
        return this.toggleLike(likeData, userId, targetUserId, translations, retryCount + 1);
      }

      return null;
    }
  },

  async deleteItem(itemId: number, type: LikeableItem["type"]) {
    try {
      // delete associated notifications first
      const { error: notificationError } = await supabase
        .from("notifications")
        .delete()
        .eq(`${type}_id`, itemId);

      if (notificationError) throw notificationError;

      // delete the item
      const { error: itemError } = await supabase
        .from(type === "post" ? "post" : "comments")
        .delete()
        .eq("id", itemId);

      if (itemError) throw itemError;
      return true;
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      return false;
    }
  },

  async reportItem(
    itemId: number,
    reporterId: string,
    reportedUserId: string,
    type: LikeableItem["type"]
  ) {
    try {
      const { error } = await supabase.from("reports").insert([
        {
          [`${type}_id`]: itemId,
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          status: "pending",
        },
      ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error reporting ${type}:`, error);
      return false;
    }
  },

  async blockUser(blockerId: string, blockedId: string) {
    try {
      const { error } = await supabase.from("blocks").insert([
        {
          blocker_id: blockerId,
          blocked_id: blockedId,
        },
      ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error blocking user:", error);
      return false;
    }
  },

  async fetchItemLikesCounts(ids: number[], type: LikeableItem["type"]) {
    try {
      const idField = `${type}_id` as const;
      const { data, error } = await supabase
        .from("likes")
        .select(idField)
        .eq("emoji", "❤️")
        .in(idField, ids);

      if (error) throw error;

      type LikeIdRow = { post_id: number | null; comment_id: number | null };
      const rows = (data || []) as unknown as LikeIdRow[];
      const likesCount: { [id: number]: number } = {};

      for (const id of ids) {
        likesCount[id] = 0;
      }

      for (const row of rows) {
        const itemId = idField === "post_id" ? row.post_id : row.comment_id;
        if (!itemId) continue;
        likesCount[itemId] = (likesCount[itemId] || 0) + 1;
      }

      return likesCount;
    } catch (error) {
      console.error(`Error fetching ${type} likes counts:`, error);
      return {};
    }
  },

  // wrapper methods
  reportPost: (postId: number, reporterId: string, reportedUserId: string) =>
    postService.reportItem(postId, reporterId, reportedUserId, "post"),

  reportComment: (commentId: number, reporterId: string, reportedUserId: string) =>
    postService.reportItem(commentId, reporterId, reportedUserId, "comment"),

  fetchPostsLikes: (postIds: number[], userId?: string) =>
    postService.fetchLikes(postIds, "post", userId),

  fetchCommentsLikes: (commentIds: number[], userId?: string) =>
    postService.fetchLikes(commentIds, "comment", userId),

  togglePostLike: (
    postId: number,
    userId: string,
    postUserId: string,
    translations: { title: string; body: string }
  ) => postService.toggleLike({ id: postId, type: "post" }, userId, postUserId, translations),

  toggleCommentLike: (
    commentId: number,
    postId: number,
    userId: string,
    commentUserId: string,
    translations: { title: string; body: string }
  ) =>
    postService.toggleLike(
      { id: commentId, type: "comment", parentId: postId },
      userId,
      commentUserId,
      translations
    ),

  deletePost: (postId: number) => postService.deleteItem(postId, "post"),
  deleteComment: (commentId: number) => postService.deleteItem(commentId, "comment"),

  fetchPostLikesCounts: (postIds: number[]) => postService.fetchItemLikesCounts(postIds, "post"),

  fetchCommentLikesCounts: (commentIds: number[]) =>
    postService.fetchItemLikesCounts(commentIds, "comment"),

  async fetchRecentPosts(
    feedType: "challenge" | "discussion" | "all",
    pageParam: number,
    blockedUserIds: string[],
    postsPerPage: number = 20
  ): Promise<{ posts: PostRecord[]; hasMore: boolean }> {
    const select = `${BASE_SELECT}, challenges:challenge_id (title), side_quests:quest_id (title)`;

    let query = supabase
      .from("post")
      .select(select)
      .not("media.upload_status", "in", '("failed","pending")')
      .order("created_at", { ascending: false });

    if (feedType === "challenge") {
      query = query.not("challenge_id", "is", null);
    } else if (feedType === "discussion") {
      query = query.is("challenge_id", null).is("quest_id", null).eq("is_welcome", false);
    }

    query = applyBlockedFilter(query, blockedUserIds);

    const start = (pageParam - 1) * postsPerPage;
    query = query.range(start, start + postsPerPage - 1);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as PostRecord[];

    if (feedType === "discussion" && rows.length > 0) {
      const newest = rows[0].created_at;
      const oldest = rows[rows.length - 1].created_at;

      let welcomeQuery = supabase
        .from("post")
        .select(select)
        .is("challenge_id", null)
        .eq("is_welcome", true)
        .not("media.upload_status", "in", '("failed","pending")')
        .gte("created_at", oldest);

      if (pageParam === 1) {
        welcomeQuery = welcomeQuery.lte("created_at", new Date().toISOString());
      } else {
        welcomeQuery = welcomeQuery.lte("created_at", newest);
      }
      welcomeQuery = applyBlockedFilter(welcomeQuery, blockedUserIds);

      const { data: welcomeData, error: welcomeError } = await welcomeQuery;
      if (welcomeError) throw welcomeError;

      const merged = [...rows, ...((welcomeData ?? []) as PostRecord[])]
        .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
        .sort((a, b) => (a.created_at > b.created_at ? -1 : a.created_at < b.created_at ? 1 : 0));

      return { posts: merged, hasMore: rows.length === postsPerPage };
    }

    return { posts: rows, hasMore: rows.length === postsPerPage };
  },

  async fetchPopularPosts(
    feedType: "challenge" | "discussion" | "all",
    pageParam: number,
    blockedUserIds: string[],
    postsPerPage: number = 20
  ): Promise<{ posts: PostRecord[]; hasMore: boolean }> {
    const offset = (pageParam - 1) * postsPerPage;

    const { data: idRows, error: rpcError } = await supabase.rpc("get_popular_post_ids", {
      feed_type: feedType,
      blocked_ids: blockedUserIds,
      page_size: postsPerPage,
      page_offset: offset,
    });

    if (rpcError) throw rpcError;
    if (!idRows || idRows.length === 0) {
      return { posts: [], hasMore: false };
    }

    const orderedIds: number[] = idRows.map((r: { post_id: number }) => r.post_id);
    const select = `${BASE_SELECT}, challenges:challenge_id (title), side_quests:quest_id (title)`;

    const { data, error } = await supabase
      .from("post")
      .select(select)
      .in("id", orderedIds);

    if (error) throw error;

    const rows = (data ?? []) as PostRecord[];
    const postMap = new Map(rows.map((p) => [p.id, p]));
    const posts = orderedIds
      .map((id) => postMap.get(id))
      .filter((p): p is PostRecord => !!p);

    return { posts, hasMore: orderedIds.length === postsPerPage };
  },
};
