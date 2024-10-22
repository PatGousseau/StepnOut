import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../constants/Colors';
import Markdown from 'react-native-markdown-display';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ChallengeCardProps {
  title: string;
  description: string;
  onTakeChallenge: () => void;
}

const markdownStyles = StyleSheet.create({
  body: {
    color: 'white',
  },
});

const ChallengeCard: React.FC<ChallengeCardProps> = ({ title, description, onTakeChallenge }) => {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, animation]);

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], 
  });

  return (
    <Animated.View style={[styles.card]}>
      <TouchableOpacity style={styles.cardContent} onPress={toggleExpand} activeOpacity={1}>
        <View style={styles.topContainer}>
          <TouchableOpacity style={styles.button} onPress={onTakeChallenge}>
            <Text style={styles.buttonText}>Upload</Text>
          </TouchableOpacity>
          <View style={styles.challengeText}>
            <Text style={styles.thisWeeksChallengeLabel}>This Week's Challenge</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={18} color="white" />
        </View>
        <Animated.View style={[styles.descriptionContainer, { height: animatedHeight }]}>
          <Markdown style={markdownStyles}>{description}</Markdown>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  thisWeeksChallengeLabel: {
    fontSize: 14,
    color: colors.dark.text,
    marginBottom: 4,
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.dark.tint, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  challengeText: {
    marginLeft: 0,
    padding: 0,
  },
  topContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  descriptionContainer: {
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.text, 
    flex: 1,
  },
  button: {
    backgroundColor: colors.light.accent, 
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: colors.dark.text, 
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChallengeCard;
