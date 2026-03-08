import { supabase } from '../lib/supabase';
import { Badge, UserBadge, UserStats } from '../types/badges';
import { BADGES } from '../constants/badges';
import { UserProfile } from '../models/User';
import { Challenge } from '../types';

const CACHE_TIMEOUT = 2 * 60 * 1000;
const statsCache: Record<string, { stats: UserStats, timestamp: number }> = {};
const challengeLadderCache: { challenges: Challenge[]; timestamp: number } = { challenges: [], timestamp: 0 };

export const BadgeService = {
    /**
     * Fetches all necessary stats for a user to calculate badges.
     */
    async getUserStats(userId: string): Promise<UserStats> {
        const now = Date.now();
        const cached = statsCache[userId];
        if (cached && (now - cached.timestamp < CACHE_TIMEOUT)) {
            return cached.stats;
        }

        const stats: UserStats = {
            postsCount: 0,
            postsWithImageCount: 0,
            challengesCount: 0,
            commentsGivenCount: 0,
            likesGivenCount: 0,
            streakCurrent: 0,
            firstChallengeCompleted: false,
            reactionsReceivedCount: 0,
        };

        try {
            const maxStreakThreshold = Math.max(
                ...BADGES.filter(b => b.id.startsWith('streak')).map(b => b.threshold || 0),
                1
            );

            // Fetch independent stats in parallel
            const [
                userPostsRes,
                commentsRes,
                likesRes,
            ] = await Promise.all([
                supabase
                    .from('post')
                    .select('body, media_id, challenge_id')
                    .eq('user_id', userId),
                supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId),
                supabase
                    .from('likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId),
            ]);

            if (userPostsRes.error) throw userPostsRes.error;
            const userPosts = userPostsRes.data || [];

            stats.postsCount = userPosts.filter((p) => (p.body || '').trim() !== '').length;
            stats.postsWithImageCount = userPosts.filter(
                (p) => (p.body || '').trim() !== '' && p.media_id !== null
            ).length;
            stats.challengesCount = userPosts.filter((p) => p.challenge_id !== null).length;
            stats.firstChallengeCompleted = stats.challengesCount > 0;

            if (!commentsRes.error) stats.commentsGivenCount = commentsRes.count || 0;
            if (!likesRes.error) stats.likesGivenCount = likesRes.count || 0;

            // Reuse challenge ladder cache (same for all users)
            const ladderFresh = challengeLadderCache.challenges.length > 0
                && (now - challengeLadderCache.timestamp < CACHE_TIMEOUT);

            let orderedChallenges = challengeLadderCache.challenges;

            if (!ladderFresh) {
                const { data: activeChallenge, error: activeChallengeError } = await supabase
                    .from('challenges')
                    .select('*')
                    .eq('is_active', true)
                    .single();

                if (activeChallengeError) throw activeChallengeError;
                if (!activeChallenge) throw new Error('No active challenge found');

                const { data: previousChallenges, error: prevError } = await supabase
                    .from('challenges')
                    .select('*')
                    .lt('created_at', activeChallenge.created_at)
                    .order('created_at', { ascending: false })
                    .limit(maxStreakThreshold + 1);

                if (prevError) throw prevError;

                orderedChallenges = [activeChallenge, ...(previousChallenges || [])];
                challengeLadderCache.challenges = orderedChallenges;
                challengeLadderCache.timestamp = now;
            }

            const activeChallenge = orderedChallenges[0];
            if (!activeChallenge) throw new Error('No active challenge found');

            const challengeIds = orderedChallenges.map(c => c.id);
            const completedSet = new Set(
                userPosts
                    .map((p) => p.challenge_id)
                    .filter((id): id is number => typeof id === 'number' && challengeIds.includes(id))
            );

            stats.streakCurrent = this.computeStreak(completedSet, activeChallenge, orderedChallenges);
        } catch (error) {
            console.error('Error fetching user stats for badges:', error);
        }

        statsCache[userId] = { stats, timestamp: Date.now() };
        return stats;
    },

    computeStreak(completedSet: Set<number>, activeChallenge: Challenge, orderedChallenges: Challenge[]): number {
        const isActiveCompleted = completedSet.has(activeChallenge.id);

        let streak = 0;

        for (let i = 0; i < orderedChallenges.length; i++) {
            const challenge = orderedChallenges[i];

            // If active and NOT completed -> skip it
            if (i === 0 && !isActiveCompleted) {
                continue;
            }

            if (completedSet.has(challenge.id)) {
                streak++;
            } else {
                break; // streak broken
            }
        }

        return streak;
    },

    /**
     * Calculates which badges are unlocked based on stats and profile data.
     */
    calculateBadges(stats: UserStats, userProfile: UserProfile): UserBadge[] {
        const earnedBadges: UserBadge[] = [];

        // --- Onboarding ---
        if (stats.firstChallengeCompleted) {
            earnedBadges.push(this.createBadgeEntry('first_challenger'));
        }

        if (stats.postsWithImageCount > 0) {
            earnedBadges.push(this.createBadgeEntry('documenter'));
        }

        if (stats.commentsGivenCount > 0) {
            earnedBadges.push(this.createBadgeEntry('icebreaker'));
        }

        // Check availability of profile data
        const isProfileComplete = !!(
            userProfile.name &&
            userProfile.username &&
            userProfile.profileImageUrl &&
            userProfile.instagram &&
            userProfile.bio
        );
        if (isProfileComplete) {
            earnedBadges.push(this.createBadgeEntry('open_book'));
        }

        // --- Consistency ---
        // If we had streak data:
        if (stats.streakCurrent >= 2) earnedBadges.push(this.createBadgeEntry('streak_2'));
        if (stats.streakCurrent >= 4) earnedBadges.push(this.createBadgeEntry('streak_4'));

        // --- Community (Multi-level) ---
        // Storyteller (Posts)
        this.checkLevelBadge(earnedBadges, stats.postsCount, 'storyteller');

        // Supporter (Likes Given)
        this.checkLevelBadge(earnedBadges, stats.likesGivenCount, 'supporter');

        // Chatter (Comments Given)
        this.checkLevelBadge(earnedBadges, stats.commentsGivenCount, 'chatter');

        return earnedBadges;
    },

    checkLevelBadge(earnedBadges: UserBadge[], value: number, type: string) {
        // Find all badges in the same tiered group.
        const relatedBadges = BADGES.filter(b => b.type === type && !!b.level);

        // Sort by threshold desc to find highest unlocked
        relatedBadges.sort((a, b) => (b.threshold || 0) - (a.threshold || 0));

        for (const badge of relatedBadges) {
            if (badge.threshold && value >= badge.threshold) {
                earnedBadges.push({
                    badgeId: badge.id,
                    progress: value
                });
            }
        }
    },

    createBadgeEntry(id: string): UserBadge {
        return {
            badgeId: id,
        };
    },

    /**
     * Returns metadata for all badges (locked and unlocked) merged with user progress
     */
    getAllBadgesWithStatus(stats: UserStats, earnedBadges: UserBadge[]): (Badge & { unlocked: boolean, currentProgress?: number })[] {
        const earnedMap = new Map(earnedBadges.map(b => [b.badgeId, b]));

        return BADGES.map(badge => {
            const earned = earnedMap.get(badge.id);
            let currentProgress = earned?.progress;

            // If not earned, we can still show progress for threshold badges
            if (currentProgress === undefined && badge.threshold) {
                if (badge.type === 'storyteller') currentProgress = stats.postsCount;
                else if (badge.type === 'supporter') currentProgress = stats.likesGivenCount;
                else if (badge.type === 'chatter') currentProgress = stats.commentsGivenCount;
                else if (badge.type === 'streak') currentProgress = stats.streakCurrent;
            }

            return {
                ...badge,
                unlocked: !!earned,
                currentProgress: currentProgress
            };
        });
    }
};
