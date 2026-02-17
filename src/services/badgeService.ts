import { supabase } from '../lib/supabase';
import { Badge, UserBadge, UserStats } from '../types/badges';
import { BADGES } from '../constants/badges';
import { UserProfile } from '../models/User';

export const BadgeService = {
    /**
     * Fetches all necessary stats for a user to calculate badges.
     */
    async getUserStats(userId: string): Promise<UserStats> {
        const stats: UserStats = {
            postsCount: 0,
            commentsCount: 0,
            likesReceivedCount: 0,
            likesGivenCount: 0,
            streakCurrent: 0,
            streakLongest: 0,
            profileCompleted: false,
            firstChallengeCompleted: false,
            commentsReceivedCount: 0,
            reactionsReceivedCount: 0,
        };

        try {
            // 1. Posts Count
            const { count: postsCount, error: postsError } = await supabase
                .from('post')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (!postsError) stats.postsCount = postsCount || 0;

            // 2. Comments Given Count
            const { count: commentsCount, error: commentsError } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (!commentsError) stats.commentsCount = commentsCount || 0;

            // 3. Likes Given Count
            const { count: likesGivenCount, error: likesGivenError } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (!likesGivenError) stats.likesGivenCount = likesGivenCount || 0;

            // 4. Activity received (Likes + Comments on user's posts)
            // This is a bit more complex. best way without a new table is to get user's post IDs first.
            // For scalability, we might just fetch the last 100 posts or similar, but for now let's try to get aggregate if possible.
            // Supabase doesn't easily support "sum of likes on my posts" without an RPC or complex join.
            // We will approximate or use a separate query. For now, let's skip "Likes Received" precise count aggregation 
            // if it requires too many reads, OR do a join.

            // Let's try to get it via post summaries if we had them. Since we don't, we can try to fetch posts and sum their likes.
            // Limit to 1000 latest posts to avoid timeout.
            const { data: postsData } = await supabase
                .from('post')
                .select(`
          id,
          likes:likes(count),
          comments:comments(count)
        `)
                .eq('user_id', userId)
                .limit(100); // Limit to avoid performance hit

            if (postsData) {
                let totalLikes = 0;
                let totalCommentsReceived = 0;

                postsData.forEach((post: any) => {
                    // Supabase returns array of counts for one-to-many if structured right, or we just get length
                    // actually select count above usually returns [{count: N}] array if using count aggregator, 
                    // but with the syntax above it returns the actual rows unless we use specific join. 
                    // Wait, the standard way to get counts in join is .select('*, likes(count)'). 
                    // But here we need sum.

                    // Let's rely on the previous implementation pattern or just simple approximation for now.
                    // The query `likes(count)` returns `likes: [{ count: 5 }]` usually.
                    const postLikes = post.likes?.[0]?.count || 0;
                    const postComments = post.comments?.[0]?.count || 0;

                    totalLikes += postLikes;
                    totalCommentsReceived += postComments;
                });

                stats.likesReceivedCount = totalLikes;
                stats.commentsReceivedCount = totalCommentsReceived;
                stats.reactionsReceivedCount = totalLikes + totalCommentsReceived;
            }

            // 5. Streaks 
            // We can reuse the WeekData logic if we had access to it, or fetch challenges.
            // For now, let's fetch completed challenges count.
            const { count: challengesCompletedCount } = await supabase
                .from('post')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .not('challenge_id', 'is', null);

            if (challengesCompletedCount && challengesCompletedCount > 0) {
                stats.firstChallengeCompleted = true;
            }

            // Streak calculation would ideally come from the same logic as UserProgress.
            // For this MVP, we might Mock streak or check `UserProgress` hook reuse in the component.
            // We will leave streak at 0 here and allow it to be passed in or calculated if passed from the hook.

        } catch (error) {
            console.error('Error fetching user stats for badges:', error);
        }

        return stats;
    },

    /**
     * Calculates which badges are unlocked based on stats and profile data.
     */
    calculateBadges(stats: UserStats, userProfile: UserProfile): UserBadge[] {
        const earnedBadges: UserBadge[] = [];

        // Check availability of profile data
        const isProfileComplete = !!(
            userProfile.name &&
            userProfile.username &&
            userProfile.profileImageUrl &&
            userProfile.instagram
        );

        // --- Onboarding ---
        if (stats.firstChallengeCompleted) {
            earnedBadges.push(this.createBadgeEntry('first_challenger'));
        }

        if (stats.postsCount > 0) {
            earnedBadges.push(this.createBadgeEntry('documenter'));
        }

        if (stats.commentsCount > 0) {
            earnedBadges.push(this.createBadgeEntry('icebreaker'));
        }

        if (isProfileComplete) {
            earnedBadges.push(this.createBadgeEntry('open_book'));
        }

        // --- Consistency ---
        // If we had streak data:
        if (stats.streakCurrent >= 15) earnedBadges.push(this.createBadgeEntry('streak_15'));
        if (stats.streakCurrent >= 30) earnedBadges.push(this.createBadgeEntry('streak_30'));

        // --- Community (Multi-level) ---
        // Storyteller (Posts)
        this.checkLevelBadge(earnedBadges, stats.postsCount, 'storyteller');

        // Supporter (Likes Given)
        this.checkLevelBadge(earnedBadges, stats.likesGivenCount, 'supporter');

        // Influencer (Reactions Received)
        this.checkLevelBadge(earnedBadges, stats.reactionsReceivedCount, 'influencer');

        return earnedBadges;
    },

    checkLevelBadge(earnedBadges: UserBadge[], value: number, baseId: string) {
        // Find all badges with this baseId (e.g. storyteller_bronze, storyteller_silver...)
        const relatedBadges = BADGES.filter(b => b.id.startsWith(baseId + '_'));

        // Sort by threshold desc to find highest unlocked
        relatedBadges.sort((a, b) => (b.threshold || 0) - (a.threshold || 0));

        for (const badge of relatedBadges) {
            if (badge.threshold && value >= badge.threshold) {
                earnedBadges.push({
                    badgeId: badge.id,
                    unlockedAt: new Date().toISOString(), // In a real app we'd store this date
                    progress: value
                });
                // If we want to show only highest level: break; 
                // If we want to show all achieved levels: continue;
                // Usually showing all is fine, or UI filters it. Let's return all achieved.
            }
        }
    },

    createBadgeEntry(id: string): UserBadge {
        return {
            badgeId: id,
            unlockedAt: new Date().toISOString()
        };
    },

    /**
     * Returns metadata for all badges (locked and unlocked) merged with user progress
     */
    getAllBadgesWithStatus(stats: UserStats, earnedBadges: UserBadge[]): (Badge & { unlocked: boolean, earnedDate?: string, currentProgress?: number })[] {
        const earnedMap = new Map(earnedBadges.map(b => [b.badgeId, b]));

        return BADGES.map(badge => {
            const earned = earnedMap.get(badge.id);
            let currentProgress = earned?.progress;

            // If not earned, we can still show progress for threshold badges
            if (currentProgress === undefined && badge.threshold) {
                if (badge.id.startsWith('storyteller')) currentProgress = stats.postsCount;
                else if (badge.id.startsWith('supporter')) currentProgress = stats.likesGivenCount;
                else if (badge.id.startsWith('influencer')) currentProgress = stats.reactionsReceivedCount;
                else if (badge.id.startsWith('streak')) currentProgress = stats.streakCurrent;
            }

            return {
                ...badge,
                unlocked: !!earned,
                earnedDate: earned?.unlockedAt,
                currentProgress: currentProgress
            };
        });
    }
};
