/**
 * jwt-auth.guard.ts - Guard для защиты маршрутов JWT токенами
 * 
 * Этот guard проверяет наличие и валидность JWT токена в заголовке Authorization
 * Используется для защиты приватных маршрутов API
 * 
 * Принцип работы:
 * 1. Извлекает токен из заголовка Authorization: "Bearer <token>"
 * 2. Проверяет валидность токена с помощью JwtService
 * 3. Если токен валиден, добавляет payload в request['user']
 * 4. Если токен невалиден или отсутствует, выбрасывает UnauthorizedException
 * 
 * Использование:
 * @UseGuards(JwtAuthGuard) - декоратор на контроллере или методе
 * 
 * @module JwtAuthGuard
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  /**
   * Проверяет наличие и валидность JWT токена
   * 
   * @param context - Контекст выполнения (HTTP запрос)
   * @returns true если токен валиден, иначе выбрасывает исключение
   * @throws UnauthorizedException - если токен отсутствует или невалиден
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    // Проверка наличия токена
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      // Верификация токена с использованием секретного ключа
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      // Добавляем payload токена в request для использования в контроллерах
      request['user'] = payload;
    } catch {
      // Если токен невалиден (истек, подделан и т.д.)
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  /**
   * Извлекает JWT токен из заголовка Authorization
   * 
   * Ожидаемый формат: "Bearer <token>"
   * 
   * @param request - HTTP запрос
   * @returns JWT токен или undefined если не найден
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

