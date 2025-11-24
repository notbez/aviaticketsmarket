import { Module } from '@nestjs/common';
import { FlightsModule } from './flights/flights.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
    FlightsModule,
    BookingModule,
    AuthModule,
  ],
})
export class AppModule {}