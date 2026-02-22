import { Badge, BadgeCategory } from '../types/badges';

export const BADGES: Badge[] = [
    // --- Onboarding / Getting Started ---
    {
        id: 'first_challenger',
        name: 'First Challenger',
        description: 'Complete your first challenge',
        category: 'onboarding',
        icon: 'trophy-outline',
    },
    {
        id: 'documenter',
        name: 'Documenter',
        description: 'Log your first challenge adding text and image',
        category: 'onboarding',
        icon: 'image-outline',
    },
    {
        id: 'icebreaker',
        name: 'Icebreaker',
        description: 'Post your first comment to start a discussion',
        category: 'onboarding',
        icon: 'chatbubble-outline',
    },
    {
        id: 'open_book',
        name: 'Open Book',
        description: 'Fully complete your profile details',
        category: 'onboarding',
        icon: 'book-outline',
    },

    // --- Consistency ---
    {
        id: 'streak_2',
        name: 'Half Month Streak',
        description: 'Maintain a 2-week challenge streak',
        category: 'consistency',
        icon: 'flame-outline',
        threshold: 2,
    },
    {
        id: 'streak_4',
        name: 'Month Streak',
        description: 'Maintain a 4-week challenge streak',
        category: 'consistency',
        icon: 'flame',
        threshold: 4,
    },

    // --- Community (Multi-level) ---

    // Storyteller (Text Posts) - Simplify to just "Posts" for now as we track general posts
    {
        id: 'storyteller_bronze',
        name: 'Storyteller Bronze',
        description: 'Share (threshold) updates',
        category: 'community',
        icon: 'pencil-outline',
        level: 'bronze',
        threshold: 5,
    },
    {
        id: 'storyteller_silver',
        name: 'Storyteller Silver',
        description: 'Share (threshold) updates',
        category: 'community',
        icon: 'pencil',
        level: 'silver',
        threshold: 20,
    },
    {
        id: 'storyteller_gold',
        name: 'Storyteller Gold',
        description: 'Share (threshold) updates',
        category: 'community',
        icon: 'pencil',
        level: 'gold',
        threshold: 50,
    },

    // Supporter (Likes Given)
    {
        id: 'supporter_bronze',
        name: 'Supporter Bronze',
        description: 'Like (threshold) posts',
        category: 'community',
        icon: 'heart-outline',
        level: 'bronze',
        threshold: 15,
    },
    {
        id: 'supporter_silver',
        name: 'Supporter Silver',
        description: 'Like (threshold) posts',
        category: 'community',
        icon: 'heart-outline',
        level: 'silver',
        threshold: 100,
    },
    {
        id: 'supporter_gold',
        name: 'Supporter Gold',
        description: 'Like (threshold) posts',
        category: 'community',
        icon: 'heart-outline',
        level: 'gold',
        threshold: 250,
    },

    // Conversationalist (comments given)
    {
        id: 'conversationalist_bronze',
        name: 'Conversationalist Bronze',
        description: 'Comment (threshold) times',
        category: 'community',
        icon: 'chatbubbles-outline',
        level: 'bronze',
        threshold: 10,
    },
    {
        id: 'conversationalist_silver',
        name: 'Conversationalist Silver',
        description: 'Comment (threshold) times',
        category: 'community',
        icon: 'chatbubbles-outline',
        level: 'silver',
        threshold: 50,
    },
    {
        id: 'conversationalist_gold',
        name: 'Conversationalist Gold',
        description: 'Comment (threshold) times',
        category: 'community',
        icon: 'chatbubbles-outline',
        level: 'gold',
        threshold: 100,
    }
];
