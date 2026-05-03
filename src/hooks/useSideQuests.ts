import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { SideQuestQuestionnaireDraft } from "../types/sideQuests";
import { sideQuestService } from "../services/sideQuestService";
import { rankSideQuests } from "../utils/sideQuestMatching";

export function useSideQuests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
    onSuccess: async () => {
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

  return {
    profile: profileQuery.data || null,
    profileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    rankedSideQuests,
    sideQuestsLoading: sideQuestsQuery.isLoading,
    sideQuestsError: sideQuestsQuery.error,
    saveProfile: saveProfileMutation.mutateAsync,
    savingProfile: saveProfileMutation.isPending,
  };
}
