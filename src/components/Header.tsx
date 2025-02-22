import React from 'react';
import { Image, View, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Text } from './StyledText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors'; 
import { router } from 'expo-router';

interface HeaderProps {
  onNotificationPress: () => void;
  onMenuPress: () => void;
  onFeedbackPress: () => void;
  unreadCount: number;
  isDetailPage?: boolean;
}

const Header = ({ onNotificationPress, onMenuPress, onFeedbackPress, unreadCount, isDetailPage = false }: HeaderProps) => {
  
  return (
    <SafeAreaView style={styles.safeArea}>
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
        
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Text style={styles.stepnOut}>Stepn Out</Text>
        </TouchableOpacity>
        
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
  stepnOut: {
    color: colors.light.primary,
    fontFamily: 'PingFangSC-Bold',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Header;
