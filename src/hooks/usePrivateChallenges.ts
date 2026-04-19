import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  PrivateChallengeDifficulty,
  PrivateChallengeQuestionnaireDraft,
} from "../types/privateChallenges";
import {
  computePrivateChallengeStats,
  getLocalDateString,
  privateChallengeService,
} from "../services/privateChallengeService";

export function usePrivateChallenges() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["private-challenge-profile", user?.id],
    queryFn: () => privateChallengeService.fetchProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const todaySetQuery = useQuery({
    queryKey: ["private-challenge-today", user?.id, language],
    queryFn: () => privateChallengeService.fetchOrCreateTodaySet(getLocalDateString(), language),
    enabled: !!user?.id && !!profileQuery.data,
    staleTime: 30000,
  });

  const historyQuery = useQuery({
    queryKey: ["private-challenge-history", user?.id],
    queryFn: () => privateChallengeService.fetchHistory(user!.id),
    enabled: !!user?.id && !!profileQuery.data,
    staleTime: 30000,
  });

  const saveProfileMutation = useMutation({
    mutationFn: (draft: PrivateChallengeQuestionnaireDraft) =>
      privateChallengeService.saveProfile(user!.id, draft),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["private-challenge-profile", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["private-challenge-today", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["private-challenge-history", user?.id] }),
      ]);
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ setId, difficulty, note }: { setId: number; difficulty: PrivateChallengeDifficulty; note: string }) =>
      privateChallengeService.completeSet(setId, difficulty, note),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["private-challenge-today", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["private-challenge-history", user?.id] }),
      ]);
    },
  });

  const skipMutation = useMutation({
    mutationFn: (setId: number) => privateChallengeService.skipSet(setId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["private-challenge-today", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["private-challenge-history", user?.id] }),
      ]);
    },
  });

  const stats = useMemo(
    () => computePrivateChallengeStats(historyQuery.data || []),
    [historyQuery.data]
  );

  return {
    profile: profileQuery.data || null,
    profileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    todaySet: todaySetQuery.data || null,
    todaySetLoading: todaySetQuery.isLoading,
    todaySetError: todaySetQuery.error,
    history: historyQuery.data || [],
    historyLoading: historyQuery.isLoading,
    historyError: historyQuery.error,
    stats,
    saveProfile: saveProfileMutation.mutateAsync,
    savingProfile: saveProfileMutation.isPending,
    completeChallenge: completeMutation.mutateAsync,
    completingChallenge: completeMutation.isPending,
    skipToday: skipMutation.mutateAsync,
    skippingToday: skipMutation.isPending,
  };
}
