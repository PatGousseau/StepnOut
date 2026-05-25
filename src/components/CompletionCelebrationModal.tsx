import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Modal,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { captureRef } from 'react-native-view-shot';
import { Image as ExpoImage } from 'expo-image';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useActiveChallenge } from '../hooks/useActiveChallenge';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { captureEvent } from '../lib/posthog';
import { CHALLENGE_EVENTS, SIDE_QUEST_EVENTS } from '../constants/analyticsEvents';
import { appConfigService } from '../services/appConfigService';
import { profileService } from '../services/profileService';
import InstagramStoryCard from './InstagramStoryCard';
import { instagramShareService } from '../services/instagramShareService';
import CompletionBurst from './CompletionBurst';

type CompletionCelebrationVariant = 'challenge' | 'quest';

interface CompletionCelebrationModalProps {
  isVisible: boolean;
  mediaPreview?: string | null;
  onClose: () => void;
  postText?: string;
  title: string;
  variant: CompletionCelebrationVariant;
  variantId: number;
}

const CompletionCelebrationModal: React.FC<CompletionCelebrationModalProps> = ({
  isVisible,
  mediaPreview,
  onClose,
  postText,
  title,
  variant,
  variantId,
}) => {
  const { t } = useLanguage();
  const { username, user } = useAuth();
  const { completionCount } = useActiveChallenge();
  const confettiRef = useRef<{ start: () => void } | null>(null);
  const storyCardRef = useRef<View>(null);
  const countAnim = useRef(new Animated.Value(0)).current;
  const bodyProgress = useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = React.useState(0);
  const [isSharing, setIsSharing] = React.useState(false);
  const [profileImageUrl, setProfileImageUrl] = React.useState<string | null>(null);
  const [burstSession, setBurstSession] = React.useState(0);
  const [contentMounted, setContentMounted] = React.useState(false);
  const openedCountRef = useRef(0);

  const config = {
    challenge: {
      badgeBackgroundColor: colors.light.accent2,
      badgeBorderColor: colors.light.primary,
      badgeTextColor: colors.light.primary,
      bodyBackgroundColor: colors.neutral.grey2,
      buttonBackgroundColor: colors.light.primary,
      countTarget: completionCount,
      countUnit: t('people'),
      countHighlightPrefix: '',
      eventIdKey: 'challenge_id',
      eventTitleKey: 'challenge_title',
      events: CHALLENGE_EVENTS,
      helperCopy: t('have stepped out of their comfort zone this week.'),
      inspireCopy: t('Inspire your friend to be the (count)th!', { count: displayCount + 1 }),
      messageBuilder: async () => {
        const shareLink = await appConfigService.getShareLink();
        return t("(emoji) Join me as the (count)th person to complete this week's challenge on Stepn Out! 🚀\n\n(link)", {
          emoji: '💪',
          count: completionCount + 1,
          link: shareLink,
        });
      },
      modalOpenedEvent: CHALLENGE_EVENTS.SHARE_MODAL_OPENED,
      storyVariant: 'challenge' as const,
      subtitle: t("This week's challenge"),
    },
    quest: {
      badgeBackgroundColor: colors.sideQuest.highlightSoft,
      badgeBorderColor: colors.sideQuest.bgBorder,
      badgeTextColor: colors.sideQuest.text,
      bodyBackgroundColor: colors.sideQuest.bg,
      buttonBackgroundColor: colors.sideQuest.base,
      countTarget: 0,
      countUnit: '',
      countHighlightPrefix: t('Side quest'),
      eventIdKey: 'quest_id',
      eventTitleKey: 'quest_title',
      events: SIDE_QUEST_EVENTS,
      helperCopy: t('completed for today. Share it now before tomorrow brings a new one.'),
      inspireCopy: t('Pull a friend into today’s adventure.'),
      messageBuilder: async () => {
        const shareLink = await appConfigService.getShareLink();
        return t("I just completed today's side quest on Stepn Out. Come try one too.\n\n(link)", {
          link: shareLink,
        });
      },
      modalOpenedEvent: SIDE_QUEST_EVENTS.SHARE_MODAL_OPENED,
      storyVariant: 'quest' as const,
      subtitle: t("Today's side quest"),
    },
  }[variant];

  const celebrationText = useMemo(() => {
    const options =
      variant === 'challenge'
        ? ['You did it!', 'Well done!', 'Way to go!', 'You stepped out!', 'Bravo!']
        : ['Quest complete!', 'Nice detour!', 'Map cleared!', 'That counts!', 'Side quest done!'];
    return options[Math.floor(Math.random() * options.length)];
  }, [variant]);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (!user?.id) return;
      try {
        const profile = await profileService.fetchProfileById(user.id);
        if (profile?.profileImageUrl) {
          setProfileImageUrl(profile.profileImageUrl);
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    if (isVisible) {
      loadProfileImage();
      captureEvent(config.modalOpenedEvent, {
        [config.eventIdKey]: variantId,
        [config.eventTitleKey]: title,
      });
    }
  }, [config.eventIdKey, config.eventTitleKey, config.modalOpenedEvent, isVisible, title, user?.id, variantId]);

  useEffect(() => {
    if (!isVisible) {
      const unmountTimer = setTimeout(() => {
        setContentMounted(false);
        countAnim.setValue(0);
        bodyProgress.setValue(0);
        setDisplayCount(0);
      }, 320);
      return () => clearTimeout(unmountTimer);
    }

    openedCountRef.current = config.countTarget;
    setContentMounted(true);
    setBurstSession((session) => session + 1);
    countAnim.setValue(0);
    bodyProgress.setValue(0);
    setDisplayCount(0);

    const confettiTimer = setTimeout(() => confettiRef.current?.start(), 3300);

    const listener = countAnim.addListener(({ value }) => {
      setDisplayCount(Math.round(value));
    });

    Animated.timing(countAnim, {
      toValue: openedCountRef.current,
      duration: 1100,
      delay: 1650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.timing(bodyProgress, {
      toValue: 1,
      duration: 520,
      delay: 1700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    return () => {
      clearTimeout(confettiTimer);
      countAnim.removeListener(listener);
    };
  }, [bodyProgress, config.countTarget, countAnim, isVisible]);

  const handleShare = async () => {
    try {
      const message = await config.messageBuilder();
      await Share.share({
        message,
        title: t('Join Me on Stepn Out!'),
      });

      captureEvent(config.events.SHARED, {
        [config.eventIdKey]: variantId,
        [config.eventTitleKey]: title,
      });

      onClose();
    } catch (error) {
      console.error(t('Error sharing:'), error);
    }
  };

  const handleInstagramShare = async () => {
    if (isSharing || !storyCardRef.current) return;
    setIsSharing(true);

    try {
      if (mediaPreview) {
        await ExpoImage.prefetch(mediaPreview);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      const fileUri = await captureRef(storyCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const instagramInstalled = await instagramShareService.isInstagramInstalled();
      let shared = false;

      if (instagramInstalled) {
        try {
          shared = await instagramShareService.shareToInstagramStories(fileUri);
        } catch {
          shared = await instagramShareService.shareNative(fileUri);
        }
      } else {
        shared = await instagramShareService.shareNative(fileUri);
      }

      if (shared) {
        captureEvent(config.events.SHARED_TO_INSTAGRAM, {
          [config.eventIdKey]: variantId,
          [config.eventTitleKey]: title,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const highlightText =
    variant === 'challenge'
      ? `${displayCount} ${config.countUnit}`
      : config.countHighlightPrefix;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <InstagramStoryCard
          ref={storyCardRef}
          username={username || ''}
          challengeTitle={title}
          postText={postText}
          profileImageUrl={profileImageUrl || undefined}
          completionCount={completionCount}
          variant={config.storyVariant}
        />

        <View style={styles.modalContent}>
          <View style={styles.celebrationContainer}>
            {contentMounted && (
              <CompletionBurst
                key={burstSession}
                title={t(celebrationText)}
                variant={variant}
              />
            )}
          </View>

          <Animated.View
            style={{
              opacity: bodyProgress,
              transform: [
                {
                  translateY: bodyProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <View
              style={[
                styles.titleBadge,
                {
                  backgroundColor: config.badgeBackgroundColor,
                  borderColor: config.badgeBorderColor,
                },
              ]}
            >
              <Text style={[styles.titleBadgeLabel, { color: config.badgeTextColor }]}>
                {config.subtitle}
              </Text>
              <Text style={[styles.titleBadgeTitle, { color: config.badgeTextColor }]}>
                {title}
              </Text>
            </View>

            {mediaPreview && (
              <Image
                source={{ uri: mediaPreview }}
                style={styles.mediaPreview}
                resizeMode="cover"
              />
            )}

            <View
              style={[
                styles.messageCard,
                { backgroundColor: config.bodyBackgroundColor },
              ]}
            >
              <Text style={styles.messageText}>
                <Text
                  style={[
                    styles.highlight,
                    { color: variant === 'challenge' ? colors.light.accent : colors.sideQuest.text },
                  ]}
                >
                  {highlightText}
                </Text>
                {' '}
                {config.helperCopy}
              </Text>

              <Text
                style={[
                  styles.inspireText,
                  { color: variant === 'challenge' ? colors.light.accent : colors.sideQuest.text },
                ]}
              >
                <MaterialCommunityIcons
                  name={variant === 'challenge' ? 'shimmer' : 'compass-rose'}
                  size={14}
                  color={variant === 'challenge' ? colors.light.accent : colors.sideQuest.text}
                />
                {' '}{config.inspireCopy}
              </Text>
            </View>

            <View style={styles.shareButtons}>
              <TouchableOpacity
                style={styles.instagramButton}
                onPress={handleInstagramShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialCommunityIcons name="instagram" size={20} color="white" />
                )}
                <Text style={styles.buttonText}>
                  {isSharing ? t('Sharing...') : t('Share to Instagram Story')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.friendButton,
                  { backgroundColor: config.buttonBackgroundColor },
                ]}
                onPress={handleShare}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={18}
                  color="white"
                  style={{ transform: [{ rotate: '-30deg' }] }}
                />
                <Text style={styles.friendButtonText}>{t('Share with a friend')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                captureEvent(config.events.SHARE_SKIPPED, {
                  [config.eventIdKey]: variantId,
                  [config.eventTitleKey]: title,
                });
                onClose();
              }}
            >
              <Text style={styles.skipText}>{t('Skip')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <ConfettiCannon
            ref={confettiRef}
            count={90}
            origin={{ x: -10, y: -20 }}
            fallSpeed={2800}
            explosionSpeed={600}
            fadeOut
            colors={
              variant === 'challenge'
                ? ['#FFE27A', '#FFB347', '#FF6B3D', '#FFD166', '#F5F2ED']
                : ['#FFD8CB', '#F09A81', '#E27D60', '#FFF1EC', '#FFF8F5']
            }
            autoStart={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  friendButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 14,
  },
  friendButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  highlight: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  instagramButton: {
    alignItems: 'center',
    backgroundColor: '#D44A7A',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 14,
  },
  inspireText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mediaPreview: {
    borderRadius: 12,
    height: 150,
    marginBottom: 12,
    width: '100%',
  },
  messageCard: {
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
  },
  messageText: {
    color: colors.light.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderRadius: 24,
    maxWidth: 400,
    overflow: 'visible',
    paddingHorizontal: 26,
    paddingVertical: 24,
    width: '90%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  shareButtons: {
    gap: 10,
  },
  skipText: {
    color: colors.neutral.darkGrey,
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  titleBadge: {
    borderRadius: 14,
    borderWidth: 1.25,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
  },
  titleBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  titleBadgeTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default CompletionCelebrationModal;
