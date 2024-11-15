import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChallengeProgress, UserProgress, WeekData } from '../types';

const hardCodedUserId = '4e723784-b86d-44a2-9ff3-912115398421'; // hard coded until auth is built in

const useUserProgress = (): { data: UserProgress | null; loading: boolean; error: string | null } => {
  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch submissions for the user
        const { data: submissionData, error: submissionError } = await supabase
          .from('submission')
          .select(`
            challenge_id
          `)
          .eq('user_id', hardCodedUserId);

        if (submissionError) throw submissionError;

        // Fetch the active challenge first
        const { data: activeChallenge, error: activeError } = await supabase
          .from('challenges_status')
          .select('*')
          .eq('is_active', true)
          .single();

        if (activeError) throw activeError;

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
          throw new Error('No data returned from the database');
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
          .eq('user_id', hardCodedUserId);

        if (difficultyError) throw difficultyError;

        // Calculate completed challenges by difficulty
        const challengeData: ChallengeProgress = {
          easy: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'easy').length,
          medium: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'medium').length,
          hard: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'hard').length,
        };

        setData({ challengeData, weekData });
      } catch (err) {
        setError('Failed to fetch progress data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default useUserProgress;
