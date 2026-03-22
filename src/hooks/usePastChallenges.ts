import { useQuery } from "@tanstack/react-query";
import { challengeService } from "../services/challengeService";

export function usePastChallenges(excludeChallengeId?: number) {
  const {
    data: pastChallenges,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["past-challenges", excludeChallengeId],
    queryFn: () => challengeService.fetchPastChallengesFromPosts(excludeChallengeId),
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  return {
    pastChallenges: pastChallenges ?? [],
    loading: isLoading,
    error,
    refetch,
    isRefetching,
  };
}
