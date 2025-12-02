import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OnelyaService } from '../onelya/onelya.service';

@Controller('onelya/avia/search')
export class DirectSearchController {
  private readonly logger = new Logger(DirectSearchController.name);

  constructor(private readonly onelyaService: OnelyaService) {}

  @Post('route-pricing')
  async routePricing(@Body() body?: any) {
    this.logger.log('=== MOBILE APP SEARCH REQUEST ===');
    
    // Фиксированный запрос к Onelya API
    const fixedBody = {
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

    try {
      this.logger.log('Calling Onelya API...');
      const onelyaResponse = await this.onelyaService.routePricing(fixedBody);
      this.logger.log('Onelya API response received');
      
      // Трансформируем ответ в билеты для мобильного приложения
      const flights = this.transformToFlights(onelyaResponse);
      this.logger.log(`Transformed to ${flights.length} flights`);
      
      return { results: flights };
    } catch (error) {
      this.logger.error('Request failed:', error);
      
      // Возвращаем fallback билеты
      const fallbackFlights = this.getFallbackFlights();
      this.logger.log(`Returning ${fallbackFlights.length} fallback flights`);
      
      return { results: fallbackFlights };
    }
  }

  private transformToFlights(data: any): any[] {
    if (!data?.Routes || !Array.isArray(data.Routes)) {
      return this.getFallbackFlights();
    }

    const results = [];

    data.Routes.forEach((route: any, routeIndex: number) => {
      if (!route.Segments || !Array.isArray(route.Segments)) {
        return;
      }

      route.Segments.forEach((segment: any, segmentIndex: number) => {
        const flight = segment.Flights?.[0];
        if (!flight) return;

        const segmentPrice = route.Cost ? Math.round(route.Cost / route.Segments.length) : 25000;
        
        const flightCard = {
          id: `flight-${routeIndex}-${segmentIndex}`,
          from: flight.OriginAirportCode || 'MOW',
          to: flight.DestinationAirportCode || 'TJM',
          fromCountry: 'Россия',
          toCountry: 'Россия',
          departTime: this.formatTime(flight.DepartureDateTime),
          arrivalTime: this.formatTime(flight.ArrivalDateTime),
          duration: this.formatDuration(flight.FlightDuration),
          flightNumber: `${flight.MarketingAirlineCode} ${flight.FlightNumber}`,
          provider: this.getAirlineName(flight.MarketingAirlineCode),
          airplane: flight.Airplane || 'Boeing 737',
          class: flight.ServiceClass === 'Economic' ? 'Эконом' : flight.ServiceClass,
          price: segmentPrice.toLocaleString('ru-RU'),
          logo: `https://via.placeholder.com/42x42/2aa8ff/ffffff?text=${flight.MarketingAirlineCode}`,
          availableSeats: segment.AvailablePlaceQuantity || 9,
          hasStops: flight.TechnicalLandings && flight.TechnicalLandings.length > 0,
          stops: flight.TechnicalLandings?.length || 0,
          baggage: flight.FareDescription?.BaggageInfo?.Description || 'Ручная кладь включена',
          meal: flight.FareDescription?.MealInfo?.Description || 'Питание не включено',
          refundable: flight.FareDescription?.RefundInfo?.RefundIndication !== 'RefundNotPossible',
          exchangeable: flight.FareDescription?.ExchangeInfo?.ExchangeIndication === 'ExchangePossible',
        };

        results.push(flightCard);
      });
    });

    return results.length > 0 ? results : this.getFallbackFlights();
  }

  private formatTime(dateTime: string): string {
    if (!dateTime) return '00:00';
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
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
    };
    return airlines[code] || `Авиакомпания ${code}`;
  }

  private getFallbackFlights(): any[] {
    return [
      {
        id: 'fallback-1',
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
        id: 'fallback-2',
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
    ];
  }
}