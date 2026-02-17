import { Badge, BadgeCategory } from '../types/badges';

export const BADGES: Badge[] = [
    // --- Onboarding / Getting Started ---
    {
        id: 'first_challenger',
        name: 'First Challenger',
        description: 'Complete your first challenge.',
        category: 'onboarding',
        icon: 'trophy-outline',
        requiredAction: 'first_challenge_completed',
    },
    {
        id: 'documenter',
        name: 'Documenter',
        description: 'Post your first text + image update.',
        category: 'onboarding',
        icon: 'image-outline',
        requiredAction: 'first_post_created',
    },
    {
        id: 'icebreaker',
        name: 'Icebreaker',
        description: 'Post your first comment to start a discussion.',
        category: 'onboarding',
        icon: 'chatbubble-outline',
        requiredAction: 'first_comment_created',
    },
    {
        id: 'open_book',
        name: 'Open Book',
        description: 'Fully complete your profile details.',
        category: 'onboarding',
        icon: 'person-outline',
        requiredAction: 'profile_completed',
    },

    // --- Consistency ---
    {
        id: 'streak_15',
        name: 'Half Month Streak',
        description: 'Maintain a 15-day activity streak.',
        category: 'consistency',
        icon: 'flame-outline',
        threshold: 15,
    },
    {
        id: 'streak_30',
        name: 'Month Streak',
        description: 'Maintain a 30-day activity streak.',
        category: 'consistency',
        icon: 'flame',
        threshold: 30,
    },
    {
        id: 'comeback',
        name: 'Comeback Kid',
        description: 'Return after a week of inactivity.',
        category: 'consistency',
        icon: 'return-up-back-outline',
        requiredAction: 'comeback_after_inactivity',
    },

    // --- Community (Multi-level) ---

    // Storyteller (Text Posts) - Simplify to just "Posts" for now as we track general posts
    {
        id: 'storyteller_bronze',
        name: 'Storyteller Bronze',
        description: 'Share 5 updates.',
        category: 'community',
        icon: 'pencil-outline',
        level: 'bronze',
        maxLevel: 'platinum',
        threshold: 5,
    },
    {
        id: 'storyteller_silver',
        name: 'Storyteller Silver',
        description: 'Share 20 updates.',
        category: 'community',
        icon: 'pencil',
        level: 'silver',
        maxLevel: 'platinum',
        threshold: 20,
    },
    {
        id: 'storyteller_gold',
        name: 'Storyteller Gold',
        description: 'Share 50 updates.',
        category: 'community',
        icon: 'pencil',
        level: 'gold',
        maxLevel: 'platinum',
        threshold: 50,
    },

    // Supporter (Likes Given)
    {
        id: 'supporter_bronze',
        name: 'Supporter Bronze',
        description: 'Like 10 posts.',
        category: 'community',
        icon: 'heart-outline',
        level: 'bronze',
        maxLevel: 'platinum',
        threshold: 10,
    },
    {
        id: 'supporter_silver',
        name: 'Supporter Silver',
        description: 'Like 100 posts.',
        category: 'community',
        icon: 'heart',
        level: 'silver',
        maxLevel: 'platinum',
        threshold: 100,
    },

    // Influencer (Reactions/Comments Received)
    {
        id: 'influencer_bronze',
        name: 'Influencer Bronze',
        description: 'Receive 10 reactions/comments.',
        category: 'community',
        icon: 'star-outline',
        level: 'bronze',
        maxLevel: 'platinum',
        threshold: 10, // Combined comments + likes received
    },
    {
        id: 'influencer_silver',
        name: 'Influencer Silver',
        description: 'Receive 100 reactions/comments.',
        category: 'community',
        icon: 'star',
        level: 'silver',
        maxLevel: 'platinum',
        threshold: 100,
    },
];
