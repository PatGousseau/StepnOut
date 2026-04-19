import { useQuery } from '@tanstack/react-query';
import { contentService } from '../services/contentService';

export const usePiece = (id: number | null) =>
  useQuery({
    queryKey: ['esplora', 'piece', id],
    queryFn: () => (id == null ? null : contentService.fetchPieceById(id)),
    enabled: id != null && !Number.isNaN(id),
    staleTime: 5 * 60_000,
  });
