// tickets-backend/src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { HttpModule } from '@nestjs/axios';
import { Booking, BookingSchema } from '../schemas/booking.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}