// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Заголовок */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <MaterialCommunityIcons name="airplane" size={36} color="#000" />
        </View>

        <Text style={styles.title}>Создайте аккаунт</Text>
        <Text style={styles.sub}>Заполните данные, чтобы зарегистрироваться</Text>

        <View style={{ width: '100%', marginTop: 18 }}>
          <Input label="Имя" placeholder="Введите ваше имя" value={name} onChangeText={setName} />

          <Input
            label="Email"
            placeholder="Введите ваш email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            label="Пароль"
            placeholder="Введите пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Подтвердите пароль"
            placeholder="Введите пароль ещё раз"
            secureTextEntry
          />

          <PrimaryButton title="Зарегистрироваться" onPress={() => { }} />
        </View>

        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#777', fontFamily: 'Roboto_400Regular' }}>
            Уже есть аккаунт? <Text style={{ color: '#29A9E0' }}>Войти</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, alignItems: 'center' },
  header: { alignItems: 'center' },

  title: {
    fontSize: 20,
    fontFamily: 'Roboto_700Bold',
    marginTop: 12,
    textAlign: 'center',
  },

  sub: {
    color: '#9A9A9A',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
  },
});