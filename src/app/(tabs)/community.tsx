import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/Colors';
import { Text } from '../../components/StyledText';
import { FilledAvatarCircle, FilledAvatarCircleUser } from '../../components/FilledAvatarCircle';
import { useChallengeCompleters } from '../../hooks/useChallengeCompleters';

export default function CommunityScreen() {
  const { users: completers, loading } = useChallengeCompleters();

  const users = useMemo(() => {
    return completers as FilledAvatarCircleUser[];
  }, [completers]);

  const countLabel = loading ? 'Loading…' : `${users.length} Completed`;

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>This Week</Text>
        <Text style={styles.subtitle}>Challenge Finishers</Text>
        <Text style={styles.meta}>{countLabel}</Text>

        <View style={styles.circleWrap}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator />
            </View>
          ) : (
            <FilledAvatarCircle users={users} intervalMs={2200} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  card: {
    backgroundColor: colors.light.cardBg,
    borderRadius: 12,
    marginVertical: 24,
    padding: 20,
  },
  title: {
    color: colors.light.primary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.light.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  meta: {
    color: colors.light.lightText,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  circleWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  loadingWrap: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
