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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.light.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  submitButton: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: colors.light.primary,
    fontWeight: '600',
  },
  successMessage: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  successText: {
    fontSize: 16,
    color: colors.light.primary,
    fontWeight: '600',
  },
});

export default FeedbackModal; 