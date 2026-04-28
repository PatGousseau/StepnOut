export type FeedSort = "recent" | "popular";

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
    body: string;
    media_id?: number;
    media?: {
      file_path: string;
    };
    created_at: string;
    featured: boolean;
    challenge_id?: number;
    challenge_title?: string;
    comfort_zone_rating?: number;
    likes_count: number;
    comments_count: number;
    liked: boolean;
    likes?: {
      count: number;
    };
    is_welcome?: boolean;
    comment_previews?: {
      username: string;
      text: string;
      replyToUsername?: string;
    }[];
  }

  export interface ChallengeProgress {
    easy: number;  
    medium: number; 
    hard: number;   
  }
  
  export interface WeekData {
    week: number;
    hasStreak: boolean;
    challengeId: number;
    postId?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isCompleted: boolean;
  }
  
  export interface UserProgress {
    challengeProgress: ChallengeProgress;
    weekData: WeekData[];
  }

  export interface Notification {
    notification_id: number;
    user_id: string;
    trigger_user_id: string | null;
    action_type: 'like' | 'comment' | 'reaction' | 'new_challenge';
    emoji?: string;
    created_at: string;
    is_read: boolean;
    post_id: string | null;
    comment_id?: string | null;
    challenge_id?: string | number | null;
    trigger_profile?: {
      username: string;
      name: string;
    } | null;
    challenge?: {
      title: string;
      title_it: string;
    } | null;
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
    parent_comment_id?: number | null;
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

  export interface ReactionSummary {
    emoji: string;
    count: number;
    reacted: boolean;
  }

  export interface ReactionUser {
    id: string;
    username: string;
    name: string;
    profileImageUrl: string | null;
  }

  export type ContentCategory =
    | 'fear'
    | 'vulnerability'
    | 'connection'
    | 'stories'
    | 'science'
    | 'practice';

  export interface CardLink {
    url: string;
    label?: string;
  }

  export type ContentCard =
    | { type: 'text'; body: string; link?: CardLink }
    | { type: 'youtube'; video_id: string; caption?: string }
    | { type: 'link'; url: string; label: string; description?: string };

  export interface ContentPiece {
    id: number;
    title: string;
    category: ContentCategory;
    hook: string;
    cards: ContentCard[];
    cover_image_path: string | null;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface ContentBookmark {
    user_id: string;
    piece_id: number;
    created_at: string;
  }
