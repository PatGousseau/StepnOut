import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Text } from './StyledText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors'; 
import { useNotifications } from '../hooks/useNotifications';
import NotificationSidebar from './NotificationSidebar';

const Header = () => {
  const { unreadCount, markAllAsRead, notifications } = useNotifications();
  
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationPress = () => {
    markAllAsRead();
    setShowNotifications(true);
  };

  const handleSidebarClose = () => {
    setShowNotifications(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        </TouchableOpacity>
        <Text style={styles.stepnOut}>Stepn Out</Text>
        <TouchableOpacity 
          style={styles.notificationIcon}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications" size={28} color={colors.light.primary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <NotificationSidebar 
        visible={showNotifications}
        onClose={handleSidebarClose}
        notifications={notifications}
      />
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
  },
  stepnOut: {
    fontSize: 18,
    fontFamily: 'PingFangSC-Bold',
    fontWeight: 'bold',
    color: colors.light.primary,
  },
  notificationIcon: {
    marginLeft: 15, 
    position: 'relative', 
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: -4,
    backgroundColor: colors.light.alertRed, 
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;
