// screens/FlightDetailsScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FlightDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { flight } = route.params || {};
  const [activeTab, setActiveTab] = useState('info'); // info, refund

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Доступные рейсы</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Flight Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.routeCircle}>
            <Text style={styles.routeFrom}>{flight?.from || 'ENG'}</Text>
            <MaterialIcons name="flight" size={24} color="#0277bd" />
            <Text style={styles.routeTo}>{flight?.to || 'SFO'}</Text>
          </View>
          <Text style={styles.price}>{flight?.price || 850}$</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'info' && styles.tabTextActive,
              ]}
            >
              Информация о рейсе
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'refund' && styles.tabActive]}
            onPress={() => setActiveTab('refund')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'refund' && styles.tabTextActive,
              ]}
            >
              Возврат и перенос
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'info' ? (
          <View style={styles.infoCard}>
            <View style={styles.airlineRow}>
              <Text style={styles.airlineName}>
                {flight?.airline || 'Emirates Airlines'} - Premium
              </Text>
              <Text style={styles.flightNumber}>
                {flight?.flightNumber || 'AB978'}
              </Text>
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>Вылет</Text>
                <Text style={styles.routeValue}>
                  {flight?.from || 'ENG'} {flight?.departTime || '6:30 PM'}
                </Text>
                <Text style={styles.routeDate}>
                  {formatDate(flight?.date) || '19 фев 2025'}
                </Text>
              </View>

              <View style={styles.durationBlock}>
                <MaterialIcons name="flight" size={20} color="#666" />
                <Text style={styles.durationText}>
                  {flight?.duration || '2ч 35м'}
                </Text>
              </View>

              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>Прилет</Text>
                <Text style={styles.routeValue}>
                  {flight?.to || 'SFO'} {flight?.arriveTime || '8:30 PM'}
                </Text>
                <Text style={styles.routeDate}>
                  {formatDate(flight?.date) || '19 фев 2025'}
                </Text>
              </View>
            </View>

            <View style={styles.priceBreakdown}>
              <Text style={styles.priceTitle}>Детализация цены</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>1 Взрослый</Text>
                <Text style={styles.priceValue}>{flight?.price || 850}$</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Налог</Text>
                <Text style={styles.priceValue}>Включен</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Доп. багаж 3кг</Text>
                <Text style={styles.priceValue}>150$</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Приоритетная регистрация</Text>
                <Text style={styles.priceValue}>0$</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Скидка</Text>
                <Text style={[styles.priceValue, styles.discount]}>-50$</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Итого</Text>
                <Text style={styles.totalValue}>
                  {(flight?.price || 850) + 150 - 50}$
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.refundTitle}>Условия возврата и переноса</Text>
            <Text style={styles.refundText}>
              • Возврат возможен не менее чем за 24 часа до вылета
            </Text>
            <Text style={styles.refundText}>
              • Комиссия за возврат составляет 10% от стоимости билета
            </Text>
            <Text style={styles.refundText}>
              • Перенос рейса возможен за дополнительную плату
            </Text>
            <Text style={styles.refundText}>
              • Детали уточняйте у службы поддержки
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.selectSeatsButton}
          onPress={() =>
            navigation.navigate('SeatSelection', { flight })
          }
        >
          <Text style={styles.selectSeatsButtonText}>Выбрать места</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2aa8ff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  routeCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  routeFrom: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginRight: 12,
  },
  routeTo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginLeft: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0277bd',
  },
  tabsContainer: {
    flexDirection: 'row',
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
  infoCard: {
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
  airlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  flightNumber: {
    fontSize: 14,
    color: '#666',
  },
  routeDetails: {
    marginBottom: 20,
  },
  routeItem: {
    marginBottom: 16,
  },
  routeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  routeDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  durationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  discount: {
    color: '#4caf50',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0277bd',
  },
  refundTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  refundText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  selectSeatsButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  selectSeatsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

