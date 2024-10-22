import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../constants/Colors'; 

const Layout = () => {
  return (
    <Tabs
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
          title: 'Home',
          headerStyle: { backgroundColor: colors.light.primary },
          headerTintColor: '#fff',
        }}
      />
      <Tabs.Screen
        name="profile" 
        options={{ 
          title: 'Profile',
          headerStyle: { backgroundColor: colors.light.secondary },
          headerTintColor: '#fff', 
        }}
      />
    </Tabs>
  );
};

export default Layout;
