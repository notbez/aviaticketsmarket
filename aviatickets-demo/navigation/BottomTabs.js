// navigation/BottomTabs.js
import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TicketsScreen from '../screens/TicketsScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

// Предзагрузка иконок для оптимизации
const homeIcon = require('../assets/icons/tab-home.png');
const ticketsIcon = require('../assets/icons/tab-tickets.png');
const profileIcon = require('../assets/icons/tab-profile.png');

export default function BottomTabs() {
  const insets = useSafeAreaInsets();

  // Мемоизация стилей для оптимизации
  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: '#fff',
      height: 60 + insets.bottom,
      paddingBottom: insets.bottom + 6,
      paddingTop: 8,
      borderTopWidth: 0,
      elevation: 5,
    }),
    [insets.bottom],
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarLabelStyle: { fontSize: 12 },
        lazy: true, // Ленивая загрузка экранов
      }}
    >
      {/* Главная — теперь первая вкладка */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({ focused }) => (
            <Image
              source={homeIcon}
              style={{
                width: 28,
                height: 28,
                opacity: focused ? 1 : 0.6,
              }}
            />
          ),
        }}
      />

      {/* Билеты — вторая вкладка */}
      <Tab.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          tabBarLabel: 'Билеты',
          tabBarIcon: ({ focused }) => (
            <Image
              source={ticketsIcon}
              style={{
                width: 24,
                height: 24,
                opacity: focused ? 1 : 0.6,
              }}
            />
          ),
        }}
      />

      {/* Профиль */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ focused }) => (
            <Image
              source={profileIcon}
              style={{
                width: 24,
                height: 24,
                opacity: focused ? 1 : 0.6,
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}