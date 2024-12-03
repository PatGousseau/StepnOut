import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './StyledText';
import { FontAwesome } from '@expo/vector-icons'; 
import { colors } from '../constants/Colors';
import { useLanguage } from '../contexts/LanguageContext';

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
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
}

const StreakCalendar: React.FC<{ weekData: WeekData[] }> = ({ weekData }) => {
  const { t } = useLanguage();
  
  const getBoxStyle = (week: WeekData) => {
    if (week.isCompleted) {
      return {
        backgroundColor: '#66BB6A',
        borderColor: '#66BB6A',
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
      backgroundColor: 'transparent',
      borderColor: colors.light.primary,
    };
  };

  return (
    <View style={styles.streakCalendarContainer}>
      <View style={styles.streakHeader}>
        <View style={styles.streakTitle}>
          <FontAwesome name="calendar" size={14} color={colors.light.primary} />
          <Text style={styles.streakTitleText}>{t('Latest Challenges')}</Text>
        </View>
      </View>
      <View style={styles.calendarGrid}>
        {[...weekData].reverse().map((week, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.calendarBox,
              getBoxStyle(week),
            ]}
            activeOpacity={0.8}
          />
        ))}
      </View>
    </View>
  );
};

const UserProgress: React.FC<UserProgressProps> = ({ challengeData, weekData }) => {
  const { t } = useLanguage();
  const total = challengeData.easy + challengeData.medium + challengeData.hard;

  return (
    <View style={styles.container}>
      <Text style={styles.yourProgressText}>{t('Your Progress')}</Text>
      <View style={styles.rowContainer}>
        <View style={styles.totalContainer}>
          <FontAwesome name="trophy" size={32} color="#7798AB" />
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{total}</Text>
            <Text style={styles.totalLabel}>{t('Total')}</Text>
          </View>
        </View>

        <View style={styles.streakContainer}>
          <StreakCalendar weekData={weekData} />
        </View>
      </View>

      <View style={styles.breakdownContainer}>
        {[
          { label: t('Easy'), count: challengeData.easy, color: '#E8F5E9', textColor: '#66BB6A' },
          { label: t('Medium'), count: challengeData.medium, color: '#FFF3E0', textColor: '#FFA726' },
          { label: t('Hard'), count: challengeData.hard, color: '#FFEBEE', textColor: '#EF5350' },
        ].map((level) => (
          <View key={level.label} style={[styles.challengeBox, { backgroundColor: level.color }]}>
            <Text style={[styles.challengeCount, { color: level.textColor }]}>{level.count}</Text>
            <Text style={styles.challengeLabel}>{level.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  yourProgressText: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B1E',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  totalContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    backgroundColor: '#F3F3F3',
    borderRadius: 12
  },
  totalTextContainer: {
    marginLeft: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D1B1E',
  },
  totalLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  streakContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  challengeCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  challengeLabel: {
    fontSize: 14,
    color: '#0D1B1E',
  },
  
  // Streak Calendar Styles
  streakCalendarContainer: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F3F3F3',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakTitleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  streakCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.light.primary,
    marginLeft: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarBox: {
    width: '11%',
    paddingBottom: '11%',
    borderRadius: 3,
    borderWidth: 1,
  },
});

export default UserProgress;
