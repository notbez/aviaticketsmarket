// screens/PassengerInfoScreen.js
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

export default function PassengerInfoScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { flight, selectedSeats, cabinClass } = route.params || {};
  const [expandedPassenger, setExpandedPassenger] = useState(0);
  const [passengers, setPassengers] = useState([
    {
      firstName: '',
      middleLastName: '',
      dateOfBirth: '',
      gender: 'Мужской',
      passport: '',
      countryOfIssue: '',
      passportExpiryDate: '',
    },
  ]);
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    middleLastName: '',
    phone: '',
    email: '',
  });

  const togglePassenger = (index) => {
    setExpandedPassenger(expandedPassenger === index ? -1 : index);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        firstName: '',
        middleLastName: '',
        dateOfBirth: '',
        gender: 'Мужской',
        passport: '',
        countryOfIssue: '',
        passportExpiryDate: '',
      },
    ]);
  };

  const toggleGender = (index) => {
    const genders = ['Мужской', 'Женский'];
    const currentIndex = genders.indexOf(passengers[index].gender);
    const nextGender = genders[(currentIndex + 1) % genders.length];
    updatePassenger(index, 'gender', nextGender);
  };

  const handleContinue = () => {
    // Здесь будет отправка данных на сервер
    navigation.navigate('Booking', {
      flight,
      selectedSeats,
      cabinClass,
      passengers,
      contactInfo,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Данные пассажира</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Passengers */}
          {passengers.map((passenger, index) => (
            <View key={index} style={styles.passengerCard}>
              <TouchableOpacity
                style={styles.passengerHeader}
                onPress={() => togglePassenger(index)}
              >
                <Text style={styles.passengerTitle}>
                  Пассажир {index + 1} - Взрослый
                </Text>
                <MaterialIcons
                  name={
                    expandedPassenger === index
                      ? 'keyboard-arrow-up'
                      : 'keyboard-arrow-down'
                  }
                  size={24}
                  color="#0277bd"
                />
              </TouchableOpacity>

              {expandedPassenger === index && (
                <View style={styles.passengerForm}>
                  <Text style={styles.label}>Имя</Text>
                  <TextInput
                    value={passenger.firstName}
                    onChangeText={(text) =>
                      updatePassenger(index, 'firstName', text)
                    }
                    style={styles.input}
                    placeholder="Имя"
                  />

                  <Text style={styles.label}>Отчество и фамилия</Text>
                  <TextInput
                    value={passenger.middleLastName}
                    onChangeText={(text) =>
                      updatePassenger(index, 'middleLastName', text)
                    }
                    style={styles.input}
                    placeholder="Отчество и фамилия"
                  />

                  <Text style={styles.label}>Дата рождения</Text>
                  <TextInput
                    value={passenger.dateOfBirth}
                    onChangeText={(text) =>
                      updatePassenger(index, 'dateOfBirth', text)
                    }
                    style={styles.input}
                    placeholder="дд/мм/гггг"
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Пол</Text>
                  <TouchableOpacity
                    style={styles.genderSelector}
                    onPress={() => toggleGender(index)}
                  >
                    <Text style={styles.genderText}>{passenger.gender}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
                  </TouchableOpacity>

                  <Text style={styles.label}>Паспорт</Text>
                  <TextInput
                    value={passenger.passport}
                    onChangeText={(text) =>
                      updatePassenger(index, 'passport', text)
                    }
                    style={styles.input}
                    placeholder="Введите 9-значный номер паспорта"
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Страна выдачи</Text>
                  <TouchableOpacity style={styles.input}>
                    <Text style={styles.placeholderText}>
                      Выберите страну
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
                  </TouchableOpacity>

                  <Text style={styles.label}>Срок действия паспорта</Text>
                  <TextInput
                    value={passenger.passportExpiryDate}
                    onChangeText={(text) =>
                      updatePassenger(index, 'passportExpiryDate', text)
                    }
                    style={styles.input}
                    placeholder="дд/мм/гггг"
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>
          ))}

          {passengers.length < 5 && (
            <TouchableOpacity
              style={styles.addPassengerButton}
              onPress={addPassenger}
            >
              <MaterialIcons name="add" size={20} color="#0277bd" />
              <Text style={styles.addPassengerText}>Добавить пассажира</Text>
            </TouchableOpacity>
          )}

          {/* Contact Info */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Контактная информация</Text>

            <Text style={styles.label}>Имя</Text>
            <TextInput
              value={contactInfo.firstName}
              onChangeText={(text) =>
                setContactInfo({ ...contactInfo, firstName: text })
              }
              style={styles.input}
              placeholder="Имя"
            />

            <Text style={styles.label}>Отчество и фамилия</Text>
            <TextInput
              value={contactInfo.middleLastName}
              onChangeText={(text) =>
                setContactInfo({ ...contactInfo, middleLastName: text })
              }
              style={styles.input}
              placeholder="Отчество и фамилия"
            />

            <Text style={styles.label}>Номер телефона</Text>
            <TextInput
              value={contactInfo.phone}
              onChangeText={(text) =>
                setContactInfo({ ...contactInfo, phone: text })
              }
              style={styles.input}
              placeholder="0123456789"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={contactInfo.email}
              onChangeText={(text) =>
                setContactInfo({ ...contactInfo, email: text })
              }
              style={styles.input}
              placeholder="Введите ваш email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <View style={styles.continueButtonContent}>
              <View>
                <Text style={styles.continueButtonLabel}>Итого:</Text>
                <Text style={styles.continueButtonAmount}>
                  {(flight?.price || 950)}$
                </Text>
              </View>
              <Text style={styles.continueButtonText}>Продолжить</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  passengerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  passengerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0277bd',
  },
  passengerForm: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  genderText: {
    fontSize: 15,
    color: '#222',
  },
  addPassengerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#0277bd',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 12,
  },
  addPassengerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0277bd',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#0277bd',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
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

