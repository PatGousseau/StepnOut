import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './StyledText';
import { FontAwesome } from '@expo/vector-icons'; 
import { colors } from '../constants/Colors';

interface UserProgressProps {
  challengeData: {
    easy: number;
    medium: number;
    hard: number;
  };
  weekData: { week: number; hasStreak: boolean }[];
}

const StreakCalendar: React.FC<{ weekData: { hasStreak: boolean }[] }> = ({ weekData }) => {
  const currentStreak = weekData.reverse().findIndex(week => !week.hasStreak);
  const streakCount = currentStreak === -1 ? weekData.length : currentStreak;

  return (
    <View style={styles.streakCalendarContainer}>
      <View style={styles.streakHeader}>
        <View style={styles.streakTitle}>
          <FontAwesome name="calendar" size={14} color={colors.light.primary} />
          <Text style={styles.streakTitleText}>Streak</Text>
        </View>
        <Text style={styles.streakCountText}>{streakCount} weeks</Text>
      </View>
      <View style={styles.calendarGrid}>
        {weekData.reverse().map((week, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.calendarBox,
              {
                backgroundColor: week.hasStreak ? '#66BB6A' : 'transparent',
                borderColor: week.hasStreak ? '#66BB6A' : colors.light.text,
              },
            ]}
            activeOpacity={0.8}
          />
        ))}
      </View>
    </View>
  );
};

const UserProgress: React.FC<UserProgressProps> = ({ challengeData, weekData }) => {
  const total = challengeData.easy + challengeData.medium + challengeData.hard;

  return (
    <View style={styles.container}>
      <Text style={styles.yourProgressText}>Your Progress</Text>
      <View style={styles.rowContainer}>
        <View style={styles.totalContainer}>
          <FontAwesome name="trophy" size={32} color="#7798AB" />
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{total}</Text>
            <Text style={styles.totalLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.streakContainer}>
          <StreakCalendar weekData={weekData} />
        </View>
      </View>

      <View style={styles.breakdownContainer}>
        {[
          { label: 'Easy', count: challengeData.easy, color: '#E8F5E9', textColor: '#66BB6A' },
          { label: 'Medium', count: challengeData.medium, color: '#FFF3E0', textColor: '#FFA726' },
          { label: 'Hard', count: challengeData.hard, color: '#FFEBEE', textColor: '#EF5350' },
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
