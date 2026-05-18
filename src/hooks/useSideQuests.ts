import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { DailySideQuestStatus, SideQuestProfile, SideQuestQuestionnaireDraft } from "../types/sideQuests";
import { sideQuestService } from "../services/sideQuestService";
import { rankSideQuests } from "../utils/sideQuestMatching";

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  for (const item of b) {
    if (!setA.has(item)) return false;
  }
  return true;
}

function hasQuestionnaireChanged(profile: SideQuestProfile, draft: SideQuestQuestionnaireDraft) {
  return !(
    sameSet(profile.goal ?? [], draft.goal) &&
    sameSet(profile.hard_situation ?? [], draft.hard_situation) &&
    (profile.stretch_level ?? null) === draft.stretch_level &&
    sameSet(profile.preferred_context ?? [], draft.preferred_context) &&
    sameSet(profile.meaningful_type ?? [], draft.meaningful_type) &&
    sameSet(profile.avoid_types ?? [], draft.avoid_types) &&
    sameSet(profile.progress_definition ?? [], draft.progress_definition)
  );
}

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
  const userId = user?.id;

  const profileQuery = useQuery({
    queryKey: ["side-quest-profile", userId],
    queryFn: () => sideQuestService.fetchProfile(user!.id),
    enabled: !!userId,
    staleTime: 30000,
  });

  const sideQuestsQuery = useQuery({
    queryKey: ["side-quests"],
    queryFn: () => sideQuestService.fetchSideQuests(),
    enabled: !!userId && !!profileQuery.data,
    staleTime: 30000,
  });

  const saveProfileMutation = useMutation({
    mutationFn: (draft: SideQuestQuestionnaireDraft) => sideQuestService.saveProfile(user!.id, draft),
    onMutate: async (draft) => {
      const previous = profileQuery.data;
      const changed = !!previous && hasQuestionnaireChanged(previous, draft);
      return { changed };
    },
    onSuccess: async (profile, draft, context) => {
      if (!userId) return;

      queryClient.setQueryData(["side-quest-profile", userId], profile);

      if (context?.changed) {
        await sideQuestService.deleteDailyDraw(userId, localDay);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["side-quest-profile", userId] }),
        queryClient.invalidateQueries({ queryKey: ["side-quests"] }),
        queryClient.invalidateQueries({ queryKey: ["side-quest-draw", userId, localDay] }),
      ]);
    },
  });

  const rankedSideQuests = useMemo(() => {
    if (!profileQuery.data || !sideQuestsQuery.data) return [];
    return rankSideQuests(profileQuery.data, sideQuestsQuery.data);
  }, [profileQuery.data, sideQuestsQuery.data]);

  const dailyDrawQuery = useQuery({
    queryKey: ["side-quest-draw", userId, localDay],
    queryFn: () => sideQuestService.fetchDailyDraw(user!.id, localDay),
    enabled: !!userId && !!profileQuery.data && rankedSideQuests.length > 0,
    staleTime: 30000,
  });

  const drawDailyQuestMutation = useMutation({
    mutationFn: () => sideQuestService.claimDailyQuest(user!.id, rankedSideQuests, localDay),
    onSuccess: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({ queryKey: ["side-quest-draw", userId, localDay] });
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
