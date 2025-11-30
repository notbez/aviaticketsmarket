import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE } from '../constants/api';

export default function BookingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();   // ← допускается только здесь!
  const { flight } = route.params;
  const [email, setEmail] = useState('test@example.com');

  const book = async () => {
    try {
      // Передаём все данные о рейсе
      const body = {
        ...flight, // включает from, to, date, departTime, arriveTime, price, provider и т.д.
        contact: { email },
      };

      const res = await fetch(`${API_BASE}/booking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: flight.from,
          to: flight.to,
          date: flight.date,
          price: flight.price,
          contact: { email },
          flightNumber: flight.flightNumber,
          departTime: flight.departTime,
          arriveTime: flight.arriveTime,
          segments: flight.segments, // если есть
        }),
      });

      if (!res.ok) {
        throw new Error('Server response not OK');
      }

      const json = await res.json();
      if (json.ok && json.booking) {
        navigation.navigate("Ticket", { booking: json.booking });
      } else {
        alert('Ошибка бронирования: ' + (json.error || 'Неизвестная ошибка'));
      }
    } catch (err) {
      alert('Ошибка соединения с сервером');
      console.error('Booking error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Рейс: {flight.from} → {flight.to}</Text>
      <Text>Дата: {flight.date}</Text>
      <Text>Вылет: {flight.departTime} — Прилет: {flight.arriveTime}</Text>
      <Text>Цена: {flight.price}₽</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Ваш e-mail"
      />
      <Button title="Оформить бронь" onPress={book} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 10 },
});