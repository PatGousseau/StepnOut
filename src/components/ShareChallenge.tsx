import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Modal, Image } from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useActiveChallenge } from '../hooks/useActiveChallenge';
import { useLanguage } from '../contexts/LanguageContext';
import { captureEvent } from '../lib/posthog';
import { CHALLENGE_EVENTS } from '../constants/analyticsEvents';
import { appConfigService } from '../services/appConfigService';

interface ShareChallengeProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  challengeId: number;
  mediaPreview?: string | null;
  streakCount?: number;
}

const ShareChallenge: React.FC<ShareChallengeProps> = ({
  title,
  challengeId,
  onClose,
  mediaPreview,
  streakCount = 1,
  isVisible
}) => {
  const { t } = useLanguage();
  // ConfettiCannon lacks proper TypeScript types
  const confettiRef = useRef<InstanceType<typeof ConfettiCannon> | null>(null);
  const { completionCount } = useActiveChallenge();

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
        
        <View style={styles.modalContent}>
          <View style={styles.celebrationContainer}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>{t('Challenge Complete!')}</Text>
          </View>

          <View style={styles.recapContainer}>
            {mediaPreview && (
              <Image 
                source={{ uri: mediaPreview }} 
                style={styles.mediaPreview}
                resizeMode="cover"
              />
            )}
            <Text style={styles.challengeTitle}>&quot;{title}&quot;</Text>
          </View>

          <View style={styles.socialProofContainer}>
            <Text style={styles.socialProofText}>
              <Text style={styles.highlight}>
                {t('(count) people', { count: completionCount })}
              </Text>
              {' '}
              {t('have stepped out of their comfort zone this week.')}
              {'\n'}
              <Text style={styles.socialProofSubtext}>
                {t('Inspire your friend to be the (count)th!', { count: completionCount + 1 })}
              </Text>
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.laterButton} 
              onPress={() => {
                captureEvent(CHALLENGE_EVENTS.SHARE_SKIPPED, {
                  challenge_id: challengeId,
                });
                onClose();
              }}
            >
              <Text style={styles.laterButtonText}>{t('Skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShare}
            >
              <MaterialCommunityIcons name="shimmer" size={20} color="white" />
              <Text style={styles.shareButtonText}>{t('Inspire someone!')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeTitle: {
    color: colors.light.text,
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  highlight: {
    color: colors.light.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  laterButton: {
    alignItems: 'center',
    backgroundColor: colors.neutral.grey2,
    borderRadius: 12,
    flex: 0.3,
    justifyContent: 'center',
    padding: 12,
  },
  laterButtonText: {
    color: colors.neutral.darkGrey,
    fontSize: 16,
    fontWeight: '500',
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
    padding: 24,
    width: '90%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  recapContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: colors.light.accent,
    borderRadius: 12,
    flex: 0.7,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  socialProofContainer: {
    backgroundColor: colors.neutral.grey2,
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
  },
  socialProofSubtext: {
    color: colors.neutral.darkGrey,
    fontSize: 15,
  },
  socialProofText: {
    color: colors.light.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    color: colors.light.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default ShareChallenge; 