// screens/TicketsScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export default function TicketsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, completed, cancelled
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadBookings();
    }
  }, [token, activeTab]);

  const loadBookings = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/booking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация билетов по статусу (пока что мок данные)
  const getFilteredBookings = () => {
    // Пока что возвращаем пустой массив, так как реальных данных от Onelya нет
    // В будущем здесь будет фильтрация по bookingStatus
    return [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderBookingCard = (booking) => {
    const airlineName = booking.provider === 'onelya' ? 'Авиакомпания' : 'Демо-рейс';
    const flightNumber = booking.flightNumber || 'N/A';
    const from = booking.from || 'N/A';
    const to = booking.to || 'N/A';
    const departTime = booking.departTime || 'N/A';
    const arriveTime = booking.arriveTime || 'N/A';
    const duration = booking.duration || 'N/A';
    const date = formatDate(booking.departureDate);

    return (
      <View key={booking._id || booking.id} style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.airlineLogo}>
            <Text style={styles.airlineLogoText}>
              {airlineName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.airlineName}>{airlineName}</Text>
            <Text style={styles.flightNumber}>{flightNumber}</Text>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.timeBlock}>
            <Text style={styles.time}>{departTime}</Text>
            <Text style={styles.cityCode}>{from}</Text>
          </View>

          <View style={styles.durationBlock}>
            <MaterialIcons name="flight" size={16} color="#666" />
            <Text style={styles.durationText}>{duration}</Text>
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.time}>{arriveTime}</Text>
            <Text style={styles.cityCode}>{to}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Подробности</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Мои билеты</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Ожидаемые
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.tabTextActive,
            ]}
          >
            Завершенные
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancelled' && styles.tabActive]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'cancelled' && styles.tabTextActive,
            ]}
          >
            Отмененные
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0277bd" />
          </View>
        ) : getFilteredBookings().length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="flight" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' && 'Нет ожидаемых рейсов'}
              {activeTab === 'completed' && 'Нет завершенных рейсов'}
              {activeTab === 'cancelled' && 'Нет отмененных рейсов'}
            </Text>
            <Text style={styles.emptySubtext}>
              Ваши билеты появятся здесь после бронирования
            </Text>
          </View>
        ) : (
          getFilteredBookings().map((booking) => renderBookingCard(booking))
        )}
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
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
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
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
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  bookingCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  airlineLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  airlineLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0277bd',
  },
  cardHeaderContent: {
    flex: 1,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  flightNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeBlock: {
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  cityCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  durationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  detailsButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
