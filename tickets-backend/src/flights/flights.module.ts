// flights.module.ts
import { Module } from '@nestjs/common';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { OnelyaModule } from '../onelya/onelya.module';

@Module({
  imports: [OnelyaModule],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}