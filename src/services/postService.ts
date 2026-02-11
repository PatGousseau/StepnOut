import { supabase } from "../lib/supabase";
import { sendLikeNotification, sendReactionNotification } from "../lib/notificationsService";
import { LikeableItem, Post, ReactionSummary } from "../types";

interface PostDataComment {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  parent_comment_id: number | null;
  profiles: { username: string } | null;
}

interface PostData {
  id: number;
  user_id: string;
  body: string | null;
  created_at: string;
  challenge_id: number | null;
  is_welcome: boolean | null;
  media_id: number | null;
  media: { file_path: string | null; upload_status: string | null } | null;
  profiles: {
    id: string;
    username: string;
    name: string;
    profile_media: { file_path: string } | null;
  } | null;
  likes: { count: number }[];
  comments: PostDataComment[];
  challenges?: { title: string } | null;
}

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

function getCommentPreviews(post: PostData) {
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
    .filter((c): c is PostDataComment & { profiles: { username: string } } =>
      !!c.body && !!c.profiles?.username
    )
    .map((c) => ({
      username: c.profiles.username,
      text: c.body,
      replyToUsername: c.parent_comment_id ? commentUserMap.get(c.parent_comment_id) : undefined,
    }));
  return previews.length > 0 ? previews : undefined;
}

function processPost(post: PostData, isChallenge: boolean) {
  return {
    ...post,
    ...(isChallenge ? { challenge_title: post.challenges?.title } : {}),
    comment_previews: getCommentPreviews(post),
    comments: undefined,
  };
}

function applyBlockedFilter(query: any, blockedUserIds: string[]) {
  if (blockedUserIds.length === 0) return query;
  const quotedList = `(${blockedUserIds.map((id) => `"${id}"`).join(",")})`;
  return query.not("user_id", "in", quotedList);
}

export const postService = {
  async fetchLikes(ids: number[], type: LikeableItem["type"], userId?: string) {
    try {
      const idField = `${type}_id` as const;
      const { data, error } = await supabase
        .from("likes")
        .select(`${idField}, user_id`)
        .eq("emoji", "❤️")
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
        .eq("emoji", "❤️")
        .single();

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
    feedType: "challenge" | "discussion",
    pageParam: number,
    blockedUserIds: string[],
    postsPerPage: number = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    const isChallenge = feedType === "challenge";
    const select = isChallenge
      ? `${BASE_SELECT}, challenges!inner (title)`
      : BASE_SELECT;

    // challenge feed behaves normally
    if (isChallenge) {
      let query = supabase
        .from("post")
        .select(select)
        .not("media.upload_status", "in", '("failed","pending")')
        .order("created_at", { ascending: false })
        .not("challenge_id", "is", null);

      query = applyBlockedFilter(query, blockedUserIds);

      const start = (pageParam - 1) * postsPerPage;
      query = query.range(start, start + postsPerPage - 1);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as PostData[];
      const posts = rows.map((p) => processPost(p, true));

      return { posts: posts as Post[], hasMore: posts.length === postsPerPage };
    }

    // discussion feed: welcome posts should *not* count toward pagination.
    // we paginate by non-welcome discussion posts, then pull any welcome posts
    // that fall in the same "timeline slice" and merge them back in.
    const start = (pageParam - 1) * postsPerPage;

    const baseDiscussionQuery = () => {
      let q = supabase
        .from("post")
        .select(select)
        .not("media.upload_status", "in", '("failed","pending")')
        .order("created_at", { ascending: false })
        .is("challenge_id", null);

      q = applyBlockedFilter(q, blockedUserIds);
      return q;
    };

    // 1) fetch the non-welcome discussion posts for this page
    const { data: nonWelcomeData, error: nonWelcomeError } = await baseDiscussionQuery()
      .eq("is_welcome", false)
      .range(start, start + postsPerPage - 1);

    if (nonWelcomeError) throw nonWelcomeError;

    const nonWelcomeRows = (nonWelcomeData ?? []) as PostData[];

    // if there are no non-welcome posts at all, fall back to showing welcome posts normally
    if (nonWelcomeRows.length === 0) {
      const { data: welcomeData, error: welcomeError } = await baseDiscussionQuery()
        .eq("is_welcome", true)
        .range(start, start + postsPerPage - 1);

      if (welcomeError) throw welcomeError;

      const welcomeRows = (welcomeData ?? []) as PostData[];
      const posts = welcomeRows.map((p) => processPost(p, false));
      return { posts: posts as Post[], hasMore: posts.length === postsPerPage };
    }

    // 2) compute the timeline bounds for this page based on non-welcome pagination
    // newerBound = the non-welcome post right before this page (i.e. last item in previous page)
    let newerBoundCreatedAt: string | null = null;
    if (start > 0) {
      const { data: boundData, error: boundError } = await baseDiscussionQuery()
        .eq("is_welcome", false)
        .range(start - 1, start - 1);

      if (boundError) throw boundError;
      const boundRow = (boundData?.[0] ?? null) as PostData | null;
      newerBoundCreatedAt = boundRow?.created_at ?? null;
    }

    // olderBound = the last non-welcome post in this page
    const olderBoundCreatedAt = nonWelcomeRows[nonWelcomeRows.length - 1].created_at;

    // 3) pull welcome posts that fall within this slice (newer than olderBound and
    // not newer than newerBound, if present)
    let welcomeQuery = baseDiscussionQuery().eq("is_welcome", true).gt("created_at", olderBoundCreatedAt);
    if (newerBoundCreatedAt) {
      welcomeQuery = welcomeQuery.lte("created_at", newerBoundCreatedAt);
    }

    const { data: welcomeData, error: welcomeError } = await welcomeQuery;
    if (welcomeError) throw welcomeError;

    const welcomeRows = (welcomeData ?? []) as PostData[];

    // 4) merge + sort to preserve the real timeline
    const mergedRows = [...welcomeRows, ...nonWelcomeRows].sort((a, b) =>
      a.created_at > b.created_at ? -1 : a.created_at < b.created_at ? 1 : 0
    );

    const posts = mergedRows.map((p) => processPost(p, false));

    return {
      posts: posts as Post[],
      hasMore: nonWelcomeRows.length === postsPerPage,
    };
  },

  async fetchPopularPosts(
    feedType: "challenge" | "discussion",
    pageParam: number,
    blockedUserIds: string[],
    postsPerPage: number = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
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
    const isChallenge = feedType === "challenge";
    const select = isChallenge
      ? `${BASE_SELECT}, challenges!inner (title)`
      : BASE_SELECT;

    const { data, error } = await supabase
      .from("post")
      .select(select)
      .in("id", orderedIds);

    if (error) throw error;

    const rows = (data ?? []) as PostData[];
    const postMap = new Map(rows.map((p) => [p.id, p]));
    const posts = orderedIds
      .map((id) => postMap.get(id))
      .filter((p): p is PostData => !!p)
      .map((p) => processPost(p, isChallenge));

    return { posts: posts as Post[], hasMore: orderedIds.length === postsPerPage };
  },
};
