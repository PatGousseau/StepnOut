import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text } from './StyledText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors'; 

const Header = () => {
  const notificationCount = 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.logo}>Stepn Out</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color={colors.light.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications" size={32} color={colors.light.cardBg} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.light.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'PingFangSC-Medium',
    color: '#fff',
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
