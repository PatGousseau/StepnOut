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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>this week</Text>
      <Text style={styles.subtitle}>completed challenge</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    paddingTop: 72,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.grey3,
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
