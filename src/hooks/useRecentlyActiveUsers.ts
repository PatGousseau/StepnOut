import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { imageService } from '../services/imageService';

export interface RecentlyActiveUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl: string | null;
  isActiveToday: boolean;
}

export const useRecentlyActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState<RecentlyActiveUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          name,
          is_recently_active,
          profile_media:media!profiles_profile_media_id_fkey (file_path)
        `)
        .not('profile_media_id', 'is', null)
        .order('is_recently_active', { ascending: false });

      if (error) throw error;

      const users = await Promise.all(
        (profiles || []).map(async (profile) => {
          const media = Array.isArray(profile.profile_media) 
            ? profile.profile_media[0] 
            : profile.profile_media;
          
          let profileImageUrl = null;
          if (media?.file_path) {
            try {
              profileImageUrl = (await imageService.getProfileImageUrl(media.file_path, 'small')).fullUrl;
            } catch (error) {
              console.error('Error getting profile image:', error);
            }
          }

          return {
            id: profile.id,
            username: profile.username || 'Unknown',
            name: profile.name || 'Unknown',
            profileImageUrl,
            isActiveToday: profile.is_recently_active || false,
          };
        })
      );

      // Filter out users without valid profile images
      const usersWithPictures = users.filter(user => user.profileImageUrl !== null);
      setActiveUsers(usersWithPictures);
    } catch (error) {
      console.error('Error fetching recently active users:', error);
      setActiveUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({ activeUsers, loading, fetchUsers }),
    [activeUsers, loading, fetchUsers]
  );
};

