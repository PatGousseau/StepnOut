import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useActiveChallenge } from '../hooks/useActiveChallenge';
import { sideQuestService } from '../services/sideQuestService';

const LAST_SEEN_CHALLENGE_ID_KEY = 'last_seen_challenge_id';

// Local calendar day (YYYY-MM-DD) — must match the key useSideQuests uses so
// the daily-draw query shares its cache and clears reactively after a pull.
function getLocalDayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type TabBadgeContextValue = {
  /** A weekly challenge is active that the user hasn't opened yet. */
  hasUnseenChallenge: boolean;
  /** Mark the current active challenge as seen (clears the challenge dot). */
  markChallengeSeen: () => void;
  /** The user hasn't pulled today's side quest yet. */
  hasNewSideQuest: boolean;
};

const TabBadgeContext = createContext<TabBadgeContextValue>({
  hasUnseenChallenge: false,
  markChallengeSeen: () => {},
  hasNewSideQuest: false,
});

export const TabBadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const localDay = getLocalDayString();

  const { activeChallenge } = useActiveChallenge();

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

  // Side quest dot: driven straight from the DB — show it whenever there is no
  // side_quest_draws row for today (i.e. the user hasn't pulled today's quest).
  // Shares the query key with useSideQuests, so pulling a quest clears it.
  const dailyDrawQuery = useQuery({
    queryKey: ['side-quest-draw', userId, localDay],
    queryFn: () => sideQuestService.fetchDailyDraw(userId!, localDay),
    enabled: !!userId,
    staleTime: 30000,
  });

  const hasNewSideQuest = !!userId && dailyDrawQuery.isFetched && !dailyDrawQuery.data;

  const value = useMemo(
    () => ({ hasUnseenChallenge, markChallengeSeen, hasNewSideQuest }),
    [hasUnseenChallenge, markChallengeSeen, hasNewSideQuest]
  );

  return <TabBadgeContext.Provider value={value}>{children}</TabBadgeContext.Provider>;
};

export const useTabBadges = () => useContext(TabBadgeContext);
