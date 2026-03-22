import React, { useCallback, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { ChallengeCard, PatrizioExample, ShareExperience } from "./Challenge";
import { useLanguage } from "../contexts/LanguageContext";
import { ChallengeSkeleton } from "./Skeleton";
import { useQuery } from "@tanstack/react-query";
import { challengeService } from "../services/challengeService";
import { usePastChallenges } from "../hooks/usePastChallenges";
import { PastChallengeCard } from "./PastChallengeCard";
import { useFetchChallengePosts } from "../hooks/useFetchChallengePosts";
import Post from "./Post";
import { User } from "../models/User";

interface ChallengePageProps {
  id?: number;
}

export const ChallengePage: React.FC<ChallengePageProps> = ({ id }) => {
  const { t, language } = useLanguage();
  const params = useLocalSearchParams();
  
  // Get challenge ID from prop or URL params
  const challengeId = id ?? (params.id ? parseInt(String(params.id)) : undefined);
  
  const [refreshing, setRefreshing] = useState(false);

  // Use React Query to fetch challenge data
  const {
    data: challenge,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: () => {
      if (!challengeId) {
        throw new Error("Invalid challenge ID");
      }
      return challengeService.fetchChallengeById(challengeId);
    },
    enabled: !!challengeId,
    staleTime: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const showPastChallengePosts = !!challenge && challenge.daysRemaining <= 0;

  const { pastChallenges } = usePastChallenges(challengeId, !showPastChallengePosts);

  const {
    posts: pastChallengePosts,
    userMap: pastChallengeUserMap,
    loading: pastChallengePostsLoading,
    loadMore: loadMorePastChallengePosts,
    hasMore: hasMorePastChallengePosts,
    isFetchingNextPage: isFetchingMorePastChallengePosts,
    refetch: refetchPastChallengePosts,
  } = useFetchChallengePosts(showPastChallengePosts ? challengeId : undefined);

  const header = useMemo(() => {
    if (!challenge) return null;

    const localizedChallenge = {
      ...challenge,
      title: language === "it" ? challenge.title_it : challenge.title,
      description: language === "it" ? challenge.description_it : challenge.description,
    };

    return (
      <View>
        <View style={[styles.content, showPastChallengePosts && styles.contentInList]}>
          <Text style={styles.title}>{t("Challenge")}</Text>
          <Text style={styles.endsIn}>
            {challenge.daysRemaining > 0
              ? t(challenge.daysRemaining === 1 ? "Ends in 1 day" : "Ends in (days) days", {
                  days: challenge.daysRemaining,
                })
              : t("Past challenge")}
          </Text>
          <ChallengeCard challenge={localizedChallenge} />
          <PatrizioExample challenge={localizedChallenge} />

          {challenge.daysRemaining > 0 && <ShareExperience challenge={challenge} />}
        </View>

        {challenge.daysRemaining > 0 && pastChallenges.length > 0 && (
          <View style={styles.pastChallengesOuter}>
            <Text style={styles.sectionTitle}>{t("Past challenges")}</Text>
            {pastChallenges.map((c) => (
              <PastChallengeCard
                key={c.id}
                challenge={{
                  ...c,
                  title: language === "it" ? c.title_it : c.title,
                  description: language === "it" ? c.description_it : c.description,
                }}
                onPress={() => router.push(`/challenge/${c.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    );
  }, [challenge, language, pastChallenges, showPastChallengePosts, t]);

  const onRefreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchPastChallengePosts()]);
    setRefreshing(false);
  }, [refetch, refetchPastChallengePosts]);

  // Loading state
  if (isLoading) {
    return <ChallengeSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>{t("Error loading challenge")}</Text>
      </View>
    );
  }

  // Challenge not found
  if (!challenge) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>{t("Challenge not found")}</Text>
      </View>
    );
  }

  if (showPastChallengePosts) {
    return (
      <FlatList
        style={styles.container}
        data={pastChallengePosts}
        renderItem={({ item }) => {
          const postUser = pastChallengeUserMap[item.user_id] as User;
          if (!postUser) return null;
          return <Post post={item} postUser={postUser} />;
        }}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        onEndReached={() => {
          if (!pastChallengePostsLoading && !isFetchingMorePastChallengePosts && hasMorePastChallengePosts) {
            loadMorePastChallengePosts();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshAll} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {header}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  content: {
    backgroundColor: colors.light.cardBg,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  contentInList: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  pastChallengesOuter: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.light.primary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 18,
  },
  endsIn: {
    color: colors.light.lightText,
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    color: colors.light.primary,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
});
