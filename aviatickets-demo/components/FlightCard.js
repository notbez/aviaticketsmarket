import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function FlightCard({ item, onBook }) {
  return (
    <View style={styles.cardWrapper}>

      <View style={styles.card}>

        {/* Заголовок */}
        <View style={styles.headerRow}>
          <View style={styles.airlineRow}>
            <Image source={{ uri: item.logo }} style={styles.logo} />
            <Text style={styles.airline}>{item.provider}</Text>
          </View>
          <Text style={styles.price}>{item.price} ₽</Text>
        </View>

        {/* Маршрут с самолетом и пунктиром */}
        <View style={styles.routeArcBlock}>
          <Text style={styles.code}>{item.from}</Text>

          <View style={styles.arcLine}>
            <View style={styles.dash} />
            <Image
              source={require('../assets/plane.png')}
              style={styles.plane}
            />
            <View style={styles.dash} />
          </View>

          <Text style={styles.code}>{item.to}</Text>
        </View>

        {/* Страны */}
        <View style={styles.countryRow}>
          <Text style={styles.country}>{item.fromCountry}</Text>
          <Text style={styles.country}>{item.toCountry}</Text>
        </View>

        {/* Информация блока 1 */}
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Вылет</Text>
            <Text style={styles.value}>{item.departTime}</Text>
          </View>
          <View>
            <Text style={styles.label}>Номер рейса</Text>
            <Text style={styles.value}>{item.flightNumber}</Text>
          </View>
        </View>

        {/* Информация блока 2 */}
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Длительность</Text>
            <Text style={styles.value}>{item.duration}</Text>
          </View>
          <View>
            <Text style={styles.label}>Класс</Text>
            <Text style={styles.value}>{item.class}</Text>
          </View>
        </View>

        {/* Пунктир */}
        <View style={styles.dashedSeparator} />

        {/* Кнопка */}
        <TouchableOpacity style={styles.button} onPress={() => onBook(item)}>
          <Text style={styles.buttonText}>Забронировать</Text>
        </TouchableOpacity>
      </View>

      {/* Вырезы билета слева и справа */}
      <View style={styles.cutLeft} />
      <View style={styles.cutRight} />

    </View>
  );
}

const styles = StyleSheet.create({

  cardWrapper: {
    marginBottom: 28,
    position: 'relative',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  /* Вырезы */
  cutLeft: {
    position: 'absolute',
    left: -12,
    top: '75%',
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
  },

  cutRight: {
    position: 'absolute',
    right: -12,
    top: '75%',
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  airline: {
    fontSize: 18,
    fontWeight: '600',
  },

  price: {
    fontSize: 22,
    fontWeight: '800',
  },

  routeArcBlock: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  code: {
    fontSize: 20,
    fontWeight: '700',
    maxWidth: 80,
    textAlign: 'center',
  },

  arcLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dash: {
    width: 40,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
  },

  plane: {
    width: 26,
    height: 26,
    marginHorizontal: 6,
    tintColor: '#29A9E0',
  },

  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  country: {
    color: '#7a7a7a',
    fontSize: 14,
    maxWidth: 90,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  label: {
    color: '#9ea7b3',
    fontSize: 14,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 3,
  },

  dashedSeparator: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    marginTop: 25,   // подняли ближе к верхней части
    marginBottom: 25,
},
  button: {
    backgroundColor: '#29A9E0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});