import { IsEmail, IsString, MinLength, IsNotEmpty, IsBoolean } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  passportNumber?: string;

  @IsString()
  passportCountry?: string;

  passportExpiryDate?: Date;

  @IsBoolean()
  termsAccepted: boolean;

  @IsBoolean()
  notificationsAccepted: boolean;
}

