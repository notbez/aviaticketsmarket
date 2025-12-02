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
    this.logger.log('=== FLIGHTS SEARCH STARTED ===');
    this.logger.log(`Query received: ${JSON.stringify(query)}`);
    
    // Фиксированный запрос для демонстрации
    const body: RoutePricingRequest = {
      AdultQuantity: 1,
      ChildQuantity: 0,
      BabyWithoutPlaceQuantity: 0,
      BabyWithPlaceQuantity: 0,
      YouthQuantity: 0,
      SeniorQuantity: 0,
      Tariff: 'Standard',
      ServiceClass: 'Economic',
      AirlineCodes: ['UT', 'S7', 'SU'],
      DirectOnly: false,
      Segments: [
        {
          OriginCode: 'MOW',
          DestinationCode: 'TJM',
          DepartureDate: '2025-12-10T00:00:00',
          DepartureTimeFrom: null,
          DepartureTimeTo: null,
        },
        {
          OriginCode: 'TJM',
          DestinationCode: 'MOW',
          DepartureDate: '2025-12-15T00:00:00',
          DepartureTimeFrom: null,
          DepartureTimeTo: null,
        },
      ],
      DiscountCodes: null,
      PriceFilter: 'LowFare',
    };

    this.logger.log('[Onelya] Starting RoutePricing request: MOW → TJM');
    this.logger.log(`[Onelya] Request body: ${JSON.stringify(body, null, 2)}`);
    
    const startTime = Date.now();

    try {
      this.logger.log('[Onelya] Calling onelyaService.routePricing...');
      const data = await this.onelyaService.routePricing(body);
      
      const duration = Date.now() - startTime;
      this.logger.log(`[Onelya] Request completed in ${duration}ms`);
      this.logger.log(`[Onelya] Response routes count: ${data.Routes?.length || 0}`);
      
      // Преобразуем ответ Onelya в формат для фронтенда
      const transformedResults = this.transformOnelyaResponse(data);
      this.logger.log(`[Onelya] Transformed to ${transformedResults.length} flight cards`);
      
      return {
        Routes: data.Routes || [],
        results: transformedResults,
        mock: false,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const message = error?.message || 'Onelya search failed';
      this.logger.error(`[Onelya] Request failed after ${duration}ms: ${message}`);
      this.logger.error(`[Onelya] Error details:`, error);
      this.logger.warn('[Onelya] Using fallback demo data for demonstration');

      // Возвращаем демо-данные для показа
      const fallbackResults = this.getFallbackFlights();
      this.logger.log(`[Onelya] Returning ${fallbackResults.length} fallback flights`);
      
      return {
        error: false,
        mock: true,
        results: fallbackResults,
        message: 'Используются демо-данные',
      };
    }
  }

  private transformOnelyaResponse(data: any): any[] {
    if (!data?.Routes || !Array.isArray(data.Routes)) {
      return [];
    }

    const results = [];

    data.Routes.forEach((route: any, routeIndex: number) => {
      if (!route.Segments || !Array.isArray(route.Segments)) {
        return;
      }

      // Создаем отдельные билеты для каждого сегмента (направления)
      route.Segments.forEach((segment: any, segmentIndex: number) => {
        const flight = segment.Flights?.[0];
        if (!flight) return;

        const departureTime = this.formatTime(flight.DepartureDateTime);
        const arrivalTime = this.formatTime(flight.ArrivalDateTime);
        const duration = flight.FlightDuration || '00:00:00';
        
        // Для цены берем пропорциональную часть от общей стоимости маршрута
        const segmentPrice = route.Cost ? Math.round(route.Cost / route.Segments.length) : 25000;
        
        const flightCard = {
          id: `flight-${routeIndex}-${segmentIndex}`,
          from: flight.OriginAirportCode || 'MOW',
          to: flight.DestinationAirportCode || 'TJM',
          fromCountry: this.getCountryByAirport(flight.OriginAirportCode),
          toCountry: this.getCountryByAirport(flight.DestinationAirportCode),
          departTime: departureTime,
          arrivalTime: arrivalTime,
          duration: this.formatDuration(duration),
          flightNumber: `${flight.MarketingAirlineCode} ${flight.FlightNumber}`,
          provider: this.getAirlineName(flight.MarketingAirlineCode),
          airplane: flight.Airplane || 'Boeing 737',
          class: flight.ServiceClass === 'Economic' ? 'Эконом' : flight.ServiceClass,
          price: segmentPrice.toLocaleString('ru-RU'),
          logo: this.getAirlineLogo(flight.MarketingAirlineCode),
          // Дополнительная информация
          availableSeats: segment.AvailablePlaceQuantity || 9,
          hasStops: flight.TechnicalLandings && flight.TechnicalLandings.length > 0,
          stops: flight.TechnicalLandings?.length || 0,
          baggage: flight.FareDescription?.BaggageInfo?.Description || 'Ручная кладь включена',
          meal: flight.FareDescription?.MealInfo?.Description || 'Питание не включено',
          refundable: flight.FareDescription?.RefundInfo?.RefundIndication !== 'RefundNotPossible',
          exchangeable: flight.FareDescription?.ExchangeInfo?.ExchangeIndication === 'ExchangePossible',
          originalRoute: route,
          originalSegment: segment,
          originalFlight: flight,
        };

        results.push(flightCard);
      });
    });

    return results;
  }

  private getCountryByAirport(airportCode: string): string {
    const russianAirports = ['MOW', 'SVO', 'VKO', 'DME', 'LED', 'TJM', 'KZN', 'UFA', 'ROV', 'KRR'];
    return russianAirports.includes(airportCode) ? 'Россия' : 'Другая страна';
  }

  private formatTime(dateTime: string): string {
    if (!dateTime) return '00:00';
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Moscow'
      });
    } catch {
      return '00:00';
    }
  }

  private formatDuration(duration: string): string {
    if (!duration) return '0ч 0м';
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      return `${hours}ч ${minutes}м`;
    }
    return duration;
  }

  private getAirlineName(code: string): string {
    const airlines = {
      'UT': 'UTair',
      'S7': 'S7 Airlines', 
      'SU': 'Аэрофлот',
      '7K': 'Когалымавиа',
      'U6': 'Уральские авиалинии',
      'FV': 'Россия',
      'DP': 'Победа',
    };
    return airlines[code] || `Авиакомпания ${code}`;
  }

  private getAirlineLogo(code: string): string {
    // Возвращаем заглушку для логотипа авиакомпании
    return `https://via.placeholder.com/42x42/2aa8ff/ffffff?text=${code}`;
  }

  private getFallbackFlights(): any[] {
    // Реальные данные для демонстрации
    return [
      {
        id: 'flight-1',
        from: 'VKO',
        to: 'TJM',
        fromCountry: 'Россия',
        toCountry: 'Россия',
        departTime: '09:30',
        arrivalTime: '15:00',
        duration: '3ч 30м',
        flightNumber: 'UT 126',
        provider: 'UTair',
        airplane: 'Боинг 737-500',
        class: 'Эконом',
        price: '24,730',
        logo: 'https://via.placeholder.com/42x42/2aa8ff/ffffff?text=UT',
        availableSeats: 9,
        hasStops: true,
        stops: 1,
        baggage: 'Ручная кладь 10кг',
        meal: 'Питание платно',
        refundable: false,
        exchangeable: true,
      },
      {
        id: 'flight-2',
        from: 'TJM',
        to: 'DME',
        fromCountry: 'Россия',
        toCountry: 'Россия',
        departTime: '17:30',
        arrivalTime: '18:40',
        duration: '3ч 10м',
        flightNumber: '7K 111',
        provider: 'Когалымавиа',
        airplane: 'ТУ-134',
        class: 'Эконом',
        price: '24,730',
        logo: 'https://via.placeholder.com/42x42/ff6b35/ffffff?text=7K',
        availableSeats: 9,
        hasStops: false,
        stops: 0,
        baggage: 'Ручная кладь 10кг',
        meal: 'Питание платно',
        refundable: false,
        exchangeable: true,
      },
      {
        id: 'flight-3',
        from: 'SVO',
        to: 'TJM',
        fromCountry: 'Россия',
        toCountry: 'Россия',
        departTime: '06:15',
        arrivalTime: '11:45',
        duration: '5ч 30м',
        flightNumber: 'SU 1482',
        provider: 'Аэрофлот',
        airplane: 'Аирбас A320',
        class: 'Эконом',
        price: '32,150',
        logo: 'https://via.placeholder.com/42x42/0078d4/ffffff?text=SU',
        availableSeats: 15,
        hasStops: true,
        stops: 1,
        baggage: 'Багаж 23кг включен',
        meal: 'Горячее питание',
        refundable: true,
        exchangeable: true,
      },
      {
        id: 'flight-4',
        from: 'VKO',
        to: 'TJM',
        fromCountry: 'Россия',
        toCountry: 'Россия',
        departTime: '22:10',
        arrivalTime: '03:40',
        duration: '3ч 30м',
        flightNumber: 'S7 3456',
        provider: 'S7 Airlines',
        airplane: 'Боинг 737-800',
        class: 'Эконом',
        price: '27,890',
        logo: 'https://via.placeholder.com/42x42/00a651/ffffff?text=S7',
        availableSeats: 7,
        hasStops: false,
        stops: 0,
        baggage: 'Ручная кладь + 1 место багажа',
        meal: 'Легкий перекус',
        refundable: true,
        exchangeable: true,
      },
      {
        id: 'flight-5',
        from: 'TJM',
        to: 'VKO',
        fromCountry: 'Россия',
        toCountry: 'Россия',
        departTime: '14:25',
        arrivalTime: '15:55',
        duration: '3ч 30м',
        flightNumber: 'UT 127',
        provider: 'UTair',
        airplane: 'Боинг 737-500',
        class: 'Эконом',
        price: '26,340',
        logo: 'https://via.placeholder.com/42x42/2aa8ff/ffffff?text=UT',
        availableSeats: 12,
        hasStops: true,
        stops: 1,
        baggage: 'Ручная кладь 10кг',
        meal: 'Питание платно',
        refundable: false,
        exchangeable: true,
      },
    ];
  }

  // Оставляем метод для совместимости, но он не используется
  private buildDate(date?: string): string {
    let d: Date;
  
    if (!date) {
      d = new Date();
    } else {
      d = new Date(date);
      if (isNaN(d.getTime())) {
        // если дата невалидная, вернуть текущую
        d = new Date();
      }
    }
  
    // Возвращаем в формате YYYY-MM-DDTHH:mm:ss
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
  
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
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