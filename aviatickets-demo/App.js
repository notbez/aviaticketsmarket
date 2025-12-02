/**
 * App.js - Корневой компонент React Native приложения
 * 
 * Этот файл является точкой входа приложения и выполняет:
 * 1. Загрузку шрифтов Roboto
 * 2. Инициализацию AuthProvider для управления состоянием авторизации
 * 3. Настройку навигации через NavigationContainer
 * 4. Отображение экрана загрузки пока шрифты не загружены
 * 
 * @component App
 */

import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import RootNavigator from './navigation/RootNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

/**
 * NavigationWrapper - обертка для навигации с проверкой авторизации
 */
function NavigationWrapper() {
  const { token, loading } = useAuth();
  const navigationRef = useRef(null);

  useEffect(() => {
    if (!loading && navigationRef.current) {
      if (!token) {
        // Если пользователь не авторизован, показываем экран входа
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        // Если пользователь авторизован, показываем главный экран
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    }
  }, [token, loading]);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * Главный компонент приложения
 * 
 * @returns {JSX.Element} Корневой компонент с навигацией и провайдерами
 */
export default function App() {
  // Загрузка шрифтов Roboto для использования в приложении
  // fontsLoaded будет true когда все шрифты загрузятся
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,  // Обычный шрифт
    Roboto_500Medium,   // Средний шрифт
    Roboto_700Bold,     // Жирный шрифт
  });

  // Пока шрифты не загружены, показываем экран загрузки
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#29A9E0" />
        <StatusBar barStyle="default" />
      </View>
    );
  }

  // Когда шрифты загружены, рендерим основное приложение
  // AuthProvider оборачивает все приложение для доступа к состоянию авторизации
  return (
    <AuthProvider>
      <NavigationWrapper />
    </AuthProvider>
  );
}