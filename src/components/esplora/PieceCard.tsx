import React, { useState } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { colors } from '../../constants/Colors';
import {
  CATEGORY_GRADIENTS,
  CATEGORY_LABEL_KEYS,
  esploraSpacing,
  esploraType,
} from '../../constants/EsploraStyles';
import { CardLink, ContentCard, ContentCategory } from '../../types';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';
import { useLanguage } from '../../contexts/LanguageContext';
import { CARD_STACK_OUTER_MARGIN, CARD_STACK_RADIUS } from './CardPager';

const CARD_INNER_PADDING = esploraSpacing.lg;

interface HookCardProps {
  kind: 'hook';
  text: string;
  category: ContentCategory;
}

interface BodyCardProps {
  kind: 'body';
  card: ContentCard;
  pieceId: number;
}

type Props = HookCardProps | BodyCardProps;

export const PieceCard: React.FC<Props> = (props) => {
  if (props.kind === 'hook') {
    return <HookCard text={props.text} category={props.category} />;
  }

  return (
    <View style={[styles.card, styles.centered]}>
      <CardBody card={props.card} pieceId={props.pieceId} />
    </View>
  );
};

const HookCard: React.FC<{ text: string; category: ContentCategory }> = ({
  text,
  category,
}) => {
  const { t } = useLanguage();
  const accentColor = CATEGORY_GRADIENTS[category][0];
  const eyebrow = t(CATEGORY_LABEL_KEYS[category]).toUpperCase();
  return (
    <View style={[styles.card, styles.hookCard]}>
      <View style={[styles.hookAccent, { backgroundColor: accentColor }]} />
      <Text style={[styles.hookEyebrow, { color: accentColor }]}>{eyebrow}</Text>
      <Text style={styles.hook}>{text}</Text>
    </View>
  );
};

const CardBody: React.FC<{ card: ContentCard; pieceId: number }> = ({
  card,
  pieceId,
}) => {
  if (card.type === 'text') {
    return (
      <View>
        <Text style={styles.body}>{card.body}</Text>
        {card.link ? <InlineLink link={card.link} pieceId={pieceId} /> : null}
      </View>
    );
  }

  if (card.type === 'youtube') {
    return <YouTubeEmbed videoId={card.video_id} caption={card.caption} />;
  }

  return (
    <LinkCard
      url={card.url}
      label={card.label}
      description={card.description}
      pieceId={pieceId}
    />
  );
};

const InlineLink: React.FC<{ link: CardLink; pieceId: number }> = ({
  link,
  pieceId,
}) => {
  const handlePress = () => {
    captureEvent(ESPLORA_EVENTS.EXTERNAL_LINK_TAPPED, { piece_id: pieceId });
    Linking.openURL(link.url);
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.inlineLink}
      accessibilityRole="link"
    >
      <Text style={styles.inlineLinkText}>{link.label ?? link.url} →</Text>
    </TouchableOpacity>
  );
};

const LinkCard: React.FC<{
  url: string;
  label: string;
  description?: string;
  pieceId: number;
}> = ({ url, label, description, pieceId }) => {
  const handlePress = () => {
    captureEvent(ESPLORA_EVENTS.EXTERNAL_LINK_TAPPED, { piece_id: pieceId });
    Linking.openURL(url);
  };
  return (
    <TouchableOpacity onPress={handlePress} accessibilityRole="link">
      <Text style={styles.linkLabel}>{label} →</Text>
      {description ? <Text style={styles.linkDesc}>{description}</Text> : null}
    </TouchableOpacity>
  );
};

const YouTubeEmbed: React.FC<{ videoId: string; caption?: string }> = ({
  videoId,
  caption,
}) => {
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const playerWidth = width - (CARD_STACK_OUTER_MARGIN + CARD_INNER_PADDING) * 2;
  const playerHeight = (playerWidth * 9) / 16;
  const playerSize = { width: playerWidth, height: playerHeight };
  const thumbUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleActivate = () => {
    setActivated(true);
    setPlaying(true);
  };

  if (errored) {
    return (
      <View>
        <TouchableOpacity
          onPress={() => Linking.openURL(watchUrl)}
          activeOpacity={0.85}
          accessibilityRole="link"
          style={[styles.youtubeFrame, playerSize]}
        >
          <Image
            source={{ uri: thumbUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.youtubePlayOverlay}>
            <View style={styles.youtubePlayBadge}>
              <Ionicons name="open-outline" size={26} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.caption}>
          {caption ? `${caption} — ` : ''}{t('Open on YouTube')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {activated ? (
        <View style={[styles.youtubeFrame, playerSize]}>
          <YoutubePlayer
            height={playerHeight}
            width={playerWidth}
            videoId={videoId}
            play={playing}
            onChangeState={(state: string) => {
              if (state === 'ended') setPlaying(false);
            }}
            onError={() => setErrored(true)}
          />
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleActivate}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={caption ? `Play video: ${caption}` : 'Play video'}
          style={[styles.youtubeFrame, playerSize]}
        >
          <Image
            source={{ uri: thumbUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.youtubePlayOverlay}>
            <View style={styles.youtubePlayBadge}>
              <Ionicons name="play" size={28} color="#FFFFFF" style={styles.youtubePlayIcon} />
            </View>
          </View>
        </TouchableOpacity>
      )}
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: CARD_INNER_PADDING,
    paddingVertical: esploraSpacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_STACK_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  centered: {
    justifyContent: 'center',
  },
  hookCard: {
    justifyContent: 'center',
  },
  hookAccent: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: esploraSpacing.md,
  },
  hookEyebrow: {
    ...esploraType.categoryLabel,
    fontSize: 12,
    letterSpacing: 1.4,
    marginBottom: esploraSpacing.md,
  },
  hook: {
    ...esploraType.body,
    color: colors.light.text,
    fontSize: 19,
    lineHeight: 30,
    fontStyle: 'italic',
    textAlign: 'left',
  },
  body: {
    ...esploraType.body,
    color: colors.light.text,
    fontSize: 17,
    lineHeight: 28,
  },
  inlineLink: {
    marginTop: esploraSpacing.lg,
  },
  inlineLinkText: {
    ...esploraType.body,
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  linkLabel: {
    ...esploraType.hook,
    color: colors.light.primary,
  },
  linkDesc: {
    ...esploraType.body,
    color: colors.light.lightText,
    fontSize: 15,
    marginTop: esploraSpacing.sm,
  },
  caption: {
    ...esploraType.body,
    color: colors.light.lightText,
    fontSize: 14,
    marginTop: esploraSpacing.md,
  },
  youtubeFrame: {
    backgroundColor: colors.neutral.black,
    borderRadius: 8,
    overflow: 'hidden',
  },
  youtubePlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  youtubePlayBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubePlayIcon: {
    marginLeft: 3,
  },
});
