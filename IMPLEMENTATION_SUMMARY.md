# 🎯 Реализация поиска рейсов через Onelya API

## Как это работает:

### 1. Пользователь нажимает "Найти рейс"
- Показывается загрузка
- Отправляется POST запрос на `/onelya/avia/search/route-pricing`

### 2. Backend получает запрос
- `DirectSearchController` обрабатывает запрос
- Отправляет фиксированный JSON к Onelya API:
```json
{
  "AdultQuantity": 1,
  "ChildQuantity": 0,
  "BabyWithoutPlaceQuantity": 0,
  "BabyWithPlaceQuantity": 0,
  "YouthQuantity": 0,
  "SeniorQuantity": 0,
  "Tariff": "Standard",
  "ServiceClass": "Economic",
  "AirlineCodes": ["UT", "S7", "SU"],
  "DirectOnly": false,
  "Segments": [
    {
      "OriginCode": "MOW",
      "DestinationCode": "TJM",
      "DepartureDate": "2025-12-10T00:00:00",
      "DepartureTimeFrom": null,
      "DepartureTimeTo": null
    },
    {
      "OriginCode": "TJM",
      "DestinationCode": "MOW",
      "DepartureDate": "2025-12-15T00:00:00",
      "DepartureTimeFrom": null,
      "DepartureTimeTo": null
    }
  ],
  "DiscountCodes": null,
  "PriceFilter": "LowFare"
}
```

### 3. Onelya API отвечает
- Возвращает JSON с рейсами (Routes, Segments, Flights)
- Backend трансформирует в билеты для мобильного приложения

### 4. Трансформация в билеты
Backend преобразует каждый рейс в формат:
```json
{
  "id": "flight-0-0",
  "from": "VKO",
  "to": "TJM",
  "departTime": "09:30",
  "duration": "3ч 30м",
  "flightNumber": "UT 126",
  "provider": "UTair",
  "price": "24,730",
  "stops": 1,
  "availableSeats": 9
}
```

### 5. Мобильное приложение
- Получает массив билетов в `{ results: [...] }`
- Отображает их в виде красивых карточек
- Показывает информацию о пересадках, багаже, питании

## Fallback система:
Если Onelya API недоступен - показываются демо-билеты

## Файлы изменены:
- `tickets-backend/src/flights/direct-search.controller.ts` - основная логика
- `aviatickets-demo/screens/SearchScreen.js` - запрос к API
- `aviatickets-demo/constants/api.js` - URL сервера

## Для запуска:
1. Backend: `pm2 start` на сервере
2. Frontend: `npx expo start`
3. Нажать "Найти рейс" в приложении

Система готова к работе! 🚀