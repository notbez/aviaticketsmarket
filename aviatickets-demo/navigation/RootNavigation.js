/**
 * RootNavigation.js - Корневая навигация приложения
 * 
 * Определяет структуру навигации между экранами приложения:
 * - MainTabs: главный экран с нижними вкладками (Home, Tickets, Profile)
 * - Login/SignUp: экраны авторизации
 * - Results: результаты поиска рейсов
 * - SelectCity: выбор города для поиска
 * - Account/Settings: настройки аккаунта
 * - Faq/Support: FAQ и поддержка
 * 
 * Использует Stack Navigator для навигации между экранами
 * headerShown: false - скрывает стандартный заголовок (используются кастомные)
 * 
 * @module RootNavigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './BottomTabs';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SelectCityScreen from '../screens/SelectCityScreen';

import AccountScreen from '../screens/AccountScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FaqScreen from '../screens/FaqScreen';
import SupportScreen from '../screens/SupportScreen';
import SupportOptionsScreen from '../screens/SupportOptionsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import FlightDetailsScreen from '../screens/FlightDetailsScreen';
import SeatSelectionScreen from '../screens/SeatSelectionScreen';
import PassengerInfoScreen from '../screens/PassengerInfoScreen';

const Stack = createStackNavigator();

/**
 * RootNavigator - корневой навигатор приложения
 * 
 * @returns {JSX.Element} Stack Navigator с всеми экранами
 */
export default function RootNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      {/* Экраны авторизации */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      {/* Главный экран с нижними вкладками (Home, Tickets, Profile) */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      
      {/* Экраны поиска и бронирования */}
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="SelectCity" component={SelectCityScreen} />
      <Stack.Screen name="FlightDetails" component={FlightDetailsScreen} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <Stack.Screen name="PassengerInfo" component={PassengerInfoScreen} />
      
      {/* Экраны профиля и настроек */}
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      
      {/* Экраны помощи */}
      <Stack.Screen name="SupportOptions" component={SupportOptionsScreen} />
      <Stack.Screen name="Faq" component={FaqScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
}