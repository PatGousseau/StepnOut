import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import { colors } from '../../constants/Colors';

export default function OnboardingScreen() {
  return (
    <Onboarding
      onSkip={() => router.replace('/(tabs)')}
      onDone={() => router.replace('/(tabs)')}
      pages={[
        {
          backgroundColor: colors.light.background,
          image: (
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/splash.png')} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
            </View>
          ),
          title: 'Welcome, Stepn Out Adventurer!',
          subtitle: 'Ready to step out of your comfort zone? Each week, Patrizio challenges you to do something bold. Join the community, complete challenges, and share your journey!'
        },
        {
          backgroundColor: colors.light.background,
          image: (
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/splash.png')} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
            </View>
          ),
          title: 'How Stepn Out Works',
          subtitle: '• Weekly Challenges from Patrizio\n• Complete & Share your journey\n• Earn Streaks & Kudos'
        },
        {
          backgroundColor: colors.light.background,
          image: (
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/splash.png')} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
            </View>
          ),
          title: 'Join a Supportive Community',
          subtitle: 'Celebrate small wins, be inspired by featured posts, and connect with others stepping out of their comfort zones!'
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
}); 