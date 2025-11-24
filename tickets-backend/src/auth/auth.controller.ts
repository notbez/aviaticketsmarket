import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: any) {
    return {
      accessToken: 'demo-jwt-token',
      user: { email: body.email || 'demo@user' },
    };
  }
}