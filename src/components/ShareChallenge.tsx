import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Platform, Modal, Image } from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ConfettiCannon from 'react-native-confetti-cannon';

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
  const confettiRef = useRef<any>(null);

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
      const streakEmoji = streakCount >= 3 ? '🔥' : '💪';
      const defaultMessage = `${streakEmoji} Join me as the 138th person to complete this week's comfort zone challenge on Stepn Out! 🚀\n\n[TODO: Link to challenge/app]`;
      
      await Share.share({
        message: Platform.select({
          ios: defaultMessage,
          android: defaultMessage,
        }) ?? defaultMessage,
        title: "Join Me on StepN Out!",
      });
      
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
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
            <Text style={styles.title}>Challenge Complete!</Text>
          </View>

          <View style={styles.recapContainer}>
            {mediaPreview && (
              <Image 
                source={{ uri: mediaPreview }} 
                style={styles.mediaPreview}
                resizeMode="cover"
              />
            )}
            <Text style={styles.challengeTitle}>"{title}"</Text>
          </View>

          <View style={styles.socialProofContainer}>
            <Text style={styles.socialProofText}>
              <Text style={styles.highlight}>137 people</Text>
              {' have stepped out of their comfort zone this week.\n'}
              <Text style={styles.socialProofSubtext}>
                Inspire your friend to be the 138th!
              </Text>
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.laterButton} 
              onPress={onClose}
            >
              <Text style={styles.laterButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShare}
            >
              <MaterialCommunityIcons name="shimmer" size={20} color="white" />
              <Text style={styles.shareButtonText}>Inspire someone!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  streakBadge: {
    backgroundColor: colors.light.accent,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.light.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
  recapContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaPreview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    color: colors.light.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  socialProofContainer: {
    backgroundColor: colors.neutral.grey2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  socialProofText: {
    fontSize: 16,
    color: colors.light.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  highlight: {
    color: colors.light.accent,
    fontWeight: 'bold',
    fontSize: 18,
  },
  socialProofSubtext: {
    fontSize: 15,
    color: colors.neutral.darkGrey,
  },
  inspirationText: {
    fontSize: 14,
    color: colors.neutral.darkGrey,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  laterButton: {
    flex: 0.3,
    backgroundColor: colors.neutral.grey2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterButtonText: {
    color: colors.neutral.darkGrey,
    fontSize: 16,
    fontWeight: '500',
  },
  shareButton: {
    flex: 0.7,
    backgroundColor: colors.light.accent,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ShareChallenge; 