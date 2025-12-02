/**
 * user.schema.ts - MongoDB схема для пользователей
 * 
 * Определяет структуру документа пользователя в базе данных:
 * - Основные данные: имя, email, телефон, пароль
 * - Паспортные данные: номер, страна, срок действия
 * - Настройки уведомлений: email, push
 * - Согласия: условия использования, уведомления
 * - OAuth данные: Google ID, Apple ID
 * - Аватар: URL и бинарные данные
 * 
 * timestamps: true автоматически добавляет поля createdAt и updatedAt
 * 
 * @module User
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: {
      passportNumber: { type: String, default: null },
      country: { type: String, default: null },
      expiryDate: { type: Date, default: null },
    },
    _id: false,
  })
  passport?: {
    passportNumber?: string;
    country?: string;
    expiryDate?: Date;
  };

  @Prop({
    type: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },
    _id: false,
    default: {
      emailNotifications: true,
      pushNotifications: true,
    },
  })
  notifications?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };

  @Prop({
    type: {
      termsAccepted: { type: Boolean, default: false },
      termsAcceptedAt: { type: Date, default: null },
      notificationsAccepted: { type: Boolean, default: false },
      notificationsAcceptedAt: { type: Date, default: null },
    },
    _id: false,
    default: {
      termsAccepted: false,
      termsAcceptedAt: null,
      notificationsAccepted: false,
      notificationsAcceptedAt: null,
    },
  })
  consents?: {
    termsAccepted: boolean;
    termsAcceptedAt?: Date;
    notificationsAccepted: boolean;
    notificationsAcceptedAt?: Date;
  };

  @Prop({ default: null })
  avatarUrl?: string;

  @Prop({ type: Buffer, default: null })
  avatar?: Buffer;

  @Prop({ default: null })
  avatarMimeType?: string;

  // OAuth fields
  @Prop({ default: null })
  googleId?: string;

  @Prop({ default: null })
  appleId?: string;

  @Prop({ default: null })
  oauthProvider?: 'google' | 'apple';

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ appleId: 1 });

