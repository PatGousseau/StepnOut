import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {  ChallengeWithCount } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useActiveChallenge = () => {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeWithCount | null>(null);
  const [completionCount, setCompletionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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


  }, [user?.id]);

  return {
    activeChallenge,
    loading,
    fetchActiveChallenge,
    completionCount
  };
};