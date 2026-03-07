import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';

const THROTTLE_MS = 30 * 60 * 1000;

export function useAppOpenTracker(userId?: string, isLoading?: boolean) {
  const lastOpenUpdateRef = useRef<number>(0);

  const updateLastOpenAt = useCallback(async () => {
    if (!userId) return;
    const now = Date.now();
    if (now - lastOpenUpdateRef.current < THROTTLE_MS) return;
    lastOpenUpdateRef.current = now;

    const { error } = await supabase
      .from('profiles')
      .update({ last_open_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last_open_at:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || isLoading) return;
    updateLastOpenAt();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        updateLastOpenAt();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userId, isLoading, updateLastOpenAt]);
}
