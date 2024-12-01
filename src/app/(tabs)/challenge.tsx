import { ChallengePage } from '../../components/ChallengePage';
import { Text } from '../../components/StyledText';
import { useActiveChallenge } from '../../hooks/useActiveChallenge';

const ChallengeScreen: React.FC = () => {
  // get current active challenge
  const { activeChallenge, loading } = useActiveChallenge();

  if (loading) {
    return <Text>Loading challenge...</Text>;
  }

  if (!activeChallenge) {
    return <Text>No active challenge found</Text>;
  }
  return <ChallengePage id={activeChallenge.id} />;
};

export default ChallengeScreen;