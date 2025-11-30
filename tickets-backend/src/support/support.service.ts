import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportMessage, SupportMessageDocument } from '../schemas/support-message.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportMessage.name)
    private supportMessageModel: Model<SupportMessageDocument>,
  ) {}

  async getUserMessages(userId: string): Promise<SupportMessageDocument[]> {
    return this.supportMessageModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  async sendMessage(userId: string, message: string): Promise<SupportMessageDocument> {
    // Save user message
    const userMessage = new this.supportMessageModel({
      user: new Types.ObjectId(userId),
      sender: 'user',
      message,
    });
    await userMessage.save();

    // Auto-reply from support (placeholder)
    const supportMessage = new this.supportMessageModel({
      user: new Types.ObjectId(userId),
      sender: 'support',
      message: 'Мы получили ваше сообщение и скоро ответим. Спасибо за обращение!',
      replyTo: userMessage._id,
    });
    await supportMessage.save();

    return userMessage;
  }
}

