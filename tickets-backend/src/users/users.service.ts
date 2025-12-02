import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async updateUser(userId: string, updateDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update basic fields
    if (updateDto.fullName) user.fullName = updateDto.fullName;
    if (updateDto.phone) user.phone = updateDto.phone;

    // Update passport
    if (updateDto.passport) {
      user.passport = {
        ...user.passport,
        ...updateDto.passport,
      };
    }

    // Update notifications
    if (updateDto.notifications) {
      user.notifications = {
        ...user.notifications,
        ...updateDto.notifications,
      };
    }

    // Update consents
    if (updateDto.consents) {
      if (updateDto.consents.termsAccepted !== undefined) {
        user.consents.termsAccepted = updateDto.consents.termsAccepted;
        if (updateDto.consents.termsAccepted && !user.consents.termsAcceptedAt) {
          user.consents.termsAcceptedAt = new Date();
        }
      }
      if (updateDto.consents.notificationsAccepted !== undefined) {
        user.consents.notificationsAccepted = updateDto.consents.notificationsAccepted;
        if (updateDto.consents.notificationsAccepted && !user.consents.notificationsAcceptedAt) {
          user.consents.notificationsAcceptedAt = new Date();
        }
      }
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.avatar;
    return userObj as UserDocument;
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Store file buffer and mime type
    user.avatar = file.buffer;
    user.avatarMimeType = file.mimetype;

    // For now, we'll use a placeholder URL
    // In production, upload to S3/Cloudinary/etc and store URL
    user.avatarUrl = `/api/users/${userId}/avatar`;

    await user.save();

    return { avatarUrl: user.avatarUrl };
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }
}

