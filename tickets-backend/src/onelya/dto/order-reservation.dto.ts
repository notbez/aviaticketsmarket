export interface ReservationCreateRequest {
  ContactPhone?: string;
  ContactEmails?: string[];
  RefuseToReceiveAutomaticRoundTripDiscountForRailwayTickets?: boolean;
  Customers: unknown[];
  ReservationItems: unknown[];
  CheckDoubleBooking?: boolean;
  PaymentRemark?: string;
  WaitListApplicationId?: number;
  PushNotificationUrl?: string;
}

export interface ReservationCreateResponse {
  OrderId: number;
  Amount: number;
  ConfirmTill: string;
  Customers: unknown[];
  ReservationResults: unknown[];
}

