import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { Text } from './StyledText';
import { useLanguage } from '../contexts/LanguageContext';
import { useUpdateAvailable } from '../hooks/useUpdateAvailable';

export const UpdateAvailableModal = () => {
  const { t } = useLanguage();
  const { updateAvailable, storeUrl } = useUpdateAvailable();
  const [dismissed, setDismissed] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  const visible = updateAvailable && !!storeUrl && !dismissed;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [visible, slideAnim]);

  const handleUpdatePress = useCallback(async () => {
    if (!storeUrl) return;
    const canOpen = await Linking.canOpenURL(storeUrl);
    if (!canOpen) return;
    await Linking.openURL(storeUrl);
  }, [storeUrl]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleDismiss}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
          onStartShouldSetResponder={() => true}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={28} color={colors.light.primary} />
          </View>
          <Text style={styles.title}>{t('Update available')}</Text>
          <Text style={styles.subtitle}>{t('Update to get the latest features.')}</Text>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress} activeOpacity={0.8}>
            <Text style={styles.updateButtonText}>{t('Update')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterButton} onPress={handleDismiss} hitSlop={10}>
            <Text style={styles.laterButtonText}>{t('Not now')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.light.accent2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.light.lightText,
    textAlign: 'center',
    marginBottom: 20,
  },
  updateButton: {
    width: '100%',
    backgroundColor: colors.light.primary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  updateButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 12,
    marginTop: 4,
  },
  laterButtonText: {
    color: colors.light.lightText,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default UpdateAvailableModal;
