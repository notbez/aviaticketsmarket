// screens/TicketScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { API_BASE } from '../constants/api';

export default function TicketScreen({ route }) {
  // Исправлено: безопасная выборка booking
  const booking = route?.params?.booking;

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Ошибка: данные брони не получены</Text>
      </View>
    );
  }

  const pdfUrl = `${API_BASE}/booking/${booking.id}/pdf`;

  const openPdf = () => {
    Linking.openURL(pdfUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ваш билет оформлен ✈️</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Маршрут</Text>
        <Text style={styles.value}>{booking.from} → {booking.to}</Text>

        <Text style={styles.label}>Дата</Text>
        <Text style={styles.value}>{booking.date}</Text>

        <Text style={styles.label}>Цена</Text>
        <Text style={styles.value}>{booking.price} ₽</Text>

        <Text style={styles.label}>Имя пассажира</Text>
        <Text style={styles.value}>
          {booking?.contact?.name || "Не указано"}
        </Text>

        <Text style={styles.label}>Номер брони</Text>
        <Text style={styles.value}>{booking.id}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={openPdf}>
        <Text style={styles.buttonText}>Скачать билет (PDF)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: {
    padding: 20,
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    marginBottom: 30,
  },
  label: { fontSize: 14, color: '#666', marginTop: 10 },
  value: { fontSize: 18, fontWeight: '600', color: '#111' },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { fontSize: 18, color: 'red' },
});