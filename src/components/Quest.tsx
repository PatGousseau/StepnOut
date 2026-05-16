import React from "react";
import { StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { colors } from "../constants/Colors";
import { Text } from "./StyledText";
import { SideQuest } from "../types/sideQuests";
import { captureEvent } from "../lib/posthog";
import { SIDE_QUEST_EVENTS, USER_PROPERTIES } from "../constants/analyticsEvents";
import { setUserProperties } from "../lib/posthog";
import { supabase } from "../lib/supabase";
import { CompletionPostComposer } from "./CompletionPostComposer";

interface QuestCardProps {
  quest: SideQuest;
  tags?: string[];
}

interface ShareQuestExperienceProps {
  quest: SideQuest;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, tags }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.questPage}>
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <View style={styles.heroLineOne} />
        <View style={styles.heroLineTwo} />
        <View style={styles.heroLineThree} />

        <View style={styles.heroHeaderContent}>
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>{t("Today's quest")}</Text>
            <Text style={styles.heroTitle}>{quest.title}</Text>
            {!!quest.summary && <Text style={styles.heroSummary}>{quest.summary}</Text>}

            {tags && tags.length > 0 && (
              <View style={styles.heroPills}>
                {tags.slice(0, 2).map((tag) => (
                  <View key={tag} style={styles.heroPill}>
                    <Text style={styles.heroPillText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {!!quest.instructions && (
          <>
            <View style={styles.heroDivider} />
            <View style={styles.heroDetailSection}>
              <View style={styles.heroDetailHeader}>
                <View style={styles.heroDetailIcon}>
                  <MaterialCommunityIcons name="compass-outline" size={16} color={colors.sideQuest.text} />
                </View>
                <Text style={styles.heroDetailLabel}>{t("Try this")}</Text>
              </View>
              <Text style={styles.heroDetailText}>{quest.instructions}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export const ShareQuestExperience: React.FC<ShareQuestExperienceProps> = ({ quest }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const questCompletionQuery = useQuery({
    queryKey: ["quest-completion", quest.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("post")
        .select("id")
        .eq("quest_id", quest.id)
        .eq("user_id", user.id)
        .limit(1);
      if (error) throw error;
      return !!data?.length;
    },
    enabled: !!user,
    staleTime: 30000,
  });

  const completed = questCompletionQuery.data ?? false;
  const checking = questCompletionQuery.isLoading;

  return (
    <CompletionPostComposer
      variant="quest"
      completed={completed}
      checkingCompletion={checking}
      buildSubmitData={({ userId }) => ({
        user_id: userId,
        quest_id: quest.id,
      })}
      onCompleted={({ selectedMedia }) => {
        queryClient.setQueryData(["quest-completion", quest.id, user?.id], true);
        queryClient.invalidateQueries({ queryKey: ["home-posts"] });
        captureEvent(SIDE_QUEST_EVENTS.DAILY_QUEST_COMPLETED, {
          quest_id: quest.id,
          quest_title: quest.title,
          has_media: !!selectedMedia,
          is_video: selectedMedia?.isVideo || false,
        });
        setUserProperties({
          [USER_PROPERTIES.LAST_ACTIVE]: new Date().toISOString(),
        });
      }}
    />
  );
};

const styles = StyleSheet.create({
  heroDetailHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  heroDetailIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroDetailLabel: {
    color: colors.sideQuest.text,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroDetailSection: {
    backgroundColor: colors.sideQuest.bg,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
  },
  heroDetailText: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 23,
  },
  heroDivider: {
    backgroundColor: colors.sideQuest.border,
    height: 1,
  },
  heroCard: {
    backgroundColor: colors.sideQuest.bgAlt,
    borderColor: colors.sideQuest.bgBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    overflow: "hidden",
    position: "relative",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
  },
  heroHeaderContent: {
    padding: 22,
  },
  heroEyebrow: {
    color: colors.sideQuest.text,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  heroGlow: {
    backgroundColor: colors.sideQuest.tint,
    borderRadius: 999,
    height: 160,
    position: "absolute",
    right: -34,
    top: -46,
    width: 160,
  },
  heroLineOne: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 110,
    position: "absolute",
    right: -18,
    top: 18,
    transform: [{ rotate: "14deg" }],
    width: 110,
  },
  heroLineThree: {
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 86,
    position: "absolute",
    right: 18,
    top: 54,
    transform: [{ rotate: "-10deg" }],
    width: 86,
  },
  heroLineTwo: {
    backgroundColor: colors.sideQuest.fill,
    borderRadius: 999,
    height: 10,
    position: "absolute",
    right: 26,
    top: 32,
    transform: [{ rotate: "-18deg" }],
    width: 74,
  },
  heroPill: {
    backgroundColor: colors.sideQuest.overlay,
    borderColor: colors.sideQuest.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroPillText: {
    color: colors.light.text,
    fontSize: 12,
    fontWeight: "600",
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 18,
  },
  heroSummary: {
    color: colors.light.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  heroTitle: {
    color: colors.light.text,
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 31,
  },
  questPage: {
    alignSelf: "center",
    width: "90%",
  },
});
