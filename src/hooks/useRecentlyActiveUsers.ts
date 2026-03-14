import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { imageService } from '../services/imageService';

const PAGE_SIZE = 20;

export interface RecentlyActiveUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl: string | null;
  isActiveToday: boolean;
}

type ProfileRow = {
  id: string;
  username?: string | null;
  name?: string | null;
  is_recently_active?: boolean | null;
  profile_media?: { file_path?: string | null } | Array<{ file_path?: string | null }> | null;
};

const PROFILE_SELECT = `
  id,
  username,
  name,
  is_recently_active,
  profile_media:media!profiles_profile_media_id_fkey (file_path)
`;

async function fetchRecentlyActiveCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_recently_active', true)
    .not('profile_media_id', 'is', null);

  if (error) throw error;
  return count || 0;
}

async function fetchRecentlyActivePage(pageParam: number): Promise<RecentlyActiveUser[]> {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .not('profile_media_id', 'is', null)
    .order('is_recently_active', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return mapProfiles((data || []) as ProfileRow[]);
}

export const useRecentlyActiveUsers = () => {
  const countQuery = useQuery({
    queryKey: ['recently-active-count'],
    queryFn: fetchRecentlyActiveCount,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const usersQuery = useInfiniteQuery({
    queryKey: ['recently-active-users'],
    queryFn: ({ pageParam }) => fetchRecentlyActivePage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const activeUsers = useMemo(() => {
    const pages = usersQuery.data?.pages || [];
    const seen = new Set<string>();

    return pages
      .flat()
      .filter((u) => {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });
  }, [usersQuery.data?.pages]);

  const fetchUsers = useCallback(async () => {
    await Promise.all([countQuery.refetch(), usersQuery.refetch()]);
  }, [countQuery, usersQuery]);

  const loadMore = useCallback(async () => {
    if (!usersQuery.hasNextPage || usersQuery.isFetchingNextPage) return;
    await usersQuery.fetchNextPage();
  }, [usersQuery]);

  return {
    activeUsers,
    activeTodayCount: countQuery.data || 0,
    loading: countQuery.isLoading || usersQuery.isLoading,
    loadingMore: usersQuery.isFetchingNextPage,
    hasMore: !!usersQuery.hasNextPage,
    fetchUsers,
    loadMore,
  };
};

function mapProfiles(profiles: ProfileRow[]): RecentlyActiveUser[] {
  const seen = new Set<string>();
  return profiles
    .map((p) => {
      const media = Array.isArray(p.profile_media) ? p.profile_media[0] : p.profile_media;
      return {
        id: p.id,
        username: p.username || 'Unknown',
        name: p.name || 'Unknown',
        profileImageUrl: media?.file_path
          ? imageService.getProfileImageUrlSync(media.file_path, 'tiny')
          : null,
        isActiveToday: p.is_recently_active || false,
      };
    })
    .filter((u): u is RecentlyActiveUser => {
      if (!u.profileImageUrl || seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
}
