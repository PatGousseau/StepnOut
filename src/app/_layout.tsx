import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../constants/Colors'; 
import Header from '../components/Header';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Layout = () => {
  return (
    <>
      <Header />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: colors.light.primary,
          tabBarStyle: { 
            paddingBottom: 5,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'index') {
              iconName = 'home';
            } else if (route.name === 'profile') {
              iconName = 'person';
            } else if (route.name === 'admin') {
              iconName = 'settings';
            // } else if (route.name === 'fonts') {
            //   iconName = 'text';
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
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '',
            headerStyle: { backgroundColor: colors.light.primary },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: '',
            headerStyle: { backgroundColor: colors.light.primary },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
        {/* <Tabs.Screen
          name="fonts"
          options={{
            title: 'Fonts',
            headerStyle: { backgroundColor: colors.light.primary },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        /> */}
      </Tabs>
    </>
  );
};

export default Layout;
