// flights.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);
  private readonly baseUrl: string;
  private readonly login: string;
  private readonly password: string;
  private readonly pos: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('ONELYA_BASE_URL') ||
      'https://test.onelya.ru/api';
    this.login =
      this.configService.get<string>('ONELYA_LOGIN') || 'trevel_test';
    this.password =
      this.configService.get<string>('ONELYA_PASSWORD') || 'hldKMo@9';
    this.pos = this.configService.get<string>('ONELYA_POS') || 'trevel_test';

    // Проверка и предупреждения о пустых переменных
    if (!this.login) {
      this.logger.warn('ONELYA_LOGIN is not set, using empty string');
    }
    if (!this.password) {
      this.logger.warn('ONELYA_PASSWORD is not set, using empty string');
    }
    if (!this.pos || this.pos === 'trevel_test') {
      this.logger.warn('ONELYA_POS is not set or using default value');
    }
    this.logger.log(`Onelya baseUrl: ${this.baseUrl}`);
  }

  async search(query: any) {
    const { from, to, date } = query;

    const url = `${this.baseUrl}/Avia/V1/Search/RoutePricing`;
    this.logger.log(`[Onelya] POST ${url} - Search: ${from} → ${to} on ${date}`);

    const body = {
      AdultQuantity: 1,
      ChildQuantity: 0,
      BabyWithoutPlaceQuantity: 0,
      BabyWithPlaceQuantity: 0,
      YouthQuantity: 0,
      SeniorQuantity: 0,
      Tariff: 'Standard',
      ServiceClass: 'Economic',
      DirectOnly: false,
      Segments: [
        {
          OriginCode: from,
          DestinationCode: to,
          DepartureDate: `${date}T00:00:00`,
        },
      ],
    };

    const token = Buffer.from(`${this.login}:${this.password}`).toString(
      'base64',
    );

    this.logger.debug(`[Onelya] Request payload: ${JSON.stringify(body)}`);

    try {
      const response = await firstValueFrom(
        this.http.post(url, body, {
          headers: {
            Authorization: `Basic ${token}`,
            Pos: this.pos,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }),
      );

      this.logger.log(`[Onelya] Search response status: ${response.status}`);
      this.logger.debug(`[Onelya] Response data keys: ${Object.keys(response.data || {}).join(', ')}`);

      return {
        ...response.data,
        mock: false,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data || error?.message || String(error);
      const errorStatus = error?.response?.status;
      this.logger.error(
        `[Onelya] Search failed: ${errorMessage}`,
        errorStatus ? `Status: ${errorStatus}` : '',
      );
      
      // Возвращаем мок-данные с пометкой
      return {
        error: true,
        mock: true,
        results: [],
        message: 'Onelya API недоступен, возвращены мок-данные',
      };
    }
  }
}