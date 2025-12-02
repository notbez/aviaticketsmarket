# 🧪 Тестирование эндпоинтов

## Проверка работы сервера

### 1. Health check
```bash
curl http://193.233.103.8:3000/flights/health
```

### 2. Поиск рейсов (как в приложении)
```bash
curl -X POST http://193.233.103.8:3000/flights/search \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Прямой запрос к Onelya (как в Postman)
```bash
curl -X POST http://193.233.103.8:3000/onelya/avia/search/route-pricing \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Что должно происходить:

1. **Пользователь нажимает "Поиск рейса"**
2. **Показывается загрузка** (LoadingOverlay)
3. **Отправляется POST** на `/flights/search`
4. **Backend логирует** "POST /flights/search called"
5. **Backend отправляет запрос** к Onelya API
6. **Ждем ответ** (до 3 минут)
7. **Трансформируем данные** в формат билетов
8. **Возвращаем результат** в приложение
9. **Переходим на Results** только после получения ответа

## Логи которые должны появиться:

```
[FlightsController] === POST /flights/search called ===
[FlightsService] === FLIGHTS SEARCH STARTED ===
[FlightsService] [Onelya] Starting RoutePricing request: MOW → TJM
[OnelyaService] [Onelya] POST https://api-test.onelya.ru//Avia/V1/Search/RoutePricing
[FlightsService] [Onelya] Request completed in 120000ms
[FlightsService] [Onelya] Transformed to 3 flight cards
```

## Если что-то не работает:

1. **Нет логов в backend** → проблема с сетью/URL
2. **Есть логи, но ошибка Onelya** → проблема с API ключами
3. **Сразу переходит на Results** → проблема с async/await в frontend
4. **Показывает пустой список** → проблема с трансформацией данных