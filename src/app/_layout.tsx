import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../constants/Colors'; 
import Header from '../components/Header'

const Layout = () => {
  return (
    <><Header /><Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.light.primary,
        tabBarLabelStyle: { fontSize: 16 },
        tabBarStyle: { paddingBottom: 5 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'profile') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.light.primary },
          headerTintColor: '#fff',
          headerShown: false,
        }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.light.primary },
          headerTintColor: '#fff',
          headerShown: false,
        }} />
    </Tabs></>
  );
};

export default Layout;
