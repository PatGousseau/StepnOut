import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { imageService } from '../services/imageService';

const PAGE_SIZE = 20;
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface RecentlyActiveUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl: string | null;
  isActiveToday: boolean;
}

type RecentlyActiveCache = {
  activeUsers: RecentlyActiveUser[];
  activeTodayCount: number;
  hasMore: boolean;
  timestamp: number;
};

let recentlyActiveCache: RecentlyActiveCache | null = null;

const PROFILE_SELECT = `
  id,
  username,
  name,
  is_recently_active,
  profile_media:media!profiles_profile_media_id_fkey (file_path)
`;

export const useRecentlyActiveUsers = () => {
  const cacheIsFresh = !!recentlyActiveCache && Date.now() - recentlyActiveCache.timestamp < CACHE_TTL_MS;

  const [activeUsers, setActiveUsers] = useState<RecentlyActiveUser[]>(
    cacheIsFresh ? recentlyActiveCache!.activeUsers : []
  );
  const [activeTodayCount, setActiveTodayCount] = useState(
    cacheIsFresh ? recentlyActiveCache!.activeTodayCount : 0
  );
  const [loading, setLoading] = useState(!cacheIsFresh);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(cacheIsFresh ? recentlyActiveCache!.hasMore : true);

  const fetchUsers = useCallback(async () => {
    const hasCache = !!recentlyActiveCache;
    const isFresh = hasCache && Date.now() - recentlyActiveCache!.timestamp < CACHE_TTL_MS;

    if (hasCache) {
      setActiveUsers(recentlyActiveCache!.activeUsers);
      setActiveTodayCount(recentlyActiveCache!.activeTodayCount);
      setHasMore(recentlyActiveCache!.hasMore);
    }

    // If cache is still fresh, avoid a refetch to keep UI instant on back nav
    if (isFresh) {
      setLoading(false);
      return;
    }

    // For stale/no cache, fetch. If we already have cached data, keep showing it without loader flash.
    setLoading(!hasCache);
    try {
      const [countResult, profilesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_recently_active', true)
          .not('profile_media_id', 'is', null),
        supabase
          .from('profiles')
          .select(PROFILE_SELECT)
          .not('profile_media_id', 'is', null)
          .order('is_recently_active', { ascending: false })
          .range(0, PAGE_SIZE - 1),
      ]);

      const nextActiveTodayCount = countResult.count || 0;
      const profiles = profilesResult.data || [];
      const nextActiveUsers = mapProfiles(profiles);
      const nextHasMore = profiles.length === PAGE_SIZE;

      setActiveTodayCount(nextActiveTodayCount);
      setActiveUsers(nextActiveUsers);
      setHasMore(nextHasMore);

      recentlyActiveCache = {
        activeUsers: nextActiveUsers,
        activeTodayCount: nextActiveTodayCount,
        hasMore: nextHasMore,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching recently active users:', error);
      if (!hasCache) {
        setActiveUsers([]);
        setActiveTodayCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const offset = activeUsers.length;
      const { data: profiles } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT)
        .not('profile_media_id', 'is', null)
        .order('is_recently_active', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      const newUsers = mapProfiles(profiles || []);
      setActiveUsers((prev) => {
        const ids = new Set(prev.map((u) => u.id));
        const merged = [...prev, ...newUsers.filter((u) => !ids.has(u.id))];

        recentlyActiveCache = {
          activeUsers: merged,
          activeTodayCount,
          hasMore: (profiles || []).length === PAGE_SIZE,
          timestamp: Date.now(),
        };

        return merged;
      });
      setHasMore((profiles || []).length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [activeUsers.length, loadingMore, hasMore, activeTodayCount]);

  return { activeUsers, activeTodayCount, loading, loadingMore, hasMore, fetchUsers, loadMore };
};

type ProfileRow = {
  id: string;
  username?: string | null;
  name?: string | null;
  is_recently_active?: boolean | null;
  profile_media?: { file_path?: string | null } | Array<{ file_path?: string | null }> | null;
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
