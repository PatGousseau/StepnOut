import { Stack } from 'expo-router';
import { ChallengePage } from '../../components/ChallengePage';
import { StyleSheet, SafeAreaView } from 'react-native';

export default function ChallengePageWrapper() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ChallengePage />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
