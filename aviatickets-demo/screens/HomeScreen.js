// screens/HomeScreen.js
import React, { 
  useState, 
  useRef,        // ← добавлено
  useEffect      // ← если используешь
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoadingOverlay from '../components/LoadingOverlay';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { API_BASE } from '../constants/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  const [from, setFrom] = useState('Дубай, ОАЭ');
  const [to, setTo] = useState('Выберите направление');

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [passengers, setPassengers] = useState('1');
  const [showPassengers, setShowPassengers] = useState(false);

  const [cls, setCls] = useState('Эконом');
  const [showClass, setShowClass] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const [loading, setLoading] = useState(false);
  const bottomSheetRef = useRef(null);
  const [bottomSheetContent, setBottomSheetContent] = useState(null);

  const formatDate = (d) =>
    `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${d.getFullYear()}`;

  const openBottomSheet = (content) => {
    setBottomSheetContent(content);
    bottomSheetRef.current?.expand();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const onSearch = () => {
    setLoading(true);

    setTimeout(() => {
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
        
        console.log('Loaded flights:', flights.length);
        
        setLoading(false);
        nav.navigate('Results', { 
          from: 'MOW', 
          to: 'TJM',
          results: flights 
        });
      } catch (error) {
        console.error('Error loading flights:', error);
        setLoading(false);
      }
    }, 1500);
  };

  const Field = ({ label, icon, value, onPress }) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity style={styles.fieldBox} onPress={onPress}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color="#0277bd"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.fieldValue}>{value}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScrollBeginDrag={() => {
          setShowPassengers(false);
          setShowClass(false);
        }}
      >
        {/* HEADER */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top > 20 ? insets.top - 10 : 10 },
          ]}
        >
          <Text style={styles.headerTitle}>Найди свой рейс</Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* TABS */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, !isRoundTrip && styles.tabActive]}
              onPress={() => setIsRoundTrip(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  !isRoundTrip && styles.tabTextActive,
                ]}
              >
                В одну сторону
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, isRoundTrip && styles.tabActive]}
              onPress={() => setIsRoundTrip(true)}
            >
              <Text
                style={[
                  styles.tabText,
                  isRoundTrip && styles.tabTextActive,
                ]}
              >
                Туда-обратно
              </Text>
            </TouchableOpacity>
          </View>

          {/* FIELDS */}
          <Field
            label="Откуда"
            icon="airplane-takeoff"
            value={from}
            onPress={() =>
              nav.navigate('SelectCity', {
                target: 'from',
                onSelect: (v) => setFrom(v),
              })
            }
          />

          <Field
            label="Куда"
            icon="airplane-landing"
            value={to}
            onPress={() =>
              nav.navigate('SelectCity', {
                target: 'to',
                onSelect: (v) => setTo(v),
              })
            }
          />

          <Field
            label="Дата вылета"
            icon="calendar"
            value={formatDate(date)}
            onPress={() => setShowPicker(true)}
          />

          {/* PASSENGERS + CLASS */}
          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 18 }}>
            <View style={{ flex: 1, position: 'relative' }}>
              <Text style={styles.fieldLabel}>Пассажиры</Text>

              <TouchableOpacity
                style={styles.fieldBox}
                onPress={() => {
                  setShowClass(false);
                  setShowPassengers(!showPassengers);
                }}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={22}
                  color="#0277bd"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.fieldValue}>{passengers}</Text>
              </TouchableOpacity>

              {showPassengers && (
                <View style={styles.dropdown}>
                  {[1, 2, 3, 4].map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPassengers(n.toString());
                        setShowPassengers(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{ flex: 1, position: 'relative' }}>
              <Text style={styles.fieldLabel}>Класс</Text>

              <TouchableOpacity
                style={styles.fieldBox}
                onPress={() => {
                  setShowPassengers(false);
                  setShowClass(!showClass);
                }}
              >
                <MaterialCommunityIcons
                  name="seat-recline-normal"
                  size={22}
                  color="#0277bd"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.fieldValue}>{cls}</Text>
              </TouchableOpacity>

              {showClass && (
                <View style={styles.dropdown}>
                  {['Эконом', 'Бизнес'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCls(c);
                        setShowClass(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* SEARCH BUTTON */}
          <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
            <Text style={styles.searchTxt}>Поиск рейса</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DATE PICKER */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      {loading && <LoadingOverlay />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1EA6FF',
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    width: '92%',
    alignSelf: 'center',
    marginTop: -10,   // ← вместо -20
    borderRadius: 26,
    padding: 20,
    paddingBottom: 30,
  },

  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
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

  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    marginLeft: 4,
  },

  fieldBox: {
    backgroundColor: '#F3F3F3',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  dropdownText: {
    fontSize: 16,
    color: '#333',
  },

  searchBtn: {
    marginTop: 10,
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  searchTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});