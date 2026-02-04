import { useState, useCallback } from 'react';
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

const PROFILE_SELECT = `
  id,
  username,
  name,
  is_recently_active,
  profile_media:media!profiles_profile_media_id_fkey (file_path)
`;

export const useRecentlyActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState<RecentlyActiveUser[]>([]);
  const [activeTodayCount, setActiveTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Get count and first page in parallel
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

      setActiveTodayCount(countResult.count || 0);
      const profiles = profilesResult.data || [];
      setActiveUsers(mapProfiles(profiles));
      setHasMore(profiles.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching recently active users:', error);
      setActiveUsers([]);
      setActiveTodayCount(0);
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
        return [...prev, ...newUsers.filter((u) => !ids.has(u.id))];
      });
      setHasMore((profiles || []).length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [activeUsers.length, loadingMore, hasMore]);

  return { activeUsers, activeTodayCount, loading, loadingMore, hasMore, fetchUsers, loadMore };
};

function mapProfiles(profiles: any[]): RecentlyActiveUser[] {
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
