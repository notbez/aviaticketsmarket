// screens/SupportOptionsScreen.js
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SupportOptionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Поддержка</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>
          Выберите, как вы хотите получить помощь
        </Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Faq')}
        >
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={32}
              color="#0277bd"
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Часто задаваемые вопросы</Text>
            <Text style={styles.optionDescription}>
              Найдите ответы на популярные вопросы
            </Text>
          </View>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={24}
            color="#bdbdbd"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Support')}
        >
          <View style={styles.optionIcon}>
            <MaterialIcons name="support-agent" size={32} color="#0277bd" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Написать в поддержку</Text>
            <Text style={styles.optionDescription}>
              Свяжитесь с нашей службой поддержки
            </Text>
          </View>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={24}
            color="#bdbdbd"
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111', flex: 1, marginLeft: 12 },
  container: { padding: 16, paddingBottom: 40 },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: { flex: 1 },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
  },
});

