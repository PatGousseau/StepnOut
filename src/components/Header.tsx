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
}

const Header = ({ onNotificationPress, onMenuPress, onFeedbackPress, unreadCount }: HeaderProps) => {
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            console.log('Logo clicked!');
            onMenuPress();
          }}
        >
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Text style={styles.stepnOut}>Stepn Out</Text>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.feedbackIcon}
            onPress={onFeedbackPress}
          >
            <Ionicons name="chatbox-ellipses-outline" size={26} color={colors.light.primary} />
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
  safeArea: {
    // backgroundColor: colors.light.primary,
    backgroundColor: colors.light.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'android' ? 10 : 16,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 32,
  },
  stepnOut: {
    fontSize: 18,
    fontFamily: 'PingFangSC-Bold',
    fontWeight: 'bold',
    color: colors.light.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: -4,
    backgroundColor: colors.light.alertRed, 
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedbackIcon: {
    position: 'relative',
    marginRight: 16,
  },
});

export default Header;
