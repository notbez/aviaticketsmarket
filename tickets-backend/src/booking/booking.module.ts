// tickets-backend/src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { AuthModule } from '../auth/auth.module';
import { OnelyaModule } from '../onelya/onelya.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    // Импортируем AuthModule, чтобы JwtModule/JwtService были доступны для JwtAuthGuard
    AuthModule,
    OnelyaModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}