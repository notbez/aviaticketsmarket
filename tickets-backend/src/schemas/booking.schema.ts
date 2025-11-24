import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) provider: string; // 'onelya'
  @Prop() providerBookingId: string;
  @Prop({ required: true }) flight: any; // snapshot of flight
  @Prop({ required: true }) passengers: any[];
  @Prop() status: string; // PENDING, RESERVED, PAID, CANCELLED
  @Prop() price: number;
  @Prop() serviceFee: number;
  @Prop() total: number;
  @Prop() pdfUrl: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);