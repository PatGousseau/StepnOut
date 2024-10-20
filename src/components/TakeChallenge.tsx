import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Colors from '../constants/Colors'; 

interface ChallengeCardProps {
  title: string;
  description: string;
  onTakeChallenge: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ title, description, onTakeChallenge }) => {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-20);

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onTakeChallenge}>
            <Text style={styles.buttonText}>Take Challenge</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: Colors.light.primary, 
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
  textContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  textBlock: {
    flex: 1, 
    marginRight: 8, 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.text, 
  },
  description: {
    fontSize: 16,
    opacity: 0.9,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.accent, 
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: Colors.light.text, 
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChallengeCard;
