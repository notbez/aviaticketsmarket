import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleOAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class AppleOAuthDto {
  @IsString()
  @IsNotEmpty()
  identityToken: string;

  @IsString()
  @IsNotEmpty()
  authorizationCode: string;

  @IsString()
  fullName?: string;
}

