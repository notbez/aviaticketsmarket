// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <MaterialCommunityIcons name="airplane" size={36} color="#000" />
        </View>

        <Text style={styles.title}>Начните путешествие</Text>
        <Text style={styles.sub}>Ваши данные в безопасности. Войдите, чтобы продолжить.</Text>

        <View style={{ marginTop: 18, width: '100%' }}>

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

          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.remember}>
              <View style={styles.radio} />
              <Text style={styles.remTxt}>Запомнить меня</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgot}>Забыли пароль?</Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton title="Войти" onPress={handleSignIn} />
        </View>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>
            Нет аккаунта? <Text style={{ color: '#29A9E0' }}>Зарегистрироваться</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.sepWrap}>
          <View style={styles.line} />
          <Text style={styles.or}>или</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <FontAwesome name="google" size={20} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <FontAwesome name="facebook" size={20} color="#4267B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <FontAwesome name="apple" size={20} color="#000" />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, alignItems: 'center' },

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
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },

  remember: { flexDirection: 'row', alignItems: 'center' },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },

  remTxt: { color: '#555', fontFamily: 'Roboto_400Regular' },

  forgot: { color: '#29A9E0', fontSize: 13, fontFamily: 'Roboto_500Medium' },

  link: { marginTop: 12 },

  linkText: { color: '#777', fontFamily: 'Roboto_400Regular' },

  sepWrap: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 18 },

  line: { flex: 1, height: 1, backgroundColor: '#eee' },

  or: { marginHorizontal: 10, color: '#999', fontFamily: 'Roboto_400Regular' },

  socialRow: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'space-between',
    width: '60%',
  },

  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    elevation: 2,
  },
});