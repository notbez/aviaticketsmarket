export interface RoutePricingSegment {
  OriginCode: string;
  DestinationCode: string;
  DepartureDate: string;
  DepartureTimeFrom?: string | null;
  DepartureTimeTo?: string | null;
}

export interface RoutePricingRequest {
  AdultQuantity?: number;
  ChildQuantity?: number;
  BabyWithoutPlaceQuantity?: number;
  BabyWithPlaceQuantity?: number;
  YouthQuantity?: number;
  SeniorQuantity?: number;
  Tariff?: string;
  ServiceClass?: string;
  AirlineCodes?: string[];
  DirectOnly?: boolean;
  Segments: RoutePricingSegment[];
  DiscountCodes?: DiscountCodes | null;
  PriceFilter?: string | null;
}

export interface DiscountCodes {
  ClientGroupSysName?: string | null;
  TourCode?: string | null;
}

export interface RoutePricingResponse {
  Routes: any[];
}

export interface DatePricingRequestSegment {
  OriginCode: string;
  DestinationCode: string;
  DepartureDate: string;
  DepartureTimeFrom?: string | null;
  DepartureTimeTo?: string | null;
}

export interface DatePricingRequest {
  ServiceClass?: string;
  AirlineCode?: string | null;
  DirectOnly?: boolean;
  Segments: DatePricingRequestSegment[];
}

export interface DatePricingResponse {
  DatePriceItems: any[];
}

export interface FareInfoByRouteFlightRequest {
  MarketingAirlineCode: string;
  OperatingAirlineCode: string;
  FlightNumber: string;
  OriginAirportCode: string;
  DestinationAirportCode: string;
  DepartureDateTime: string;
  ServiceClass: string;
  ServiceSubclass: string;
  FareCode: string;
  BrandId?: string | null;
  FareAdditionalTextInfo?: string | null;
  FlightGroup?: number;
}

export interface FareInfoByRouteRequest {
  Gds: string;
  Flights: FareInfoByRouteFlightRequest[];
  FlightIndex?: number;
  Tariff?: string;
  AdultQuantity?: number;
  ChildQuantity?: number;
  BabyWithoutPlaceQuantity?: number;
  BabyWithPlaceQuantity?: number;
  YouthQuantity?: number;
  SeniorQuantity?: number;
}

export interface FareInfoByRouteResponse {
  Text: string;
}

export interface BrandFareFlightRequest {
  MarketingAirlineCode: string;
  FlightNumber: string;
  OriginAirportCode: string;
  DestinationAirportCode: string;
  DepartureDateTime: string;
  ArrivalDateTime: string;
  ServiceSubclass: string;
  FlightGroup: number;
  JointNumber?: string | null;
  ServiceClass: string;
  Gds?: string;
  RouteGroup: number;
  ValidatingAirlineCode?: string;
  OperatingAirlineCode?: string;
  Airplane?: string | null;
  OriginTerminal?: string | null;
  DestinationTerminal?: string | null;
  Subclass?: string;
  FareCode?: string;
  FlightDuration?: string;
  FlightTransport?: string;
  FareAdditionalTextInfo?: string;
}

export interface BrandFarePricingRequest {
  VariantId?: string;
  Gds: string;
  AdultQuantity?: number;
  ChildQuantity?: number;
  BabyWithoutPlaceQuantity?: number;
  BabyWithPlaceQuantity?: number;
  YouthQuantity?: number;
  SeniorQuantity?: number;
  Tariff?: string;
  Flights: BrandFareFlightRequest[];
  TreatyCode?: string | null;
  DiscountCodes?: DiscountCodes | null;
  Interface?: string | null;
}

export interface BrandFarePricingResponse {
  BrandFares: any[];
}

