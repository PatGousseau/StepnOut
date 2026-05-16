import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useLanguage } from '../contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useActiveChallenge } from '../hooks/useActiveChallenge';
import { FeatureActionButton } from './FeatureActionButton';

interface UserProgressProps {
  challengeData: {
    easy: number;
    medium: number;
    hard: number;
  };
  weekData: WeekData[];
}

interface WeekData {
  week: number;
  hasStreak: boolean;
  challengeId: number;
  postId?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
}

const StreakCalendar: React.FC<{ weekData: WeekData[] }> = ({ weekData }) => {
  const router = useRouter();
  const allWeeks = [...weekData].reverse();

  const getBoxStyle = (week: WeekData) => {
    if (week.isCompleted) {
      return {
        backgroundColor: colors.light.primary,
        borderColor: colors.light.primary,
      };
    }
    if (week.isActive) {
      return {
        backgroundColor: colors.light.primary,
        borderColor: colors.light.primary,
      };
    }
    // Past uncompleted challenges
    return {
      backgroundColor: '#EEF1F6',
      borderColor: '#D7DDE8',
    };
  };

  return (
    <View style={styles.streakCalendarContainer}>
      <View style={styles.calendarGrid}>
        {allWeeks.map((week, index) => (
          <TouchableOpacity
            key={`${week.challengeId}-${index}`}
            activeOpacity={week.isCompleted && week.postId ? 0.8 : 1}
            onPress={() => {
              if (week.isCompleted && week.postId) {
                router.push(`/post/${week.postId}`);
              }
            }}
            style={[
              styles.calendarBox,
              getBoxStyle(week),
            ]}
          >
            {week.isCompleted ? <Text style={styles.calendarCheckmark}>✓</Text> : null}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const UserProgress: React.FC<UserProgressProps> = ({ challengeData, weekData }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const breakdown = [
    { key: 'easy', label: t('Easy'), count: challengeData.easy, color: '#66BB6A' },
    { key: 'medium', label: t('Medium'), count: challengeData.medium, color: '#FFA726' },
    { key: 'hard', label: t('Hard'), count: challengeData.hard, color: '#EF5350' },
  ];
  const total = breakdown.reduce((sum, level) => sum + level.count, 0);
  const isEmpty = total === 0;
  const { activeChallenge } = useActiveChallenge();

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>{t('Your Challenge History')}</Text>
        <Text style={styles.emptyExplainer}>
          {t("Once you complete a challenge, it'll appear here.")}
        </Text>

        {activeChallenge?.title && (
          <Text style={styles.thisWeekLine}>
            {t('This week:')}{' '}
            <Text style={styles.thisWeekName}>{activeChallenge.title}</Text>
          </Text>
        )}

        <FeatureActionButton
          onPress={() => router.push('/(tabs)/challenge')}
          title={t('Take this challenge')}
          tone="indigo"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.yourProgressText}>{t('Your Challenge History')}</Text>
      <View style={styles.streakRow}>
        <StreakCalendar weekData={weekData} />
      </View>

      <View style={styles.progressBarTrack}>
        {breakdown
          .filter((level) => level.count > 0)
          .map((level) => (
            <View
              key={level.key}
              style={[
                styles.progressBarSegment,
                {
                  backgroundColor: level.color,
                  flex: level.count,
                },
              ]}
            />
          ))}
      </View>

      <View style={styles.breakdownContainer}>
        {breakdown.map((level) => (
          <View key={level.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: level.color }]} />
            <Text style={styles.challengeLabel}>{level.label}</Text>
            <Text style={styles.challengeCount}>{level.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F7FA',
    borderColor: '#D7DDE8',
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 16,
    padding: 16,
  },
  yourProgressText: {
    color: '#0D1B1E',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 18,
  },
  progressBarTrack: {
    backgroundColor: '#E6E8EC',
    borderRadius: 999,
    flexDirection: 'row',
    height: 12,
    marginTop: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarSegment: {
    height: '100%',
  },
  emptyTitle: {
    color: '#0D1B1E',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyExplainer: {
    color: '#7F8C8D',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  thisWeekLine: {
    color: '#0D1B1E',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  thisWeekName: {
    fontWeight: '600',
  },
  streakRow: {
    marginTop: 0,
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -2,
  },
  legendItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 6,
    width: 8,
  },
  challengeLabel: {
    color: '#0D1B1E',
    fontSize: 14,
    marginRight: 4,
  },
  challengeCount: {
    color: '#0D1B1E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Streak Calendar Styles
  streakCalendarContainer: {
    borderRadius: 10,
    padding: 0,
    width: '100%',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarBox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    marginBottom: 6,
    marginRight: 6,
    width: 28,
  },
  calendarCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
});

export default UserProgress;
