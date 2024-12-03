import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Challenge, ChallengeWithCount } from '../types';
import { sendNewChallengeNotification } from '../lib/notificationsService';
import { useAuth } from '../contexts/AuthContext';

export const useActiveChallenge = () => {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeWithCount | null>(null);
  const [completionCount, setCompletionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getDaysUntilSunday = (): number => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // If it's Sunday, return 7 (days until next Sunday)
    // Otherwise, calculate days remaining until Sunday
    return dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  };

  const fetchActiveChallenge = async () => {
    setLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select(`
          *,
          media:image_media_id(
            file_path
          )
        `)
        .eq('is_active', true)
        .single();

      if (challengeError) {
        console.error('Error fetching active challenge:', challengeError);
        return;
      }

      const { count, error: countError } = await supabase
        .from('post')
        .select('id', { count: 'exact' })
        .eq('challenge_id', challengeData.id);

      if (countError) {
        console.error('Error fetching completion count:', countError);
      }

      const currentCount = count || 0;
      setCompletionCount(currentCount);
      
      const challenge = {
        ...challengeData,
        media_file_path: challengeData.media?.file_path || null,
        daysRemaining: getDaysUntilSunday(),
        completion_count: currentCount
      };
      
      setActiveChallenge(challenge as ChallengeWithCount);
    } catch (error) {
      console.error('Error fetching active challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveChallenge();


    // Update days remaining at midnight
    const midnightUpdate = setInterval(() => {
      if (activeChallenge) {
        setActiveChallenge({
          ...activeChallenge,
          daysRemaining: getDaysUntilSunday()
        });
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => {
      clearInterval(midnightUpdate);
    };
  }, [user?.id]);

  return {
    activeChallenge,
    loading,
    fetchActiveChallenge,
    completionCount
  };
};