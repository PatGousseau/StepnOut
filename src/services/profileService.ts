import { supabase } from '../lib/supabase';
import { uploadMedia } from '../utils/handleMediaUpload';

export const profileService = {
  async updateProfilePicture(userId: string): Promise<{ success: boolean; error?: string; profileImageUrl?: string }> {
    try {
      const result = await uploadMedia({
        allowVideo: false,
        allowsEditing: true,
      });

      if (!result.mediaId) {
        return { success: false };
      }

      // Update profile with new media id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_media_id: result.mediaId })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { 
        success: true,
        profileImageUrl: result.mediaUrl
      };
    } catch (error) {
      console.error('Error updating profile picture:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  },

  async updateProfile(
    userId: string, 
    updates: { username?: string; name?: string; website?: string; instagram?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if username contains spaces
      if (updates.username && updates.username.includes(' ')) {
        throw new Error('Username cannot contain spaces');
      }

      if (updates.username) {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', updates.username)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
          throw new Error('Username is already taken');
        }

        const { error: usernameUpdateError } = await supabase
          .from('profiles')
          .update({ 
            username: updates.username,
          })
          .eq('id', userId);

        if (usernameUpdateError) throw usernameUpdateError;
      }

      if (updates.name) {
        const { error: nameUpdateError } = await supabase
        .from('profiles')
        .update({ 
          name: updates.name 
        })
        .eq('id', userId);

        if (nameUpdateError) throw nameUpdateError;
      }

      if (updates.instagram) {
        const { error: instaError } = await supabase
          .from('profiles')
          .update({ instagram: updates.instagram })
          .eq('id', userId);
        if (instaError) throw instaError;
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete user profile first (this should cascade to related data)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Call the RPC function to delete the auth user
      const { error: deleteError } = await supabase.rpc('delete_user');
      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }
}; 