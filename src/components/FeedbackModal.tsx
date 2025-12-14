import React, { useState } from 'react';
import { 
  View, 
  Modal, 
  TextInput, 
  StyleSheet, 
  Text,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { captureEvent } from '../lib/posthog';
import { UI_EVENTS } from '../constants/analyticsEvents';

interface FeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isVisible, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];
  const { user } = useAuth();
  const { t } = useLanguage();

  const animateContent = (toValue: number) => {
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handleSubmit = async () => {
    try {
      if (!feedback.trim()) return;

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id,
          message: feedback.trim()
        });

      if (error) throw error;

      captureEvent(UI_EVENTS.FEEDBACK_SUBMITTED, {
        feedback_length: feedback.trim().length,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFeedback('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      onShow={() => animateContent(1)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            animateContent(0);
            setTimeout(onClose, 200);
          }}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  })
                }]
              }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchStart={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{t('Send Feedback')}</Text>
            {showSuccess ? (
              <View style={styles.successMessage}>
                <Icon name="checkmark-circle" size={24} color={colors.light.primary} />
                <Text style={styles.successText}>{t('Thank you for your feedback!')}</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  multiline
                  placeholder={t("What's on your mind?")}
                  value={feedback}
                  onChangeText={setFeedback}
                  maxLength={500}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitButtonText}>{t('Submit')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: colors.light.primary,
    fontWeight: '600',
  },
  input: {
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    height: 120,
    marginBottom: 16,
    padding: 12,
    textAlignVertical: 'top',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    color: colors.light.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  successMessage: {
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  successText: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackModal; 