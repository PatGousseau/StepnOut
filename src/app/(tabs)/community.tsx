import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/Colors';
import { Text } from '../../components/StyledText';
import { FilledAvatarCircle, FilledAvatarCircleUser } from '../../components/FilledAvatarCircle';

export default function CommunityScreen() {
  const users = useMemo(() => {
    // placeholder for now — next commit wires this to supabase for the active challenge
    return new Array(90).fill(0).map((_, i) => ({
      id: String(i),
      username: `user${i}`,
      profileImageUrl: null,
    })) as FilledAvatarCircleUser[];
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>this week</Text>
      <Text style={styles.subtitle}>completed challenge</Text>

      <View style={styles.circleWrap}>
        <FilledAvatarCircle users={users} intervalMs={2200} />
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
    color: colors.neutral.grey2,
    marginBottom: 18,
  },
  circleWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
});
