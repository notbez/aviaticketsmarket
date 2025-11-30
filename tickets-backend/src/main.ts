/**
 * main.ts - Точка входа приложения NestJS
 * 
 * Этот файл инициализирует и запускает NestJS приложение:
 * 1. Создает экземпляр приложения из AppModule
 * 2. Настраивает Swagger документацию для API
 * 3. Запускает сервер на указанном порту
 * 
 * @author Aviatickets Team
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Функция bootstrap - инициализирует и запускает приложение
 * Вызывается автоматически при старте Node.js процесса
 */
async function bootstrap() {
  // Создаем экземпляр NestJS приложения из корневого модуля
  const app = await NestFactory.create(AppModule);

  // Настраиваем Swagger документацию
  // Swagger - это инструмент для автоматической генерации API документации
  const config = new DocumentBuilder()
    .setTitle('Aviatickets API')
    .setDescription('Demo backend for flight search and booking (mock data)')
    .setVersion('0.1')
    .build();

  // Создаем Swagger документ и настраиваем его на маршруте /api
  // После запуска документация будет доступна по адресу: http://localhost:3000/api
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Запускаем сервер на порту из переменной окружения PORT или 3000 по умолчанию
  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Server started: http://localhost:${process.env.PORT || 3000}/api`);
}

// Запускаем приложение
bootstrap();