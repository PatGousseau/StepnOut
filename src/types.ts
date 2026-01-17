export interface Challenge {
    id: number;
    title: string;
    title_it: string;
    description: string;
    description_it: string;
    difficulty: 'easy' | 'medium' | 'hard';
    created_by: string;
    created_at: Date;
    updated_at: Date;
    media: {
      file_path: string;
    };
    is_active: boolean;
    daysRemaining: number;
  }

  /**
   * Post as used throughout the app.
   * - Raw from Supabase: has `likes` array, `challenges` join
   * - Formatted for UI: has `likes_count`, `comments_count`, `liked`
   */
  export interface Post {
    id: number;
    user_id: string;
    body: string;
    media_id?: number;
    media?: {
      file_path: string;
      upload_status?: string;
      thumbnail_path?: string;
    } | null;
    created_at: string;
    featured: boolean;
    challenge_id?: number;
    challenge_title?: string;
    is_welcome?: boolean;
    // Supabase join/aggregate fields (present in raw response)
    likes?: { count: number }[] | { count: number };
    challenges?: { title: string } | null;
    // Computed fields (added during formatting, optional until then)
    likes_count?: number;
    comments_count?: number;
    liked?: boolean;
  }

  export interface ChallengeProgress {
    easy: number;  
    medium: number; 
    hard: number;   
  }
  
  export interface WeekData {
    week: number;
    hasStreak: boolean;
  }
  
  export interface UserProgress {
    challengeProgress: ChallengeProgress;
    weekData: WeekData[];
  }

  export interface Notification {
    notification_id: number;
    user_id: string;
    trigger_user_id: string;
    action_type: 'like' | 'comment';
    created_at: string;
    is_read: boolean;
    post_id: string;
    trigger_profile?: {
      username: string;
      name: string;
    };
    body?: string;
    comment?: {
      body: string;
    };
  }

  export interface Comment {
    id: number;
    text: string;
    userId: string;
    created_at: string;
    post_id: number;
    liked: boolean;
    likes?: {
      count: number;
    };
  }

  export interface LikeableItem {
    id: number;
    type: "post" | "comment";
    parentId?: number; // for comments, this is the postId
  }

  /**
   * React Native FormData blob type for file uploads.
   * RN's FormData.append() accepts this object format instead of web's Blob.
   */
  export interface RNFormDataBlob {
    uri: string;
    name: string;
    type: string;
  }

