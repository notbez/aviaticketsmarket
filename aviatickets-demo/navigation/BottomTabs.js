// navigation/BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TicketsScreen from '../screens/TicketsScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',

          // адаптация для Android + iOS
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,

          borderTopWidth: 0,
          elevation: 5,
        },
        tabBarLabelStyle: { fontSize: 12 },
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
              source={require('../assets/icons/tab-home.png')}
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
              source={require('../assets/icons/tab-tickets.png')}
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
              source={require('../assets/icons/tab-profile.png')}
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