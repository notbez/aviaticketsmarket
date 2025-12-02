// components/Input.js
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  icon = null,
}) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#bdbdbd"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setHidden(!hidden)} style={styles.iconBtn}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color="#888" />
          </TouchableOpacity>
        ) : icon ? (
          <View style={styles.iconWrap}>{icon}</View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, color: '#222', marginBottom: 6, fontFamily: 'Roboto_400Regular' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  input: { flex: 1, fontSize: 15, color: '#111', fontFamily: 'Roboto_400Regular' },
  iconBtn: { marginLeft: 8 },
  iconWrap: { marginLeft: 8 },
});