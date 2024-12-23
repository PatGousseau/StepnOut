import { Loader } from '@/src/components/Loader';
import { ChallengePage } from '../../components/ChallengePage';
import { Text } from '../../components/StyledText';
import { useActiveChallenge } from '../../hooks/useActiveChallenge';

const ChallengeScreen: React.FC = () => {
  const { activeChallenge, loading } = useActiveChallenge();

  if (loading) {
    return <Loader />;
  }

  if (!activeChallenge) {
    return <Text>No active challenge found</Text>;
  }
  return <ChallengePage id={activeChallenge.id} />;
};

export default ChallengeScreen;