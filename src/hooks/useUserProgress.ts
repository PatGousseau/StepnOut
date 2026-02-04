import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChallengeProgress, UserProgress, WeekData, Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

const useUserProgress = (targetUserId: string) => {
  const { user } = useAuth();
  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const POSTS_PER_PAGE = 10;

  const fetchUserPosts = async (page = 1, isLoadMore = false) => {
    setPostsLoading(true);
    try {
      // First fetch all posts
      const { data: posts, error } = await supabase
        .from('post')
        .select(`
          id,
          user_id,
          created_at,
          featured,
          body,
          media_id,
          challenge_id,
          is_welcome,
          challenges (title),
          media (
            file_path,
            upload_status
          ),
          likes:likes(count),
          comments (id, body, created_at, parent_comment_id, profiles:user_id (username))
        `)
        .eq('user_id', targetUserId)
        .neq("media.upload_status", "failed")
        .neq("media.upload_status", "pending")
        .order('created_at', { ascending: false })
        .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);

      if (error) throw error;

      // Drop welcome posts from profile feeds
      const transformedPosts = posts.map(post => ({
        ...post,
        challenge_title: post.challenges?.title
      })).filter(post => !post.is_welcome);

      // Then fetch like status separately
      const likedPostIds = new Set<string>();

      if (transformedPosts.length > 0) {
        const { data: likedPosts } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user?.id)
          .in('post_id', transformedPosts.map(post => post.id));

        likedPosts?.forEach(like => likedPostIds.add(like.post_id));
      }

      // Helper to extract up to 3 comment previews (oldest first)
      const getCommentPreviews = (post: any) => {
        if (post.comments && post.comments.length > 0) {
          // Sort by created_at ascending to get oldest first
          const sortedComments = [...post.comments].sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          // Create a map of comment id to username for reply lookups
          const commentUserMap = new Map<number, string>();
          for (const c of post.comments) {
            if (c?.id && c?.profiles?.username) {
              commentUserMap.set(c.id, c.profiles.username);
            }
          }
          const previews = sortedComments
            .slice(0, 3)
            .filter((c: any) => c?.body && c?.profiles?.username)
            .map((c: any) => ({
              username: c.profiles.username,
              text: c.body,
              replyToUsername: c.parent_comment_id ? commentUserMap.get(c.parent_comment_id) : undefined,
            }));
          return previews.length > 0 ? previews : undefined;
        }
        return undefined;
      };

      const formattedPosts: Post[] = transformedPosts.map(post => ({
        ...post,
        media: {
          file_path: post.media?.file_path
            ? `${supabase.storageUrl}/object/public/challenge-uploads/${post.media.file_path}`
            : null,
        },
        likes_count: post.likes?.[0]?.count ?? 0,
        comments_count: post.comments?.length ?? 0,
        comment_previews: getCommentPreviews(post),
        challenge_title: post.challenge_title,
        liked: likedPostIds.has(post.id)
      }));

      setUserPosts(prev => isLoadMore ? [...prev, ...formattedPosts] : formattedPosts);
      setHasMorePosts(posts.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      // Clear data and stop loading if there's no authenticated user
      setData(null);
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // First, get the active challenge
        const { data: activeChallenge, error: activeChallengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true)
          .single();

        if (activeChallengeError) throw activeChallengeError;
        if (!activeChallenge) throw new Error('No active challenge found');

        // Then get 8 previous challenges before the active one
        const { data: previousChallenges, error: previousChallengesError } = await supabase
          .from('challenges')
          .select('*')
          .lt('created_at', activeChallenge.created_at)
          .order('created_at', { ascending: false })
          .limit(8);

        if (previousChallengesError) throw previousChallengesError;

        // Combine active challenge with previous challenges
        const challenges = [activeChallenge, ...(previousChallenges || [])];

        // Fetch submissions for the user
        const { data: submissionData, error: submissionError } = await supabase
          .from('post')
          .select(`
            challenge_id,
            media (
              file_path,
              upload_status
            )
          `)
          .eq('user_id', user.id)
          .not('challenge_id', 'is', null)
          .neq("media.upload_status", "failed")
          .neq("media.upload_status", "pending");

        if (submissionError) throw submissionError;

        const completedChallengeIds = submissionData?.map(s => s.challenge_id) || [];

        // Create week data array from challenges
        const weekData: WeekData[] = challenges.slice(1).map((challenge, index) => ({
          week: index + 1,
          hasStreak: completedChallengeIds.includes(challenge.id),
          challengeId: challenge.id,
          startDate: challenge.created_at,
          endDate: challenge.updated_at,
          isActive: challenge.is_active,
          isCompleted: completedChallengeIds.includes(challenge.id)
        }));

        // For difficulty counts
        const { data: submissionsWithDifficulty, error: difficultyError } = await supabase
          .from('post')
          .select(`
            challenge_id,
            challenges!inner (
              difficulty
            )
          `)
          .eq('user_id', user.id);

        if (difficultyError) throw difficultyError;

        // Calculate completed challenges by difficulty
        const challengeData: ChallengeProgress = {
          easy: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'easy').length,
          medium: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'medium').length,
          hard: submissionsWithDifficulty.filter(s => s.challenges.difficulty === 'hard').length,
        };

        setData({ challengeData, weekData });
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch progress data');
        setData({ 
          challengeData: { easy: 0, medium: 0, hard: 0 }, 
          weekData: [] 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts(1);
    }
  }, [user?.id]);

  return {
    data,
    loading,
    error,
    userPosts,
    postsLoading,
    hasMorePosts,
    fetchUserPosts
  };
};

export default useUserProgress;
