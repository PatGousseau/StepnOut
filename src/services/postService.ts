import { supabase } from '../lib/supabase';
import { sendLikeNotification } from '../lib/notificationsService';

export const postService = {
  async fetchLikes(postId: number) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('user_id')
        .eq('post_id', postId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching likes:', error);
      return [];
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

  async getPostCounts(postId: number) {
    try {
      const [likesResponse, commentsResponse] = await Promise.all([
        supabase
          .from('likes')
          .select('id', { count: 'exact' })
          .eq('post_id', postId),
        supabase
          .from('comments')
          .select('id', { count: 'exact' })
          .eq('post_id', postId)
      ]);

      return {
        likes: likesResponse.count || 0,
        comments: commentsResponse.count || 0
      };
    } catch (error) {
      console.error('Error fetching post counts:', error);
      return { likes: 0, comments: 0 };
    }
  }
};