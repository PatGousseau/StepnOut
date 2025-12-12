import { supabase } from "../lib/supabase";
import { imageService } from "../services/imageService";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  profileImageUrl: string | null;
  created_at?: string;
  instagram?: string;
}

export class User {
  private static userCache: Map<string, User> = new Map();
  private _profile: UserProfile | null = null;
  private _loading: boolean = true;
  private _error: string | null = null;

  private constructor(private userId: string) {}

  static async getUser(userId: string, forceRefresh: boolean = false): Promise<User> {
    const cachedUser = this.userCache.get(userId);

    if (!cachedUser || forceRefresh) {
      const user = forceRefresh || !cachedUser ? new User(userId) : cachedUser;
      this.userCache.set(userId, user);
      await user.load();
    }

    return this.userCache.get(userId)!;
  }

  static invalidate(userId?: string) {
    if (userId) {
      this.userCache.delete(userId);
    } else {
      this.userCache.clear();
    }
  }

  async load(): Promise<void> {
    if (!this.userId) {
      this._error = "No user ID provided";
      this._loading = false;
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          username,
          name,
          created_at,
          instagram,
          profile_media:media!profiles_profile_media_id_fkey (
            file_path
          )
        `
        )
        .eq("id", this.userId)
        .single();

      if (error) throw error;

      if (data) {
        let profileImageUrl = null;

        if (data.profile_media?.file_path) {
          try {
            const urls = await imageService.getProfileImageUrl(data.profile_media.file_path);
            profileImageUrl = urls.fullUrl;
          } catch (error) {
            console.error("Error transforming profile image:", error);
          }
        }

        this._profile = {
          id: data.id,
          username: data.username || "Unknown",
          name: data.name || "Unknown",
          profileImageUrl,
          created_at: data.created_at,
          instagram: data.instagram || undefined,
        };
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      this._error = err instanceof Error ? err.message : "Failed to fetch user data";
    } finally {
      this._loading = false;
    }
  }

  // Getters
  get id(): string {
    return this.userId;
  }
  get profile(): UserProfile | null {
    return this._profile;
  }
  get loading(): boolean {
    return this._loading;
  }
  get error(): string | null {
    return this._error;
  }
  get username(): string {
    return this._profile?.username || "unknown";
  }
  get name(): string {
    return this._profile?.name || "Unknown";
  }
  get profileImageUrl(): string | null {
    return this._profile?.profileImageUrl || null;
  }
  get instagram(): string | undefined {
    return this._profile?.instagram;
  }

  // Setters
  set profileImageUrl(url: string) {
    if (this._profile) {
      this._profile.profileImageUrl = url;
    }
  }

  set username(value: string) {
    if (this._profile) {
      this._profile.username = value;
    }
  }

  set name(value: string) {
    if (this._profile) {
      this._profile.name = value;
    }
  }

  set instagram(value: string | undefined) {
    if (this._profile) {
      this._profile.instagram = value;
    }
  }
}
