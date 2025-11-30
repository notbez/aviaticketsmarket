/**
 * auth.service.ts - Сервис авторизации и аутентификации
 * 
 * Этот сервис отвечает за:
 * - Регистрацию новых пользователей
 * - Вход пользователей (email/password)
 * - OAuth авторизацию (Google, Apple)
 * - Генерацию JWT токенов
 * - Валидацию пользователей
 * 
 * @module AuthService
 */

import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleOAuthDto, AppleOAuthDto } from './dto/oauth.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    // Инициализация Google OAuth клиента
    // Если GOOGLE_CLIENT_ID не установлен, Google OAuth будет отключен
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId) {
      this.googleClient = new OAuth2Client(googleClientId);
      this.logger.log('Google OAuth client initialized');
    } else {
      this.logger.warn('GOOGLE_CLIENT_ID not set, Google OAuth disabled');
    }
  }

  /**
   * Регистрация нового пользователя
   * 
   * @param registerDto - Данные для регистрации (email, password, fullName и т.д.)
   * @returns Объект с JWT токеном и данными пользователя
   * @throws BadRequestException - если не приняты условия использования
   * @throws ConflictException - если пользователь с таким email уже существует
   */
  async register(registerDto: RegisterDto) {
    // Проверка принятия условий использования
    if (!registerDto.termsAccepted) {
      throw new BadRequestException('Terms must be accepted');
    }

    // Проверка существования пользователя с таким email
    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Хеширование пароля с помощью bcrypt (10 раундов)
    // Пароль никогда не хранится в открытом виде
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Создание нового пользователя
    const user = new this.userModel({
      fullName: registerDto.fullName,
      email: registerDto.email.toLowerCase(),
      phone: registerDto.phone,
      passwordHash,
      passport: {
        passportNumber: registerDto.passportNumber,
        country: registerDto.passportCountry,
        expiryDate: registerDto.passportExpiryDate,
      },
      consents: {
        termsAccepted: registerDto.termsAccepted,
        termsAcceptedAt: new Date(),
        notificationsAccepted: registerDto.notificationsAccepted,
        notificationsAcceptedAt: registerDto.notificationsAccepted
          ? new Date()
          : null,
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
      },
    });

    await user.save();

    // Generate JWT
    const payload = { sub: user._id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Remove password hash from response
    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.avatar;

    return {
      accessToken,
      user: userObj,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: loginDto.email.toLowerCase() })
      .select('+passwordHash');

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = { sub: user._id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.avatar;

    return {
      accessToken,
      user: userObj,
    };
  }

  async googleAuth(googleDto: GoogleOAuthDto) {
    if (!this.googleClient) {
      throw new BadRequestException('Google OAuth not configured');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleDto.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      let user = await this.userModel.findOne({
        $or: [
          { email: payload.email.toLowerCase() },
          { googleId: payload.sub },
        ],
      });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user.googleId = payload.sub;
          user.oauthProvider = 'google';
          await user.save();
        }
      } else {
        // Create new user
        user = new this.userModel({
          fullName: payload.name || 'User',
          email: payload.email.toLowerCase(),
          phone: '', // Will be filled later
          passwordHash: '', // OAuth users don't have password
          googleId: payload.sub,
          oauthProvider: 'google',
          avatarUrl: payload.picture,
          consents: {
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            notificationsAccepted: false,
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
          },
        });
        await user.save();
      }

      const jwtPayload = { sub: user._id.toString(), email: user.email };
      const accessToken = this.jwtService.sign(jwtPayload);

      const userObj = user.toObject();
      delete userObj.passwordHash;
      delete userObj.avatar;

      return {
        accessToken,
        user: userObj,
      };
    } catch (error) {
      this.logger.error('Google OAuth error:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async appleAuth(appleDto: AppleOAuthDto) {
    // Apple ID verification is more complex and requires JWT verification
    // For now, we'll create/update user based on identity token
    // In production, you should verify the token with Apple's servers

    try {
      // Decode identity token (basic validation)
      // In production, verify with Apple's public keys
      const decoded = JSON.parse(
        Buffer.from(appleDto.identityToken.split('.')[1], 'base64').toString(),
      );

      if (!decoded.email) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      let user = await this.userModel.findOne({
        $or: [
          { email: decoded.email.toLowerCase() },
          { appleId: decoded.sub },
        ],
      });

      if (user) {
        if (!user.appleId) {
          user.appleId = decoded.sub;
          user.oauthProvider = 'apple';
          await user.save();
        }
      } else {
        user = new this.userModel({
          fullName: appleDto.fullName || decoded.email.split('@')[0] || 'User',
          email: decoded.email.toLowerCase(),
          phone: '',
          passwordHash: '',
          appleId: decoded.sub,
          oauthProvider: 'apple',
          consents: {
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            notificationsAccepted: false,
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
          },
        });
        await user.save();
      }

      const jwtPayload = { sub: user._id.toString(), email: user.email };
      const accessToken = this.jwtService.sign(jwtPayload);

      const userObj = user.toObject();
      delete userObj.passwordHash;
      delete userObj.avatar;

      return {
        accessToken,
        user: userObj,
      };
    } catch (error) {
      this.logger.error('Apple OAuth error:', error);
      throw new UnauthorizedException('Apple authentication failed');
    }
  }

  async validateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }
}

