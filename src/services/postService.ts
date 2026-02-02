import { supabase } from "../lib/supabase";
import { sendLikeNotification } from "../lib/notificationsService";
import { LikeableItem, Post } from "../types";

export const postService = {
  async fetchLikes(ids: number[], type: LikeableItem["type"], userId?: string) {
    try {
      const idField = `${type}_id` as const;
      const { data, error } = await supabase
        .from("likes")
        .select(`${idField}, user_id`)
        .in(idField, ids);

      if (error) throw error;

      const likesMap = ids.reduce((acc, itemId) => {
        const itemLikes = data.filter((like) => like[idField] === itemId);
        return {
          ...acc,
          [itemId]: {
            count: itemLikes.length,
            isLiked: userId ? itemLikes.some((like) => like.user_id === userId) : false,
          },
        };
      }, {});

      return likesMap;
    } catch (error) {
      console.error(`Error fetching ${type} likes:`, error);
      return {};
    }
  },

  async toggleLike(
    likeData: LikeableItem,
    userId: string,
    targetUserId: string,
    translations: { title: string; body: string }
  ) {
    try {
      const { id, type, parentId } = likeData;
      const idField = `${type}_id` as const;

      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq(idField, id)
        .eq("user_id", userId)
        .single();

      if (existingLike) {
        const { error } = await supabase.from("likes").delete().eq("id", existingLike.id);
        if (error) throw error;
        return false; // unliked
      } else {
        const { error } = await supabase.from("likes").insert([{ [idField]: id, user_id: userId }]);

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
      console.error(`Error toggling ${likeData.type} like:`, error);
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
      const { data, error } = await supabase.from("likes").select(idField).in(idField, ids);

      if (error) throw error;

      const likesCount = ids.reduce((acc, itemId) => {
        const count = data.filter((like) => like[idField] === itemId).length;
        return {
          ...acc,
          [itemId]: count,
        };
      }, {});

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

  async fetchHomePosts(
    pageParam: number,
    blockedUserIds: string[],
    postsPerPage: number = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    try {
      const baseSelect = `
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

      // Query for challenge posts
      let challengeQuery = supabase
        .from("post")
        .select(`
          ${baseSelect},
          challenges!inner (
            title
          )
        `)
        .not("challenge_id", "is", null)
        .not("media.upload_status", "in", '("failed","pending")')
        .order("created_at", { ascending: false });

      // Query for discussion posts (excluding welcome posts for proper pagination)
      let discussionQuery = supabase
        .from("post")
        .select(baseSelect)
        .is("challenge_id", null)
        .or("is_welcome.is.null,is_welcome.eq.false")
        .not("media.upload_status", "in", '("failed","pending")')
        .order("created_at", { ascending: false });

      // Query for welcome posts (only on first page, fetch all recent ones)
      // Query for welcome posts (only on first page, fetch all recent ones)
      let welcomeQuery = pageParam === 1
        ? supabase
            .from("post")
            .select(baseSelect)
            .is("challenge_id", null)
            .eq("is_welcome", true)
            .order("created_at", { ascending: false })
            .limit(100)
        : null;

      // Add blocked users filter if needed (quote UUIDs)
      if (blockedUserIds.length > 0) {
        const quotedList = `(${blockedUserIds.map((id) => `"${id}"`).join(",")})`;
        challengeQuery = challengeQuery.not("user_id", "in", quotedList);
        discussionQuery = discussionQuery.not("user_id", "in", quotedList);
        if (welcomeQuery) {
          welcomeQuery = welcomeQuery.not("user_id", "in", quotedList);
        }
      }

      // Add pagination (offset-based)
      const start = (pageParam - 1) * postsPerPage;
      const end = pageParam * postsPerPage - 1;
      challengeQuery = challengeQuery.range(start, end);
      discussionQuery = discussionQuery.range(start, end);

      // Execute queries
      const queries: Promise<any>[] = [challengeQuery, discussionQuery];
      if (welcomeQuery) queries.push(welcomeQuery);

      const responses = await Promise.all(queries);
      const [challengeResponse, discussionResponse, welcomeResponse] = responses;

      if (challengeResponse.error) throw challengeResponse.error;
      if (discussionResponse.error) throw discussionResponse.error;
      if (welcomeResponse?.error) throw welcomeResponse.error;

      // Helper to extract up to 3 comment previews (oldest first)
      const getCommentPreviews = (post: any) => {
        if (post.comments && post.comments.length > 0) {
          // Sort by created_at ascending to get oldest first
          const sortedComments = [...post.comments].sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          // Create a map of comment id to username for reply lookups
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
        }
        return undefined;
      };

      // Process challenge posts (attach title and comment previews)
      const challengePosts = (challengeResponse.data ?? []).map((post: any) => ({
        ...post,
        challenge_title: post.challenges?.title,
        comment_previews: getCommentPreviews(post),
        comments: undefined, // Remove full comments array
      }));

      // Process discussion posts
      const discussionPosts = (discussionResponse.data ?? []).map((post: any) => ({
        ...post,
        comment_previews: getCommentPreviews(post),
        comments: undefined,
      }));

      // Process welcome posts (only on first page)
      const welcomePosts = (welcomeResponse?.data ?? []).map((post: any) => ({
        ...post,
        comment_previews: getCommentPreviews(post),
        comments: undefined,
      }));

      // Combine & enforce global ordering (newest first)
      const postData = [...challengePosts, ...discussionPosts, ...welcomePosts].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // true if EITHER bucket filled its page
      const hasMore =
        challengePosts.length === postsPerPage ||
        discussionPosts.length === postsPerPage;

      return {
        posts: postData as Post[],
        hasMore,
      };
    } catch (error) {
      console.error("Error fetching home posts:", error);
      throw error; // Re-throw for React Query to handle
    }
  },
};
