// screens/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Навигация будет обработана автоматически через NavigationWrapper в App.js
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menu = [
    { key: 'account', title: 'Аккаунт', icon: <MaterialIcons name="person" size={20} color="#0277bd" />, screen: 'Account' },
    { key: 'payments', title: 'История платежей', icon: <FontAwesome5 name="wallet" size={18} color="#0277bd" />, screen: 'Payments' },
    { key: 'support', title: 'Поддержка', icon: <MaterialIcons name="support-agent" size={20} color="#0277bd" />, screen: 'SupportOptions' },
    { key: 'settings', title: 'Настройки', icon: <MaterialIcons name="settings" size={20} color="#0277bd" />, screen: 'Settings' },
  ];

  // пример профиля — в реале берёте из стора / API
  const profile = {
    name: 'Вахиб Кхан',
    email: 'wahibkhan5959@gmail.com',
    // avatar: 'https://example.com/path/to/avatar.jpg' // если есть - поставьте сюда
  };

  // remote fallback (никаких локальных require -> безопасно для сборки)
  const avatarUri =
    profile.avatar ||
    'https://ui-avatars.com/api/?name=В+К&background=E3F2FD&color=0277BD&rounded=true&size=256';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={{ width: 32 }} />
          <Text style={styles.headerTitle}>Профиль</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.topCard}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
          </View>
        </View>

        <View style={styles.menuWrap}>
          {menu.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={styles.menuItem}
              onPress={() => m.screen && navigation.navigate(m.screen)}
            >
              <View style={styles.menuIcon}>{m.icon}</View>
              <Text style={styles.menuTitle}>{m.title}</Text>
              <MaterialIcons name="keyboard-arrow-right" size={22} color="#bdbdbd" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.menuItem, styles.logout]} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: '#ffebee' }]}>
              <MaterialIcons name="exit-to-app" size={20} color="#e53935" />
            </View>
            <Text style={[styles.menuTitle, { color: '#e53935' }]}>Выйти</Text>
            <View style={{ width: 22 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, marginBottom: 18, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111', flex: 1 },
  topCard: {
    marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  avatarWrap: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', marginRight: 16, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 72, height: 72, resizeMode: 'cover' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: '#111' },
  userEmail: { fontSize: 13, color: '#9e9e9e', marginTop: 4 },
  menuWrap: { marginTop: 18, paddingHorizontal: 16 },
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 12,
      
      // Тени - серый цвет, непрозрачность 0.2, без смещения
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
  menuIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuTitle: { flex: 1, fontSize: 16, color: '#111' },
  logout: { backgroundColor: '#fff' },
});