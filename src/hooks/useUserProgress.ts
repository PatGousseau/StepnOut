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
        const { data: progressData, error } = await supabase
          .from('user_progress')
          .select('total_challenges_completed, streak, easy_challenges_completed, medium_challenges_completed, hard_challenges_completed')
          .eq('user_id', hardCodedUserId)
          .single();

        if (error) throw error;

        if (progressData) {
          const challengeData: ChallengeProgress = {
            easy: progressData.easy_challenges_completed,
            medium: progressData.medium_challenges_completed,
            hard: progressData.hard_challenges_completed,
          };

          const weekData: WeekData[] = Array(progressData.streak)
            .fill({ hasStreak: true })
            .concat(Array(8 - progressData.streak).fill({ hasStreak: false }))
            .map((week, index) => ({ ...week, week: index + 1 }));

          setData({ challengeData, weekData });
        }
      } catch (err) {
        setError('Failed to fetch progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default useUserProgress;
