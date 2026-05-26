import { useQuery } from '@tanstack/react-query';
import { contentService } from '../services/contentService';
import { useAuth } from '../contexts/AuthContext';

export const useBookmarkedPieces = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['esplora', 'bookmarked', user?.id],
    queryFn: () =>
      user?.id ? contentService.fetchBookmarkedPieces(user.id) : [],
    enabled: !!user?.id,
    staleTime: 30_000,
  });
};
