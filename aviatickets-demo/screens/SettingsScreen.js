// screens/SettingsScreen.js
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function SettingsScreen({ navigation }) {
  const Row = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconLetter}>{icon}</Text>
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.chev}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Настройки</Text>
        </View>

        <View style={{ height: 12 }} />

        <Row
          icon="🔔"
          title="Уведомления"
          onPress={() => navigation.navigate('Notifications')}
        />
        <Row
          icon="🌍"
          title="Регион"
          onPress={() => navigation.navigate('Region')}
        />
        <Row
          icon="💱"
          title="Валюта"
          onPress={() => navigation.navigate('Currency')}
        />
        <Row
          icon="⚖️"
          title="Правовая информация"
          onPress={() => navigation.navigate('Legal')}
        />

        <View style={{ height: 200 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: { fontSize: 28, color: '#222', paddingHorizontal: 8 },
  title: { fontSize: 20, fontWeight: '700', flex: 1 },

  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#e8f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconLetter: { fontSize: 18 },

  rowTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  chev: { fontSize: 20, color: '#999' },
});