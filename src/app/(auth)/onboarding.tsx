import React from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import { colors } from '../../constants/Colors';
import { useLanguage } from '../../contexts/LanguageContext';

export default function OnboardingScreen() {
  const { t } = useLanguage();

  return (
    <Onboarding
      onSkip={() => router.replace('/(tabs)')}
      onDone={() => router.replace('/(tabs)')}
      showNext={true}
      showSkip={false}
      nextLabel={t('Next')}
      bottomBarHighlight={false}
      bottomBarColor={colors.light.background}
      transitionAnimationDuration={200}
      allowFontScalingButtons={false}
      containerStyles={{
        padding: 0,
        margin: 0,
        justifyContent: 'flex-start',
      }}
      imageContainerStyles={{
        paddingBottom: 0,
        paddingTop: 0,
        flex: 0,
        height: '70%',
      }}
      titleStyles={{
        marginTop: 10,
        paddingTop: 0,
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.light.text,
      }}
      subTitleStyles={{
        marginTop: -10,
        fontSize: 15,
        color: colors.light.text,
      }}
      bottomBarHeight={60}
      topBarHeight={0}
      controlStatusBar={false}
      pages={[
        {
          backgroundColor: colors.light.background,
          image: (
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/playstore.png')} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
            </View>
          ),
          title: t('Welcome to Stepn Out!'),
          subtitle: t('A community for people who want to step out of their comfort zone and challenge themselves.')
        },
        {
          backgroundColor: colors.light.background,
          image: (
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/home-screen.png')} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
            </View>
          ),
          title: t('Create a discussion post'),
          subtitle: t('Share your thoughts, ask questions, and connect with others on Stepn Out')
        },
        {
          backgroundColor: colors.light.background,
          image: (
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/challenge-screen.png')} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
            </View>
          ),
          title: t('Complete a challenge'),
          subtitle: t('Every week a new challenge is posted. Complete it and share your progress with the community.')
        },
        {
          backgroundColor: colors.light.background,
          image: (
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/complete-challenge.png')} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
            </View>
          ),
          title: t('Share your experience'),
          subtitle: t('Complete challenge by sharing your experience with the community.')
        },
        {
          backgroundColor: colors.light.background,
          image: (
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/profile-screen.png')} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
            </View>
          ),
          title: t('Track your progress'),
          subtitle: t('View your streaks and challenges completed.')
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: '100%',
    margin: 0,
    padding: 0,
    width: '100%',
  },
  onboardingImage: {
    height: '100%',
    margin: 0,
    padding: 0,
    width: '100%',
  },
}); 