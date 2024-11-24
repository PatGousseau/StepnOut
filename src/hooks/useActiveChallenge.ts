import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Challenge } from '../types';

export const useActiveChallenge = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveChallenge = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenges_status')
        .select(`
          challenges(
            *,
            media:image_media_id(
              file_path
            )
          )
        `)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching active challenge:', error);
      } else if (data && data.challenges) {
        const challenge = {
          ...data.challenges,
          media_file_path: data.challenges.media?.file_path || null
        };
        setActiveChallenge(challenge as Challenge);
      }
    } catch (error) {
      console.error('Error fetching active challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveChallenge();
  }, []);

  return {
    activeChallenge,
    loading,
    fetchActiveChallenge
  };
};