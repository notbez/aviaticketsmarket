import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, type: String })
  answer: string;

  @Prop({
    type: String,
    enum: ['payments', 'baggage', 'refunds', 'checkin', 'general'],
    default: 'general',
  })
  category: 'payments' | 'baggage' | 'refunds' | 'checkin' | 'general';

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);

// Indexes
FaqSchema.index({ category: 1, order: 1 });
FaqSchema.index({ isActive: 1 });

