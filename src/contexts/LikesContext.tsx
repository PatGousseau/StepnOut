import React, { createContext, useContext, useState } from 'react';
import { postService } from '../services/postService';
import { Post } from '../types';

interface LikesContextType {
  likedPosts: { [postId: number]: boolean };
  likeCounts: { [postId: number]: number };
  toggleLike: (postId: number, userId: string, postUserId: string) => Promise<void>;
  initializeLikes: (posts: Post[]) => void;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export const LikesProvider = ({ children }) => {
  const [likedPosts, setLikedPosts] = useState<{ [postId: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [postId: number]: number }>({});

  const initializeLikes = (posts: Post[]) => {
    const initialLikeCounts = posts.reduce((acc, post) => ({
      ...acc,
      [post.id]: post.likes_count || 0
    }), {});
    
    const initialLikedState = posts.reduce((acc, post) => ({
      ...acc,
      [post.id]: post.liked || false
    }), {});

    setLikeCounts(initialLikeCounts);
    setLikedPosts(initialLikedState);
  };

  const toggleLike = async (postId: number, userId: string, postUserId: string) => {
    // Optimistic update
    const isCurrentlyLiked = likedPosts[postId];
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