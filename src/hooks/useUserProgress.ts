import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChallengeProgress, UserProgress, WeekData, Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

const useUserProgress = () => {
  const { user } = useAuth();
  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const POSTS_PER_PAGE = 10;

  const fetchUserPosts = async (page = 1, isLoadMore = false) => {
    if (!user?.id) return;
    
    setPostsLoading(true);
    try {
      const { data: posts, error } = await supabase
        .from('post')
        .select(`
          id, 
          user_id, 
          created_at, 
          featured, 
          body, 
          media_id, 
          media (file_path),
          likes:likes(count),
          comments:comments(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);

      if (error) throw error;

      const formattedPosts = posts.map(post => ({
        ...post,
        media_file_path: post.media?.file_path 
          ? `${supabase.storageUrl}/object/public/challenge-uploads/${post.media.file_path}`
          : null,
        likes_count: post.likes?.[0]?.count ?? 0,
        comments_count: post.comments?.[0]?.count ?? 0
      }));

      setUserPosts(prev => isLoadMore ? [...prev, ...formattedPosts] : formattedPosts);
      setHasMorePosts(posts.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

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
        // Fetch submissions for the user
        const { data: submissionData, error: submissionError } = await supabase
          .from('submission')
          .select(`challenge_id`)
          .eq('user_id', user.id);

        if (submissionError) throw submissionError;

        // Fetch the active challenge first
        const { data: activeChallenge, error: activeError } = await supabase
          .from('challenges_status')
          .select('*')
          .eq('is_active', true)
          .single();

        if (activeError) {
          // If no active challenge is found, set empty data instead of throwing
          if (activeError.code === 'PGRST116') {
            setData({ 
              challengeData: { easy: 0, medium: 0, hard: 0 }, 
              weekData: [] 
            });
            return;
          }
          throw activeError;
        }

        // Fetch 8 challenges before the active one
        const { data: previousChallenges, error: challengesError } = await supabase
          .from('challenges_status')
          .select(`
            id,
            challenge_id,
            start_date,
            end_date,
            is_active
          `)
          .lt('start_date', activeChallenge.start_date)
          .order('start_date', { ascending: false })
          .limit(8);

        if (challengesError) throw challengesError;

        // Use only previous challenges (exclude active challenge)
        const challengesData = previousChallenges || [];

        if (!submissionData || !challengesData) {
          // on error set empty data
          setData({ 
            challengeData: { easy: 0, medium: 0, hard: 0 }, 
            weekData: [] 
          });
          return;
        }

        const completedChallengeIds = submissionData.map(s => s.challenge_id);

        // Create week data array from challenges
        const weekData: WeekData[] = challengesData.map((challenge, index) => ({
          week: index + 1,
          hasStreak: completedChallengeIds.includes(challenge.challenge_id),
          challengeId: challenge.challenge_id,
          startDate: challenge.start_date,
          endDate: challenge.end_date,
          isActive: challenge.is_active,
          isCompleted: completedChallengeIds.includes(challenge.challenge_id)
        }));

        // For difficulty counts, we need to join with challenges table
        const { data: submissionsWithDifficulty, error: difficultyError } = await supabase
          .from('submission')
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

        setData({ challengeData, weekData });
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch progress data');
        // Set empty data on error
        setData({ 
          challengeData: { easy: 0, medium: 0, hard: 0 }, 
          weekData: [] 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts(1);
    }
  }, [user?.id]);

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
