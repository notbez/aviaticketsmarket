// screens/SignUpScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export default function SignUpScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportCountry, setPassportCountry] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notificationsAccepted, setNotificationsAccepted] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleSignUp = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Ошибка', 'Введите ФИО');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Ошибка', 'Необходимо принять пользовательское соглашение');
      return;
    }

    setLoading(true);
    try {
      const body = {
        fullName,
        email,
        phone,
        password,
        passportNumber: passportNumber || undefined,
        passportCountry: passportCountry || undefined,
        passportExpiryDate: passportExpiryDate || undefined,
        termsAccepted,
        notificationsAccepted,
      };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Обработка различных типов ошибок
        let errorMessage = 'Ошибка регистрации';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : data.error.message || errorMessage;
        } else if (Array.isArray(data.message)) {
          errorMessage = data.message.join(', ');
        }
        throw new Error(errorMessage);
      }

      // Проверяем наличие необходимых полей в ответе
      if (!data.accessToken || !data.user) {
        throw new Error('Некорректный ответ от сервера');
      }

      // Save token and user
      await login(data.accessToken, data.user);
      Alert.alert('Успешно', 'Регистрация завершена');
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Не удалось зарегистрироваться');
      console.error('SignUp error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужен доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <MaterialCommunityIcons name="airplane" size={36} color="#000" />
        </View>

        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.sub}>Заполните данные для создания аккаунта</Text>

        {/* Avatar */}
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="camera" size={32} color="#999" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Input
            label="ФИО"
            placeholder="Введите ваше полное имя"
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            label="Email"
            placeholder="Введите email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Пароль"
            placeholder="Минимум 6 символов"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Подтвердите пароль"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Text style={styles.sectionTitle}>Паспортные данные</Text>

          <Input
            label="Номер паспорта"
            placeholder="Серия и номер"
            value={passportNumber}
            onChangeText={setPassportNumber}
          />

          <Input
            label="Страна выдачи"
            placeholder="Россия"
            value={passportCountry}
            onChangeText={setPassportCountry}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateLabel}>Срок действия паспорта</Text>
            <Text style={styles.dateValue}>
              {passportExpiryDate.toLocaleDateString('ru-RU')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={passportExpiryDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setPassportExpiryDate(selectedDate);
                }
              }}
            />
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={[styles.checkboxBox, termsAccepted && styles.checkboxBoxChecked]}>
                {termsAccepted && (
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                Принимаю пользовательское соглашение
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setNotificationsAccepted(!notificationsAccepted)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  notificationsAccepted && styles.checkboxBoxChecked,
                ]}
              >
                {notificationsAccepted && (
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                Согласен получать уведомления
              </Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            title="Зарегистрироваться"
            onPress={handleSignUp}
            disabled={loading}
          />
        </View>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>
            Уже есть аккаунт? <Text style={{ color: '#29A9E0' }}>Войти</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 40 },
  header: { alignItems: 'center' },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto_700Bold',
    marginTop: 16,
    textAlign: 'center',
  },
  sub: {
    color: '#9A9A9A',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  form: {
    width: '100%',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Roboto_400Regular',
  },
  dateValue: {
    fontSize: 16,
    color: '#111',
    fontFamily: 'Roboto_400Regular',
  },
  checkboxContainer: {
    marginVertical: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#29A9E0',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxBoxChecked: {
    backgroundColor: '#29A9E0',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Roboto_400Regular',
  },
  link: { marginTop: 12 },
  linkText: { color: '#777', fontFamily: 'Roboto_400Regular' },
});
