// flights.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FlightsService {
  private readonly baseUrl = 'https://api-test.onelya.ru/';
  private readonly login = 'trevel_test';
  private readonly password = 'hldKMo@9';
  private readonly pos = 'trevel_test'; // <<< ОБЯЗАТЕЛЬНО ЗАМЕНИТЬ

  constructor(private readonly http: HttpService) {}

  async search(query: any) {
    const { from, to, date } = query;

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

    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/Avia/V1/Search/RoutePricing`,
          body,
          {
            headers: {
              Authorization: `Basic ${token}`,
              Pos: this.pos,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.error('Onelya error:', error?.response?.data || error);
      return {
        error: true,
        mock: true,
        results: [],
      };
    }
  }
}