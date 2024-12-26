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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 16,
    padding: 16,
  },
  yourProgressText: {
    color: '#0D1B1E',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  totalContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    marginRight: 12,
    padding: 12
  },
  totalTextContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    marginLeft: 12,
  },
  totalText: {
    color: '#0D1B1E',
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalLabel: {
    color: '#7F8C8D',
    fontSize: 14,
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
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
  },
  challengeCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  challengeLabel: {
    color: '#0D1B1E',
    fontSize: 14,
  },
  
  // Streak Calendar Styles
  streakCalendarContainer: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    padding: 12,
  },
  streakHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  streakTitle: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  streakTitleText: {
    color: colors.light.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  streakCountText: {
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarBox: {
    borderRadius: 3,
    borderWidth: 1,
    paddingBottom: '11%',
    width: '11%',
  },
});

export default UserProgress;
