import { supabase } from '../lib/supabase';
import { sendLikeNotification } from '../lib/notificationsService';

export const postService = {

  async fetchPostsLikes(postIds: number[], userId?: string) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      if (error) throw error;

      const likesMap = postIds.reduce((acc, postId) => {
        const postLikes = data.filter(like => like.post_id === postId);
        return {
          ...acc,
          [postId]: {
            count: postLikes.length,
            isLiked: userId ? postLikes.some(like => like.user_id === userId) : false
          }
        };
      }, {});

      console.log('Fetched likes for posts:', likesMap);
      
      return likesMap;
    } catch (error) {
      console.error('Error fetching posts likes:', error);
      return {};
    }
  },

  async toggleLike(
    postId: number, 
    userId: string, 
    postUserId: string,
    translations: { title: string; body: string }
  ) {
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        return false; // Unliked
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: userId }]);

        if (error) throw error;

        // Send notification only if the liker is not the post owner
        if (userId !== postUserId) {
          // Get the username of the liker
          const { data: userData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .single();

          await sendLikeNotification(
            userId,
            userData?.username || 'Someone',
            postUserId,
            postId.toString(),
            translations
          );
        }
        return true; // Liked
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return null;
    }
  },

  async deletePost(postId: number) {
    try {
      const { error } = await supabase
        .from('post')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  async reportPost(postId: number, reporterId: string, reportedUserId: string) {
    try {
      const { error } = await supabase
        .from('reports')
        .insert([{
          post_id: postId,
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          status: 'pending'
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reporting post:', error);
      return false;
    }
  },

  async blockUser(blockerId: string, blockedId: string) {
    try {
      const { error } = await supabase
        .from('blocks')
        .insert([{
          blocker_id: blockerId,
          blocked_id: blockedId
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  },

  async fetchLikesCounts(postIds: number[]) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', postIds);

      if (error) throw error;

      // Count likes for each post
      const likesCount = postIds.reduce((acc, postId) => {
        const count = data.filter(like => like.post_id === postId).length;
        return {
          ...acc,
          [postId]: count
        };
      }, {});

      console.log('Fetched likes counts:', likesCount);

      return likesCount;
    } catch (error) {
      console.error('Error fetching likes counts:', error);
      return {};
    }
  }
};