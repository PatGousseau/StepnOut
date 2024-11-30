import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Challenge } from '../types';
import { sendNewChallengeNotification } from '../lib/notificationsService';
import { useAuth } from '../contexts/AuthContext';

export const useActiveChallenge = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
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
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          media:image_media_id(
            file_path
          )
        `)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching active challenge:', error);
      } else if (data) {
        const challenge = {
          ...data,
          media_file_path: data.media?.file_path || null,
          daysRemaining: getDaysUntilSunday()
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
      .channel('challenges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          filter: 'is_active=eq.true'
        },
        async (payload) => {
          await fetchActiveChallenge();
          
          if (user?.id && payload.eventType === 'UPDATE' && payload.new.is_active) {
            await sendNewChallengeNotification(user.id, payload.new.id);
          }
        }
      )
      .subscribe();

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
      subscription.unsubscribe();
      clearInterval(midnightUpdate);
    };
  }, [user?.id]);

  return {
    activeChallenge,
    loading,
    fetchActiveChallenge
  };
};