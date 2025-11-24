// flights.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('search')
  search(@Query() query: any) {
    return this.flightsService.search(query);
  }
}