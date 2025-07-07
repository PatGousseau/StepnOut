import React, { useEffect, useRef } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Animated } from 'react-native';
import { Text } from './StyledText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors'; 
import { router } from 'expo-router';
import { useUploadProgress } from '../contexts/UploadProgressContext';

interface HeaderProps {
  onNotificationPress: () => void;
  onMenuPress: () => void;
  onFeedbackPress: () => void;
  unreadCount: number;
  isDetailPage?: boolean;
  hideLogo?: boolean;
}

const Header = ({ 
  onNotificationPress, 
  onMenuPress,
  onFeedbackPress, 
  unreadCount, 
  isDetailPage = false,
  hideLogo = false
}: HeaderProps) => {
  const { uploadProgress, uploadMessage } = useUploadProgress();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (uploadProgress !== null) {
      // Smoothly animate to the new progress value
      Animated.timing(progressAnimation, {
        toValue: uploadProgress,
        duration: 300,
        useNativeDriver: false
      }).start();

      // Show message with fade in if present
      if (uploadMessage) {
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      } else {
        Animated.timing(messageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    } else {
      // Reset progress when upload is complete
      Animated.timing(progressAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start();
      
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [uploadProgress, uploadMessage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {uploadProgress !== null && (
        <View style={styles.uploadContainer}>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { 
                  width: progressAnimation.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
          {uploadMessage && (
            <Animated.View 
              style={[
                styles.messageContainer,
                { opacity: messageOpacity }
              ]}
            >
              <Text style={styles.messageText}>{uploadMessage}</Text>
            </Animated.View>
          )}
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (isDetailPage) {
              router.back();
            } else {
              onMenuPress();
            }
          }}
        >
          {isDetailPage ? (
            <Ionicons name="chevron-back" size={24} color={colors.light.primary} />
          ) : (
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          )}
        </TouchableOpacity>
        
        {!hideLogo && (
          <Image 
            source={require('../assets/images/header-logo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
        )}
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.feedbackIcon}
            onPress={onFeedbackPress}
          >
            <Ionicons name="help-circle-outline" size={26} color={colors.light.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationIcon}
            onPress={onNotificationPress}
          >
            <Ionicons name="notifications" size={28} color={colors.light.primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: colors.light.alertRed,
    borderRadius: 10,
    height: 18, 
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: -4,
    width: 18,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedbackIcon: {
    marginRight: 16,
    position: 'relative',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'android' ? 10 : 16,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logo: {
    height: 28,
    marginRight: 32,
    width: 28,
  },
  notificationIcon: {
    position: 'relative',
  },
  safeArea: {
    // backgroundColor: colors.light.primary,
    backgroundColor: colors.light.background
  },
  headerLogo: {
    height: 30,
    width: 120,
  },
  uploadContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#ddd',
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.light.accent,
    borderRadius: 1.5,
  },
  messageContainer: {
    backgroundColor: colors.light.accent,
    padding: 8,
    alignItems: 'center',
  },
  messageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;
