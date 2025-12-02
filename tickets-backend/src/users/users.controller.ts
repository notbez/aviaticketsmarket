import {
  Controller,
  Put,
  Get,
  UseGuards,
  Request,
  Body,
  BadRequestException,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Request() req) {
    const user = await this.usersService.getUserById(req.user.sub);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.avatar;
    return userObj;
  }

  @Put()
  async updateProfile(@Request() req, @Body() updateDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.sub, updateDto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.updateAvatar(req.user.sub, file);
  }
}

