// screen/SearchScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AIRPORTS } from '../constants/airports';
import { API_BASE } from '../constants/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [from, setFrom] = useState('SVO');
  const [to, setTo] = useState('LED');
  const [date, setDate] = useState(new Date('2025-12-20'));
  const [showPicker, setShowPicker] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const search = () => {
    navigation.navigate('Results', { from, to, date: date.toISOString().split('T')[0] });
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

      <Button title="Найти" onPress={search} />
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
  dateText: { color: '#111' }
});