// screens/PaymentsScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState('cards'); // cards, history
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [saveCard, setSaveCard] = useState(false);

  // Мок данные для истории платежей
  const paymentHistory = [
    {
      id: '1',
      date: '19 фев 2025',
      amount: '950$',
      description: 'Рейс ENG → SFO',
      status: 'Оплачено',
    },
    {
      id: '2',
      date: '15 фев 2025',
      amount: '850$',
      description: 'Рейс NYC → UAE',
      status: 'Оплачено',
    },
  ];

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Максимум 16 цифр + 3 пробела
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    setCardData({ ...cardData, cardNumber: formatted });
  };

  const handleExpiryDateChange = (text) => {
    const formatted = formatExpiryDate(text);
    setCardData({ ...cardData, expiryDate: formatted });
  };

  const handleCvvChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 3);
    setCardData({ ...cardData, cvv: cleaned });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Платежи</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'cards' && styles.tabActive]}
          onPress={() => setActiveSection('cards')}
        >
          <Text
            style={[
              styles.tabText,
              activeSection === 'cards' && styles.tabTextActive,
            ]}
          >
            Данные карты
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'history' && styles.tabActive]}
          onPress={() => setActiveSection('history')}
        >
          <Text
            style={[
              styles.tabText,
              activeSection === 'history' && styles.tabTextActive,
            ]}
          >
            История платежей
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {activeSection === 'cards' ? (
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Добавить новую карту</Text>

              <View style={styles.inputCard}>
                <Text style={styles.label}>Имя держателя карты</Text>
                <TextInput
                  value={cardData.cardHolder}
                  onChangeText={(text) =>
                    setCardData({ ...cardData, cardHolder: text })
                  }
                  style={styles.input}
                  placeholder="Введите имя держателя карты"
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Номер карты</Text>
                <TextInput
                  value={cardData.cardNumber}
                  onChangeText={handleCardNumberChange}
                  style={styles.input}
                  placeholder="Введите номер карты"
                  keyboardType="numeric"
                  maxLength={19}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Срок действия</Text>
                    <TextInput
                      value={cardData.expiryDate}
                      onChangeText={handleExpiryDateChange}
                      style={styles.input}
                      placeholder="дд/мм/гггг"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      value={cardData.cvv}
                      onChangeText={handleCvvChange}
                      style={styles.input}
                      placeholder="***"
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={3}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setSaveCard(!saveCard)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      saveCard && styles.checkboxChecked,
                    ]}
                  >
                    {saveCard && (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Сохранить данные карты
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Сохранить карту</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.historySection}>
              {paymentHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="receipt" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>Нет истории платежей</Text>
                </View>
              ) : (
                paymentHistory.map((payment) => (
                  <View key={payment.id} style={styles.paymentCard}>
                    <View style={styles.paymentHeader}>
                      <View>
                        <Text style={styles.paymentDescription}>
                          {payment.description}
                        </Text>
                        <Text style={styles.paymentDate}>{payment.date}</Text>
                      </View>
                      <Text style={styles.paymentAmount}>
                        {payment.amount}
                      </Text>
                    </View>
                    <View style={styles.paymentFooter}>
                      <View
                        style={[
                          styles.statusBadge,
                          payment.status === 'Оплачено' &&
                            styles.statusBadgeSuccess,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            payment.status === 'Оплачено' &&
                              styles.statusTextSuccess,
                          ]}
                        >
                          {payment.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0277bd',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0277bd',
    fontWeight: '700',
  },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cardSection: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    color: '#9ea7b3',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0277bd',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0277bd',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#111',
  },
  saveButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0277bd',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  statusBadgeSuccess: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusTextSuccess: {
    color: '#4caf50',
  },
});

