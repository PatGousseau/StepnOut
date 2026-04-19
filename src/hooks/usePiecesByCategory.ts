import { useInfiniteQuery } from '@tanstack/react-query';
import { contentService } from '../services/contentService';
import { ContentCategory } from '../types';

const PAGE_SIZE = 10;

export const usePiecesByCategory = (category: ContentCategory) =>
  useInfiniteQuery({
    queryKey: ['esplora', 'category', category],
    queryFn: ({ pageParam = 0 }) =>
      contentService.fetchPiecesByCategory(
        category,
        PAGE_SIZE,
        pageParam as number
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
    initialPageParam: 0,
    staleTime: 60_000,
  });
