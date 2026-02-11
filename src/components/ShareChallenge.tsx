import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Modal, Image, ActivityIndicator } from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useActiveChallenge } from '../hooks/useActiveChallenge';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { captureEvent } from '../lib/posthog';
import { CHALLENGE_EVENTS } from '../constants/analyticsEvents';
import { appConfigService } from '../services/appConfigService';
import { profileService } from '../services/profileService';
import InstagramStoryCard from './InstagramStoryCard';
import { captureRef } from 'react-native-view-shot';
import { instagramShareService } from '../services/instagramShareService';
import { Image as ExpoImage } from 'expo-image';

interface ShareChallengeProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  challengeId: number;
  mediaPreview?: string | null;
  streakCount?: number;
  postText?: string;
}

const ShareChallenge: React.FC<ShareChallengeProps> = ({
  title,
  challengeId,
  onClose,
  mediaPreview,
  streakCount = 1,
  isVisible,
  postText
}) => {
  const { t } = useLanguage();
  const { username, user } = useAuth();
  const confettiRef = useRef<any>(null);
  const storyCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = React.useState(false);
  const [profileImageUrl, setProfileImageUrl] = React.useState<string | null>(null);
  const { completionCount } = useActiveChallenge();

  React.useEffect(() => {
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
    if (isVisible) loadProfileImage();
  }, [user?.id, isVisible]);

  const celebrationText = useMemo(() => {
    const options = [
      'You did it!',
      'Well done!',
      'Way to go!',
      'You stepped out!',
      'Bravo!',
    ];
    return options[Math.floor(Math.random() * options.length)];
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.start();
        }
      }, 100);
    }
  }, [isVisible]);

  const handleShare = async () => {
    try {
      const shareLink = await appConfigService.getShareLink();
      const streakEmoji = streakCount >= 3 ? '🔥' : '💪';
      const defaultMessage = t("(emoji) Join me as the (count)th person to complete this week's challenge on Stepn Out! 🚀\n\n(link)", {
        emoji: streakEmoji,
        count: completionCount + 1,
        link: shareLink
      });

      await Share.share({
        message: defaultMessage,
        title: t('Join Me on Stepn Out!'),
      });

      captureEvent(CHALLENGE_EVENTS.SHARED, {
        challenge_id: challengeId,
        challenge_title: title,
        completion_count: completionCount,
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
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
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
        captureEvent(CHALLENGE_EVENTS.SHARED_TO_INSTAGRAM, {
          challenge_id: challengeId,
          challenge_title: title,
          completion_count: completionCount,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{x: -10, y: 0}}
          fallSpeed={3000}
          explosionSpeed={1000}
          fadeOut={true}
          colors={['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98']}
          autoStartDelay={0}
        />

        {/* Hidden Instagram Story Card for capture */}
        <InstagramStoryCard
          ref={storyCardRef}
          username={username || ''}
          challengeTitle={title}
          mediaUrl={mediaPreview || undefined}
          postText={postText}
          profileImageUrl={profileImageUrl || undefined}
          completionCount={completionCount}
        />

        <View style={styles.modalContent}>
          <View style={styles.celebrationContainer}>
            <Text style={styles.title}>{t(celebrationText)}</Text>
          </View>

          {mediaPreview && (
            <Image
              source={{ uri: mediaPreview }}
              style={styles.mediaPreview}
              resizeMode="cover"
            />
          )}
          <View style={styles.socialProofContainer}>
            <Text style={styles.socialProofText}>
              <Text style={styles.highlight}>
                {t('(count) people', { count: completionCount })}
              </Text>
              {' '}
              {t('have stepped out of their comfort zone this week.')}
            </Text>

            <Text style={styles.inspireText}>
              <MaterialCommunityIcons name="shimmer" size={14} color={colors.light.accent} />
              {' '}{t('Inspire your friend to be the (count)th!', { count: completionCount + 1 })}
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
              style={styles.friendButton}
              onPress={handleShare}
            >
              <MaterialCommunityIcons name="send" size={18} color="white" style={{ transform: [{ rotate: '-30deg' }] }} />
              <Text style={styles.friendButtonText}>{t('Share with a friend')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              captureEvent(CHALLENGE_EVENTS.SHARE_SKIPPED, {
                challenge_id: challengeId,
              });
              onClose();
            }}
          >
            <Text style={styles.skipText}>{t('Skip')}</Text>
          </TouchableOpacity>
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
  challengeBox: {
    backgroundColor: colors.light.accent2,
    borderColor: colors.light.primary,
    borderRadius: 8,
    borderWidth: 1.25,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: '100%',
  },
  challengeTitle: {
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipText: {
    color: colors.neutral.darkGrey,
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  inspireText: {
    color: colors.light.accent,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  friendButton: {
    alignItems: 'center',
    backgroundColor: colors.light.primary,
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
  instagramButton: {
    alignItems: 'center',
    backgroundColor: '#D44A7A',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 14,
  },
  mediaPreview: {
    borderRadius: 12,
    height: 150,
    marginBottom: 12,
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderRadius: 24,
    maxWidth: 400,
    paddingVertical: 24,
    paddingHorizontal: 26,
    width: '90%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  highlight: {
    color: colors.light.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButtons: {
    gap: 10,
  },
  socialProofContainer: {
    backgroundColor: colors.neutral.grey2,
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
  },
  socialProofText: {
    color: colors.light.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    color: colors.light.text,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default ShareChallenge;
