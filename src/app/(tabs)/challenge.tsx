import { Loader } from '@/src/components/Loader';
import { ChallengePage } from '../../components/ChallengePage';
import { Text } from '../../components/StyledText';
import { useActiveChallenge } from '../../hooks/useActiveChallenge';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/Colors';

const ChallengeScreen: React.FC = () => {
  const { activeChallenge, loading } = useActiveChallenge();

  if (loading) {
    return (
      <View style={styles.container}>
        <Loader />
      </View>
    );
  }

  if (!activeChallenge) {
    return <Text>No active challenge found</Text>;
  }
  return <ChallengePage id={activeChallenge.id} />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
});

export default ChallengeScreen;