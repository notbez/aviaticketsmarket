import { Controller, Post, Body, Get, UseGuards, Request, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleOAuthDto, AppleOAuthDto } from './dto/oauth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  async googleAuth(@Body() googleDto: GoogleOAuthDto) {
    return this.authService.googleAuth(googleDto);
  }

  @Post('apple')
  async appleAuth(@Body() appleDto: AppleOAuthDto) {
    return this.authService.appleAuth(appleDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    const user = await this.authService.validateUser(req.user.sub);
    if (!user) {
      throw new Error('User not found');
    }
    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.avatar;
    return userObj;
  }
}
