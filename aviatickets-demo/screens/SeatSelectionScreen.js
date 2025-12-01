// screens/SeatSelectionScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SeatSelectionScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { flight } = route.params || {};
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [cabinClass, setCabinClass] = useState('Premium');

  // Мок данные мест (в реальности будут от Onelya)
  const seats = [
    { id: '1A', row: 1, col: 'A', available: true },
    { id: '1B', row: 1, col: 'B', available: true },
    { id: '1C', row: 1, col: 'C', available: false },
    { id: '1D', row: 1, col: 'D', available: true },
    { id: '2A', row: 2, col: 'A', available: true },
    { id: '2B', row: 2, col: 'B', available: false },
    { id: '2C', row: 2, col: 'C', available: true },
    { id: '2D', row: 2, col: 'D', available: true },
    { id: '3A', row: 3, col: 'A', available: true },
    { id: '3B', row: 3, col: 'B', available: true },
    { id: '3C', row: 3, col: 'C', available: true },
    { id: '3D', row: 3, col: 'D', available: false },
  ];

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getSeatStyle = (seat) => {
    if (!seat.available) {
      return [styles.seat, styles.seatReserved];
    }
    if (selectedSeats.includes(seat.id)) {
      return [styles.seat, styles.seatSelected];
    }
    return [styles.seat, styles.seatAvailable];
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Выбор места</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatAvailable]} />
            <Text style={styles.legendText}>Доступно</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatReserved]} />
            <Text style={styles.legendText}>Занято</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatSelected]} />
            <Text style={styles.legendText}>Выбрано</Text>
          </View>
        </View>

        {/* Cabin Class Selector */}
        <View style={styles.cabinSelector}>
          <Text style={styles.cabinLabel}>Класс обслуживания</Text>
          <TouchableOpacity style={styles.cabinButton}>
            <Text style={styles.cabinButtonText}>{cabinClass}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Seat Map */}
        <View style={styles.seatMap}>
          <View style={styles.seatGrid}>
            {seats.map((seat) => (
              <TouchableOpacity
                key={seat.id}
                style={getSeatStyle(seat)}
                onPress={() => seat.available && toggleSeat(seat.id)}
                disabled={!seat.available}
              >
                <Text
                  style={[
                    styles.seatText,
                    !seat.available && styles.seatTextReserved,
                    selectedSeats.includes(seat.id) && styles.seatTextSelected,
                  ]}
                >
                  {seat.row}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Выбранные места:</Text>
            <Text style={styles.summaryValue}>
              {selectedSeats.length > 0
                ? selectedSeats.join(', ')
                : 'Не выбрано'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Пассажиров:</Text>
            <Text style={styles.summaryValue}>{selectedSeats.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Класс:</Text>
            <Text style={styles.summaryValue}>{cabinClass}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedSeats.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={() =>
            selectedSeats.length > 0 &&
            navigation.navigate('PassengerInfo', {
              flight,
              selectedSeats,
              cabinClass,
            })
          }
          disabled={selectedSeats.length === 0}
        >
          <View style={styles.continueButtonContent}>
            <View>
              <Text style={styles.continueButtonLabel}>Итого:</Text>
              <Text style={styles.continueButtonAmount}>
                {selectedSeats.length * 0}$
              </Text>
            </View>
            <Text style={styles.continueButtonText}>Продолжить</Text>
          </View>
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  cabinSelector: {
    marginBottom: 24,
  },
  cabinLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cabinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  cabinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  seatMap: {
    marginBottom: 24,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  seat: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  seatAvailable: {
    backgroundColor: '#e0e0e0',
  },
  seatReserved: {
    backgroundColor: '#424242',
  },
  seatSelected: {
    backgroundColor: '#0277bd',
  },
  seatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  seatTextReserved: {
    color: '#fff',
  },
  seatTextSelected: {
    color: '#fff',
  },
  summary: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  continueButton: {
    backgroundColor: '#0277bd',
    borderRadius: 12,
    padding: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueButtonLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  continueButtonAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

