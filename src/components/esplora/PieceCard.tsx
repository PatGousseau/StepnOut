import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../constants/Colors';
import { esploraSpacing, esploraType } from '../../constants/EsploraStyles';
import { CardLink, ContentCard } from '../../types';
import { captureEvent } from '../../lib/posthog';
import { ESPLORA_EVENTS } from '../../constants/analyticsEvents';

interface HookCardProps {
  kind: 'hook';
  text: string;
}

interface BodyCardProps {
  kind: 'body';
  card: ContentCard;
  pieceId: number;
}

type Props = HookCardProps | BodyCardProps;

export const PieceCard: React.FC<Props> = (props) => {
  if (props.kind === 'hook') {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.hook}>{props.text}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.centered]}>
      <CardBody card={props.card} pieceId={props.pieceId} />
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
  const { width } = useWindowDimensions();
  const playerWidth = width - esploraSpacing.readerHorizontalPadding * 2;
  const playerHeight = (playerWidth * 9) / 16;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  return (
    <View>
      <View
        style={{
          width: playerWidth,
          height: playerHeight,
          backgroundColor: colors.neutral.black,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${videoId}?playsinline=1` }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          javaScriptEnabled
        />
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      <TouchableOpacity
        onPress={() => Linking.openURL(watchUrl)}
        style={styles.youtubeFallback}
        accessibilityRole="link"
      >
        <Text style={styles.youtubeFallbackText}>Open in YouTube →</Text>
      </TouchableOpacity>
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
  youtubeFallback: {
    marginTop: esploraSpacing.sm,
  },
  youtubeFallbackText: {
    ...esploraType.body,
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
