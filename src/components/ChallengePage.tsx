import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { Challenge } from '../types';
import { supabase } from '../lib/supabase';
import { ChallengeCard } from './Challenge';
import { PatrizioExample } from './Challenge';
import { ShareExperience } from './Challenge';
import { useLanguage } from '../contexts/LanguageContext';

interface ChallengePageProps {
  id?: number;
}

export const ChallengePage: React.FC<ChallengePageProps> = ({ id }) => {
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const challengeId = id || (typeof params.id === 'string' ? parseInt(params.id) : params.id);
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      const daysRemaining = 7 - daysSinceCreation;

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
    await loadChallenge();
    setRefreshing(false);
  }, [challengeId]);

  useEffect(() => {
    setLoading(true);
    loadChallenge().finally(() => setLoading(false));
  }, [challengeId]);

  if (loading) {
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
        <ChallengeCard challenge={challenge} />
        <PatrizioExample challenge={challenge} />
        <ShareExperience challenge={challenge} />
      </View>
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
});
