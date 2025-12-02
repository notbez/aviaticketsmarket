import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
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
  OrderInfoResponse,
  OrderListRequest,
  OrderListResponse,
} from './dto/order-reservation.dto';

@Injectable()
export class OnelyaService {
  private readonly logger = new Logger(OnelyaService.name);
  private readonly baseUrl: string;
  private readonly login: string;
  private readonly password: string;
  private readonly pos: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('ONELYA_BASE_URL')?.trim() ||
      'https://api-test.onelya.ru/';
    this.login =
      this.configService.get<string>('ONELYA_LOGIN')?.trim() ||
      'trevel_test';
    this.password =
      this.configService.get<string>('ONELYA_PASSWORD') || '5mPaN5KyB!27LN!';
    this.pos =
      this.configService.get<string>('ONELYA_POS')?.trim() || 'trevel_test';
    this.timeoutMs = 180000; // 3 минуты для Onelya API

    if (!this.baseUrl.startsWith('http')) {
      this.logger.warn(
        `ONELYA_BASE_URL "${this.baseUrl}" выглядит некорректным, используются значения по умолчанию`,
      );
    }

    this.logger.log(
      `OnelyaService initialized (baseUrl=${this.baseUrl}, pos=${this.pos})`,
    );
  }

  async routePricing(
    body: RoutePricingRequest,
  ): Promise<RoutePricingResponse> {
    return this.post<RoutePricingRequest, RoutePricingResponse>(
      '/Avia/V1/Search/RoutePricing',
      body,
    );
  }

  async datePricing(
    body: DatePricingRequest,
  ): Promise<DatePricingResponse> {
    return this.post<DatePricingRequest, DatePricingResponse>(
      '/Avia/V1/Search/DatePricing',
      body,
    );
  }

  async fareInfoByRoute(
    body: FareInfoByRouteRequest,
  ): Promise<FareInfoByRouteResponse> {
    return this.post<FareInfoByRouteRequest, FareInfoByRouteResponse>(
      '/Avia/V1/Search/FareInfoByRoute',
      body,
    );
  }

  async brandFarePricing(
    body: BrandFarePricingRequest,
  ): Promise<BrandFarePricingResponse> {
    return this.post<BrandFarePricingRequest, BrandFarePricingResponse>(
      '/Avia/V1/Search/BrandFarePricing',
      body,
    );
  }

  async createReservation(
    body: ReservationCreateRequest,
  ): Promise<ReservationCreateResponse> {
    return this.post<ReservationCreateRequest, ReservationCreateResponse>(
      '/Order/V1/Reservation/Create',
      body,
    );
  }

  async recalcReservation(
    body: ReservationRecalcRequest,
  ): Promise<ReservationRecalcResponse> {
    return this.post<ReservationRecalcRequest, ReservationRecalcResponse>(
      '/Order/V1/Reservation/Recalc',
      body,
    );
  }

  async confirmReservation(
    body: ReservationConfirmRequest,
  ): Promise<ReservationConfirmResponse> {
    return this.post<ReservationConfirmRequest, ReservationConfirmResponse>(
      '/Order/V1/Reservation/Confirm',
      body,
    );
  }

  async blankReservation(body: ReservationBlankRequest): Promise<{
    buffer: Buffer;
    contentType?: string;
  }> {
    const endpoint = '/Order/V1/Reservation/Blank';
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders();

    this.logger.log(`[Onelya] POST ${url} (blank)`);
    this.logger.debug(`[Onelya] Blank request: ${JSON.stringify(body)}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<ArrayBuffer>(url, body, {
          headers,
          timeout: this.timeoutMs,
          responseType: 'arraybuffer',
        }),
      );

      const contentType = response.headers?.['content-type'];
      this.logger.log(
        `[Onelya] Blank response ${response.status} (${contentType || 'unknown'})`,
      );

      return {
        buffer: Buffer.from(response.data),
        contentType,
      };
    } catch (error) {
      this.handleAxiosError(endpoint, error as AxiosError);
    }
  }

  async voidReservation(
    body: ReservationVoidRequest,
  ): Promise<ReservationVoidResponse> {
    return this.post<ReservationVoidRequest, ReservationVoidResponse>(
      '/Order/V1/Reservation/Void',
      body,
    );
  }

  async cancelReservation(
    body: ReservationCancelRequest,
  ): Promise<Record<string, never>> {
    return this.post<ReservationCancelRequest, Record<string, never>>(
      '/Order/V1/Reservation/Cancel',
      body,
    );
  }

  async orderInfo(body: OrderInfoRequest): Promise<OrderInfoResponse> {
    return this.post<OrderInfoRequest, OrderInfoResponse>(
      '/Order/V1/Info/OrderInfo',
      body,
    );
  }

  async orderList(body: OrderListRequest): Promise<OrderListResponse> {
    return this.post<OrderListRequest, OrderListResponse>(
      '/Order/V1/Info/OrderList',
      body,
    );
  }

  private async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
  ): Promise<TResponse> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders();

    this.logger.log(`[Onelya] POST ${url}`);
    this.logger.debug(`[Onelya] Request body: ${JSON.stringify(body)}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<TResponse>(url, body, {
          headers,
          timeout: this.timeoutMs,
          responseType: 'json',
        }),
      );
      this.logger.log(
        `[Onelya] Response ${response.status} ${endpoint} (${this.safeSize(
          response.data,
        )})`,
      );
      return response.data;
    } catch (error) {
      this.handleAxiosError(endpoint, error as AxiosError);
    }
  }

  private buildUrl(endpoint: string): string {
    if (!endpoint.startsWith('/')) {
      return `${this.baseUrl}/${endpoint}`;
    }
    return `${this.baseUrl}${endpoint}`;
  }

  private buildHeaders() {
    const token = Buffer.from(`${this.login}:${this.password}`).toString(
      'base64',
    );
    return {
      Authorization: `Basic ${token}`,
      Pos: this.pos,
      PartnerId: this.configService.get('ONELYA_PARTNER_ID'),
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    };
  }

  private handleAxiosError(endpoint: string, error: AxiosError): never {
    const status =
      error.response?.status && error.response.status > 0
        ? error.response.status
        : HttpStatus.BAD_GATEWAY;
    const data = error.response?.data;
    const message = `[Onelya] ${endpoint} request failed`;

    this.logger.error(
      `${message}. Status: ${status}.`,
      typeof data === 'string' ? data : JSON.stringify(data),
    );

    throw new HttpException(
      {
        message,
        statusCode: status,
        endpoint,
        error: data ?? error.message,
      },
      status,
    );
  }

  private safeSize(data: unknown): string {
    if (data === undefined || data === null) {
      return 'empty';
    }
    const text =
      typeof data === 'string' ? data : JSON.stringify(data).substring(0, 200);
    return `${text.length}b`;
  }
}

