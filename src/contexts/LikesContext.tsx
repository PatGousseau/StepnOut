import React, { createContext, useContext, useState } from 'react';
import { postService } from '../services/postService';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LikesContextType {
  likedPosts: { [postId: number]: boolean };
  likeCounts: { [postId: number]: number };
  toggleLike: (postId: number, userId: string, postUserId: string) => Promise<void>;
  initializeLikes: (posts: Post[]) => Promise<void>;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export const LikesProvider = ({ children }: { children: React.ReactNode }) => {
  const [likedPosts, setLikedPosts] = useState<{ [postId: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [postId: number]: number }>({});
  const { user } = useAuth();

  const initializeLikes = async (posts: Post[]) => {
    const postIds = posts.map(post => post.id);
    
    // Fetch likes status and counts separately
    const [likesMap, countsMap] = await Promise.all([
      postService.fetchPostsLikes(postIds, user?.id),
      postService.fetchLikesCounts(postIds)
    ]);
    
    // Merge new likes data with existing data
    setLikedPosts(prev => ({
      ...prev,
      ...Object.fromEntries(
        postIds.map(postId => [postId, likesMap[postId]?.isLiked || false])
      )
    }));

    setLikeCounts(prev => ({
      ...prev,
      ...countsMap
    }));
  };

  const toggleLike = async (postId: number, userId: string, postUserId: string) => {
    const isCurrentlyLiked = likedPosts[postId];
    
    // Optimistic update
    setLikedPosts(prev => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setLikeCounts(prev => ({ 
      ...prev, 
      [postId]: prev[postId] + (isCurrentlyLiked ? -1 : 1)
    }));

    try {
      const result = await postService.toggleLike(postId, userId, postUserId, {
        title: '(username)',
        body: 'liked your post'
      });

      if (result === null) {
        // Revert on failure
        setLikedPosts(prev => ({ ...prev, [postId]: isCurrentlyLiked }));
        setLikeCounts(prev => ({ 
          ...prev, 
          [postId]: prev[postId] + (isCurrentlyLiked ? 1 : -1)
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setLikedPosts(prev => ({ ...prev, [postId]: isCurrentlyLiked }));
      setLikeCounts(prev => ({ 
        ...prev, 
        [postId]: prev[postId] + (isCurrentlyLiked ? 1 : -1)
      }));
    }
  };

  return (
    <LikesContext.Provider value={{ 
      likedPosts, 
      likeCounts, 
      toggleLike,
      initializeLikes 
    }}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
}; 