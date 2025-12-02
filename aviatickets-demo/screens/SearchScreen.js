// screen/SearchScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AIRPORTS } from '../constants/airports';
import { API_BASE } from '../constants/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingOverlay from '../components/LoadingOverlay';

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [from, setFrom] = useState('SVO');
  const [to, setTo] = useState('LED');
  const [date, setDate] = useState(new Date('2025-12-20'));
  const [showPicker, setShowPicker] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = () => {
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      try {
        const onelyaData = require('../code.json');
        const flights = [];
        
        onelyaData.Routes?.forEach((route, routeIndex) => {
          route.Segments?.forEach((segment, segmentIndex) => {
            const flight = segment.Flights?.[0];
            if (!flight) return;
            
            const formatTime = (dt) => {
              if (!dt) return '00:00';
              const d = new Date(dt);
              return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            };
            
            const formatDuration = (dur) => {
              if (!dur) return '0ч 0м';
              const m = dur.match(/(\d+):(\d+)/);
              return m ? `${m[1]}ч ${m[2]}м` : dur;
            };
            
            const airlines = { 'S7': 'S7 Airlines', 'SU': 'Аэрофлот', 'UT': 'UTair' };
            const price = route.Cost ? Math.round(route.Cost / route.Segments.length) : 25000;
            
            flights.push({
              id: `flight-${routeIndex}-${segmentIndex}`,
              from: flight.OriginAirportCode,
              to: flight.DestinationAirportCode,
              fromCountry: 'Россия',
              toCountry: 'Россия',
              departTime: formatTime(flight.DepartureDateTime),
              arrivalTime: formatTime(flight.ArrivalDateTime),
              duration: formatDuration(flight.FlightDuration),
              flightNumber: `${flight.MarketingAirlineCode} ${flight.FlightNumber}`,
              provider: airlines[flight.MarketingAirlineCode] || flight.MarketingAirlineCode,
              airplane: flight.Airplane || 'Boeing 737',
              class: flight.BrandedFareInfo?.BrandName || 'Эконом',
              price: price.toLocaleString('ru-RU'),
              logo: `https://via.placeholder.com/42x42/2aa8ff/ffffff?text=${flight.MarketingAirlineCode}`,
              availableSeats: segment.AvailablePlaceQuantity || 9,
              hasStops: !!(flight.TechnicalLandings?.length),
              stops: flight.TechnicalLandings?.length || 0,
              baggage: flight.FareDescription?.BaggageInfo?.Description || 'Ручная кладь',
              meal: flight.FareDescription?.MealInfo?.Description || 'Питание не включено',
              refundable: flight.FareDescription?.RefundInfo?.RefundIndication !== 'RefundNotPossible',
              exchangeable: flight.FareDescription?.ExchangeInfo?.ExchangeIndication === 'ExchangePossible',
            });
          });
        });
        
        console.log('Flights loaded:', flights.length);
        
        navigation.navigate('Results', { 
          from: 'MOW', 
          to: 'TJM', 
          date: '2025-12-10',
          results: flights
        });
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить рейсы: ' + error.message);
      }
    }, 1500);
  };

  const filterAirports = (text, setter, fieldSetter) => {
    fieldSetter(text);
    if (text.length > 0) {
      const filtered = AIRPORTS.filter(a =>
        a.name.toLowerCase().includes(text.toLowerCase()) ||
        a.code.toLowerCase().includes(text.toLowerCase())
      );
      setter(filtered.slice(0, 10));
    } else {
      setter([]);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Text style={styles.title}>Поиск авиабилетов</Text>
      
      <View style={styles.demoNotice}>
        <Text style={styles.demoText}>
          ✈️ Реальные рейсы из Onelya API (Москва ↔ Тюмень)
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Откуда"
        value={from}
        onChangeText={(t) => filterAirports(t, setFromSuggestions, setFrom)}
      />

      <FlatList
        style={styles.suggestions}
        data={fromSuggestions}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setFrom(item.code); setFromSuggestions([]); }}>
            <Text style={styles.suggestItem}>{item.name} ({item.code})</Text>
          </TouchableOpacity>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Куда"
        value={to}
        onChangeText={(t) => filterAirports(t, setToSuggestions, setTo)}
      />

      <FlatList
        style={styles.suggestions}
        data={toSuggestions}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setTo(item.code); setToSuggestions([]); }}>
            <Text style={styles.suggestItem}>{item.name} ({item.code})</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>Дата: {date.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selected) => {
            setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      <Button title="Найти" onPress={search} disabled={loading} />
      
      {loading && <LoadingOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 6 },
  suggestions: { maxHeight: 120, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginBottom: 6 },
  suggestItem: { padding: 8 },
  dateBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 12 },
  dateText: { color: '#111' },
  
  demoNotice: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  
  demoText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
});