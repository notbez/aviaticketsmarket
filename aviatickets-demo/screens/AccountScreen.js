// screens/AccountScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const initialProfile = {
  username: 'Wahib Khan',
  email: 'wahibkhan5959@gmail.com',
  phone: '+920123456789',
  password: '••••••••',
  name: 'Wahib',
  middleName: 'Khan',
  gender: 'Мужской',
  passportNumber: 'EN007H5',
  country: 'Pakistan',
  expiryDate: '12-12-2030',
  avatar: null, // можно передать uri
};

export default function AccountScreen({ navigation }) {
  const [profile, setProfile] = useState({ ...initialProfile });
  const [savedProfile] = useState({ ...initialProfile }); // in real app savedProfile should come from backend
  const [isDirty, setIsDirty] = useState(false);
  const [genderIndex, setGenderIndex] = useState(0);
  const genders = ['Мужской', 'Женский', 'Другой', 'Не указано'];

  // detect changes
  useEffect(() => {
    const changed = Object.keys(profile).some(
      (k) => profile[k] !== savedProfile[k]
    );
    setIsDirty(changed);
  }, [profile, savedProfile]);

  const onChange = (key, value) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const onToggleGender = () => {
    const next = (genderIndex + 1) % genders.length;
    setGenderIndex(next);
    onChange('gender', genders[next]);
  };

  const onSave = () => {
    // тут отправка на сервер
    // имитируем сохранение: считаем что сохранили, сбрасываем статус dirty
    // в реальном приложении — после успешного ответа обновим savedProfile
    // для демонстрации просто сбрасываем isDirty
    // eslint-disable-next-line no-alert
    alert('Данные сохранены');
    setIsDirty(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Личные данные</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Avatar + name */}
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>W</Text>
                </View>
              )}
            </View>

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.fullName}>{profile.username}</Text>
              <Text style={styles.emailSmall}>{profile.email}</Text>
            </View>
          </View>

          {/* Account info section */}
          <Text style={styles.sectionTitle}>Информация аккаунта</Text>

          <View style={styles.inputCard}>
            <Text style={styles.label}>Имя пользователя</Text>
            <TextInput
              value={profile.username}
              onChangeText={(v) => onChange('username', v)}
              style={styles.input}
              placeholder="Введите имя пользователя"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={profile.email}
              onChangeText={(v) => onChange('email', v)}
              style={styles.input}
              placeholder="Введите email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Телефон</Text>
            <TextInput
              value={profile.phone}
              onChangeText={(v) => onChange('phone', v)}
              style={styles.input}
              placeholder="Введите телефон"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Пароль</Text>
            <TextInput
              value={profile.password}
              onChangeText={(v) => onChange('password', v)}
              style={styles.input}
              placeholder="Введите пароль"
              secureTextEntry
            />
          </View>

          {/* Personal info */}
          <Text style={styles.sectionTitle}>Личная информация</Text>

          <View style={styles.inputCard}>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              value={profile.name}
              onChangeText={(v) => onChange('name', v)}
              style={styles.input}
              placeholder="Введите имя"
            />

            <Text style={styles.label}>Отчество</Text>
            <TextInput
              value={profile.middleName}
              onChangeText={(v) => onChange('middleName', v)}
              style={styles.input}
              placeholder="Введите отчество"
            />

            <Text style={styles.label}>Пол</Text>
            <TouchableOpacity onPress={onToggleGender} style={styles.input}>
              <Text style={{ color: '#222' }}>{profile.gender}</Text>
            </TouchableOpacity>
          </View>

          {/* Passport info */}
          <Text style={styles.sectionTitle}>Паспортные данные</Text>

          <View style={styles.inputCard}>
            <Text style={styles.label}>Номер паспорта</Text>
            <TextInput
              value={profile.passportNumber}
              onChangeText={(v) => onChange('passportNumber', v)}
              style={styles.input}
              placeholder="Введите номер паспорта"
            />

            <Text style={styles.label}>Страна</Text>
            <TextInput
              value={profile.country}
              onChangeText={(v) => onChange('country', v)}
              style={styles.input}
              placeholder="Введите страну"
            />

            <Text style={styles.label}>Срок действия</Text>
            <TextInput
              value={profile.expiryDate}
              onChangeText={(v) => onChange('expiryDate', v)}
              style={styles.input}
              placeholder="DD-MM-YYYY"
            />
          </View>

          <View style={{ height: 120 }} />{/* отступ чтобы не перекрыло кнопкой */}
        </ScrollView>

        {/* Save button fixed at bottom */}
        {isDirty && (
          <View style={styles.saveWrap}>
            <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
              <Text style={styles.saveText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 40 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  back: { fontSize: 28, color: '#222', paddingHorizontal: 8 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatarWrap: {},
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#bfe7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 24, fontWeight: '700', color: '#fff' },
  fullName: { fontSize: 16, fontWeight: '700' },
  emailSmall: { color: '#8a8a8a', marginTop: 4 },

  sectionTitle: { marginTop: 18, marginBottom: 8, fontSize: 16, fontWeight: '700' },

  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  label: { color: '#9ea7b3', marginTop: 10, marginBottom: 6, fontSize: 13 },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 15,
  },

  saveWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  saveBtn: {
    backgroundColor: '#0277bd',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});