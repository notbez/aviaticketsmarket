/**
 * app.module.ts - Корневой модуль приложения NestJS
 * 
 * Этот модуль объединяет все функциональные модули приложения:
 * - ConfigModule: загрузка переменных окружения из .env файла
 * - MongooseModule: подключение к MongoDB базе данных
 * - HttpModule: для HTTP запросов к внешним API (Onelya)
 * - Функциональные модули: Auth, Users, Flights, Booking, FAQ, Support, Onelya
 * 
 * @module AppModule
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightsModule } from './flights/flights.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FaqModule } from './faq/faq.module';
import { SupportModule } from './support/support.module';
import { OnelyaModule } from './onelya/onelya.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule - загружает переменные окружения из .env файла
    // isGlobal: true означает, что модуль доступен во всех других модулях без импорта
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // MongooseModule - подключается к MongoDB
    // MONGO_URI берется из переменной окружения или используется значение по умолчанию
    // retryWrites и w: 'majority' - настройки для надежности записи данных
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/tickets',
      {
        retryWrites: true, // Повторять запись при ошибке
        w: 'majority', // Ожидать подтверждения от большинства реплик
      },
    ),
    
    // HttpModule - для выполнения HTTP запросов к внешним API
    // Используется для интеграции с Onelya API
    HttpModule.register({
      timeout: 15000, // Таймаут запроса 15 секунд
      maxRedirects: 5, // Максимум 5 редиректов
    }),
    
    // Функциональные модули приложения
    FlightsModule,    // Поиск рейсов
    BookingModule,    // Бронирование билетов
    AuthModule,       // Авторизация и аутентификация
    UsersModule,      // Управление пользователями
    FaqModule,        // Часто задаваемые вопросы
    SupportModule,    // Чат поддержки
    OnelyaModule,     // Health check для Onelya API
  ],
})
export class AppModule {}