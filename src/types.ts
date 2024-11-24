export interface Challenge {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    created_by: string;
    created_at: Date;
    updated_at: Date;
    duration: number;
    media_file_path: string;
  }

  export interface Post {
    id: number;
    user_id: string;
    media_id?: number;
    created_at: string;
    featured: boolean;
    body: string;
    media_file_path?: string;
    likes_count: number;
    comments_count: number;
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
    trigger_profile?: {
      username: string;
      name: string;
    };
    comment_text?: string;
  }