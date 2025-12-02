/**
 * AuthContext.js - React Context для управления состоянием авторизации
 * 
 * Этот контекст предоставляет глобальное состояние авторизации для всего приложения:
 * - user: данные текущего пользователя
 * - token: JWT токен для API запросов
 * - loading: состояние загрузки (пока проверяется сохраненная авторизация)
 * - login: функция для входа пользователя
 * - logout: функция для выхода пользователя
 * - updateUser: функция для обновления данных пользователя
 * 
 * Данные сохраняются в AsyncStorage для восстановления сессии после перезапуска приложения
 * 
 * @module AuthContext
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Создаем контекст для авторизации
const AuthContext = createContext();

/**
 * Хук useAuth - для доступа к контексту авторизации
 * 
 * @returns {Object} Объект с состоянием и функциями авторизации
 * @throws {Error} Если используется вне AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * AuthProvider - провайдер контекста авторизации
 * 
 * Оборачивает приложение и предоставляет состояние авторизации всем дочерним компонентам
 * 
 * @param {Object} props - React props
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {JSX.Element} Provider компонент
 */
export const AuthProvider = ({ children }) => {
  // Состояние авторизации
  const [user, setUser] = useState(null);      // Данные пользователя
  const [token, setToken] = useState(null);    // JWT токен
  const [loading, setLoading] = useState(true); // Загрузка (проверка сохраненной сессии)

  // При монтировании компонента загружаем сохраненную авторизацию
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Загрузка сохраненной авторизации из AsyncStorage
   * Вызывается при старте приложения для восстановления сессии
   */
  const loadStoredAuth = async () => {
    try {
      // Пытаемся загрузить токен и данные пользователя из локального хранилища
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      // Если данные найдены, восстанавливаем состояние
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser)); // Парсим JSON строку обратно в объект
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      // В любом случае завершаем загрузку
      setLoading(false);
    }
  };

  /**
   * Функция входа пользователя
   * 
   * @param {string} authToken - JWT токен от сервера
   * @param {Object} userData - Данные пользователя
   * @throws {Error} Если не удалось сохранить данные
   */
  const login = async (authToken, userData) => {
    try {
      // Сохраняем токен и данные пользователя в AsyncStorage
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Обновляем состояние
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Error saving auth:', error);
      throw error;
    }
  };

  /**
   * Функция выхода пользователя
   * Удаляет все данные авторизации из хранилища и состояния
   */
  const logout = async () => {
    try {
      // Удаляем данные из AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // Очищаем состояние
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  /**
   * Обновление данных пользователя
   * 
   * @param {Object} userData - Новые данные пользователя
   */
  const updateUser = (userData) => {
    setUser(userData);
    // Сохраняем обновленные данные в AsyncStorage
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  // Предоставляем состояние и функции через контекст
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

