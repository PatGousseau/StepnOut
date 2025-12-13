import React, { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { ChallengeCard } from "./Challenge";
import { PatrizioExample } from "./Challenge";
import { ShareExperience } from "./Challenge";
import { useLanguage } from "../contexts/LanguageContext";
import { useFetchHomeData } from "../hooks/useFetchHomeData";
import { Loader } from "./Loader";
import { useQuery } from "@tanstack/react-query";
import { challengeService } from "../services/challengeService";

interface ChallengePageProps {
  id?: number;
}

export const ChallengePage: React.FC<ChallengePageProps> = ({ id }) => {
  const { t, language } = useLanguage();
  const params = useLocalSearchParams();
  
  // Get challenge ID from prop or URL params
  const challengeId = id ?? (params.id ? parseInt(String(params.id)) : undefined);
  
  const [refreshing, setRefreshing] = useState(false);
  const { posts, loading: postsLoading, fetchAllData } = useFetchHomeData();

  // Filter posts for this challenge
  const challengePosts = posts.filter((post) => post.challenge_id === challengeId);

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
    await Promise.all([refetch(), fetchAllData()]);
    setRefreshing(false);
  }, [refetch, fetchAllData]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Loader />
      </View>
    );
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t("Challenge")}</Text>
        <Text style={styles.endsIn}>
          {challenge.daysRemaining > 0
            ? t(challenge.daysRemaining === 1 ? "Ends in 1 day" : "Ends in (days) days", {
                days: challenge.daysRemaining,
              })
            : t("Past challenge")}
        </Text>
        <ChallengeCard
          challenge={{
            ...challenge,
            title: language === "it" ? challenge.title_it : challenge.title,
            description: language === "it" ? challenge.description_it : challenge.description,
          }}
        />
        <PatrizioExample
          challenge={{
            ...challenge,
            title: language === "it" ? challenge.title_it : challenge.title,
            description: language === "it" ? challenge.description_it : challenge.description,
          }}
        />
        {challenge.daysRemaining > 0 && <ShareExperience challenge={challenge} />}
      </View>

      {/* Challenge Submissions Section */}
      {/* <View style={styles.submissionsContainer}>
        <TouchableOpacity 
          onPress={() => setIsSubmissionsExpanded(!isSubmissionsExpanded)}
          style={styles.submissionsHeader}
        >
          <View style={styles.submissionsTitleContainer}>
            <Text style={styles.submissionsTitle}>{t('Submissions')}</Text>
            <MaterialIcons 
              name={isSubmissionsExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"} 
              size={24} 
              color={colors.light.text} 
            />
          </View>
        </TouchableOpacity>
        
        {isSubmissionsExpanded && (
          <>
            {challengePosts.map(post => {
              const postUser = userMap[post.user_id] as User;
              return (
                <Post
                  key={post.id}
                  post={post}
                  postUser={postUser}
                  setPostCounts={setPostCounts}
                  onPostDeleted={handlePostDeleted}
                />
              );
            })}
            {challengePosts.length === 0 && (
              <Text style={styles.noSubmissions}>{t('No submissions yet')}</Text>
            )}
          </>
        )}
      </View> */}
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
  endsIn: {
    color: colors.light.lightText,
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  noSubmissions: {
    color: colors.light.lightText,
    marginTop: 20,
    textAlign: "center",
  },
  submissionsContainer: {
    marginTop: 20,
    padding: 16,
  },
  submissionsHeader: {
    marginBottom: 16,
  },
  submissionsTitle: {
    color: colors.light.text,
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 4,
  },
  submissionsTitleContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    color: colors.light.primary,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
});
