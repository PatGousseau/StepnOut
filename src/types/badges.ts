export type BadgeCategory = 'onboarding' | 'consistency' | 'community';
export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
    id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    icon: string;
    level?: BadgeLevel;
    maxLevel?: BadgeLevel; // To know if it's a multi-level badge

    // Logic fields
    threshold?: number; // Value required to unlock (e.g., 10 likes)
    requiredAction?: string; // Description of action for logic (e.g., "first_post")
}

export interface UserBadge {
    badgeId: string;
    progress?: number; // Current progress value (e.g., 5/10 likes)
}

// Stats needed to calculate badges
export interface UserStats {
    postsCount: number;
    challengesCount: number;
    commentsGivenCount: number;
    likesGivenCount: number;
    streakCurrent: number;
    firstChallengeCompleted: boolean;
    daysSinceLastActivity?: number;
    reactionsReceivedCount: number;
}
