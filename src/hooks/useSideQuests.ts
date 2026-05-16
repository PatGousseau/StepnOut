import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { DailySideQuestStatus, SideQuestQuestionnaireDraft } from "../types/sideQuests";
import { sideQuestService } from "../services/sideQuestService";
import { rankSideQuests } from "../utils/sideQuestMatching";

function getLocalDayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useSideQuests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const localDay = getLocalDayString();

  const profileQuery = useQuery({
    queryKey: ["side-quest-profile", user?.id],
    queryFn: () => sideQuestService.fetchProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const sideQuestsQuery = useQuery({
    queryKey: ["side-quests"],
    queryFn: () => sideQuestService.fetchSideQuests(),
    enabled: !!user?.id && !!profileQuery.data,
    staleTime: 30000,
  });

  const saveProfileMutation = useMutation({
    mutationFn: (draft: SideQuestQuestionnaireDraft) =>
      sideQuestService.saveProfile(user!.id, draft),
    onSuccess: async (profile) => {
      queryClient.setQueryData(["side-quest-profile", user?.id], profile);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["side-quest-profile", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["side-quests"] }),
      ]);
    },
  });

  const rankedSideQuests = useMemo(() => {
    if (!profileQuery.data || !sideQuestsQuery.data) return [];
    return rankSideQuests(profileQuery.data, sideQuestsQuery.data);
  }, [profileQuery.data, sideQuestsQuery.data]);

  const dailyDrawQuery = useQuery({
    queryKey: ["side-quest-draw", user?.id, localDay],
    queryFn: () => sideQuestService.fetchDailyDraw(user!.id, localDay),
    enabled: !!user?.id && !!profileQuery.data && rankedSideQuests.length > 0,
    staleTime: 30000,
  });

  const drawDailyQuestMutation = useMutation({
    mutationFn: () => sideQuestService.claimDailyQuest(user!.id, rankedSideQuests, localDay),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["side-quest-draw", user?.id, localDay] });
    },
  });

  const todaysQuestState: DailySideQuestStatus = useMemo(() => {
    if (dailyDrawQuery.data?.quest) return "revealed";
    if (rankedSideQuests.length === 0) return "undrawn";
    if (dailyDrawQuery.isFetched && !dailyDrawQuery.data && rankedSideQuests.length > 0) {
      return "undrawn";
    }
    return drawDailyQuestMutation.data?.status === "exhausted" ? "exhausted" : "undrawn";
  }, [dailyDrawQuery.data, dailyDrawQuery.isFetched, drawDailyQuestMutation.data?.status, rankedSideQuests.length]);

  return {
    profile: profileQuery.data || null,
    profileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    rankedSideQuests,
    sideQuestsLoading: sideQuestsQuery.isLoading,
    sideQuestsError: sideQuestsQuery.error,
    todaysQuest: dailyDrawQuery.data?.quest || drawDailyQuestMutation.data?.quest || null,
    todaysQuestDraw: dailyDrawQuery.data?.draw || drawDailyQuestMutation.data?.draw || null,
    todaysQuestState,
    todaysQuestLoading: dailyDrawQuery.isLoading || drawDailyQuestMutation.isPending,
    drawTodaysQuest: drawDailyQuestMutation.mutateAsync,
    localDay,
    saveProfile: saveProfileMutation.mutateAsync,
    savingProfile: saveProfileMutation.isPending,
  };
}
