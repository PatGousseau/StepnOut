// src/app/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', // Active tab color
        tabBarLabelStyle: { fontSize: 16 }, // Tab label style
        tabBarStyle: { paddingBottom: 5 }, // Tab bar style
      }}
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
