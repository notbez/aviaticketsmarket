// screens/BookingScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export default function BookingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { flight, selectedSeats, cabinClass, passengers, contactInfo } =
    route.params || {};
  const [loading, setLoading] = useState(false);

  const book = async () => {
    if (!token) {
      Alert.alert('Ошибка', 'Необходима авторизация');
      return;
    }

    try {
      setLoading(true);

      const body = {
        from: flight?.from,
        to: flight?.to,
        date: flight?.date,
        price: flight?.price,
        flightNumber: flight?.flightNumber,
        departTime: flight?.departTime,
        arriveTime: flight?.arriveTime,
        passengers: passengers || [],
        contact: contactInfo || {},
        selectedSeats: selectedSeats || [],
        cabinClass: cabinClass || 'Economy',
      };

      const res = await fetch(`${API_BASE}/booking/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Ошибка сервера');
      }

      const json = await res.json();
      if (json.ok && json.booking) {
        navigation.navigate('Ticket', { booking: json.booking });
      } else {
        Alert.alert(
          'Ошибка бронирования',
          json.error || 'Неизвестная ошибка',
        );
      }
    } catch (err) {
      console.error('Booking error:', err);
      Alert.alert('Ошибка', err.message || 'Не удалось оформить бронирование');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Подтверждение бронирования</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Детали рейса</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Маршрут:</Text>
            <Text style={styles.summaryValue}>
              {flight?.from || 'N/A'} → {flight?.to || 'N/A'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Дата:</Text>
            <Text style={styles.summaryValue}>{flight?.date || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Время вылета:</Text>
            <Text style={styles.summaryValue}>
              {flight?.departTime || 'N/A'} — {flight?.arriveTime || 'N/A'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Класс:</Text>
            <Text style={styles.summaryValue}>{cabinClass || 'N/A'}</Text>
          </View>
          {selectedSeats && selectedSeats.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Места:</Text>
              <Text style={styles.summaryValue}>
                {selectedSeats.join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Итого:</Text>
            <Text style={styles.priceValue}>
              {flight?.price || 0} ₽
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={book}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Подтвердить бронирование</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  priceCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0277bd',
  },
  bookButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});