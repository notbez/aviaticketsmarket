// flights.controller.ts
import { Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  private readonly logger = new Logger(FlightsController.name);

  constructor(private readonly flightsService: FlightsService) {}

  @Get('health')
  health() {
    this.logger.log('Health check requested');
    return {
      status: 'ok',
      service: 'flights',
      timestamp: new Date().toISOString(),
      message: 'Flights service is running',
    };
  }

  @Get('search')
  search(@Query() query: any) {
    this.logger.log('GET /flights/search called');
    return this.flightsService.search(query);
  }

  @Post('search')
  searchPost() {
    this.logger.log('=== POST /flights/search called ===');
    return this.flightsService.search({});
  }
}