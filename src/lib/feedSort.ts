import { Post } from "../types";

export type FeedSort = "recent" | "popular";

const WEIGHT_LIKE = 1;
const WEIGHT_COMMENT = 2;
const GRAVITY = 1.5;

function safeParseDateMs(iso: string | undefined): number {
  if (!iso) return 0;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

export function popularScore(post: Post, nowMs: number = Date.now()): number {
  const createdMs = safeParseDateMs(post.created_at);
  const ageHours = Math.max(0, (nowMs - createdMs) / 36e5);

  const likes = post.likes_count || 0;
  const comments = post.comments_count || 0;
  const engagement = likes * WEIGHT_LIKE + comments * WEIGHT_COMMENT;

  // higher engagement helps, but decays fast with age so "popular" feels like "trending"
  return engagement / Math.pow(ageHours + 2, GRAVITY);
}

export function sortFeedPosts(posts: Post[], sort: FeedSort): Post[] {
  const nowMs = Date.now();

  const sorted = [...posts].sort((a, b) => {
    const aWelcome = !!a.is_welcome;
    const bWelcome = !!b.is_welcome;
    if (aWelcome !== bWelcome) return aWelcome ? -1 : 1;

    if (sort === "popular") {
      const diff = popularScore(b, nowMs) - popularScore(a, nowMs);
      if (diff !== 0) return diff;
    }

    return safeParseDateMs(b.created_at) - safeParseDateMs(a.created_at);
  });

  return sorted;
}
