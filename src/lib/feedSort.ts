import { Post } from "../types";

export type FeedSort = "recent" | "popular";

type PostWithRecent = Post & {
  recent_likes_count?: number;
  recent_comments_count?: number;
};

function safeParseDateMs(iso: string | undefined): number {
  if (!iso) return 0;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

export function popularScore(post: PostWithRecent): number {
  const recentLikes = post.recent_likes_count ?? 0;
  const recentComments = post.recent_comments_count ?? 0;

  // real "popular" = recent velocity (timestamps), not just total counts.
  // fall back to total counts if recent counts aren't present.
  const likes = recentLikes || post.likes_count || 0;
  const comments = recentComments || post.comments_count || 0;

  return likes + 2 * comments;
}

export function sortFeedPosts(posts: Post[], sort: FeedSort): Post[] {
  const sorted = [...posts].sort((a, b) => {
    const aWelcome = !!a.is_welcome;
    const bWelcome = !!b.is_welcome;
    if (aWelcome !== bWelcome) return aWelcome ? -1 : 1;

    if (sort === "popular") {
      const diff = popularScore(b as PostWithRecent) - popularScore(a as PostWithRecent);
      if (diff !== 0) return diff;
    }

    return safeParseDateMs(b.created_at) - safeParseDateMs(a.created_at);
  });

  return sorted;
}
