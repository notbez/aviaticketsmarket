import { IsString, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PassportDto {
  @IsString()
  @IsOptional()
  passportNumber?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsOptional()
  expiryDate?: Date;
}

class NotificationsDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;
}

class ConsentsDto {
  @IsBoolean()
  @IsOptional()
  termsAccepted?: boolean;

  @IsBoolean()
  @IsOptional()
  notificationsAccepted?: boolean;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PassportDto)
  @IsOptional()
  passport?: PassportDto;

  @IsObject()
  @ValidateNested()
  @Type(() => NotificationsDto)
  @IsOptional()
  notifications?: NotificationsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ConsentsDto)
  @IsOptional()
  consents?: ConsentsDto;
}

