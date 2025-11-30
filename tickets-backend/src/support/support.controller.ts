import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('messages')
  async getMessages(@Request() req) {
    return this.supportService.getUserMessages(req.user.sub);
  }

  @Post('messages')
  async sendMessage(@Request() req, @Body() body: { message: string }) {
    return this.supportService.sendMessage(req.user.sub, body.message);
  }
}

