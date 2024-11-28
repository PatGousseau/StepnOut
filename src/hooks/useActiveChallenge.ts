import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Challenge } from '../types';
import { sendNewChallengeNotification } from '../lib/notificationsService';
import { useAuth } from '../contexts/AuthContext';

export const useActiveChallenge = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth()

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

    const subscription = supabase
      .channel('challenges_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenges_status',
          filter: 'is_active=eq.true'
        },
        async (payload) => {
          console.log("prints")
          await fetchActiveChallenge();
          
          if (user?.id) {
            const challengeId = payload.new.challenge_id;
            await sendNewChallengeNotification(user.id, challengeId);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return {
    activeChallenge,
    loading,
    fetchActiveChallenge
  };
};