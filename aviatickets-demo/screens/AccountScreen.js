// screens/AccountScreen.js
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { API_BASE } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export default function AccountScreen({ navigation }) {
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
    passportCountry: '',
    passportExpiryDate: '',
  });
  const [savedProfile, setSavedProfile] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Загрузка данных пользователя при монтировании
  useEffect(() => {
    loadProfile();
  }, []);

  // Определение изменений
  useEffect(() => {
    const changed = 
      profile.fullName !== savedProfile.fullName ||
      profile.phone !== savedProfile.phone ||
      profile.passportNumber !== savedProfile.passportNumber ||
      profile.passportCountry !== savedProfile.passportCountry ||
      profile.passportExpiryDate !== savedProfile.passportExpiryDate;
    setIsDirty(changed);
  }, [profile, savedProfile]);

  const loadProfile = async () => {
    if (!token) {
      setLoading(false);
      Alert.alert('Ошибка', 'Необходима авторизация');
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          Alert.alert('Ошибка', 'Сессия истекла. Пожалуйста, войдите снова.');
          setLoading(false);
          return;
        }
        throw new Error(`Ошибка загрузки данных: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Некорректные данные от сервера');
      }
      
      // Форматируем дату паспорта для отображения
      const expiryDate = data.passport?.expiryDate 
        ? new Date(data.passport.expiryDate).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).replace(/\./g, '-')
        : '';
      
      const profileData = {
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        passportNumber: data.passport?.passportNumber || '',
        passportCountry: data.passport?.country || '',
        passportExpiryDate: expiryDate,
      };
      
      setProfile(profileData);
      setSavedProfile(profileData);
      
      // Обновляем контекст
      if (updateUser) {
        updateUser({ ...user, ...data });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (key, value) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const onSave = async () => {
    if (!token) {
      Alert.alert('Ошибка', 'Необходима авторизация');
      return;
    }

    try {
      setSaving(true);
      
      // Парсим дату паспорта
      let passportExpiryDate = null;
      if (profile.passportExpiryDate) {
        const parts = profile.passportExpiryDate.split('-');
        if (parts.length === 3) {
          passportExpiryDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }

      const updateData = {
        fullName: profile.fullName,
        phone: profile.phone,
        passport: {
          passportNumber: profile.passportNumber,
          country: profile.passportCountry,
          expiryDate: passportExpiryDate,
        },
      };

      const res = await fetch(`${API_BASE}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Ошибка сохранения');
      }

      const updatedUser = await res.json();
      
      // Обновляем сохраненный профиль
      const updatedProfile = {
        ...profile,
        passportExpiryDate: updatedUser.passport?.expiryDate
          ? new Date(updatedUser.passport.expiryDate).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).replace(/\./g, '-')
          : '',
      };
      
      setSavedProfile(updatedProfile);
      setIsDirty(false);
      
      // Обновляем контекст
      if (updateUser) {
        updateUser({ ...user, ...updatedUser });
      }
      
      Alert.alert('Успешно', 'Данные сохранены');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить данные');
    } finally {
      setSaving(false);
    }
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
              <Text style={styles.fullName}>{profile.fullName || 'Загрузка...'}</Text>
              <Text style={styles.emailSmall}>{profile.email || ''}</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0277bd" />
              <Text style={styles.loadingText}>Загрузка данных...</Text>
            </View>
          ) : (
            <>
              {/* Account info section */}
              <Text style={styles.sectionTitle}>Информация аккаунта</Text>

              <View style={styles.inputCard}>
                <Text style={styles.label}>ФИО</Text>
                <TextInput
                  value={profile.fullName}
                  onChangeText={(v) => onChange('fullName', v)}
                  style={styles.input}
                  placeholder="Введите ФИО"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={profile.email}
                  editable={false}
                  style={[styles.input, styles.disabledInput]}
                  placeholder="Email"
                />

                <Text style={styles.label}>Телефон</Text>
                <TextInput
                  value={profile.phone}
                  onChangeText={(v) => onChange('phone', v)}
                  style={styles.input}
                  placeholder="Введите телефон"
                  keyboardType="phone-pad"
                />
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

                <Text style={styles.label}>Страна выдачи</Text>
                <TextInput
                  value={profile.passportCountry}
                  onChangeText={(v) => onChange('passportCountry', v)}
                  style={styles.input}
                  placeholder="Введите страну выдачи"
                />

                <Text style={styles.label}>Срок действия (ДД-ММ-ГГГГ)</Text>
                <TextInput
                  value={profile.passportExpiryDate}
                  onChangeText={(v) => onChange('passportExpiryDate', v)}
                  style={styles.input}
                  placeholder="ДД-ММ-ГГГГ"
                />
              </View>
            </>
          )}

          <View style={{ height: 120 }} />{/* отступ чтобы не перекрыло кнопкой */}
        </ScrollView>

        {/* Save button fixed at bottom */}
        {isDirty && !loading && (
          <View style={styles.saveWrap}>
            <TouchableOpacity 
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveText}>Сохранить</Text>
              )}
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
    marginBottom: 8,
  },
  back: { fontSize: 28, color: '#222', paddingHorizontal: 8 },
  title: { fontSize: 20, fontWeight: '700', flex: 1 },

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
  saveBtnDisabled: { opacity: 0.6 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
});