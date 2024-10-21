// src/app/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Import icon library

const Layout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#007AFF', // Active tab color
        tabBarLabelStyle: { fontSize: 16 }, // Tab label style
        tabBarStyle: { paddingBottom: 5 }, // Tab bar style
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = 'home'; // Icon for Home screen
          } else if (route.name === 'profile') {
            iconName = 'person'; // Icon for Profile screen
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index" // Route name for the home screen
        options={{ title: 'Home' }} // Tab title
      />
      <Tabs.Screen
        name="profile" // Route name for the profile screen
        options={{ title: 'Profile' }} // Tab title
      />
    </Tabs>
  );
};

export default Layout;
