import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChallengeProgress, SideQuestProgress, UserProgress, WeekData, Post, PostRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatFeedPosts, hydratePostMedia } from '../services/postService';

const useUserProgress = (targetUserId: string) => {
  const { user } = useAuth();
  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const POSTS_PER_PAGE = 10;

  const fetchUserPosts = useCallback(async (page = 1, isLoadMore = false) => {
    setPostsLoading(true);
    try {
      // First fetch all posts
      const { data: posts, error } = await supabase
        .from('post')
        .select(`
          id,
          user_id,
          created_at,
          featured,
          body,
          media_id,
          challenge_id,
          is_welcome,
          challenges (title),
          media:media!post_media_id_fkey (
            file_path,
            upload_status
          ),
          likes:likes(count),
          comments (id, body, created_at, parent_comment_id, profiles:user_id (username))
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);

      if (error) throw error;

      const hydratedPosts = await hydratePostMedia((posts || []) as PostRecord[]);

      // Drop welcome posts from profile feeds
      const transformedPosts = hydratedPosts.map(post => ({
        ...post,
        challenge_title: post.challenges?.title
      })).filter(post => !post.is_welcome);

      // Then fetch like status separately
      const likedPostIds = new Set<number>();

      if (transformedPosts.length > 0) {
        const { data: likedPosts } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user?.id)
          .in('post_id', transformedPosts.map(post => post.id));

        likedPosts?.forEach(like => {
          if (like.post_id != null) likedPostIds.add(like.post_id);
        });
      }
      const likedPostsMap = Object.fromEntries(
        Array.from(likedPostIds).map((postId) => [postId, true])
      );
      const { posts: formattedPosts } = formatFeedPosts(transformedPosts, likedPostsMap);

      setUserPosts(prev => isLoadMore ? [...prev, ...formattedPosts] : formattedPosts);
      setHasMorePosts((posts || []).length === POSTS_PER_PAGE);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }, [targetUserId, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      // Clear data and stop loading if there's no authenticated user
      setData(null);
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // First, get the active challenge
        const { data: activeChallenge, error: activeChallengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true)
          .single();

        if (activeChallengeError) throw activeChallengeError;
        if (!activeChallenge) throw new Error('No active challenge found');

        const joinedAt = user.created_at;

        // Then get all previous challenges before the active one, since the user joined
        const { data: previousChallenges, error: previousChallengesError } = await supabase
          .from('challenges')
          .select('*')
          .lt('created_at', activeChallenge.created_at)
          .gte('created_at', joinedAt)
          .order('created_at', { ascending: false });

        if (previousChallengesError) throw previousChallengesError;

        // Combine active challenge with previous challenges
        const challenges = [activeChallenge, ...(previousChallenges || [])];

        // Fetch submissions for the user
        const { data: submissionData, error: submissionError } = await supabase
          .from('post')
        .select(`
            id,
            challenge_id,
            created_at,
            media:media!post_media_id_fkey (
              file_path,
              upload_status
            )
          `)
          .eq('user_id', user.id)
          .not('challenge_id', 'is', null);

        if (submissionError) throw submissionError;

        const completedChallengeIds = submissionData?.map(s => s.challenge_id) || [];
        const latestSubmissionByChallenge = new Map<number, { postId: number; createdAtMs: number }>();

        for (const submission of submissionData || []) {
          if (!submission.challenge_id) continue;
          const createdAtMs = new Date(submission.created_at).getTime();
          const existing = latestSubmissionByChallenge.get(submission.challenge_id);
          if (!existing || createdAtMs > existing.createdAtMs) {
            latestSubmissionByChallenge.set(submission.challenge_id, {
              postId: submission.id,
              createdAtMs,
            });
          }
        }

        // Create week data array from all challenges, including the current active one
        const weekData: WeekData[] = challenges.map((challenge, index) => ({
          week: index + 1,
          hasStreak: completedChallengeIds.includes(challenge.id),
          challengeId: challenge.id,
          postId: latestSubmissionByChallenge.get(challenge.id)?.postId,
          startDate: challenge.created_at,
          endDate: challenge.updated_at,
          isActive: challenge.is_active,
          isCompleted: completedChallengeIds.includes(challenge.id)
        }));

        // For difficulty counts
        const { data: submissionsWithDifficulty, error: difficultyError } = await supabase
          .from('post')
          .select(`
            challenge_id,
            challenges!inner (
              difficulty
            )
          `)
          .eq('user_id', user.id);

        if (difficultyError) throw difficultyError;

        // Calculate completed challenges by difficulty
        const challengeData: ChallengeProgress = {
          easy: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'easy').length,
          medium: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'medium').length,
          hard: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'hard').length,
        };

        const { count: completedSideQuestCount, error: questError } = await supabase
          .from('post')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('quest_id', 'is', null);

        if (questError) throw questError;

        const sideQuestData: SideQuestProgress = {
          total: completedSideQuestCount ?? 0,
        };

        setData({ challengeData, weekData, sideQuestData });
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch progress data');
        setData({
          challengeData: { easy: 0, medium: 0, hard: 0 },
          weekData: [],
          sideQuestData: { total: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.created_at, user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts(1);
    }
  }, [fetchUserPosts, user?.id]);

  return {
    data,
    loading,
    error,
    userPosts,
    postsLoading,
    hasMorePosts,
    fetchUserPosts
  };
};

export default useUserProgress;
