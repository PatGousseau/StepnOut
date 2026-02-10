import React, { createContext, useContext, useMemo, useState } from "react";
import { postService } from "../services/postService";
import { useAuth } from "./AuthContext";
import { Comment, LikeableItem, Post, ReactionSummary } from "../types";

type ReactionMap = { [itemId: number]: ReactionSummary[] };

interface ReactionsContextType {
  postReactions: ReactionMap;
  commentReactions: ReactionMap;
  initializePostReactions: (posts: Post[]) => Promise<void>;
  initializeCommentReactions: (comments: Comment[]) => Promise<void>;
  togglePostReaction: (postId: number, userId: string, postUserId: string, emoji: string) => Promise<void>;
  toggleCommentReaction: (
    commentId: number,
    postId: number,
    userId: string,
    commentUserId: string,
    emoji: string
  ) => Promise<void>;
}

const ReactionsContext = createContext<ReactionsContextType | undefined>(undefined);

const upsertReaction = (
  current: ReactionSummary[] | undefined,
  emoji: string,
  delta: 1 | -1,
  reacted: boolean
) => {
  const list = current ? [...current] : [];
  const idx = list.findIndex((r) => r.emoji === emoji);

  if (idx === -1) {
    if (delta === 1) {
      list.push({ emoji, count: 1, reacted });
    }
  } else {
    const nextCount = list[idx].count + delta;
    if (nextCount <= 0) {
      list.splice(idx, 1);
    } else {
      list[idx] = { ...list[idx], count: nextCount, reacted };
    }
  }

  list.sort((a, b) => {
    if (a.reacted !== b.reacted) return a.reacted ? -1 : 1;
    if (b.count !== a.count) return b.count - a.count;
    return a.emoji.localeCompare(b.emoji);
  });

  return list;
};

export const ReactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [postReactions, setPostReactions] = useState<ReactionMap>({});
  const [commentReactions, setCommentReactions] = useState<ReactionMap>({});
  const [pending, setPending] = useState<{ [key: string]: boolean }>({});

  const initializeReactions = async (items: (Post | Comment)[], type: LikeableItem["type"]) => {
    const ids = items.map((i) => i.id);
    if (ids.length === 0) return;

    const map = await postService.fetchReactions(ids, type, user?.id);
    const setFn = type === "post" ? setPostReactions : setCommentReactions;

    setFn((prev) => ({
      ...prev,
      ...map,
    }));
  };

  const toggleReaction = async (
    item: LikeableItem,
    userId: string,
    targetUserId: string,
    emoji: string
  ) => {
    const normalized = emoji.trim();
    if (!normalized) return;

    const key = `${item.type}:${item.id}:${normalized}`;
    if (pending[key]) return;

    const isPost = item.type === "post";
    const setMap = isPost ? setPostReactions : setCommentReactions;
    const map = isPost ? postReactions : commentReactions;

    const current = map[item.id] || [];
    const existing = current.find((r) => r.emoji === normalized);
    const isReacted = !!existing?.reacted;

    setPending((prev) => ({ ...prev, [key]: true }));
    setMap((prev) => ({
      ...prev,
      [item.id]: upsertReaction(prev[item.id], normalized, isReacted ? -1 : 1, !isReacted),
    }));

    const translations = {
      title: `(username) reacted ${normalized} to your ${item.type}!`,
      body: `Check it out now.`,
    };

    try {
      const result = await postService.toggleReaction(item, userId, targetUserId, normalized, translations);
      if (result === null) {
        setMap((prev) => ({
          ...prev,
          [item.id]: upsertReaction(prev[item.id], normalized, isReacted ? 1 : -1, isReacted),
        }));
      }
    } finally {
      setPending((prev) => ({ ...prev, [key]: false }));
    }
  };

  const value = useMemo(
    () => ({
      postReactions,
      commentReactions,
      initializePostReactions: (posts: Post[]) => initializeReactions(posts, "post"),
      initializeCommentReactions: (comments: Comment[]) => initializeReactions(comments, "comment"),
      togglePostReaction: (postId: number, userId: string, postUserId: string, emoji: string) =>
        toggleReaction({ id: postId, type: "post" }, userId, postUserId, emoji),
      toggleCommentReaction: (
        commentId: number,
        postId: number,
        userId: string,
        commentUserId: string,
        emoji: string
      ) => toggleReaction({ id: commentId, type: "comment", parentId: postId }, userId, commentUserId, emoji),
    }),
    [postReactions, commentReactions, user?.id, pending]
  );

  return <ReactionsContext.Provider value={value}>{children}</ReactionsContext.Provider>;
};

export const useReactions = () => {
  const ctx = useContext(ReactionsContext);
  if (!ctx) throw new Error("useReactions must be used within a ReactionsProvider");
  return ctx;
};
