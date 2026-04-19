import { supabase } from '../lib/supabase';
import { ContentCategory, ContentPiece } from '../types';

const BASE_COLUMNS = `
  id,
  title,
  category,
  hook,
  cards,
  closing_kind,
  closing_text,
  closing_challenge_id,
  external_link_url,
  external_link_label,
  cover_image_path,
  linked_challenge_id,
  is_published,
  is_featured,
  published_at,
  created_at,
  updated_at
`;

type ContentPieceRow = Omit<ContentPiece, 'cards'> & { cards: unknown };

const normalizePiece = (row: ContentPieceRow): ContentPiece => ({
  ...row,
  cards: Array.isArray(row.cards) ? (row.cards as string[]) : [],
});

export const contentService = {
  async fetchFeaturedPiece(): Promise<ContentPiece | null> {
    const { data, error } = await supabase
      .from('content_pieces')
      .select(BASE_COLUMNS)
      .eq('is_published', true)
      .eq('is_featured', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching featured piece:', error);
      return null;
    }
    return data ? normalizePiece(data) : null;
  },

  async fetchRecentPieces(
    limit: number,
    offset: number
  ): Promise<ContentPiece[]> {
    const { data, error } = await supabase
      .from('content_pieces')
      .select(BASE_COLUMNS)
      .eq('is_published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching recent pieces:', error);
      return [];
    }
    return (data ?? []).map(normalizePiece);
  },

  async fetchPiecesByCategory(
    category: ContentCategory,
    limit: number,
    offset: number
  ): Promise<ContentPiece[]> {
    const { data, error } = await supabase
      .from('content_pieces')
      .select(BASE_COLUMNS)
      .eq('is_published', true)
      .eq('category', category)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching pieces by category:', error);
      return [];
    }
    return (data ?? []).map(normalizePiece);
  },

  async fetchPieceById(id: number): Promise<ContentPiece | null> {
    const { data, error } = await supabase
      .from('content_pieces')
      .select(BASE_COLUMNS)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching piece by id:', error);
      return null;
    }
    return data ? normalizePiece(data) : null;
  },

  async fetchBookmarkedPieces(userId: string): Promise<ContentPiece[]> {
    const { data, error } = await supabase
      .from('content_bookmarks')
      .select(`created_at, content_pieces(${BASE_COLUMNS})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarked pieces:', error);
      return [];
    }
    const rows = (data ?? []) as unknown as Array<{
      content_pieces: ContentPieceRow | null;
    }>;
    return rows
      .map((row) => row.content_pieces)
      .filter((piece): piece is ContentPieceRow => piece !== null)
      .map(normalizePiece);
  },

  async fetchUserBookmarkSet(userId: string): Promise<Set<number>> {
    const { data, error } = await supabase
      .from('content_bookmarks')
      .select('piece_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user bookmarks:', error);
      return new Set();
    }
    const rows = (data ?? []) as Array<{ piece_id: number }>;
    return new Set(rows.map((row) => row.piece_id));
  },

  async toggleBookmark(
    userId: string,
    pieceId: number,
    currentlyBookmarked: boolean
  ): Promise<boolean> {
    if (currentlyBookmarked) {
      const { error } = await supabase
        .from('content_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('piece_id', pieceId);
      if (error) {
        console.error('Error removing bookmark:', error);
        throw error;
      }
      return false;
    }

    const { error } = await supabase
      .from('content_bookmarks')
      .insert({ user_id: userId, piece_id: pieceId });
    if (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
    return true;
  },
};
