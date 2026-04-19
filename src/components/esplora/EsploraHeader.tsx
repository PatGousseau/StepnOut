import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import { esploraSpacing, esploraType } from '../../constants/EsploraStyles';
import { useLanguage } from '../../contexts/LanguageContext';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

export const EsploraHeader: React.FC = () => {
  const { t } = useLanguage();

  const handleSavedPress = () => {
    captureEvent(ESPLORA_EVENTS.SAVED_OPENED);
    router.push('/esplora/saved');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>{t('Esplora')}</Text>
      <TouchableOpacity
        onPress={handleSavedPress}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('Saved')}
      >
        <Ionicons name="bookmark-outline" size={22} color={colors.light.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: esploraSpacing.horizontalPadding,
    paddingTop: esploraSpacing.lg,
    paddingBottom: esploraSpacing.md,
  },
  wordmark: {
    ...esploraType.wordmark,
    color: colors.light.text,
  },
});
