import React, { useCallback, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { ChallengeCard, ShareExperience } from "./Challenge";
import { useLanguage } from "../contexts/LanguageContext";
import { ChallengeSkeleton } from "./Skeleton";
import { useQuery } from "@tanstack/react-query";
import { challengeService } from "../services/challengeService";
import { usePastChallenges } from "../hooks/usePastChallenges";
import { useFeaturedPiece } from "../hooks/useEsploraHome";
import { ChallengePreviewCard } from "./ChallengePreviewCard";
import { RelatedPieceCard } from "./esplora/RelatedPieceCard";
import { useFetchChallengePosts } from "../hooks/useFetchChallengePosts";
import Post from "./Post";
import { User } from "../models/User";

interface ChallengePageProps {
  id?: number;
}

export const ChallengePage: React.FC<ChallengePageProps> = ({ id }) => {
  const { t, language } = useLanguage();
  const params = useLocalSearchParams();

  const challengeId = id ?? (params.id ? parseInt(String(params.id)) : undefined);

  const [refreshing, setRefreshing] = useState(false);

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
  const isActive = !!challenge && challenge.daysRemaining > 0;

  const { pastChallenges } = usePastChallenges(challengeId, !showPastChallengePosts);
  const featuredPieceQuery = useFeaturedPiece();

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

    const endsInLabel =
      challenge.daysRemaining > 0
        ? t(
            challenge.daysRemaining === 1 ? "Ends in 1 day" : "Ends in (days) days",
            { days: challenge.daysRemaining }
          )
        : null;

    return (
      <View>
        <View style={styles.heroSection}>
          <View style={styles.eyebrowWrap}>
            <Text style={styles.eyebrow}>
              {isActive ? t("This week's challenge") : t("Past challenge")}
            </Text>
            {endsInLabel && <Text style={styles.eyebrowSub}>{endsInLabel}</Text>}
          </View>
          <ChallengeCard challenge={localizedChallenge} />
          {isActive && (
            <View style={styles.ctaWrap}>
              <ShareExperience challenge={challenge} />
            </View>
          )}
        </View>

        {featuredPieceQuery.data && (
          <>
            <View style={styles.divider} />
            <View style={styles.relatedSection}>
              <RelatedPieceCard piece={featuredPieceQuery.data} source="challenge" />
            </View>
          </>
        )}

        {isActive && pastChallenges.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.pastSection}>
              <Text style={styles.sectionTitle}>{t("Past challenges")}</Text>
              {pastChallenges.map((c) => (
                <View key={c.id} style={styles.pastChallengeCard}>
                  <ChallengePreviewCard
                    title={language === "it" ? c.title_it : c.title}
                    description={language === "it" ? c.description_it : c.description}
                    difficulty={c.difficulty}
                    imagePath={c.media?.file_path}
                    onPress={() => router.push(`/challenge/${c.id}`)}
                  />
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  }, [challenge, featuredPieceQuery.data, isActive, language, pastChallenges, t]);

  const onRefreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchPastChallengePosts()]);
    setRefreshing(false);
  }, [refetch, refetchPastChallengePosts]);

  if (isLoading) {
    return <ChallengeSkeleton />;
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>{t("Error loading challenge")}</Text>
      </View>
    );
  }

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
          if (
            !pastChallengePostsLoading &&
            !isFetchingMorePastChallengePosts &&
            hasMorePastChallengePosts
          ) {
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
      contentContainerStyle={styles.scrollContent}
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
  scrollContent: {
    paddingBottom: 48,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  eyebrowWrap: {
    marginBottom: 20,
    width: "80%",
    alignSelf: "center",
  },
  eyebrow: {
    color: colors.light.primary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  eyebrowSub: {
    color: colors.light.lightText,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  ctaWrap: {
    marginTop: 16,
    width: "80%",
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.grey1 + "90",
    marginHorizontal: 16,
    marginBottom: 24,
  },
  relatedSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pastSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: colors.light.primary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  pastChallengeCard: {
    marginBottom: 12,
  },
});
