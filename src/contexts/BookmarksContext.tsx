import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { contentService } from '../services/contentService';
import { ContentPiece } from '../types';
import { useAuth } from './AuthContext';
import { captureEvent } from '../lib/posthog';
import { ESPLORA_EVENTS } from '../constants/analyticsEvents';

interface BookmarksContextType {
  bookmarkedPieces: { [pieceId: number]: boolean };
  initializeBookmarks: (pieces: ContentPiece[]) => Promise<void>;
  isBookmarked: (pieceId: number) => boolean;
  toggleBookmark: (pieceId: number) => Promise<void>;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookmarkedPieces, setBookmarkedPieces] = useState<{ [pieceId: number]: boolean }>({});
  const [pendingBookmarks, setPendingBookmarks] = useState<{ [pieceId: number]: boolean }>({});

  // Clear local state when the user signs out or changes.
  useEffect(() => {
    if (!user?.id) {
      setBookmarkedPieces({});
    }
  }, [user?.id]);

  const initializeBookmarks = useCallback(
    async (pieces: ContentPiece[]) => {
      if (!user?.id || pieces.length === 0) return;
      const bookmarkSet = await contentService.fetchUserBookmarkSet(user.id);
      setBookmarkedPieces((prev) => {
        const next = { ...prev };
        pieces.forEach((piece) => {
          next[piece.id] = bookmarkSet.has(piece.id);
        });
        return next;
      });
    },
    [user?.id]
  );

  const isBookmarked = useCallback(
    (pieceId: number) => !!bookmarkedPieces[pieceId],
    [bookmarkedPieces]
  );

  const toggleBookmark = useCallback(
    async (pieceId: number) => {
      if (!user?.id) return;
      if (pendingBookmarks[pieceId]) return;

      const currentlyBookmarked = !!bookmarkedPieces[pieceId];

      setPendingBookmarks((prev) => ({ ...prev, [pieceId]: true }));
      setBookmarkedPieces((prev) => ({ ...prev, [pieceId]: !currentlyBookmarked }));

      try {
        const newState = await contentService.toggleBookmark(
          user.id,
          pieceId,
          currentlyBookmarked
        );
        setBookmarkedPieces((prev) => ({ ...prev, [pieceId]: newState }));
        captureEvent(ESPLORA_EVENTS.BOOKMARK_TOGGLED, {
          piece_id: pieceId,
          state: newState ? 'added' : 'removed',
        });
        // Invalidate the saved list so Salvati updates next time it opens.
        queryClient.invalidateQueries({ queryKey: ['esplora', 'bookmarked', user.id] });
      } catch (error) {
        console.error('Error toggling bookmark:', error);
        setBookmarkedPieces((prev) => ({ ...prev, [pieceId]: currentlyBookmarked }));
      } finally {
        setPendingBookmarks((prev) => ({ ...prev, [pieceId]: false }));
      }
    },
    [user?.id, bookmarkedPieces, pendingBookmarks, queryClient]
  );

  return (
    <BookmarksContext.Provider
      value={{
        bookmarkedPieces,
        initializeBookmarks,
        isBookmarked,
        toggleBookmark,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
};
