export type FeedSort = "recent" | "popular";

export interface PostCommentPreview {
  username: string;
  text: string;
  replyToUsername?: string;
}

export interface PostProfileRecord {
  id: string;
  username: string;
  name: string;
  profile_media: {
    file_path: string;
  } | null;
}

export interface PostCommentRecord {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  parent_comment_id: number | null;
  profiles: { username: string } | null;
}

export interface CommentRecord {
  id: number;
  user_id: string;
  body: string | null;
  created_at: string;
  post_id: number;
  parent_comment_id?: number | null;
  media_id?: number | null;
  media?: {
    file_path: string | null;
    upload_status?: string | null;
  } | null;
  comment_media?: {
    position: number;
    media_id: number;
    media: {
      file_path: string | null;
      upload_status?: string | null;
    } | null;
  }[];
  likes?: {
    count: number;
  }[];
}

export interface PostRecord {
  id: number;
  user_id: string;
  body: string | null;
  media_id?: number | null;
  media?: {
    file_path: string | null;
    upload_status?: string | null;
  } | null;
  post_media?: {
    position: number;
    media_id: number;
    media: {
      file_path: string | null;
      upload_status?: string | null;
    } | null;
  }[];
  created_at: string;
  featured: boolean;
  challenge_id?: number | null;
  challenge_title?: string;
  quest_id?: number | null;
  quest_title?: string;
  comfort_zone_rating?: number | null;
  likes?: {
    count: number;
  }[];
  comments?: PostCommentRecord[];
  profiles?: PostProfileRecord | null;
  challenges?: { title: string } | null;
  side_quests?: { title: string } | null;
  is_welcome?: boolean | null;
}

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
    body: string | null;
    media_id?: number;
    media?: {
      file_path: string | null;
    };
    media_items?: {
      media_id: number;
      file_path: string | null;
      position: number;
    }[];
    created_at: string;
    featured: boolean;
    challenge_id?: number | null;
    challenge_title?: string;
    quest_id?: number | null;
    quest_title?: string;
    comfort_zone_rating?: number | null;
    likes_count: number;
    comments_count: number;
    liked: boolean;
    likes?: {
      count: number;
    }[];
    is_welcome?: boolean | null;
    comment_previews?: PostCommentPreview[];
  }

  export interface ChallengeProgress {
    easy: number;
    medium: number;
    hard: number;
  }

  export interface SideQuestProgress {
    total: number;
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
    challengeData: ChallengeProgress;
    weekData: WeekData[];
    sideQuestData: SideQuestProgress;
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
    media_id?: number;
    media?: {
      file_path: string | null;
    };
    media_items?: {
      media_id: number;
      file_path: string | null;
      preview_path?: string | null;
      position: number;
      is_video?: boolean;
    }[];
    liked: boolean;
    likes_count?: number;
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
    | 'practice'
    | 'solitude'
    | 'assertiveness'
    | 'openness';

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
    is_featured: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface ContentBookmark {
    user_id: string;
    piece_id: number;
    created_at: string;
  }
