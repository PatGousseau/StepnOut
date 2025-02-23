import { supabase } from "../lib/supabase";
import { sendLikeNotification } from "../lib/notificationsService";
import { LikeableItem } from "../types";

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
            translations
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
};
