import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { Challenge } from '../types';
import { supabase } from '../lib/supabase';
import { ChallengeCard } from './Challenge';
import { PatrizioExample } from './Challenge';
import { ShareExperience } from './Challenge';
import { useLanguage } from '../contexts/LanguageContext';
import { useFetchHomeData } from '../hooks/useFetchHomeData';

interface ChallengePageProps {
  id?: number;
}

export const ChallengePage: React.FC<ChallengePageProps> = ({ id }) => {
  const { t, language } = useLanguage();
  const params = useLocalSearchParams();
  const challengeId = id || (typeof params.id === 'string' ? parseInt(params.id) : params.id);
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { posts, userMap, loading: postsLoading, fetchAllData } = useFetchHomeData();
  const [postCounts, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>({});
  const [isSubmissionsExpanded, setIsSubmissionsExpanded] = useState(false);

  // Filter posts for this challenge
  const challengePosts = posts.filter(post => post.challenge_id === challengeId);

  const loadChallenge = async () => {
    if (!challengeId) {
      console.error('No id available:', params);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          media:image_media_id(
            file_path
          )
        `)
        .eq('id', challengeId)
        .single();

      if (error) throw error;
      
      // Calculate days remaining
      const now = new Date();
      const createdAt = new Date(data.created_at);
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = 7 // - daysSinceCreation;

      setChallenge({
        ...data,
        daysRemaining,
      });
    } catch (error) {
      console.error('Error loading challenge:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadChallenge(), fetchAllData()]);
    setRefreshing(false);
  }, [challengeId, fetchAllData]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadChallenge(), fetchAllData()]).finally(() => setLoading(false));
  }, [challengeId]);

  const handlePostDeleted = () => {
    fetchAllData();
  };

  if (loading || postsLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>{t('Challenge not found')}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('Challenge')}</Text>
        <Text style={styles.endsIn}>
          {challenge.daysRemaining > 0 
            ? t(challenge.daysRemaining === 1 ? 'Ends in 1 day' : 'Ends in (days) days', { days: challenge.daysRemaining })
            : t('Past challenge')}
        </Text>
        <ChallengeCard 
          challenge={{
            ...challenge,
            title: language === 'it' ? challenge.title_it : challenge.title,
            description: language === 'it' ? challenge.description_it : challenge.description,
          }} 
        />
        <PatrizioExample 
          challenge={{
            ...challenge,
            title: language === 'it' ? challenge.title_it : challenge.title,
            description: language === 'it' ? challenge.description_it : challenge.description,
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
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 20,
    backgroundColor: colors.light.cardBg,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.light.primary,
    textAlign: 'center',
  },
  endsIn: {
    fontSize: 14,
    color: colors.light.lightText,
    marginBottom: 20,
    textAlign: 'center',
  },
  submissionsContainer: {
    padding: 16,
    marginTop: 20,
  },
  submissionsHeader: {
    marginBottom: 16,
  },
  submissionsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submissionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.text,
    marginRight: 4,
  },
  noSubmissions: {
    textAlign: 'center',
    color: colors.light.lightText,
    marginTop: 20,
  },
});
