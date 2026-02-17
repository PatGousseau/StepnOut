export type BadgeCategory = 'onboarding' | 'consistency' | 'community';
export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
    id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    icon: string; // Icon name from a vector icon library (e.g., FontAwesome/Ionicons) or custom image
    level?: BadgeLevel;
    maxLevel?: BadgeLevel; // To know if it's a multi-level badge

    // Logic fields
    threshold?: number; // Value required to unlock (e.g., 10 likes, 3 streaks)
    requiredAction?: string; // Description of action for logic (e.g., "first_post")
}

export interface UserBadge {
    badgeId: string;
    unlockedAt: string; // ISO date string
    progress?: number; // Current progress value (e.g., 5/10 likes)
}

// Stats needed to calculate badges
export interface UserStats {
    postsCount: number;
    commentsCount: number;
    likesReceivedCount: number;
    likesGivenCount: number; // We might need to fetch this
    streakCurrent: number;
    streakLongest: number;
    profileCompleted: boolean; // Based on name, bio, image, etc.
    firstChallengeCompleted: boolean;
    daysSinceLastActivity?: number;
    commentsReceivedCount: number;
    reactionsReceivedCount: number;
}
