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

@Controller('onelya/avia/search')
@UseInterceptors(OnelyaLoggingInterceptor)
export class OnelyaController {
  constructor(private readonly onelyaService: OnelyaService) {}

  @Post('route-pricing')
  routePricing(
    @Body() body: RoutePricingRequest,
  ): Promise<RoutePricingResponse> {
    return this.onelyaService.routePricing(body);
  }

  @Post('date-pricing')
  datePricing(@Body() body: DatePricingRequest): Promise<DatePricingResponse> {
    return this.onelyaService.datePricing(body);
  }

  @Post('fare-info-by-route')
  fareInfoByRoute(
    @Body() body: FareInfoByRouteRequest,
  ): Promise<FareInfoByRouteResponse> {
    return this.onelyaService.fareInfoByRoute(body);
  }

  @Post('brand-fare-pricing')
  brandFarePricing(
    @Body() body: BrandFarePricingRequest,
  ): Promise<BrandFarePricingResponse> {
    return this.onelyaService.brandFarePricing(body);
  }
}

