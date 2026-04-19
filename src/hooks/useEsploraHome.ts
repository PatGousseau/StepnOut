import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { contentService } from '../services/contentService';

const RECENT_PAGE_SIZE = 10;

export const useFeaturedPiece = () =>
  useQuery({
    queryKey: ['esplora', 'featured'],
    queryFn: () => contentService.fetchFeaturedPiece(),
    staleTime: 60_000,
  });

export const useRecentPieces = () =>
  useInfiniteQuery({
    queryKey: ['esplora', 'recent'],
    queryFn: ({ pageParam = 0 }) =>
      contentService.fetchRecentPieces(RECENT_PAGE_SIZE, pageParam as number),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < RECENT_PAGE_SIZE
        ? undefined
        : allPages.length * RECENT_PAGE_SIZE,
    initialPageParam: 0,
    staleTime: 60_000,
  });
