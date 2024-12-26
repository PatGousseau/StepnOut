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

  export interface Post {
    id: number;
    user_id: string;
    media_id?: number;
    created_at: string;
    featured: boolean;
    body: string;
    likes_count: number;
    comments_count: number;
    challenge_id?: number;
    challenge_title?: string;
    liked: boolean;
    media?: {
      file_path: string;
    };
    likes?: {
      count: number;
    };
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