// flights.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnelyaService } from '../onelya/onelya.service';
import {
  RoutePricingRequest,
  RoutePricingSegment,
} from '../onelya/dto/avia-search.dto';

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(private readonly onelyaService: OnelyaService) {}

  async search(query: any) {
    const { from, to, date } = query;

    const segments: RoutePricingSegment[] = [
      {
        OriginCode: from,
        DestinationCode: to,
        DepartureDate: this.buildDate(date),
        DepartureTimeFrom: null,
        DepartureTimeTo: null,
      },
    ];

    if (query.returnDate) {
      segments.push({
        OriginCode: to,
        DestinationCode: from,
        DepartureDate: this.buildDate(query.returnDate),
        DepartureTimeFrom: null,
        DepartureTimeTo: null,
      });
    }

    const body: RoutePricingRequest = {
      AdultQuantity: this.toInt(query.adults, 1),
      ChildQuantity: this.toInt(query.children, 0),
      BabyWithoutPlaceQuantity: this.toInt(query.infantsWithoutSeat, 0),
      BabyWithPlaceQuantity: this.toInt(query.infantsWithSeat, 0),
      YouthQuantity: this.toInt(query.youth, 0),
      SeniorQuantity: this.toInt(query.seniors, 0),
      Tariff: query.tariff || 'Standard',
      ServiceClass: query.serviceClass || 'Economic',
      AirlineCodes: this.normalizeArray(query.airlineCodes),
      DirectOnly: query.directOnly === 'true' ? true : false,
      Segments: segments,
      DiscountCodes: null,
      PriceFilter: query.priceFilter || null,
    };

    this.logger.log(
      `[Onelya] RoutePricing: ${from} → ${to} (${segments.length} segment(s))`,
    );
    this.logger.debug(`[Onelya] RoutePricing payload: ${JSON.stringify(body)}`);

    try {
      const data = await this.onelyaService.routePricing(body);
      return { ...data, mock: false };
    } catch (error: any) {
      const message = error?.message || 'Onelya search failed';
      this.logger.error(`[Onelya] RoutePricing failed: ${message}`);

      return {
        error: true,
        mock: true,
        results: [],
        message,
      };
    }
  }

  private buildDate(date?: string): string {
    if (!date) {
      return new Date().toISOString();
    }

    const normalized = new Date(date);
    if (Number.isNaN(normalized.getTime())) {
      return `${date}T00:00:00`;
    }
    return `${normalized.toISOString().substring(0, 10)}T00:00:00`;
  }

  private toInt(value: unknown, fallback: number): number {
    const parsed = parseInt(value as string, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private normalizeArray(value: unknown): string[] | undefined {
    if (!value) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return undefined;
  }
}