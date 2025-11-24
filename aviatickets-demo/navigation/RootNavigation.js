// navigation/RootNavigation.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './BottomTabs';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SelectCityScreen from '../screens/SelectCityScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      {/* главное приложение с табами */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />

      {/* результаты поиска — full screen, без таб-бара */}
      <Stack.Screen name="Results" component={ResultsScreen} />

      {/* экран выбора города */}
      <Stack.Screen name="SelectCity" component={SelectCityScreen} />
    </Stack.Navigator>
  );
}