import { supabase } from "../lib/supabase";
import { selectMediaForPreview, uploadMediaInBackground } from "../utils/handleMediaUpload";
import { Alert } from "react-native";
import { User, UserProfile } from "../models/User";
import { imageService } from "./imageService";

export const profileService = {
  async updateProfilePicture(
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; error?: string; profileImageUrl?: string; previewUrl?: string }> {
    try {
      const result = await selectMediaForPreview({
        allowVideo: false,
        allowsEditing: true,
      });

      if (!result) {
        return { success: false, error: "No media selected" };
      }

      // Update profile with new media id immediately
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_media_id: result.mediaId })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Start background upload process
      uploadMediaInBackground(result.mediaId, result.pendingUpload, onProgress).catch((error) => {
        console.error("Error in background upload:", error);
        // Optionally notify the user of upload failure
      });

      return {
        success: true,
        previewUrl: result.previewUrl, // Return preview URL for immediate display
      };
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },

  async updateProfile(
    userId: string,
    updates: { username?: string; name?: string; website?: string; instagram?: string; bio?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if username contains spaces
      if (updates.username && updates.username.includes(" ")) {
        throw new Error("Username cannot contain spaces");
      }

      if (updates.username) {
        // Check if username is already taken
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", updates.username)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingUser) {
          throw new Error("Username is already taken");
        }

        const { error: usernameUpdateError } = await supabase
          .from("profiles")
          .update({
            username: updates.username,
          })
          .eq("id", userId);

        if (usernameUpdateError) throw usernameUpdateError;
      }

      if (updates.name) {
        const { error: nameUpdateError } = await supabase
          .from("profiles")
          .update({
            name: updates.name,
          })
          .eq("id", userId);

        if (nameUpdateError) throw nameUpdateError;
      }

      if (updates.instagram) {
        const { error: instaError } = await supabase
          .from("profiles")
          .update({ instagram: updates.instagram })
          .eq("id", userId);
        if (instaError) throw instaError;
      }

      if (updates.bio !== undefined) {
        const { error: bioError } = await supabase
          .from("profiles")
          .update({ bio: updates.bio })
          .eq("id", userId);
        if (bioError) throw bioError;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete user profile first (this should cascade to related data)
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId);

      if (profileError) throw profileError;

      // Call the RPC function to delete the auth user
      const { error: deleteError } = await supabase.rpc("delete_user");
      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },

  async confirmAndDeleteAccount(
    userId: string,
    t: (key: string) => string
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      // First confirmation
      Alert.alert(
        t("Delete account"),
        t("Are you sure you want to proceed? This will permanently delete your account."),
        [
          {
            text: t("Cancel"),
            style: "cancel",
            onPress: () => resolve({ success: false }),
          },
          {
            text: t("Continue"),
            style: "destructive",
            onPress: () => {
              // Second confirmation
              Alert.alert(
                t("Final Warning"),
                t(
                  "This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?"
                ),
                [
                  {
                    text: t("Cancel"),
                    style: "cancel",
                    onPress: () => resolve({ success: false }),
                  },
                  {
                    text: t("Delete account"),
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const result = await profileService.deleteAccount(userId);
                        resolve(result);
                      } catch (error) {
                        resolve({ success: false, error: (error as Error).message });
                      }
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    });
  },

  async validateAndUpdateProfile(
    userId: string,
    updates: {
      username?: string;
      name?: string;
      instagram?: string;
      bio?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isValidUsername = /^[a-zA-Z0-9_-]+$/.test(updates.username || "");

      if (updates.username && !isValidUsername) {
        return {
          success: false,
          error: "Username can only contain letters, numbers, underscores, and hyphens.",
        };
      }

      return await this.updateProfile(userId, {
        instagram: updates.instagram,
        username: updates.username,
        name: updates.name,
        bio: updates.bio,
      });
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },

  async loadUserProfile(userId: string, forceRefresh: boolean = false): Promise<User | null> {
    try {
      return await User.getUser(userId, forceRefresh);
    } catch (error) {
      console.error("Error loading user profile:", error);
      return null;
    }
  },

  async fetchProfileById(userId: string): Promise<UserProfile | null> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          username,
          name,
          bio,
          created_at,
          instagram,
          profile_media:media!profiles_profile_media_id_fkey (
            file_path
          )
        `
        )
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (!data) {
        return null;
      }

      let profileImageUrl = null;

      // Handle profile_media - it can be an object or array from Supabase
      const profileMedia = Array.isArray(data.profile_media) 
        ? data.profile_media[0] 
        : data.profile_media;

      if (profileMedia?.file_path) {
        try {
          const urls = await imageService.getProfileImageUrl(profileMedia.file_path);
          profileImageUrl = urls.fullUrl;
        } catch (error) {
          console.error("Error transforming profile image:", error);
        }
      }

      return {
        id: data.id,
        username: data.username || "Unknown",
        name: data.name || "Unknown",
        bio: data.bio || undefined,
        profileImageUrl,
        created_at: data.created_at,
        instagram: data.instagram || undefined,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error; // Re-throw for React Query to handle
    }
  },
};
