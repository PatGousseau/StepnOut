import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { Text } from './StyledText';
import { useLanguage } from '../contexts/LanguageContext';
import { useUpdateAvailable } from '../hooks/useUpdateAvailable';

export const UpdateAvailableBanner = () => {
  const { t } = useLanguage();
  const { updateAvailable, storeUrl } = useUpdateAvailable();
  const [dismissed, setDismissed] = useState(false);

  const canShow = useMemo(() => {
    if (dismissed) return false;
    if (!updateAvailable) return false;
    if (!storeUrl) return false;
    return true;
  }, [dismissed, updateAvailable, storeUrl]);

  const handleUpdatePress = useCallback(async () => {
    if (!storeUrl) return;

    const canOpen = await Linking.canOpenURL(storeUrl);
    if (!canOpen) return;

    await Linking.openURL(storeUrl);
  }, [storeUrl]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (!canShow) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name="sparkles" size={16} color={colors.light.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('Update available')}</Text>
          <Text style={styles.subtitle}>{t('Update to get the latest features.')}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress} activeOpacity={0.8}>
          <Text style={styles.updateButtonText}>{t('Update')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss} hitSlop={10}>
          <Ionicons name="close" size={18} color={colors.light.lightText} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light.accent2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grey2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.light.lightText,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  updateButton: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  updateButtonText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 2,
  },
});

export default UpdateAvailableBanner;
