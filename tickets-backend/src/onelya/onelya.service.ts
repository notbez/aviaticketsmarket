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
      'https://test.onelya.ru/api';
    this.login =
      this.configService.get<string>('ONELYA_LOGIN')?.trim() ||
      'trevel_test';
    this.password =
      this.configService.get<string>('ONELYA_PASSWORD') || 'hldKMo@9';
    this.pos =
      this.configService.get<string>('ONELYA_POS')?.trim() || 'trevel_test';
    this.timeoutMs = 120000;

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

