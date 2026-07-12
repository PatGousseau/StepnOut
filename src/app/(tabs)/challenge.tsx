import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { ChallengeSkeleton } from '@/src/components/Skeleton';
import { ChallengePage } from '../../components/ChallengePage';
import { Text } from '../../components/StyledText';
import { useActiveChallenge } from '../../hooks/useActiveChallenge';
import { useTabBadges } from '../../contexts/TabBadgeContext';

const ChallengeScreen: React.FC = () => {
  const { activeChallenge, loading } = useActiveChallenge();
  const { markChallengeSeen } = useTabBadges();

  // Clear the "new challenge" dot whenever the user opens this tab.
  useFocusEffect(
    useCallback(() => {
      markChallengeSeen();
    }, [markChallengeSeen])
  );

  if (loading) {
    return <ChallengeSkeleton />;
  }

  if (!activeChallenge) {
    return <Text>No active challenge found</Text>;
  }
  return <ChallengePage id={activeChallenge.id} />;
};

export default ChallengeScreen;