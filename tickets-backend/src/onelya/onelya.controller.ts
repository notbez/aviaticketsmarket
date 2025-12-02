import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
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
  ReservationRecalcRequest,
  ReservationRecalcResponse,
  ReservationConfirmRequest,
  ReservationConfirmResponse,
  ReservationBlankRequest,
  ReservationVoidRequest,
  ReservationVoidResponse,
  ReservationCancelRequest,
  OrderInfoRequest,
  OrderListRequest,
} from './dto/order-reservation.dto';
import { Response } from 'express';

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

  @Post('order/reservation/recalc')
  recalcReservation(
    @Body() body: ReservationRecalcRequest,
  ): Promise<ReservationRecalcResponse> {
    return this.onelyaService.recalcReservation(body);
  }

  @Post('order/reservation/confirm')
  confirmReservation(
    @Body() body: ReservationConfirmRequest,
  ): Promise<ReservationConfirmResponse> {
    return this.onelyaService.confirmReservation(body);
  }

  @Post('order/reservation/blank')
  async blankReservation(
    @Body() body: ReservationBlankRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.onelyaService.blankReservation(body);
    res.setHeader('Content-Type', result.contentType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=onelya_blank_${body.OrderId}.pdf`,
    );
    return result.buffer;
  }

  @Post('order/reservation/void')
  voidReservation(
    @Body() body: ReservationVoidRequest,
  ): Promise<ReservationVoidResponse> {
    return this.onelyaService.voidReservation(body);
  }

  @Post('order/reservation/cancel')
  cancelReservation(@Body() body: ReservationCancelRequest) {
    return this.onelyaService.cancelReservation(body);
  }

  @Post('order/info/order-info')
  orderInfo(@Body() body: OrderInfoRequest) {
    return this.onelyaService.orderInfo(body);
  }

  @Post('order/info/order-list')
  orderList(@Body() body: OrderListRequest) {
    return this.onelyaService.orderList(body);
  }
}

