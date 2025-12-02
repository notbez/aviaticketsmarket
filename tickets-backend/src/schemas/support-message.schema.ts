import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportMessageDocument = SupportMessage & Document;

@Schema({ timestamps: true })
export class SupportMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['user', 'support'],
    required: true,
  })
  sender: 'user' | 'support';

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Types.ObjectId, ref: 'SupportMessage', default: null })
  replyTo?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SupportMessageSchema =
  SchemaFactory.createForClass(SupportMessage);

// Indexes
SupportMessageSchema.index({ user: 1, createdAt: -1 });
SupportMessageSchema.index({ isRead: 1 });

