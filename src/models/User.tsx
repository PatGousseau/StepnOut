import { supabase, supabaseStorageUrl } from '../lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  profileImageUrl: string | null;
  created_at?: string;
}

export class User {
  private static userCache: Map<string, User> = new Map();
  private _profile: UserProfile | null = null;
  private _loading: boolean = true;
  private _error: string | null = null;

  private constructor(private userId: string) {}

  static async getUser(userId: string): Promise<User> {
    if (!this.userCache.has(userId)) {
      const user = new User(userId);
      this.userCache.set(userId, user);
      await user.load();
    }
    return this.userCache.get(userId)!;
  }

  async load(): Promise<void> {
    if (!this.userId) {
      this._error = 'No user ID provided';
      this._loading = false;
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          name,
          created_at,
          profile_media:media!profiles_profile_media_id_fkey (
            file_path
          )
        `)
        .eq('id', this.userId)
        .single();

      if (error) throw error;

      if (data) {
        this._profile = {
          id: data.id,
          username: data.username || 'Unknown',
          name: data.name || 'Unknown',
          profileImageUrl: data.profile_media?.file_path 
            ? `${supabaseStorageUrl}/${data.profile_media.file_path}`
            : '/assets/images/default-pfp.png',
          created_at: data.created_at,
        };
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      this._error = err instanceof Error ? err.message : 'Failed to fetch user data';
    } finally {
      this._loading = false;
    }
  }

  // Getters
  get id(): string { return this.userId; }
  get profile(): UserProfile | null { return this._profile; }
  get loading(): boolean { return this._loading; }
  get error(): string | null { return this._error; }
  get username(): string { return this._profile?.username || 'unknown'; }
  get name(): string { return this._profile?.name || 'Unknown'; }
  get profileImageUrl(): string {
    return this._profile?.profileImageUrl || '/assets/images/default-pfp.png';
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
}