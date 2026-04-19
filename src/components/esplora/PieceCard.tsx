import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';
import { esploraSpacing, esploraType } from '../../constants/EsploraStyles';
import { useLanguage } from '../../contexts/LanguageContext';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

interface HookCardProps {
  kind: 'hook';
  text: string;
}

interface BodyCardProps {
  kind: 'body';
  text: string;
}

interface ClosingCardProps {
  kind: 'closing';
  text: string;
  closingKind: 'prompt' | 'cta';
  challengeId: number | null;
}

type Props = HookCardProps | BodyCardProps | ClosingCardProps;

export const PieceCard: React.FC<Props> = (props) => {
  const { t } = useLanguage();

  if (props.kind === 'hook') {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.hook}>{props.text}</Text>
      </View>
    );
  }

  if (props.kind === 'body') {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.body}>{props.text}</Text>
      </View>
    );
  }

  const handleCta = () => {
    if (props.challengeId != null) {
      captureEvent(ESPLORA_EVENTS.CTA_TAPPED, {
        challenge_id: props.challengeId,
      });
      router.push(`/challenge/${props.challengeId}`);
    }
  };

  return (
    <View style={[styles.card, styles.centered]}>
      <Text style={styles.closingText}>{props.text}</Text>
      {props.closingKind === 'cta' && props.challengeId != null && (
        <TouchableOpacity
          onPress={handleCta}
          style={styles.ctaButton}
          accessibilityRole="button"
        >
          <Text style={styles.ctaButtonText}>{t('Take the challenge')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: esploraSpacing.readerHorizontalPadding,
    paddingVertical: esploraSpacing.xl,
  },
  centered: {
    justifyContent: 'center',
  },
  hook: {
    ...esploraType.hookLarge,
    color: colors.light.text,
    fontSize: 30,
    lineHeight: 42,
    textAlign: 'left',
  },
  body: {
    ...esploraType.body,
    color: colors.light.text,
    fontSize: 17,
    lineHeight: 28,
  },
  closingText: {
    ...esploraType.hook,
    color: colors.light.text,
    marginBottom: esploraSpacing.xl,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: esploraSpacing.lg,
    paddingVertical: esploraSpacing.md,
    backgroundColor: colors.light.primary,
    borderRadius: 999,
  },
  ctaButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
