// screen/ResualtsScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import FlightCard from '../components/FlightCard';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function ResultsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { results = [], from, to } = route.params || {};
  
  // Получаем названия аэропортов
  const getAirportName = (code) => {
    const airports = {
      'MOW': 'Москва',
      'TJM': 'Тюмень',
      'SVO': 'Москва',
      'LED': 'СПб',
      'VKO': 'Москва',
      'DME': 'Москва'
    };
    return airports[code] || code;
  };

  const renderHeader = () => (
    <>
      {/* 🔧 FIX: добавили paddingTop здесь */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Выберите рейс</Text>
        <View style={{width:24}} />
      </View>

      <View style={styles.routeBox}>
        <Text style={styles.city}>{getAirportName(from)}</Text>
        <Text style={styles.code}>{from}</Text>
        <Image source={require('../assets/plane.png')} style={styles.planeIcon} />
        <Text style={styles.city}>{getAirportName(to)}</Text>
        <Text style={styles.code}>{to}</Text>
      </View>

      {results.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Найдено {results.length} рейс{results.length === 1 ? '' : results.length < 5 ? 'а' : 'ов'}
          </Text>
          <Text style={styles.resultsSubtext}>
            Выберите подходящий вариант
          </Text>
        </View>
      )}

      <View style={{ height: 10 }} /> 
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <FlightCard 
              item={item} 
              onBook={() => navigation.navigate('FlightDetails', { flight: item })}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Рейсы не найдены</Text>
            <Text style={styles.emptySubtitle}>
              Попробуйте изменить параметры поиска
            </Text>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Изменить поиск</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#fff' },

  // 🔧 FIX: убран paddingTop отсюда
  topBar:{ 
    backgroundColor:'#2aa8ff',
    flexDirection:'row', 
    alignItems:'center', 
    justifyContent:'space-between', 
    paddingHorizontal:16,
    paddingBottom:12
  },

  back:{ fontSize:24, color:'#fff' },
  title:{ fontSize:20, fontWeight:'700', color:'#fff' },

  routeBox:{ 
    backgroundColor:'#2aa8ff',
    padding:20, 
    alignItems:'center',
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20,
  },

  city:{ color:'#fff', fontSize:16 },
  code:{ color:'#fff', fontSize:22, fontWeight:'700' },
  planeIcon:{ width:40, height:40, marginVertical:8 },

  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: '#2aa8ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },

  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  resultsSubtext: {
    fontSize: 14,
    color: '#666',
  },
});