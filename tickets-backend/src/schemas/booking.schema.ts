import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  // Flight data
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true, type: Date })
  departureDate: Date;

  @Prop({ type: Date, default: null })
  returnDate?: Date;

  @Prop({ default: false })
  isRoundTrip: boolean;

  @Prop()
  flightNumber?: string;

  @Prop()
  departTime?: string;

  @Prop()
  arriveTime?: string;

  @Prop()
  returnDepartTime?: string;

  @Prop()
  returnArriveTime?: string;

  // Passenger data
  @Prop({ type: Array, default: [] })
  passengers: Array<{
    fullName: string;
    passportNumber?: string;
    dateOfBirth?: Date;
  }>;

  // Payment data (secure - no full card data)
  @Prop({
    type: {
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'canceled', 'refunded'],
        default: 'pending',
      },
      amount: { type: Number, required: true },
      currency: { type: String, default: 'RUB' },
      paymentMethod: { type: String, default: null },
      paymentProviderId: { type: String, default: null },
      cardLast4: { type: String, default: null },
      cardBrand: { type: String, default: null },
    },
    _id: false,
  })
  payment?: {
    paymentStatus: 'pending' | 'paid' | 'canceled' | 'refunded';
    amount: number;
    currency: string;
    paymentMethod?: string;
    paymentProviderId?: string;
    cardLast4?: string;
    cardBrand?: string;
  };

  // Booking status
  @Prop({
    type: String,
    enum: ['reserved', 'ticketed', 'canceled'],
    default: 'reserved',
  })
  bookingStatus: 'reserved' | 'ticketed' | 'canceled';

  // Provider data (Onelya)
  @Prop({ default: null })
  provider?: string;

  @Prop({ default: null })
  providerBookingId?: string;

  // Additional info
  @Prop()
  seat?: string;

  @Prop()
  gate?: string;

  @Prop()
  boardingTime?: string;

  @Prop()
  pdfUrl?: string;

  @Prop({ type: Object, default: {} })
  rawProviderData?: any;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Indexes
BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ providerBookingId: 1 });
BookingSchema.index({ 'payment.paymentStatus': 1 });
