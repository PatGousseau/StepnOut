import { Badge } from '../types/badges';

export const BADGES: Badge[] = [
    // --- Onboarding / Getting Started ---
    {
        id: 'first_challenger',
        type: 'first_challenger',
        name: 'First Challenger',
        description: 'Complete your first challenge',
        category: 'onboarding',
        icon: 'trophy-outline',
    },
    {
        id: 'documenter',
        type: 'documenter',
        name: 'Documenter',
        description: 'Log your first challenge adding text and image',
        category: 'onboarding',
        icon: 'image-outline',
    },
    {
        id: 'icebreaker',
        type: 'icebreaker',
        name: 'Icebreaker',
        description: 'Post your first comment to start a discussion',
        category: 'onboarding',
        icon: 'chatbubble-outline',
    },
    {
        id: 'open_book',
        type: 'open_book',
        name: 'Open Book',
        description: 'Fully complete your profile details',
        category: 'onboarding',
        icon: 'book-outline',
    },

    // --- Consistency ---
    {
        id: 'streak_2',
        type: 'streak',
        name: 'Half Month Streak',
        description: 'Maintain a 2-week challenge streak',
        category: 'consistency',
        icon: 'flame-outline',
        threshold: 2,
    },
    {
        id: 'streak_4',
        type: 'streak',
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
        type: 'storyteller',
        name: 'Storyteller Bronze',
        description: 'Share (threshold) posts',
        category: 'community',
        icon: 'pencil-outline',
        level: 'bronze',
        threshold: 5,
    },
    {
        id: 'storyteller_silver',
        type: 'storyteller',
        name: 'Storyteller Silver',
        description: 'Share (threshold) posts',
        category: 'community',
        icon: 'pencil',
        level: 'silver',
        threshold: 20,
    },
    {
        id: 'storyteller_gold',
        type: 'storyteller',
        name: 'Storyteller Gold',
        description: 'Share (threshold) posts',
        category: 'community',
        icon: 'pencil',
        level: 'gold',
        threshold: 50,
    },

    // Supporter (Likes Given)
    {
        id: 'supporter_bronze',
        type: 'supporter',
        name: 'Supporter Bronze',
        description: 'Like (threshold) posts',
        category: 'community',
        icon: 'heart-outline',
        level: 'bronze',
        threshold: 15,
    },
    {
        id: 'supporter_silver',
        type: 'supporter',
        name: 'Supporter Silver',
        description: 'Like (threshold) posts',
        category: 'community',
        icon: 'heart-outline',
        level: 'silver',
        threshold: 100,
    },
    {
        id: 'supporter_gold',
        type: 'supporter',
        name: 'Supporter Gold',
        description: 'Like (threshold) posts',
        category: 'community',
        icon: 'heart-outline',
        level: 'gold',
        threshold: 250,
    },

    // Chatter (comments given)
    {
        id: 'conversationalist_bronze',
        type: 'chatter',
        name: 'Chatter Bronze',
        description: 'Comment (threshold) times',
        category: 'community',
        icon: 'chatbubbles-outline',
        level: 'bronze',
        threshold: 10,
    },
    {
        id: 'conversationalist_silver',
        type: 'chatter',
        name: 'Chatter Silver',
        description: 'Comment (threshold) times',
        category: 'community',
        icon: 'chatbubbles-outline',
        level: 'silver',
        threshold: 50,
    },
    {
        id: 'conversationalist_gold',
        type: 'chatter',
        name: 'Chatter Gold',
        description: 'Comment (threshold) times',
        category: 'community',
        icon: 'chatbubbles-outline',
        level: 'gold',
        threshold: 100,
    }
];
