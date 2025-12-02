import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import {
  BrandFarePricingRequest,
  BrandFarePricingResponse,
  DatePricingRequest,
  DatePricingResponse,
  FareInfoByRouteRequest,
  FareInfoByRouteResponse,
  RoutePricingRequest,
  RoutePricingResponse,
} from './dto/avia-search.dto';
import { OnelyaService } from './onelya.service';
import { OnelyaLoggingInterceptor } from './interceptors/onelya-logging.interceptor';
import {
  ReservationCreateRequest,
  ReservationCreateResponse,
} from './dto/order-reservation.dto';

@Controller('onelya')
@UseInterceptors(OnelyaLoggingInterceptor)
export class OnelyaController {
  constructor(private readonly onelyaService: OnelyaService) {}

  @Post('avia/search/route-pricing')
  routePricing(
    @Body() body: RoutePricingRequest,
  ): Promise<RoutePricingResponse> {
    return this.onelyaService.routePricing(body);
  }

  @Post('avia/search/date-pricing')
  datePricing(@Body() body: DatePricingRequest): Promise<DatePricingResponse> {
    return this.onelyaService.datePricing(body);
  }

  @Post('avia/search/fare-info-by-route')
  fareInfoByRoute(
    @Body() body: FareInfoByRouteRequest,
  ): Promise<FareInfoByRouteResponse> {
    return this.onelyaService.fareInfoByRoute(body);
  }

  @Post('avia/search/brand-fare-pricing')
  brandFarePricing(
    @Body() body: BrandFarePricingRequest,
  ): Promise<BrandFarePricingResponse> {
    return this.onelyaService.brandFarePricing(body);
  }

  @Post('order/reservation/create')
  createReservation(
    @Body() body: ReservationCreateRequest,
  ): Promise<ReservationCreateResponse> {
    return this.onelyaService.createReservation(body);
  }
}

