import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSideQuests } from '../hooks/useSideQuests';
import { useActiveChallenge } from '../hooks/useActiveChallenge';

const LAST_SEEN_CHALLENGE_ID_KEY = 'last_seen_challenge_id';

type TabBadgeContextValue = {
  /** A weekly challenge is active that the user hasn't opened yet. */
  hasUnseenChallenge: boolean;
  /** Mark the current active challenge as seen (clears the challenge dot). */
  markChallengeSeen: () => void;
  /** A side quest is available to pull today that the user hasn't pulled yet. */
  hasNewSideQuest: boolean;
};

const TabBadgeContext = createContext<TabBadgeContextValue>({
  hasUnseenChallenge: false,
  markChallengeSeen: () => {},
  hasNewSideQuest: false,
});

export const TabBadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeChallenge } = useActiveChallenge();
  const { todaysQuest, todaysQuestState, rankedSideQuests, drawHistory } = useSideQuests();

  const [lastSeenChallengeId, setLastSeenChallengeId] = useState<string | null>(null);
  const [seenLoaded, setSeenLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LAST_SEEN_CHALLENGE_ID_KEY).then((value) => {
      if (!mounted) return;
      setLastSeenChallengeId(value);
      setSeenLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const hasUnseenChallenge =
    seenLoaded && !!activeChallenge && String(activeChallenge.id) !== lastSeenChallengeId;

  const markChallengeSeen = useCallback(() => {
    if (!activeChallenge) return;
    const id = String(activeChallenge.id);
    setLastSeenChallengeId(id);
    AsyncStorage.setItem(LAST_SEEN_CHALLENGE_ID_KEY, id);
  }, [activeChallenge]);

  // A quest is available to pull today if the user hasn't pulled today's draw
  // and at least one ranked quest hasn't been drawn before (i.e. not exhausted).
  const hasNewSideQuest = useMemo(() => {
    if (todaysQuest) return false;
    if (todaysQuestState !== 'undrawn') return false;
    return rankedSideQuests.some(
      (quest) => !drawHistory.some((drawn) => drawn.draw.quest_id === quest.id)
    );
  }, [todaysQuest, todaysQuestState, rankedSideQuests, drawHistory]);

  const value = useMemo(
    () => ({ hasUnseenChallenge, markChallengeSeen, hasNewSideQuest }),
    [hasUnseenChallenge, markChallengeSeen, hasNewSideQuest]
  );

  return <TabBadgeContext.Provider value={value}>{children}</TabBadgeContext.Provider>;
};

export const useTabBadges = () => useContext(TabBadgeContext);
