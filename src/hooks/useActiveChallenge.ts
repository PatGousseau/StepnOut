import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ChallengeWithCount } from '../types';
import { useAuth } from '../contexts/AuthContext';

const ACTIVE_CHALLENGE_SELECT = `
  id,
  title,
  title_it,
  description,
  description_it,
  difficulty,
  created_by,
  created_at,
  updated_at,
  is_active,
  media:image_media_id(
    file_path
  )
`;

export const useActiveChallenge = () => {
  const { user } = useAuth();

  // used purely to recompute daysRemaining once per hour (no network)
  const [hourTick, setHourTick] = useState(0);

  const getDaysUntilSunday = (): number => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  };

  // correctness-first: if the active challenge flips server-side, we want users to see it.
  // keep staleTime low + lightly poll.
  const activeChallengeQuery = useQuery({
    queryKey: ['activeChallenge'],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select(ACTIVE_CHALLENGE_SELECT)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5_000,
    refetchInterval: 30_000,
  });

  const challengeId = activeChallengeQuery.data?.id;

  const completionCountQuery = useQuery({
    queryKey: ['challengeCompletionCount', challengeId],
    enabled: !!challengeId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post')
        .select('id', { count: 'exact', head: true })
        .eq('challenge_id', challengeId!);

      if (error) throw error;
      return count || 0;
    },
    staleTime: 10_000,
  });

  useEffect(() => {
    const interval = setInterval(() => setHourTick((n) => n + 1), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const activeChallenge = useMemo(() => {
    const challengeData = activeChallengeQuery.data;
    if (!challengeData) return null;

    return {
      ...challengeData,
      // ChallengeWithCount expects this shape in a few places
      media_file_path: (challengeData as any).media?.file_path || null,
      daysRemaining: getDaysUntilSunday(),
      completion_count: completionCountQuery.data ?? 0,
    } as ChallengeWithCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChallengeQuery.data, completionCountQuery.data, hourTick]);

  const loading = activeChallengeQuery.isLoading || completionCountQuery.isLoading;

  // keep existing API for callers; best-effort refetch
  const fetchActiveChallenge = async () => {
    await Promise.all([
      activeChallengeQuery.refetch(),
      completionCountQuery.refetch(),
    ]);
  };

  return {
    activeChallenge,
    loading,
    fetchActiveChallenge,
    completionCount: completionCountQuery.data ?? 0,
  };
};
