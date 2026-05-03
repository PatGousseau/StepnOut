import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../services/contentService';
import { CATEGORY_ORDER } from '../constants/EsploraStyles';
import { ContentCategory, ContentPiece } from '../types';

export const useFeaturedPiece = () =>
  useQuery({
    queryKey: ['esplora', 'featured'],
    queryFn: () => contentService.fetchFeaturedPiece(),
    staleTime: 60_000,
  });

export const useAllPieces = () =>
  useQuery({
    queryKey: ['esplora', 'all'],
    queryFn: () => contentService.fetchRecentPieces(200, 0),
    staleTime: 60_000,
  });

export interface CategorySectionData {
  category: ContentCategory;
  pieces: ContentPiece[];
}

export const useCategorySections = (): {
  sections: CategorySectionData[];
  isLoading: boolean;
  pieces: ContentPiece[];
} => {
  const query = useAllPieces();
  const pieces = useMemo(() => query.data ?? [], [query.data]);

  const sections = useMemo<CategorySectionData[]>(() => {
    const byCategory = new Map<ContentCategory, ContentPiece[]>();
    for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
    for (const piece of pieces) {
      byCategory.get(piece.category)?.push(piece);
    }
    return CATEGORY_ORDER.map((category) => ({
      category,
      pieces: byCategory.get(category) ?? [],
    }));
  }, [pieces]);

  return { sections, isLoading: query.isLoading, pieces };
};
