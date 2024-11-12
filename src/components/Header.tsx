import React from 'react';
import { Image, View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text } from './StyledText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors'; 

const Header = () => {
  const notificationCount = 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        </TouchableOpacity>
        <Text style={styles.stepnOut}>Stepn Out</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications" size={28} color={colors.light.primary} />
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
    // backgroundColor: colors.light.primary,
    backgroundColor: colors.light.background
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
    width: 28,
    height: 28,
  },
  stepnOut: {
    fontSize: 18,
    fontFamily: 'PingFangSC-Medium',
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
