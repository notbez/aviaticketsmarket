// screens/SelectCityScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { AIRPORTS } from '../constants/airports';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SelectCityScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const route = useRoute();

  const target = route.params?.target || 'from';
  const [query, setQuery] = useState('');
  const [list, setList] = useState(AIRPORTS);

  useEffect(() => {
    setList(
      AIRPORTS.filter(a => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          a.code.toLowerCase().startsWith(q) ||
          a.city.toLowerCase().includes(q)
        );
      })
    );
  }, [query]);

  const pick = (code) => {
    if (route.params?.onSelect) route.params.onSelect(code);
    nav.goBack();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <Text style={styles.title}>
        Выберите город ({target === 'from' ? 'Откуда' : 'Куда'})
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Поиск города или код"
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={list}
        keyExtractor={(i) => i.code}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => pick(item.code)}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.city}>{item.city}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,   // ← ЭТО ДОБАВЛЕНО (боковые отступы)
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },

  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  code: {
    width: 64,
    fontWeight: '700',
    fontSize: 16,
  },

  city: {
    color: '#555',
    fontSize: 16,
  },
});