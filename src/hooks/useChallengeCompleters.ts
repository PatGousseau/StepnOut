import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { imageService } from '../services/imageService';

export type ChallengeCompleter = {
  id: string;
  username: string | null;
  profileImageUrl: string | null;
  latestPostBody: string | null;
};

export function useChallengeCompleters() {
  const [users, setUsers] = useState<ChallengeCompleter[]>([]);
  const [challengeTitle, setChallengeTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompleters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: activeChallenge, error: activeChallengeError } = await supabase
        .from('challenges')
        .select('id, created_at, title, title_it')
        .eq('is_active', true)
        .single();

      if (activeChallengeError) throw activeChallengeError;
      if (!activeChallenge?.id) {
        setUsers([]);
        return;
      }

      // temporarily show last week's challenge (the most recent one before the active challenge)
      const { data: lastWeekChallenge, error: lastWeekError } = await supabase
        .from('challenges')
        .select('id, title, title_it')
        .lt('created_at', activeChallenge.created_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastWeekError) throw lastWeekError;
      const challengeId = lastWeekChallenge?.id ?? activeChallenge.id;

      const title = (lastWeekChallenge as any)?.title ?? (activeChallenge as any)?.title ?? null;
      setChallengeTitle(title);

      const { data, error: submissionsError } = await supabase
        .from('post')
        .select(
          `
          user_id,
          created_at,
          body,
          profiles:user_id (
            id,
            username,
            profile_media:media!profiles_profile_media_id_fkey (file_path)
          )
        `
        )
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (submissionsError) throw submissionsError;

      const seen = new Set<string>();
      const mapped: ChallengeCompleter[] = [];

      for (const row of data || []) {
        const profile = Array.isArray((row as any).profiles)
          ? (row as any).profiles[0]
          : (row as any).profiles;

        const id = profile?.id || (row as any).user_id;
        if (!id || seen.has(id)) continue;
        seen.add(id);

        const media = Array.isArray(profile?.profile_media)
          ? profile.profile_media[0]
          : profile?.profile_media;

        const profileImageUrl = media?.file_path
          ? imageService.getProfileImageUrlSync(media.file_path, 'tiny')
          : null;

        mapped.push({
          id,
          username: profile?.username ?? null,
          profileImageUrl,
          latestPostBody: (row as any)?.body ?? null,
        });
      }

      setUsers(mapped);
    } catch (e) {
      console.error('Error fetching challenge completers:', e);
      setUsers([]);
      setChallengeTitle(null);
      setError(e instanceof Error ? e.message : 'Failed to fetch challenge completers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompleters();
  }, [fetchCompleters]);

  return { users, challengeTitle, loading, error, refetch: fetchCompleters };
}
